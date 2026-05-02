"""
Module advisor_score — D du cahier des charges.

Score automatique du conseiller sur 100 points selon 12 critères pondérés
équitablement. Conversion en niveau /10 (cible 10/10) puis décision CIC.

Le score est sévère mais défendable : chaque critère est évalué à partir
des données extraites par pdf_extractor (pas de jugement subjectif), et
chaque verdict ("acquis", "partiel", "manquant") est tracé avec sa preuve.
"""

from __future__ import annotations

import datetime as _dt
import re
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional

from .pdf_extractor import ExtractionResult, TemplateValidation, NON_EXTRAIT, _normalize


# ---------------------------------------------------------------------------
# Structures de sortie
# ---------------------------------------------------------------------------

@dataclass
class CritereResultat:
    id: int
    libelle: str
    obtenu: float
    max: float
    verdict: str  # "acquis" | "partiel" | "manquant"
    preuve: Optional[str] = None


@dataclass
class AdvisorScore:
    run_id: str
    horodatage_utc: str
    score_total: int
    niveau: int
    qualificatif: str
    decision: str
    details_criteres: List[CritereResultat]
    points_forts: List[str]
    lacunes: List[str]
    corrections_requises: List[Dict[str, Any]]

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        # asdict sérialise déjà les CritereResultat en dict
        return d


# ---------------------------------------------------------------------------
# Helpers d'évaluation
# ---------------------------------------------------------------------------

def _verdict(obtenu: float, maximum: float) -> str:
    if maximum == 0:
        return "manquant"
    ratio = obtenu / maximum
    if ratio >= 0.95:
        return "acquis"
    if ratio >= 0.5:
        return "partiel"
    return "manquant"


def _has_value(v: Any) -> bool:
    return v not in (None, "", NON_EXTRAIT, [], {})


# ---------------------------------------------------------------------------
# Critères 1..12
# ---------------------------------------------------------------------------

# Sections critiques (sous-ensemble du gabarit pour le critère 1)
SECTIONS_CRITIQUES_MIN = [
    "Information sur l'entreprise",
    "Projet à financer",
    "Coûts et sources de financement",
    "Portrait financier historique",
    "Analyse des risques",
    "Recommandation",
    "Conditions préalables",
]


def _crit_1_sections(validation: TemplateValidation, poids: float) -> CritereResultat:
    """7 sections critiques minimum présentes."""
    presentes = [s for s in SECTIONS_CRITIQUES_MIN if s in validation.sections_presentes]
    n = len(presentes)
    obtenu = poids * (n / len(SECTIONS_CRITIQUES_MIN))
    return CritereResultat(
        id=1,
        libelle="Sept sections présentes (sur les sections critiques)",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(n, len(SECTIONS_CRITIQUES_MIN)),
        preuve=f"{n}/{len(SECTIONS_CRITIQUES_MIN)} sections critiques détectées",
    )


def _crit_2_identification(extraction: ExtractionResult, poids: float) -> CritereResultat:
    champs_requis = ["entreprise", "secteur"]
    champs_bonus = ["fli", "fls"]
    n_req = sum(1 for k in champs_requis if _has_value(extraction.champs.get(k)))
    n_bonus = sum(1 for k in champs_bonus if _has_value(extraction.champs.get(k)))
    score = (n_req / len(champs_requis)) * 0.7 + (n_bonus / len(champs_bonus)) * 0.3
    obtenu = poids * score
    preuve = (
        f"entreprise={extraction.champs.get('entreprise')}, "
        f"secteur={extraction.champs.get('secteur')}, "
        f"FLI={extraction.champs.get('fli')}, FLS={extraction.champs.get('fls')}"
    )
    return CritereResultat(
        id=2,
        libelle="Identification dossier complète (entreprise, FLI/FLS, secteur)",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=preuve,
    )


def _crit_3_financier_historique(extraction: ExtractionResult, poids: float) -> CritereResultat:
    """Présence de "Portrait financier historique" + au moins 2 KPI extraits."""
    section_ok = "Portrait financier historique" in extraction.sections_detectees
    kpi_count = sum(1 for v in extraction.kpi.values() if _has_value(v))
    score = (0.5 if section_ok else 0.0) + min(kpi_count / 4.0, 0.5)
    obtenu = poids * score
    return CritereResultat(
        id=3,
        libelle="Données financières historiques suffisantes",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=f"section={section_ok}, kpi_extraits={kpi_count}/{len(extraction.kpi)}",
    )


