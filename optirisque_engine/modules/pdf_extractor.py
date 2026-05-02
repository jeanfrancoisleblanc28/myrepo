"""
Module pdf_extractor — implémente A, B et C du cahier des charges :

A. upload_pdf : copie /inputs/pdf/, hash SHA-256, run_id RUN-AAAA-MM-JJ-HHMM.
B. extract_optirisque_data : extrait les champs métier d'un PDF OptiRisque.
C. validate_against_template : compare aux sections obligatoires du gabarit.

Le module fonctionne en stdlib seul. Si pdfplumber ou PyPDF2 sont installés,
ils sont utilisés pour une extraction de meilleure qualité.

Aucune donnée n'est inventée : si une valeur n'est pas trouvée, elle vaut
"non extrait" et une alerte est ajoutée à la sortie.
"""

from __future__ import annotations

import datetime as _dt
import hashlib
import os
import re
import shutil
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

NON_EXTRAIT = "non extrait"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _strip_accents(text: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )


def _normalize(text: str) -> str:
    return _strip_accents(text or "").lower()


def _now_utc() -> _dt.datetime:
    return _dt.datetime.now(_dt.timezone.utc)


def build_run_id(now: Optional[_dt.datetime] = None) -> str:
    """Identifiant unique RUN-AAAA-MM-JJ-HHMM en UTC."""
    now = now or _now_utc()
    return now.strftime("RUN-%Y-%m-%d-%H%M")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


# ---------------------------------------------------------------------------
# A. upload_pdf
# ---------------------------------------------------------------------------

@dataclass
class UploadedPdf:
    run_id: str
    source_path: Path
    stored_path: Path
    sha256: str
    octets: int
    timestamp_utc: str


def upload_pdf(
    source_pdf: str | os.PathLike,
    inputs_dir: str | os.PathLike,
    run_id: Optional[str] = None,
) -> UploadedPdf:
    """Copie le PDF dans inputs_dir, calcule son SHA-256 et un run_id."""
    src = Path(source_pdf).expanduser().resolve()
    if not src.exists() or not src.is_file():
        raise FileNotFoundError(f"PDF introuvable : {src}")
    if src.suffix.lower() != ".pdf":
        raise ValueError(f"Le fichier doit être un PDF : {src}")

    inputs_path = Path(inputs_dir).expanduser().resolve()
    inputs_path.mkdir(parents=True, exist_ok=True)

    now = _now_utc()
    run = run_id or build_run_id(now)
    stored = inputs_path / f"{run}__{src.name}"
    if src != stored:
        shutil.copy2(src, stored)

    digest = sha256_file(stored)
    return UploadedPdf(
        run_id=run,
        source_path=src,
        stored_path=stored,
        sha256=digest,
        octets=stored.stat().st_size,
        timestamp_utc=now.isoformat(timespec="seconds"),
    )


# ---------------------------------------------------------------------------
# Lecture du texte brut du PDF (pdfplumber → PyPDF2 → fallback heuristique)
# ---------------------------------------------------------------------------

def _read_pdf_text(path: Path) -> Tuple[str, str]:
    """Retourne (texte, moteur). Texte vide si aucun moteur disponible.

    On attrape BaseException pour neutraliser les dépendances natives
    cassées (pyo3 PanicException, etc.) sans interrompre le pipeline.
    """
    try:
        import pdfplumber  # type: ignore

        with pdfplumber.open(str(path)) as pdf:
            pages = [p.extract_text() or "" for p in pdf.pages]
        return ("\n".join(pages), "pdfplumber")
    except BaseException:
        pass

    try:
        from PyPDF2 import PdfReader  # type: ignore

        reader = PdfReader(str(path))
        pages = [(p.extract_text() or "") for p in reader.pages]
        return ("\n".join(pages), "PyPDF2")
    except BaseException:
        pass

    # Dernier recours : tenter de récupérer du texte ASCII brut
    try:
        raw = path.read_bytes()
        text = re.sub(rb"[^\x09\x0a\x0d\x20-\x7e\xc0-\xff]+", b" ", raw).decode(
            "latin-1", errors="ignore"
        )
        return (text, "fallback-bytes")
    except BaseException:
        return ("", "aucun")


