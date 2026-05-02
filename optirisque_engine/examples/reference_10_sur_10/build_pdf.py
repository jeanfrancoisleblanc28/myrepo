"""
Construit le PDF OptiRisque de référence (10/10) à partir du contenu
narratif. Utilise une structure PDF mono-flux compatible PyPDF2.

Usage :
    python optirisque_engine/examples/reference_10_sur_10/build_pdf.py
"""

from __future__ import annotations

from pathlib import Path
from typing import List

HERE = Path(__file__).resolve().parent
OUT_PDF = HERE / "inputs" / "HydrometalSaurel_OptiRisque.pdf"

# Contenu structuré par sections — réplique le narratif du markdown
# en lignes prêtes pour rendu PDF (largeur effective ~95 caractères).
LINES: List[str] = [
    "OptiRisque - Dossier d'analyse de financement - REFERENCE 10/10",
    "MRC Pierre-De Saurel - DEPS - Commissaire industriel",
    "Date de soumission: 28 avril 2026 - CIC du 12 mai 2026",
    "",
    "Information sur l'entreprise",
    "Nom de l'entreprise: Hydrometal Saurel Inc.",
    "Secteur d'activite: Metallurgie de precision - composants electrolyseurs et piles a hydrogene vert",
    "FLI: 2026-008",
    "FLS: 2026-008B",
    "Adresse: 410 rue de la Forge, Sorel-Tracy (Quebec) J3P 7T2",
    "Annee de fondation: 2014. Effectif: 47 employes (38 production, 6 ingenierie, 3 admin).",
    "Actionnariat: Sophie Tremblay 62%, Karim Boudreau 28%, Fonds locaux DEPS 10%.",
    "Certifications: ISO 9001:2015, ISO 14001:2015, AWS D1.1.",
    "",
    "Projet a financer",
    "Nature du projet: Acquisition d'une cellule de soudure robotisee TIG/MIG 6 axes pour doubler la",
    "capacite de production de composants pour electrolyseurs PEM et qualifier l'usine au standard",
    "Bureau Veritas H2 - exigence des donneurs d'ordres europeens (Plug Power, ITM Power).",
    "Objectifs mesurables: capacite +110% en 18 mois; marge brute +4 points (28% a 32%);",
    "creation nette de 12 emplois techniques sur 24 mois; reduction CO2 -22% par unite.",
    "Calendrier: commande T2 2026, mise en service T4 2026, qualification BV H2 T1 2027.",
    "",
    "Couts et sources de financement",
    "Couts: cellule robotisee 1 650 000 $; amenagement et ventilation H2 240 000 $;",
    "logiciel CAO/FAO 180 000 $; formation 90 000 $; fonds de roulement 240 000 $.",
    "Total projet: 2 400 000 $.",
    "Sources: FLI 600 000 $ (25%); FLS 500 000 $ (21%); mise de fonds 600 000 $ (25%);",
    "Investissement Quebec 500 000 $ (21%); subvention RenoVert 200 000 $ (8%).",
    "Montant demande: 1 100 000 $.",
    "",
    "Sommaire du financement propose",
    "Capital total a financer: 1 100 000 $. Taux: prime + 2.75% (FLI), prime + 3.25% (FLS).",
    "Amortissement: 7 ans. Moratoire de capital: 6 mois.",
    "Garanties: surete generale 1er rang sur equipement 110% du pret, caution personnelle solidaire",
    "minimum 25% du capital, hypotheque immobiliere subsidiaire.",
    "Covenants: DSCR superieur a 1.40; ratio dette/equite inferieur a 1.80; concentration client",
    "maximum 35% par exercice.",
    "",
    "Portrait financier historique",
    "DSCR: 1.85",
    "Marge brute: 28.5%",
    "Endettement: 52%",
    "Concentration client: 22%",
    "Carnet de commandes: 4 200 000 $",
    "Historique 4 exercices (2022-2025): CA 6.2 M$ a 11.2 M$; EBITDA 720 k$ a 1 880 k$;",
    "marge brute 25.2% a 28.5%; DSCR 1.42 a 1.85; endettement 1.15 a 0.82.",
    "Tresorerie: 1.4 M$ disponible, ligne de credit 750 k$ inutilisee, fonds de roulement 1.8 M$.",
    "",
    "Portrait financier previsionnel",
    "Previsions sur 5 ans (an 1 a an 5) basees sur le carnet securise et le pipeline qualifie.",
    "An 1 (2026): CA 13.8 M$, EBITDA 2 350 k$, marge brute 29.2%, DSCR 1.92, endettement 0.78.",
    "An 2 (2027): CA 17.2 M$, EBITDA 3 100 k$, marge brute 30.4%, DSCR 2.15, endettement 0.68.",
    "An 3 (2028): CA 20.8 M$, EBITDA 3 950 k$, marge brute 31.5%, DSCR 2.38.",
    "An 4 (2029): CA 23.5 M$, EBITDA 4 580 k$, DSCR 2.52.",
    "An 5 (2030): CA 25.8 M$, EBITDA 5 100 k$, DSCR 2.68, endettement 0.38.",
    "Hypotheses cles: commande Plug Power 5.2 M$ sur 30 mois; pipeline qualifie 12 M$;",
    "inflation acier 2.5%/an; hausse salariale 3%/an; subvention RenoVert encaissee T3 2026.",
    "Stress test: scenario adverse -15% volume +10% acier -> DSCR an 1 = 1.52, endettement 0.95,",
    "tresorerie minimum 420 k$ - covenants respectes.",
    "",
    "Analyse des risques",
    "Marche: modere - dependance secteur hydrogene vert et top-3 clients = 48% du carnet.",
    "Operationnel: faible - equipe technique ancienneté 6.2 ans, redondance machines, 0 LTI.",
    "Financier: modere - DSCR confortable mais sensibilite acier 31% du COGS.",
    "Gouvernance: faible - CA structure (5 administrateurs dont 2 independants), plan de releve.",
    "Juridique: faible - aucun litige actif, conformite environnementale a jour, brevet depose.",
    "",
    "Mitigation: diversification client cible 15% au-dela du top-3 sur 24 mois (Europe).",
    "Mitigation: couverture matieres acier minimum 60% des volumes T+1 sur 4 trimestres.",
    "Mitigation: reserve de tresorerie minimum 500 000 $ maintenue 12 mois post-decaissement.",
    "Mitigation: assurance bris de machine 2 000 000 $ avec franchise 25 000 $ sur cellule.",
    "Mitigation: double approvisionnement gaz industriels (2 fournisseurs qualifies) sous 6 mois.",
    "",
    "Comparable sectoriel: marge brute mediane industrie metallurgie precision = 26% (benchmark FTQ).",
    "Comparable: DSCR mediane sectorielle FLI/FLS = 1.55. Hydrometal a 1.85 = superieur de 19%.",
    "Comparable: endettement moyenne sectorielle 1.10 (dette/equite). Hydrometal a 0.82.",
    "Comparable transactionnel: Metallurgie Becancour (FLI 2024, 950 k$, secteur similaire) DSCR 1.71.",
    "",
    "Forces: equipe stable, certifications ISO et AWS, brevet, ratios superieurs a l'industrie.",
    "Faiblesses: concentration top-3 clients 48%, sensibilite acier, taille critique a atteindre.",
    "Opportunites: marche hydrogene vert europeen, electrification ferroviaire, contrats Plug Power.",
    "Menaces: hausse acier, taux directeur, concurrence asiatique sur composants standardises.",
    "",
    "Impact portefeuille",
    "Concentration sectorielle FLI DEPS post-decaissement: metallurgie 19% (vs limite 25%).",
    "Concentration geographique MRC Pierre-De Saurel: 41% (vs limite 50%). Aucun depassement.",
    "Diversification renforcee vers la chaine de valeur hydrogene vert.",
    "",
    "Appreciation generale",
    "Dossier solide porte par une equipe de direction experimentee et une strategie clairement",
    "positionnee sur la chaine de valeur hydrogene vert, secteur prioritaire MRC Pierre-De Saurel.",
    "Ratios financiers historiques superieurs a la mediane sectorielle, previsions prudentes",
    "stress-testees, mitigations chiffrees et executables. Projet structure la capacite",
    "industrielle territoriale et cree 12 emplois qualifies sur 24 mois.",
    "",
    "Recommandation",
    "Recommandation: Favorable - approbation du financement combine FLI 600 000 $ + FLS 500 000 $.",
    "Verdict de risque: Modere (cote globale conforme aux parametres FLI/FLS).",
    "Niveau de confiance: eleve. Conformite institutionnelle: pleine.",
    "",
    "Conditions prealables",
    "Fournir avant le 30 juin 2026 les etats financiers verifies 2025 avec DSCR minimum 1.50.",
    "Obtenir avant le 15 mai 2026 caution personnelle solidaire minimum 25% du capital prete.",
    "Signer dans les 30 jours convention de garantie 1er rang couvrant minimum 110% du pret.",
    "Deposer avant le 30 juin 2026 plan de tresorerie 12 mois reserve minimum 500 000 $.",
    "Presenter avant le 31 juillet 2026 confirmation IQ et RenoVert minimum 700 000 $.",
    "Remettre avant le 30 septembre 2026 attestation MELCCFP valide minimum 5 ans.",
    "Maintenir avant chaque versement DSCR minimum 1.40 sur la duree du pret.",
    "",
    "Conditions de suivi",
    "Transmettre dans les 45 jours suivant chaque trimestre les etats financiers intermediaires",
    "et un tableau de bord de gestion.",
    "Maintenir un DSCR superieur a 1.40 sur la duree du pret avec verification trimestrielle",
    "exigible avant chaque versement de capital.",
    "Maintenir un ratio dette/equite inferieur a 1.80 et une concentration client maximum 35%",
    "par exercice.",
    "Transmettre annuellement avant le 30 avril les etats financiers verifies par cabinet CPA",
    "reconnu avec note du verificateur sur les covenants.",
    "",
    "Indicateurs de suivi",
    "DSCR mensuel; marge brute trimestrielle; carnet de commandes mensuel; concentration client",
    "trimestrielle; taux utilisation cellule robotisee mensuel; creation emplois rapport semestriel.",
    "Frequence revue conseiller: trimestrielle; revue annuelle complete a l'exercice.",
    "",
    "Autorisations",
    "Dossier prepare par la Direction du developpement economique - DEPS - de la MRC Pierre-De Saurel,",
    "signe par le commissaire industriel et soumis au Comite d'investissement (CIC) le 12 mai 2026.",
    "Charte appliquee: Indigo #24135D, Bleu #0057B8, Cyan #00AEC7. Typographie Metric / Noto Sans.",
    "MRC Pierre-De Saurel - DEPS - 62 rue Elizabeth, Sorel-Tracy (Quebec) J3P 1L4 - 450-743-2703.",
]