def _crit_4_previsions(extraction: ExtractionResult, poids: float) -> CritereResultat:
    section_ok = "Portrait financier prévisionnel" in extraction.sections_detectees
    text_norm = extraction.text.lower() if extraction.text else ""
    has_horizon = bool(re.search(r"\b(an\s*[1-5]|exercice\s*\+?\d|3\s*ans|5\s*ans|prevision|prévision)\b", text_norm))
    score = (0.6 if section_ok else 0.0) + (0.4 if has_horizon else 0.0)
    obtenu = poids * score
    return CritereResultat(
        id=4,
        libelle="Prévisions documentées",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=f"section={section_ok}, horizon_détecté={has_horizon}",
    )


def _crit_5_risques_cotes(extraction: ExtractionResult, poids: float, n_categories_attendues: int) -> CritereResultat:
    n = len(extraction.risques)
    score = min(n / max(n_categories_attendues, 1), 1.0)
    obtenu = poids * score
    return CritereResultat(
        id=5,
        libelle="Cinq catégories de risques cotées",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(n, n_categories_attendues),
        preuve=f"{n}/{n_categories_attendues} catégories cotées",
    )


def _crit_6_mitigations_chiffrees(extraction: ExtractionResult, poids: float) -> CritereResultat:
    """Mitigations contenant au moins une donnée chiffrée (%, $, ratio, échéance)."""
    text = extraction.text or ""
    blocs = re.findall(
        r"mitigation[s]?\s*[:\-][^\n]{5,300}", text, flags=re.IGNORECASE,
    )
    chiffrees = [b for b in blocs if re.search(r"[0-9]+([.,][0-9]+)?\s*(%|\$|x|mois|jours?)", b, re.IGNORECASE)]
    if not blocs:
        score = 0.0
    else:
        score = min(len(chiffrees) / max(len(blocs), 1), 1.0)
    obtenu = poids * score
    return CritereResultat(
        id=6,
        libelle="Mitigations chiffrées",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=f"{len(chiffrees)}/{len(blocs) if blocs else 0} mitigations chiffrées",
    )


def _crit_7_comparables(extraction: ExtractionResult, poids: float) -> CritereResultat:
    text_norm = (extraction.text or "").lower()
    keywords = ["comparable", "benchmark", "moyenne sectorielle", "médiane sectorielle", "industrie"]
    hits = sum(1 for k in keywords if k in text_norm)
    score = min(hits / 2.0, 1.0)  # 2 hits = score plein
    obtenu = poids * score
    return CritereResultat(
        id=7,
        libelle="Comparables sectoriels",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=f"mots-clés détectés : {hits}",
    )


def _is_smart(condition: str, smart_kw: Dict[str, List[str]]) -> Dict[str, bool]:
    """Évaluation SMART insensible aux accents (les PDF perdent souvent les
    diacritiques après extraction)."""
    norm = _normalize(condition)
    return {
        axe: any(_normalize(k) in norm for k in mots)
        for axe, mots in smart_kw.items()
    }


def _crit_8_conditions_smart(
    extraction: ExtractionResult, poids: float, smart_kw: Dict[str, List[str]]
) -> CritereResultat:
    conds = extraction.suivi.get("decaissement", []) if extraction.suivi else []
    if not conds:
        return CritereResultat(
            id=8,
            libelle="Conditions de décaissement SMART",
            obtenu=0.0,
            max=round(poids, 2),
            verdict="manquant",
            preuve="aucune condition de décaissement extraite",
        )
    smart_full = 0
    for c in conds:
        axes = _is_smart(c, smart_kw)
        # SMART = au moins Spécifique + Mesurable + Temporel
        if axes.get("specifique") and axes.get("mesurable") and axes.get("temporel"):
            smart_full += 1
    score = smart_full / len(conds)
    obtenu = poids * score
    return CritereResultat(
        id=8,
        libelle="Conditions de décaissement SMART",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=f"{smart_full}/{len(conds)} conditions SMART (S+M+T)",
    )