# ---------------------------------------------------------------------------
# B. extract_optirisque_data
# ---------------------------------------------------------------------------

@dataclass
class ExtractionResult:
    moteur: str
    text: str
    champs: Dict[str, Any] = field(default_factory=dict)
    kpi: Dict[str, Any] = field(default_factory=dict)
    risques: Dict[str, Any] = field(default_factory=dict)
    swot: Dict[str, List[str]] = field(default_factory=dict)
    suivi: Dict[str, Any] = field(default_factory=dict)
    sections_detectees: List[str] = field(default_factory=list)
    alertes: List[str] = field(default_factory=list)


# Patterns clé:valeur tolérants aux variantes typographiques
_FIELD_PATTERNS: Dict[str, List[str]] = {
    "entreprise": [
        r"(?:nom\s+de\s+l[''’]?entreprise|raison\s+sociale|client|entreprise)\s*[:\-]\s*([^\n\r]{2,120})",
    ],
    "fli": [
        r"\bFLI\s*(?:n[°ºo]\.?|num[ée]ro|#)?\s*[:\-]?\s*([A-Z0-9\-]{3,20})",
    ],
    "fls": [
        r"\bFLS\s*(?:n[°ºo]\.?|num[ée]ro|#)?\s*[:\-]?\s*([A-Z0-9\-]{3,20})",
    ],
    "secteur": [
        r"secteur\s*(?:d[''’]?activit[ée])?\s*[:\-]\s*([^\n\r]{2,120})",
    ],
    "nature_projet": [
        r"(?:nature\s+du\s+projet|projet\s+[aà]\s+financer|description\s+du\s+projet)\s*[:\-]\s*([^\n\r]{2,200})",
    ],
    "montant_demande": [
        r"(?:montant\s+demand[ée]|financement\s+demand[ée]|pr[êe]t\s+demand[ée])\s*[:\-]?\s*([0-9][0-9\s\.,]*\s*\$?(?:\s*(?:CAD|CDN))?)",
    ],
    "recommandation": [
        r"recommandation\s*[:\-]\s*([^\n\r]{2,300})",
    ],
    "verdict_risque": [
        r"(?:verdict\s+de\s+risque|cote\s+de\s+risque|niveau\s+de\s+risque)\s*[:\-]\s*([^\n\r]{2,80})",
    ],
}

_KPI_PATTERNS: Dict[str, List[str]] = {
    "DSCR": [
        r"\bDSCR\s*[:\-]?\s*([0-9]+(?:[\.,][0-9]+)?\s*x?)",
        r"ratio\s+de\s+couverture\s+du\s+service\s+de\s+(?:la\s+)?dette\s*[:\-]?\s*([0-9]+(?:[\.,][0-9]+)?)",
    ],
    "marge_brute": [
        r"marge\s+brute\s*[:\-]?\s*([0-9]+(?:[\.,][0-9]+)?\s*%)",
    ],
    "endettement": [
        r"(?:endettement|ratio\s+d[''’]?endettement|dette\s*/\s*[ée]quit[ée])\s*[:\-]?\s*([0-9]+(?:[\.,][0-9]+)?\s*[%x]?)",
    ],
    "concentration_client": [
        r"concentration\s+client[s]?\s*[:\-]?\s*([0-9]+(?:[\.,][0-9]+)?\s*%)",
    ],
    "carnet_commandes": [
        r"carnet\s+(?:de\s+)?commandes?\s*[:\-]?\s*([0-9][0-9\s\.,]*\s*\$?(?:\s*(?:CAD|CDN|M\$|k\$))?)",
    ],
}


def _first_match(patterns: List[str], text: str) -> Optional[str]:
    for pat in patterns:
        m = re.search(pat, text, flags=re.IGNORECASE)
        if m:
            value = m.group(1).strip(" \t.,;:-")
            if value:
                return value
    return None