def _wrap(line: str, width: int = 95) -> List[str]:
    """Découpe une longue ligne en segments respectant la largeur PDF."""
    if len(line) <= width:
        return [line]
    out: List[str] = []
    cur = ""
    for word in line.split(" "):
        candidate = (cur + " " + word).strip() if cur else word
        if len(candidate) > width:
            if cur:
                out.append(cur)
            cur = word
        else:
            cur = candidate
    if cur:
        out.append(cur)
    return out


def _escape(text: str) -> bytes:
    s = text.replace("\\", "\\\\").replace("(", r"\(").replace(")", r"\)")
    return s.encode("latin-1", errors="replace")


def build_multi_page_pdf(
    lines: List[str], out_path: Path, lines_per_page: int = 56,
) -> None:
    """PDF multi-pages compatible PyPDF2 avec pagination simple."""
    # Découpage en pages
    expanded: List[str] = []
    for ln in lines:
        expanded.extend(_wrap(ln, 95))
    pages = [expanded[i:i + lines_per_page]
             for i in range(0, len(expanded), lines_per_page)]

    objects: List[bytes] = []

    # 1. Catalog
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")

    # 2. Pages root
    page_kids = " ".join(f"{3 + i * 2} 0 R" for i in range(len(pages)))
    objects.append(
        f"<< /Type /Pages /Kids [{page_kids}] /Count {len(pages)} >>".encode()
    )

    # Pages : pour chaque page, 1 objet Page + 1 objet Contents
    font_obj_id = 3 + 2 * len(pages)  # font après les pages

    for i, page_lines in enumerate(pages):
        # On émet les objets dans l'ordre 3,4,5,6... :
        # (page_index pair, contents_index impair) pour chaque page.
        page_index = 3 + i * 2
        contents_index = page_index + 1
        objects.append(
            (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                f"/Contents {contents_index} 0 R "
                f"/Resources << /Font << /F1 {font_obj_id} 0 R >> >> >>"
            ).encode()
        )

        # Contents stream
        body = bytearray()
        body += b"BT\n/F1 9 Tf\n40 760 Td\n12 TL\n"
        for j, line in enumerate(page_lines):
            body += b"(" + _escape(line) + b") Tj\nT*\n"
        body += b"ET\n"
        stream = (
            b"<< /Length " + str(len(body)).encode() + b" >>\nstream\n"
            + bytes(body) + b"endstream"
        )
        objects.append(stream)

    # Font (dernier objet)
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    # Sérialisation
    pdf = bytearray()
    pdf += b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    offsets = [0]  # objet 0 = libre
    for idx, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf += f"{idx} 0 obj\n".encode() + obj + b"\nendobj\n"
    xref_pos = len(pdf)
    pdf += f"xref\n0 {len(objects) + 1}\n".encode()
    pdf += b"0000000000 65535 f \n"
    for off in offsets[1:]:
        pdf += f"{off:010d} 00000 n \n".encode()
    pdf += b"trailer\n<< /Size " + str(len(objects) + 1).encode() + b" /Root 1 0 R >>\n"
    pdf += b"startxref\n" + str(xref_pos).encode() + b"\n%%EOF\n"

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(pdf)


if __name__ == "__main__":
    build_multi_page_pdf(LINES, OUT_PDF)
    print(f"Wrote {OUT_PDF} ({OUT_PDF.stat().st_size} bytes)")