def _crit_9_suivi_defini(extraction: ExtractionResult, poids: float) -> CritereResultat:
    suivi = extraction.suivi.get("suivi", []) if extraction.suivi else []
    indicateurs = extraction.suivi.get("indicateurs_mensuels_trimestriels", []) if extraction.suivi else []
    has_section = "Conditions de suivi" in extraction.sections_detectees
    score = 0.0
    if suivi:
        score += 0.5
    if indicateurs:
        score += 0.3
    if has_section:
        score += 0.2
    score = min(score, 1.0)
    obtenu = poids * score
    return CritereResultat(
        id=9,
        libelle="Suivi post-financement défini",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=f"conditions_suivi={len(suivi)}, indicateurs={len(indicateurs)}, section={has_section}",
    )


def _crit_10_charte(extraction: ExtractionResult, poids: float, charte: Dict[str, Any]) -> CritereResultat:
    """Charte respectée — vérification honnête depuis le texte extrait.

    Limites assumées : l'extraction texte (pdfplumber/PyPDF2) ne capture
    pas les couleurs ni les polices appliquées visuellement. On ne cherche
    donc que des MARQUEURS TEXTUELS d'identité institutionnelle DÉPS
    (mention de l'organisation, slogan, contact). Une vérification
    visuelle finale par le conseiller reste requise et est mentionnée
    explicitement dans la preuve.
    """
    text_norm = _normalize(extraction.text or "")
    marqueurs = [
        "deps",
        "developpement economique",
        "mrc pierre-de saurel",
        "pierre de saurel",
        "commissaire industriel",
    ]
    hits = sum(1 for m in marqueurs if m in text_norm)
    # 2 marqueurs ou plus = score plein ; 1 marqueur = partiel ; 0 = manquant.
    if hits >= 2:
        score = 1.0
    elif hits == 1:
        score = 0.5
    else:
        score = 0.0
    obtenu = poids * score
    preuve = (
        f"marqueurs_textuels_DEPS={hits}/{len(marqueurs)} "
        "(vérification visuelle des couleurs/typo à effectuer manuellement)"
    )
    return CritereResultat(
        id=10,
        libelle="Charte graphique DÉPS respectée (marqueurs textuels)",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=preuve,
    )


def _crit_11_recommandation_conforme(extraction: ExtractionResult, poids: float) -> CritereResultat:
    reco = extraction.champs.get("recommandation")
    if not _has_value(reco):
        return CritereResultat(
            id=11,
            libelle="Recommandation institutionnelle conforme",
            obtenu=0.0,
            max=round(poids, 2),
            verdict="manquant",
            preuve="aucune recommandation extraite",
        )
    text_norm = str(reco).lower()
    institutionnel = any(
        kw in text_norm
        for kw in [
            "favorable", "défavorable", "defavorable", "conditionnelle",
            "approuv", "refus", "recommandé", "recommande",
        ]
    )
    score = 1.0 if institutionnel else 0.4
    obtenu = poids * score
    return CritereResultat(
        id=11,
        libelle="Recommandation institutionnelle conforme",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=str(reco)[:140],
    )


def _crit_12_global_quality(score_partiel: float, poids: float) -> CritereResultat:
    """Bonus de cohérence : si la moyenne des 11 premiers critères ≥ 90%, plein points."""
    if score_partiel >= 90:
        score = 1.0
    elif score_partiel >= 70:
        score = 0.6
    elif score_partiel >= 50:
        score = 0.3
    else:
        score = 0.0
    obtenu = poids * score
    return CritereResultat(
        id=12,
        libelle="Score qualité global ≥ 90/100",
        obtenu=round(obtenu, 2),
        max=round(poids, 2),
        verdict=_verdict(score, 1.0),
        preuve=f"score 1..11 normalisé = {score_partiel:.1f}/100",
    )


# ---------------------------------------------------------------------------
# Niveau & décision
# ---------------------------------------------------------------------------

def convert_score_to_level(score: int, niveaux_cfg: List[Dict[str, Any]]) -> Dict[str, Any]:
    for palier in sorted(niveaux_cfg, key=lambda p: p["max"]):
        if score <= palier["max"]:
            return {
                "niveau": int(palier["niveau"]),
                "qualificatif": palier["qualificatif"],
                "decision": palier["decision"],
            }
    palier = niveaux_cfg[-1]
    return {
        "niveau": int(palier["niveau"]),
        "qualificatif": palier["qualificatif"],
        "decision": palier["decision"],
    }


# ---------------------------------------------------------------------------
# Entrée principale
# ---------------------------------------------------------------------------