def _extract_swot(text: str) -> Dict[str, List[str]]:
    swot: Dict[str, List[str]] = {
        "forces": [], "faiblesses": [], "opportunites": [], "menaces": [],
    }
    norm = _normalize(text)
    labels = {
        "forces": ["forces", "strengths"],
        "faiblesses": ["faiblesses", "weaknesses"],
        "opportunites": ["opportunites", "opportunities"],
        "menaces": ["menaces", "threats"],
    }
    # Recherche grossière : on capture les bullets après le label, jusqu'au
    # prochain label ou une ligne vide double.
    for key, names in labels.items():
        for name in names:
            pat = rf"{name}\s*[:\-]?\s*(.+?)(?=\b(?:forces|faiblesses|opportunites|menaces|opportunities|strengths|weaknesses|threats)\b|\n\n|$)"
            m = re.search(pat, norm, flags=re.IGNORECASE | re.DOTALL)
            if m:
                bloc = m.group(1)
                items = [
                    re.sub(r"^[\-•*•\s]+", "", ln).strip()
                    for ln in bloc.splitlines()
                    if ln.strip() and not re.fullmatch(r"[\-=_]{2,}", ln.strip())
                ]
                items = [i for i in items if 2 <= len(i) <= 200]
                if items:
                    swot[key] = items[:8]
                    break
    return swot


def _extract_risk_categories(text: str, categories: List[str]) -> Dict[str, Any]:
    """Pour chaque catégorie, capture cote + brève description si présentes."""
    out: Dict[str, Any] = {}
    for cat in categories:
        cat_norm = _normalize(cat).split("/")[0].strip()
        # Patterns : "Marché : Élevé — ..." / "Risque opérationnel — Faible"
        pats = [
            rf"(?:risque\s+)?{re.escape(cat_norm)}\s*[:\-—]\s*(faible|mod[ée]r[ée]|[ée]lev[ée]|critique|fort|moyen|bas)\b",
            rf"\b{re.escape(cat_norm)}\b[^\n]{{0,40}}\b(faible|mod[ée]r[ée]|[ée]lev[ée]|critique|fort|moyen|bas)\b",
        ]
        cote: Optional[str] = None
        for p in pats:
            m = re.search(p, _normalize(text), flags=re.IGNORECASE)
            if m:
                cote = m.group(1)
                break
        if cote:
            out[cat] = {"cote": cote}
    return out


def _extract_conditions(
    text: str,
    label_keywords: List[str],
    stop_keywords: Optional[List[str]] = None,
) -> List[str]:
    """Extrait les bullets suivant un titre de section.

    Arrête la capture à la prochaine ligne vide *ou* au premier mot-clé
    de stop_keywords (utile pour stopper avant la section suivante connue).
    """
    norm_lines = text.splitlines()
    stop = [_normalize(s) for s in (stop_keywords or [])]
    starts = [_normalize(s) for s in label_keywords]
    out: List[str] = []
    capture = False
    for raw in norm_lines:
        line = raw.rstrip()
        nline = _normalize(line)
        if not capture and any(kw in nline for kw in starts):
            capture = True
            continue
        if capture:
            if not line.strip():
                if out:
                    break
                continue
            # Stop si on rencontre une autre section connue
            if any(kw and kw in nline for kw in stop):
                break
            # Stop sur titre clairement majuscule
            if re.match(r"^[A-ZÉÈÊÀÂÎÔÛÇ0-9 ,'\-]{6,}:?\s*$", line.strip()):
                break
            cleaned = re.sub(r"^[\-•*•\s\d\.\)]+", "", line).strip()
            if 3 <= len(cleaned) <= 300:
                out.append(cleaned)
            if len(out) >= 15:
                break
    return out


