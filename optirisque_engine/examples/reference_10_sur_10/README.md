# Référence DÉPS — dossier 10/10 prêt à livrer au CIC

Dossier exemplaire **fictif** sur **Hydrométal Saurel Inc.** (entreprise inventée
de Sorel-Tracy, métallurgie de précision pour composants d'électrolyseurs
hydrogène vert), produit pour calibrer la grille DÉPS à 12 critères et servir
de modèle aux conseillers.

**Score atteint : 100/100 — niveau 10/10 — qualificatif « référence DÉPS » — décision « prêt CIC ».**

> ⚠️ Toute ressemblance avec une entreprise réelle de la MRC Pierre-De Saurel
> est fortuite. Les chiffres, ratios et conditions ne sont pas réels.

## Arborescence

```
reference_10_sur_10/
├── README.md                                  # ce fichier
├── source/
│   └── dossier_optirisque.md                  # narratif source (humain)
├── build_pdf.py                               # script de rendu source → PDF
├── inputs/
│   └── HydrometalSaurel_OptiRisque.pdf        # PDF généré (3 pages)
└── outputs/
    ├── run_report.json                        # rapport audit-ready
    ├── advisor_score.json                     # 12 critères + corrections
    ├── extraction_summary.json                # données brutes extraites
    ├── slides_outline.md                      # storyboard exécutif
    ├── slides_cic.pptx                        # deck CIC charté DÉPS
    └── audit_log.json                         # trace des étapes
```

## Reproduction

```bash
# 1. Générer le PDF source à partir du narratif
python optirisque_engine/examples/reference_10_sur_10/build_pdf.py

# 2. Faire tourner le pipeline complet sur le PDF
python optirisque_engine/main.py \
  optirisque_engine/examples/reference_10_sur_10/inputs/HydrometalSaurel_OptiRisque.pdf \
  --root optirisque_engine/examples/reference_10_sur_10
```

Le pipeline produit les 6 livrables sous `outputs/` et imprime un résumé JSON.

## Détail des 12 critères — tous acquis

| # | Critère | Verdict | Preuve |
| --- | --- | --- | --- |
| 1 | 7 sections critiques | acquis | 7/7 sections critiques détectées |
| 2 | Identification dossier | acquis | entreprise + secteur + FLI 2026-008 + FLS 2026-008B |
| 3 | Données financières historiques | acquis | section + 5/5 KPI extraits |
| 4 | Prévisions documentées | acquis | section + horizon (an 1 à an 5) |
| 5 | 5 catégories de risques cotées | acquis | Marché, Opérationnel, Financier, Gouvernance, Juridique |
| 6 | Mitigations chiffrées | acquis | 5/5 mitigations avec montants/ratios/échéances |
| 7 | Comparables sectoriels | acquis | benchmark FTQ + médianes industrie + transactionnel |
| 8 | Conditions SMART | acquis | 7 conditions S+M+T (Spécifique + Mesurable + Temporel) |
| 9 | Suivi post-financement | acquis | section + 10 indicateurs + cadre trimestriel |
| 10 | Charte DÉPS (marqueurs textuels) | acquis | 4/5 marqueurs (DÉPS, MRC Pierre-De Saurel, commissaire industriel…) |
| 11 | Recommandation institutionnelle | acquis | « Favorable — approbation du financement combiné FLI + FLS » |
| 12 | Score global ≥ 90/100 | acquis | score 1..11 normalisé = 100/100 |

## Profil entreprise (résumé)

- **Hydrométal Saurel Inc.** — Sorel-Tracy, fondée en 2014, 47 employés
- **Secteur** : métallurgie de précision pour électrolyseurs PEM (hydrogène vert)
- **Projet** : acquisition d'une cellule robotisée 6 axes — investissement 2,4 M$
- **Demande** : 1 100 000 $ (FLI 600 k$ + FLS 500 k$) sur 7 ans
- **Recommandation** : Favorable, verdict de risque modéré
- **Création d'emplois** : 12 postes techniques sur 24 mois

## KPI extraits

| Indicateur | Valeur | Comparable sectoriel |
| --- | --- | --- |
| DSCR | 1,85 | Médiane FLI/FLS 1,55 (+19%) |
| Marge brute | 28,5% | Médiane industrie 26% (+2,5 pts) |
| Endettement | 52% (D/E 0,82) | Moyenne 1,10 |
| Concentration client | 22% | Limite covenant 35% |
| Carnet de commandes | 4 200 000 $ | — |

## Conditions de décaissement (toutes SMART)

1. Fournir avant le 30 juin 2026 les états financiers vérifiés 2025 avec DSCR minimum 1,50.
2. Obtenir avant le 15 mai 2026 caution personnelle solidaire minimum 25% du capital prêté.
3. Signer dans les 30 jours convention de garantie 1er rang couvrant minimum 110% du prêt.
4. Déposer avant le 30 juin 2026 plan de trésorerie 12 mois réserve minimum 500 000 $.
5. Présenter avant le 31 juillet 2026 confirmation IQ et RénoVert minimum 700 000 $.
6. Remettre avant le 30 septembre 2026 attestation MELCCFP valide minimum 5 ans.
7. Maintenir avant chaque versement DSCR minimum 1,40 sur la durée du prêt.

## Usage pédagogique

Ce dossier sert de **patron de référence** pour les conseillers DÉPS :

- Toute soumission CIC peut être comparée à ce gabarit pour identifier les
  écarts (sections manquantes, KPI absents, conditions non-SMART, etc.).
- Le `advisor_score.json` détaille les 12 critères avec leur preuve — facile
  à reproduire sur d'autres dossiers.
- Le `slides_cic.pptx` montre la structure visuelle attendue (10 slides,
  charte DÉPS, KPI obligatoire par slide, conclusion CIC).
