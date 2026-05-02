# Moteur d'automatisation OptiRisque — DÉPS

Pipeline Python complet permettant, à partir d'un PDF OptiRisque (gabarit
FTQ / FLI-FLS), de produire un dossier audit-ready pour le **Comité
d'investissement (CIC)** du DÉPS — MRC Pierre-De Saurel.

## Vue d'ensemble

```
PDF OptiRisque
   │
   ▼
[A] upload_pdf            → /inputs/pdf + SHA-256 + run_id RUN-AAAA-MM-JJ-HHMM
[B] extract_optirisque_data → champs métier, KPI, risques, SWOT, conditions
[C] validate_against_template → 13 sections du gabarit OptiRisque
[D] advisor_score          → 12 critères → score /100 → niveau /10 → décision
[E] generate_run_report    → outputs/run_report.json (audit-ready)
[F] generate_cic_slides    → outputs/slides_cic.pptx + slides_outline.md
[G] exports                → /outputs (6 livrables)
```

## Arborescence

```
optirisque_engine/
├── main.py                        # Orchestrateur CLI
├── config.yaml                    # Charte, gabarit, scoring, charte DÉPS
├── requirements.txt               # Dépendances optionnelles
├── modules/
│   ├── pdf_extractor.py           # A + B + C
│   ├── advisor_score.py           # D
│   ├── run_report_generator.py    # E
│   └── slide_generator.py         # F
├── schemas/
│   ├── run_report.schema.json
│   └── advisor_score.schema.json
├── inputs/pdf/                    # PDF source (copie horodatée)
└── outputs/                       # Livrables générés
```

## Installation

```bash
# Le coeur fonctionne en stdlib seul. Les dépendances suivantes activent :
#   - pdfplumber / PyPDF2 : extraction PDF de qualité
#   - python-pptx         : génération PowerPoint native (sinon : Markdown seul)
#   - PyYAML              : parsing YAML standard (sinon : parser interne)
pip install -r optirisque_engine/requirements.txt
```

## Utilisation

```bash
python optirisque_engine/main.py /chemin/vers/dossier.pdf
```

Options :

| Option | Défaut | Description |
| --- | --- | --- |
| `--config` | `optirisque_engine/config.yaml` | Configuration (charte, scoring, gabarit). |
| `--root` | `optirisque_engine/` | Racine pour `inputs/` et `outputs/`. |

Sortie : un résumé JSON sur stdout, et 6 fichiers dans `outputs/` :

| Fichier | Rôle |
| --- | --- |
| `run_report.json` | Rapport audit-ready (run_id, KPI, risques, score, audit trail) |
| `advisor_score.json` | Détail des 12 critères + corrections requises |
| `extraction_summary.json` | Données brutes extraites du PDF |
| `slides_outline.md` | Storyboard du deck CIC (toujours produit) |
| `slides_cic.pptx` | Deck PowerPoint conforme charte DÉPS (si `python-pptx` installé) |
| `audit_log.json` | Trace complète des étapes et acteurs |

## Score conseiller (grille DÉPS — cible 10/10)

12 critères pondérés équitablement (~8.34 pts chacun, plafonné à 100) :

1. Sept sections critiques présentes
2. Identification dossier (entreprise, FLI/FLS, secteur)
3. Données financières historiques suffisantes
4. Prévisions documentées
5. Cinq catégories de risques cotées
6. Mitigations chiffrées
7. Comparables sectoriels
8. Conditions de décaissement SMART
9. Suivi post-financement défini
10. Charte graphique DÉPS respectée
11. Recommandation institutionnelle conforme
12. Score qualité global ≥ 90/100

| Score | Niveau | Qualificatif | Décision |
| --- | --- | --- | --- |
| 0–49 | 3/10 | insuffisant | retour conseiller |
| 50–69 | 5/10 | acceptable | retour conseiller |
| 70–89 | 7/10 | standard CIC | prêt CIC |
| 90–100 | 10/10 | référence DÉPS | prêt CIC |

## Charte graphique DÉPS

| Couleur | Code | Usage |
| --- | --- | --- |
| Indigo | `#24135D` | Bandeau, titres |
| Bleu | `#0057B8` | Sous-titres, accents |
| Cyan | `#00AEC7` | Bandeau KPI, traits |
| Typo primaire | `Metric` | Titres |
| Typo fallback | `Noto Sans` | Corps |

Toute la charte est centralisée dans `config.yaml` → `charte:`.

## Garanties méthodologiques

- **Aucune donnée n'est inventée.** Si un champ n'est pas trouvé dans le PDF,
  il vaut `"non extrait"` et une alerte est ajoutée à `audit_log.json`.
- Chaque condition de décaissement est évaluée contre les 5 axes SMART
  (mots-clés configurables dans `config.yaml` → `smart_keywords:`).
- Le score est sévère mais défendable : chaque critère porte sa preuve
  (`details_criteres[*].preuve`) et son verdict (`acquis`/`partiel`/`manquant`).
- Le `run_id` est déterministe (UTC, format `RUN-AAAA-MM-JJ-HHMM`) ; le hash
  SHA-256 du PDF source est conservé dans le rapport pour traçabilité.

## Limites connues

- **PDF scannés** : sans OCR amont, l'extraction échoue gracieusement (alerte
  + tous les champs à `"non extrait"`). Le pipeline produit malgré tout les
  livrables vides + corrections requises.
- L'extraction repose sur des patterns regex calés sur les gabarits FTQ /
  FLI-FLS standard. Pour des gabarits divergents, ajuster `_FIELD_PATTERNS`
  et `_KPI_PATTERNS` dans `modules/pdf_extractor.py`.
- Sans `python-pptx`, le deck PPTX n'est pas généré ; `slides_outline.md`
  reste disponible et constitue le storyboard de référence.

## Référence

- `OptiRisque-v2-DEPS.pdf` — référence visuelle, analytique et méthodologique.
- `OptiRisque_Template.pdf` — structure FTQ / FLI-FLS de référence.

## Contact

MRC Pierre-De Saurel — Direction du développement économique
62, rue Élizabeth, Sorel-Tracy (Québec) J3P 1L4 — 450-743-2703