def extract_optirisque_data(
    pdf_path: str | os.PathLike,
    config: Dict[str, Any],
) -> ExtractionResult:
    """Extrait les champs métier d'un PDF OptiRisque."""
    path = Path(pdf_path)
    text, moteur = _read_pdf_text(path)

    result = ExtractionResult(moteur=moteur, text=text)
    if not text.strip():
        result.alertes.append(
            "Aucun texte extrait du PDF (PDF scanné ou moteur PDF absent). "
            "Installer pdfplumber ou PyPDF2 ; ou OCR-iser le document."
        )
        # On continue : tous les champs resteront non extraits.

    # Champs identitaires
    for key, patterns in _FIELD_PATTERNS.items():
        value = _first_match(patterns, text) if text else None
        if value:
            result.champs[key] = value
        else:
            result.champs[key] = NON_EXTRAIT
            result.alertes.append(f"Champ '{key}' non extrait")

    # KPI financiers
    for key in config.get("kpi_attendus", []):
        patterns = _KPI_PATTERNS.get(key, [])
        value = _first_match(patterns, text) if (text and patterns) else None
        if value:
            result.kpi[key] = value
        else:
            result.kpi[key] = NON_EXTRAIT
            result.alertes.append(f"KPI '{key}' non extrait")

    # Risques cotés
    cats = config.get("categories_risques", [])
    result.risques = _extract_risk_categories(text, cats) if text else {}
    if len(result.risques) < len(cats):
        manquants = [c for c in cats if c not in result.risques]
        if manquants:
            result.alertes.append(
                "Catégories de risques non cotées : " + ", ".join(manquants)
            )

    # SWOT
    result.swot = _extract_swot(text) if text else {
        "forces": [], "faiblesses": [], "opportunites": [], "menaces": [],
    }

    # Conditions et suivi — chaque section s'arrête au premier titre suivant
    # connu pour éviter le débordement.
    section_titles = [
        "conditions de decaissement", "conditions de décaissement",
        "conditions prealables", "conditions préalables",
        "conditions de suivi", "suivi post-financement",
        "indicateurs de suivi", "indicateurs mensuels", "indicateurs trimestriels",
        "tableau de bord", "autorisations", "appreciation generale",
        "appréciation générale", "recommandation", "impact portefeuille",
    ]
    result.suivi = {
        "decaissement": _extract_conditions(
            text,
            ["conditions de decaissement", "conditions prealables", "conditions préalables"],
            stop_keywords=[s for s in section_titles
                           if s not in ("conditions de decaissement", "conditions prealables",
                                        "conditions préalables", "conditions de décaissement")],
        ),
        "suivi": _extract_conditions(
            text,
            ["conditions de suivi", "suivi post-financement"],
            stop_keywords=[s for s in section_titles
                           if s not in ("conditions de suivi", "suivi post-financement")],
        ),
        "indicateurs_mensuels_trimestriels": _extract_conditions(
            text,
            ["indicateurs de suivi", "indicateurs mensuels", "indicateurs trimestriels", "tableau de bord"],
            stop_keywords=[s for s in section_titles
                           if s not in ("indicateurs de suivi", "indicateurs mensuels",
                                        "indicateurs trimestriels", "tableau de bord")],
        ),
    }

    # Sections détectées
    result.sections_detectees = detect_sections(
        text, config.get("gabarit_sections", [])
    )

    return result


# ---------------------------------------------------------------------------
# C. validate_against_template
# ---------------------------------------------------------------------------

def detect_sections(text: str, sections: List[str]) -> List[str]:
    """Renvoie la liste des sections du gabarit présentes dans le texte."""
    if not text:
        return []
    norm_text = _normalize(text)
    found: List[str] = []
    for section in sections:
        key = _normalize(section)
        # tolère les variantes avec/sans accents et espaces multiples
        pattern = re.escape(key).replace(r"\ ", r"\s+")
        if re.search(pattern, norm_text):
            found.append(section)
    return found


@dataclass
class TemplateValidation:
    sections_attendues: List[str]
    sections_presentes: List[str]
    sections_manquantes: List[str]
    taux_completude: float  # 0..1


def validate_against_template(
    extraction: ExtractionResult,
    config: Dict[str, Any],
) -> TemplateValidation:
    attendues = config.get("gabarit_sections", [])
    presentes = list(extraction.sections_detectees)
    manquantes = [s for s in attendues if s not in presentes]
    taux = (len(presentes) / len(attendues)) if attendues else 0.0
    return TemplateValidation(
        sections_attendues=attendues,
        sections_presentes=presentes,
        sections_manquantes=manquantes,
        taux_completude=round(taux, 4),
    )
