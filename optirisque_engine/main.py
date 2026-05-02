"""
Orchestrateur du moteur d'automatisation OptiRisque DÉPS.

Pipeline (cf. CLAUDE.md et cahier des charges) :
  A. upload_pdf
  B. extract_optirisque_data
  C. validate_against_template
  D. advisor_score
  E. generate_run_report
  F. generate_cic_slides
  G. exports → /outputs/

Usage :
  python optirisque_engine/main.py /chemin/vers/dossier.pdf
  python optirisque_engine/main.py dossier.pdf --config optirisque_engine/config.yaml
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, List

# Permet l'exécution `python optirisque_engine/main.py …` depuis la racine
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from modules.pdf_extractor import (  # noqa: E402
    upload_pdf, extract_optirisque_data, validate_against_template,
)
from modules.advisor_score import compute_advisor_score  # noqa: E402
from modules.run_report_generator import (  # noqa: E402
    generate_run_report, make_step, make_audit, write_json,
)
from modules.slide_generator import (  # noqa: E402
    build_slides, render_outline_markdown, write_outline, write_pptx,
)


# ---------------------------------------------------------------------------
# Lecture YAML — utilise PyYAML si dispo, sinon parser minimal interne
# ---------------------------------------------------------------------------

def load_config(path: Path) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Config introuvable : {path}")
    text = path.read_text(encoding="utf-8")
    try:
        import yaml  # type: ignore

        return yaml.safe_load(text) or {}
    except ImportError:
        return _minimal_yaml(text)


def _minimal_yaml(text: str) -> Dict[str, Any]:
    """
    Parser YAML très minimal (clé:valeur, listes, indentation par 2 espaces).
    Suffisant pour config.yaml ; pour des cas complexes, installer PyYAML.
    """
    root: Dict[str, Any] = {}
    stack: List = [(0, root)]

    def coerce(v: str) -> Any:
        s = v.strip()
        if not s:
            return ""
        if s.startswith('"') and s.endswith('"'):
            return s[1:-1]
        if s.startswith("'") and s.endswith("'"):
            return s[1:-1]
        if s.lower() in ("true", "yes"):
            return True
        if s.lower() in ("false", "no"):
            return False
        if s.lower() in ("null", "~"):
            return None
        try:
            if "." in s:
                return float(s)
            return int(s)
        except ValueError:
            return s

    for raw in text.splitlines():
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        stripped = raw.rstrip()
        # Strip trailing comments (heuristique : pas dans une string)
        if " #" in stripped and not (stripped.lstrip().startswith('"') or stripped.lstrip().startswith("'")):
            stripped = stripped.split(" #", 1)[0].rstrip()
        indent = len(stripped) - len(stripped.lstrip(" "))
        line = stripped.lstrip(" ")

        # Pop de la pile jusqu'au parent correspondant
        while stack and stack[-1][0] >= indent:
            stack.pop()
        parent = stack[-1][1] if stack else root

        if line.startswith("- "):
            value_part = line[2:].strip()
            if not isinstance(parent, list):
                # Convertir le dernier slot en liste si besoin
                # (cas où on a fait `key:` puis bullets en-dessous)
                if isinstance(parent, dict) and "_pending_list_key" in parent:
                    key = parent.pop("_pending_list_key")
                    parent[key] = []
                    parent = parent[key]
                    stack.append((indent, parent))
            if ":" in value_part:
                # élément dict: démarrer un nouveau dict
                k, _, v = value_part.partition(":")
                item: Dict[str, Any] = {}
                if v.strip():
                    item[k.strip()] = coerce(v)
                else:
                    item[k.strip()] = {}
                if isinstance(parent, list):
                    parent.append(item)
                stack.append((indent + 2, item))
            else:
                if isinstance(parent, list):
                    parent.append(coerce(value_part))
        else:
            if ":" not in line:
                continue
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip()
            if not value:
                # Le contenu suit (dict ou list)
                child: Any = {}
                if isinstance(parent, dict):
                    parent[key] = child
                stack.append((indent + 2, child))
                # marqueur: si on voit "- " juste après, on transforme
                if isinstance(parent, dict):
                    parent["_pending_list_key"] = key
            else:
                if isinstance(parent, dict):
                    parent[key] = coerce(value)
                    parent.pop("_pending_list_key", None)
    _strip_pending_keys(root)
    return root


def _strip_pending_keys(obj: Any) -> None:
    if isinstance(obj, dict):
        obj.pop("_pending_list_key", None)
        for v in obj.values():
            _strip_pending_keys(v)
    elif isinstance(obj, list):
        for v in obj:
            _strip_pending_keys(v)


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

def run_pipeline(pdf_path: Path, config_path: Path, project_root: Path) -> Dict[str, Any]:
    config = load_config(config_path)
    paths = config.get("paths", {})
    inputs_dir = project_root / paths.get("inputs_pdf", "inputs/pdf")
    outputs_dir = project_root / paths.get("outputs", "outputs")
    outputs_dir.mkdir(parents=True, exist_ok=True)

    etapes: List[Dict[str, Any]] = []
    audit: List[Dict[str, Any]] = []

    # A — upload
    upload = upload_pdf(pdf_path, inputs_dir)
    etapes.append(make_step("upload_pdf", "ok",
                            f"sha256={upload.sha256[:16]}…, octets={upload.octets}"))
    audit.append(make_audit("moteur_optirisque", "Téléversement et hash SHA-256",
                            ref=str(upload.stored_path)))

    # B — extraction
    extraction = extract_optirisque_data(upload.stored_path, config)
    statut_extr = "alerte" if extraction.alertes else "ok"
    etapes.append(make_step("extract_optirisque_data", statut_extr,
                            f"moteur={extraction.moteur}, alertes={len(extraction.alertes)}"))
    audit.append(make_audit("moteur_optirisque", "Extraction des champs métier",
                            ref=f"moteur={extraction.moteur}"))

    # C — validation gabarit
    validation = validate_against_template(extraction, config)
    statut_val = "ok" if validation.taux_completude >= 0.85 else "alerte"
    etapes.append(make_step("validate_against_template", statut_val,
                            f"taux_completude={validation.taux_completude:.2f}, "
                            f"manquantes={len(validation.sections_manquantes)}"))
    audit.append(make_audit("moteur_optirisque", "Validation contre le gabarit OptiRisque",
                            ref=f"completude={validation.taux_completude:.2f}"))

    # D — score conseiller
    score = compute_advisor_score(upload.run_id, extraction, validation, config)
    etapes.append(make_step("advisor_score", "ok",
                            f"score={score.score_total}/100, niveau={score.niveau}/10, "
                            f"décision={score.decision}"))
    audit.append(make_audit("moteur_optirisque", "Calcul du score conseiller (12 critères)",
                            ref=f"score={score.score_total}"))

    # E — run_report
    report = generate_run_report(upload, extraction, validation, score, etapes, audit)
    report_path = outputs_dir / "run_report.json"
    write_json(report_path, report)
    audit.append(make_audit("moteur_optirisque", "Génération run_report.json",
                            ref=str(report_path)))

    # advisor_score.json (sortie autonome)
    score_payload = score.to_dict()
    score_path = outputs_dir / "advisor_score.json"
    write_json(score_path, score_payload)

    # extraction_summary.json
    extraction_summary = {
        "run_id": upload.run_id,
        "moteur_pdf": extraction.moteur,
        "champs": extraction.champs,
        "kpi": extraction.kpi,
        "risques": extraction.risques,
        "swot": extraction.swot,
        "suivi": extraction.suivi,
        "sections_detectees": extraction.sections_detectees,
        "alertes": extraction.alertes,
    }
    write_json(outputs_dir / "extraction_summary.json", extraction_summary)

    # F — slides
    slides = build_slides(extraction, score, config)
    outline_md = render_outline_markdown(
        slides, dossier=str(extraction.champs.get("entreprise") or "dossier"),
        run_id=upload.run_id,
    )
    write_outline(outputs_dir / "slides_outline.md", outline_md)

    pptx_path = outputs_dir / "slides_cic.pptx"
    pptx_ok, pptx_msg = write_pptx(pptx_path, slides, config)
    if pptx_ok:
        etapes.append(make_step("generate_cic_slides", "ok",
                                f"{len(slides)} slides générées"))
    else:
        etapes.append(make_step("generate_cic_slides", "alerte",
                                f"PPTX ignoré : {pptx_msg}. Outline Markdown disponible."))
    audit.append(make_audit("moteur_optirisque", "Génération du deck CIC",
                            ref=str(pptx_path) if pptx_ok else str(outputs_dir / "slides_outline.md")))

    # G — audit_log.json (consolidé final, après ajout des dernières étapes)
    audit_log = {
        "run_id": upload.run_id,
        "etapes": etapes,
        "audit_trail": audit,
        "alertes": extraction.alertes,
    }
    write_json(outputs_dir / "audit_log.json", audit_log)

    # Réécrit le run_report final avec les étapes complètes (post-slides)
    final_report = generate_run_report(upload, extraction, validation, score, etapes, audit)
    write_json(report_path, final_report)

    return {
        "run_id": upload.run_id,
        "score_total": score.score_total,
        "niveau": score.niveau,
        "decision": score.decision,
        "outputs": {
            "run_report": str(report_path),
            "advisor_score": str(score_path),
            "extraction_summary": str(outputs_dir / "extraction_summary.json"),
            "slides_outline": str(outputs_dir / "slides_outline.md"),
            "slides_pptx": str(pptx_path) if pptx_ok else None,
            "audit_log": str(outputs_dir / "audit_log.json"),
        },
        "alertes": extraction.alertes,
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="optirisque-engine",
        description="Moteur d'automatisation OptiRisque DÉPS — pipeline complet.",
    )
    parser.add_argument("pdf", help="Chemin vers un PDF OptiRisque à traiter.")
    parser.add_argument(
        "--config", default=str(ROOT / "config.yaml"),
        help="Chemin vers le fichier de configuration (défaut: optirisque_engine/config.yaml).",
    )
    parser.add_argument(
        "--root", default=str(ROOT),
        help="Racine du projet (défaut: optirisque_engine/).",
    )
    args = parser.parse_args(argv)

    pdf = Path(args.pdf).expanduser().resolve()
    config = Path(args.config).expanduser().resolve()
    root = Path(args.root).expanduser().resolve()

    summary = run_pipeline(pdf, config, root)

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    # Code de sortie 0 même en cas d'alertes : ce sont des avertissements,
    # pas des échecs. Le rapport est toujours produit.
    return 0


if __name__ == "__main__":
    sys.exit(main())