def compute_advisor_score(
    run_id: str,
    extraction: ExtractionResult,
    validation: TemplateValidation,
    config: Dict[str, Any],
) -> AdvisorScore:
    poids = float(config.get("scoring", {}).get("poids_critere", 8.34))
    n_categories = len(config.get("categories_risques", []))
    smart_kw = config.get("smart_keywords", {})
    charte = config.get("charte", {})

    # 11 critères évalués depuis l'extraction
    crits: List[CritereResultat] = [
        _crit_1_sections(validation, poids),
        _crit_2_identification(extraction, poids),
        _crit_3_financier_historique(extraction, poids),
        _crit_4_previsions(extraction, poids),
        _crit_5_risques_cotes(extraction, poids, n_categories),
        _crit_6_mitigations_chiffrees(extraction, poids),
        _crit_7_comparables(extraction, poids),
        _crit_8_conditions_smart(extraction, poids, smart_kw),
        _crit_9_suivi_defini(extraction, poids),
        _crit_10_charte(extraction, poids, charte),
        _crit_11_recommandation_conforme(extraction, poids),
    ]
    # Score normalisé sur 100 pour les 11 premiers (avant critère méta)
    max_partiel = sum(c.max for c in crits)
    obtenu_partiel = sum(c.obtenu for c in crits)
    score_partiel_100 = (obtenu_partiel / max_partiel * 100) if max_partiel else 0.0

    crits.append(_crit_12_global_quality(score_partiel_100, poids))

    # Plafonnement à 100 (les 12 * 8.34 ≈ 100.08)
    seuil_max = float(config.get("scoring", {}).get("seuil_max", 100))
    total = min(sum(c.obtenu for c in crits), seuil_max)
    score_total = int(round(total))

    niveau_info = convert_score_to_level(score_total, config.get("niveaux", []))

    points_forts = [c.libelle for c in crits if c.verdict == "acquis"]
    lacunes = [c.libelle for c in crits if c.verdict in ("partiel", "manquant")]

    corrections = _build_corrections(crits)

    return AdvisorScore(
        run_id=run_id,
        horodatage_utc=_dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds"),
        score_total=score_total,
        niveau=niveau_info["niveau"],
        qualificatif=niveau_info["qualificatif"],
        decision=niveau_info["decision"],
        details_criteres=crits,
        points_forts=points_forts,
        lacunes=lacunes,
        corrections_requises=corrections,
    )


# ---------------------------------------------------------------------------
# Corrections requises
# ---------------------------------------------------------------------------

_CORRECTIONS_PAR_CRITERE: Dict[int, str] = {
    1: "Compléter les 7 sections critiques manquantes du gabarit OptiRisque.",
    2: "Saisir le nom de l'entreprise, le secteur et les numéros FLI/FLS dans l'en-tête du dossier.",
    3: "Ajouter au moins 3 années de données financières historiques avec KPI clés (DSCR, marge brute, endettement).",
    4: "Documenter les prévisions sur 3 à 5 ans (BFR, EBITDA, plan de trésorerie).",
    5: "Coter les 5 catégories de risques (Marché, Opérationnel, Financier, Gouvernance, Juridique).",
    6: "Chiffrer chaque mitigation (montant, ratio, échéance).",
    7: "Ajouter au moins deux comparables sectoriels (médianes industrie / benchmark).",
    8: "Reformuler les conditions de décaissement en SMART (Spécifique, Mesurable, Atteignable, Réaliste, Temporel).",
    9: "Définir un cadre de suivi post-financement avec fréquence et indicateurs.",
    10: ("Appliquer la charte DÉPS (couleurs Indigo #24135D / Bleu #0057B8 / "
         "Cyan #00AEC7, typographie Metric ou Noto Sans)."),
    11: "Formuler une recommandation institutionnelle explicite (favorable, défavorable, conditionnelle).",
    12: "Atteindre un score ≥ 90/100 sur les 11 premiers critères avant soumission CIC.",
}


def _build_corrections(crits: List[CritereResultat]) -> List[Dict[str, Any]]:
    corrections: List[Dict[str, Any]] = []
    for c in crits:
        if c.verdict == "acquis":
            continue
        priorite = "bloquante" if c.verdict == "manquant" else "haute"
        corrections.append(
            {
                "critere_id": c.id,
                "action": _CORRECTIONS_PAR_CRITERE.get(c.id, c.libelle),
                "priorite": priorite,
            }
        )
    return corrections
