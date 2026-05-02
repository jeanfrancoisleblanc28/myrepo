"""
Module run_report_generator — E du cahier des charges.

Produit outputs/run_report.json (audit-ready) à partir des résultats
d'extraction, de validation et de scoring.
"""

from __future__ import annotations

import datetime as _dt
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

from .pdf_extractor import ExtractionResult, TemplateValidation, UploadedPdf
from .advisor_score import AdvisorScore


@dataclass
class StepLog:
    etape: str
    statut: str  # "ok" | "alerte" | "echec" | "ignore"
    horodatage: str
    details: Optional[str] = None


@dataclass
class AuditEntry:
    horodatage: str
    acteur: str
    action: str
    ref: Optional[str] = None


def _now_iso() -> str:
    return _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds")


def make_step(etape: str, statut: str = "ok", details: Optional[str] = None) -> Dict[str, Any]:
    return {
        "etape": etape,
        "statut": statut,
        "horodatage": _now_iso(),
        "details": details,
    }


def make_audit(acteur: str, action: str, ref: Optional[str] = None) -> Dict[str, Any]:
    return {
        "horodatage": _now_iso(),
        "acteur": acteur,
        "action": action,
        "ref": ref,
    }


def generate_run_report(
    upload: UploadedPdf,
    extraction: ExtractionResult,
    validation: TemplateValidation,
    score: AdvisorScore,
    etapes: List[Dict[str, Any]],
    audit_trail: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Construit le payload run_report conforme au schéma."""
    report: Dict[str, Any] = {
        "run_id": upload.run_id,
        "timestamp_utc": _now_iso(),
        "dossier": {
            "entreprise": extraction.champs.get("entreprise"),
            "fli": extraction.champs.get("fli"),
            "fls": extraction.champs.get("fls"),
            "secteur": extraction.champs.get("secteur"),
            "nature_projet": extraction.champs.get("nature_projet"),
            "montant_demande": extraction.champs.get("montant_demande"),
        },
        "fichiers_sources": [
            {
                "chemin": str(upload.stored_path),
                "sha256": upload.sha256,
                "octets": upload.octets,
            }
        ],
        "etapes_traitement": etapes,
        "kpi_extraits": extraction.kpi,
        "analyse_risques": {
            "verdict": extraction.champs.get("verdict_risque"),
            "categories": extraction.risques,
            "swot": extraction.swot,
        },
        "recommandation": extraction.champs.get("recommandation"),
        "conditions": {
            "decaissement": extraction.suivi.get("decaissement", []) if extraction.suivi else [],
            "suivi": extraction.suivi.get("suivi", []) if extraction.suivi else [],
        },
        "cadre_suivi": {
            "frequence": _detect_frequency(extraction),
            "indicateurs": extraction.suivi.get("indicateurs_mensuels_trimestriels", []) if extraction.suivi else [],
        },
        "score_conseiller": {
            "score_total": score.score_total,
            "niveau": score.niveau,
            "decision": score.decision,
        },
        "validation_gabarit": {
            "sections_attendues": validation.sections_attendues,
            "sections_presentes": validation.sections_presentes,
            "sections_manquantes": validation.sections_manquantes,
            "taux_completude": validation.taux_completude,
        },
        "audit_trail": audit_trail,
        "alertes": list(extraction.alertes),
    }
    return report


def _detect_frequency(extraction: ExtractionResult) -> Optional[str]:
    text = (extraction.text or "").lower()
    for cand in ("mensuel", "trimestriel", "semestriel", "annuel"):
        if cand in text:
            return cand
    return None


def write_json(path: Path, payload: Dict[str, Any]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, sort_keys=False)
    return path
