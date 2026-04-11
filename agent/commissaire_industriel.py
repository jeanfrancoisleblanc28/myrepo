#!/usr/bin/env python3
"""
Commissaire Industriel — MRC Pierre-De Saurel
Agent conversationnel représentant le meilleur commissaire industriel au monde
pour la MRC Pierre-De Saurel (Sorel-Tracy, Québec).

Usage:
    python commissaire_industriel.py
    python commissaire_industriel.py --openai      # utilise l'API OpenAI
    python commissaire_industriel.py --anthropic   # utilise l'API Anthropic (Claude)
"""

import argparse
import json
import os
import sys
import textwrap
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Chargement des données territoriales
# ---------------------------------------------------------------------------

DATA_DIR = Path(__file__).parent / "data"


def load_data() -> dict:
    """Charge les données des zones industrielles de la MRC Pierre-De Saurel."""
    with open(DATA_DIR / "zones_industrielles.json", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Prompt système — identité de l'agent
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
Tu es **Jean-François Leblanc**, le meilleur commissaire industriel au monde. \
Tu travailles pour la **MRC Pierre-De Saurel** (région de Sorel-Tracy, Québec, Canada). \
Tu possèdes 30 ans d'expérience en développement économique industriel, en immobilier \
industriel et en droit foncier québécois. Tu parles exclusivement en français (langue \
professionnelle de la MRC).

## Ta mission
Accompagner tout investisseur, entrepreneur ou promoteur dans :
1. La **recherche et sélection** de terrains industriels disponibles sur le territoire de la MRC
2. La **compréhension du processus** d'achat ou de vente d'un terrain industriel
3. L'**optimisation financière** : programmes d'aide, crédits d'impôt, financement
4. La **conformité réglementaire** : zonage, environnement, permis
5. La **négociation et la clôture** d'une transaction immobilière industrielle

## Tes valeurs
- Tu défends TOUJOURS les intérêts du territoire de la MRC Pierre-De Saurel
- Tu es direct, précis, professionnel et orienté vers l'action
- Tu personnalises tes réponses selon les besoins spécifiques du client
- Tu connais tous les intervenants locaux (notaires, évaluateurs, urbanistes, CLD, Investissement Québec)
- Tu maîtrises les forces du territoire : fleuve Saint-Laurent, port de Sorel, autoroute 30, desserte ferroviaire CN/CP, énergie compétitive Hydro-Québec

## Données territoriales que tu utilises
{territorial_data}

## Règles de conduite
- Toujours commencer par identifier le besoin précis du client (superficie, type d'industrie, budget, échéancier)
- Proposer des terrains concrets disponibles sur le territoire
- Guider étape par étape le processus de transaction
- Mentionner systématiquement les programmes d'aide financière disponibles
- Référer aux bons experts locaux selon la situation
- Ne jamais inventer de prix ou de données : si tu ne sais pas, dire « Je vais vérifier avec notre équipe »
- Conclure chaque échange avec une prochaine action concrète pour le client
"""


def build_system_prompt(data: dict) -> str:
    """Injecte les données territoriales dans le prompt système."""
    territorial_summary = json.dumps(data, ensure_ascii=False, indent=2)
    return SYSTEM_PROMPT.format(territorial_data=territorial_summary)


# ---------------------------------------------------------------------------
# Mode autonome (sans API LLM) — agent basé sur des règles
# ---------------------------------------------------------------------------

MENU_OPTIONS = {
    "1": "processus_achat",
    "2": "processus_vente",
    "3": "zones_disponibles",
    "4": "programmes_aide",
    "5": "contacts",
    "6": "analyse_projet",
}


def print_banner():
    banner = """
╔══════════════════════════════════════════════════════════════════════════════╗
║         COMMISSAIRE INDUSTRIEL — MRC PIERRE-DE SAUREL                      ║
║         Jean-François Leblanc | Expert en développement industriel          ║
║         Sorel-Tracy, Québec | Tél.: 450-743-2703                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
    print(banner)


def print_wrapped(text: str, width: int = 80, indent: str = "  "):
    for paragraph in text.strip().split("\n"):
        if paragraph.strip():
            wrapped = textwrap.fill(paragraph.strip(), width=width, initial_indent=indent,
                                    subsequent_indent=indent)
            print(wrapped)
        else:
            print()


def format_etapes(etapes: list) -> str:
    lines = []
    for e in etapes:
        lines.append(f"\n  Étape {e['etape']} — {e['nom']}")
        lines.append(f"  {'─' * 50}")
        lines.append(f"  {e['description']}")
    return "\n".join(lines)


def handle_processus_achat(data: dict):
    print("\n" + "═" * 78)
    print("  PROCESSUS D'ACHAT D'UN TERRAIN INDUSTRIEL — MRC PIERRE-DE SAUREL")
    print("═" * 78)
    etapes = data["etapes_transaction"]["acquisition"]
    print(format_etapes(etapes))
    print("\n  💡 Conseil du commissaire :")
    print_wrapped(
        "Pour un terrain industriel lourd (M-2) au bord du fleuve, prévoyez "
        "un délai de 90 à 180 jours pour compléter la due diligence environnementale "
        "(Phase I/II) et obtenir les autorisations du MELCCFP. Contactez-moi dès le "
        "départ pour accélérer le processus avec nos partenaires locaux."
    )


def handle_processus_vente(data: dict):
    print("\n" + "═" * 78)
    print("  PROCESSUS DE VENTE D'UN TERRAIN INDUSTRIEL — MRC PIERRE-DE SAUREL")
    print("═" * 78)
    etapes = data["etapes_transaction"]["vente"]
    print(format_etapes(etapes))
    print("\n  💡 Conseil du commissaire :")
    print_wrapped(
        "Pour maximiser votre prix de vente, assurez-vous d'avoir un certificat "
        "de localisation à jour et un bilan Phase I ESA favorable avant de mettre "
        "sur le marché. Nous avons une liste d'acheteurs pré-qualifiés pour les "
        "zones M-2 industrielles lourdes — contactez-moi avant de recourir à un "
        "courtier externe."
    )


def handle_zones_disponibles(data: dict):
    print("\n" + "═" * 78)
    print("  ZONES INDUSTRIELLES DISPONIBLES — MRC PIERRE-DE SAUREL")
    print("═" * 78)
    for mun in data["municipalites"]:
        print(f"\n  📍 {mun['nom']}")
        for zone in mun.get("zones", []):
            print(f"     Zone {zone['code']} — {zone['type']}")
            print(f"     Superficie disponible : {zone.get('superficie_disponible_ha', 'N/D')} ha")
            print(f"     Prix moyen estimé     : {zone.get('prix_moyen_pied_carre', 'N/D')} $/pi²")
            if zone.get("infrastructures"):
                print(f"     Infrastructures       : {', '.join(zone['infrastructures'])}")
            if zone.get("acces"):
                print(f"     Accès                 : {', '.join(zone['acces'])}")
            print()

    print("  ✅ Avantages concurrentiels du territoire :")
    for avantage in data["avantages_concurrentiels"]:
        print(f"     • {avantage}")


def handle_programmes_aide(data: dict):
    print("\n" + "═" * 78)
    print("  PROGRAMMES D'AIDE FINANCIÈRE DISPONIBLES")
    print("═" * 78)
    for prog in data["programmes_aide"]:
        print(f"\n  💰 {prog['nom']}")
        print(f"     Type        : {prog['type']}")
        print_wrapped(f"Description : {prog['description']}", indent="     ")
    print("\n  💡 Conseil du commissaire :")
    print_wrapped(
        "Un projet d'implantation industrielle bien structuré peut cumuler plusieurs "
        "programmes d'aide. J'ai accompagné des projets où le montage financier combinait "
        "Investissement Québec (prêt à taux préférentiel), le FARR (subvention non remboursable) "
        "et un congé de taxes de 5 ans de la MRC, réduisant ainsi de 40% le coût réel "
        "d'acquisition et d'aménagement du terrain."
    )


def handle_contacts(data: dict):
    print("\n" + "═" * 78)
    print("  CONTACTS CLÉS — RÉSEAU D'EXPERTS MRC PIERRE-DE SAUREL")
    print("═" * 78)
    for contact_id, contact in data["contacts_cles"].items():
        print(f"\n  📞 {contact.get('organisation', contact.get('nom', contact_id))}")
        if "nom" in contact and contact["nom"] != contact.get("organisation"):
            print(f"     Contact     : {contact['nom']}")
        if "telephone" in contact:
            print(f"     Téléphone   : {contact['telephone']}")
        if "adresse" in contact:
            print(f"     Adresse     : {contact['adresse']}")
        if "site_web" in contact:
            print(f"     Site web    : {contact['site_web']}")
        if "description" in contact:
            print_wrapped(f"Description : {contact['description']}", indent="     ")


def handle_analyse_projet(data: dict):
    print("\n" + "═" * 78)
    print("  ANALYSE DE PROJET INDUSTRIEL — QUESTIONNAIRE")
    print("═" * 78)
    print()
    print("  Répondez aux questions suivantes pour recevoir une recommandation personnalisée :")
    print()

    questions = [
        ("secteur", "1. Quel est votre secteur d'activité ? (ex: pétrochimie, logistique, agroalimentaire, acier) "),
        ("superficie", "2. Superficie de terrain requise (en hectares ou en pieds carrés) ? "),
        ("budget", "3. Budget d'acquisition approximatif (en $) ? "),
        ("echeancier", "4. Quel est votre échéancier de démarrage ? "),
        ("emplois", "5. Nombre d'emplois prévus à la création ? "),
        ("besoins_speciaux", "6. Besoins spéciaux ? (accès fleuve, rail, électricité HT, eau industrielle, autre) "),
    ]

    reponses = {}
    for key, question in questions:
        reponses[key] = input(f"  {question}").strip()

    print("\n" + "─" * 78)
    print("  📋 ANALYSE ET RECOMMANDATIONS DU COMMISSAIRE")
    print("─" * 78)

    # Logique de recommandation basée sur les réponses
    secteur = reponses["secteur"].lower()
    besoins = reponses["besoins_speciaux"].lower()

    if any(mot in secteur for mot in ["pétrochimie", "chimie", "raffinerie", "acier", "sidérurgie", "pétrole"]):
        zone_recommandee = "M-2 — Zone industrielle lourde (bord du fleuve, Sorel-Tracy)"
        print(f"\n  ✅ Zone recommandée : {zone_recommandee}")
        print("     Secteur : Zone industrialo-portuaire / Chemin Saint-Roch, Tracy")
        print("     Prix estimé : 3,00 – 4,00 $/pi²")
        print("     Atout majeur : Accès direct au port de Sorel et à la voie ferrée CN")
    elif any(mot in secteur for mot in ["logistique", "transport", "entrepôt", "distribution"]):
        zone_recommandee = "M-1 — Zone industrielle légère (accès A-30)"
        print(f"\n  ✅ Zone recommandée : {zone_recommandee}")
        print("     Secteur : Boulevard Fiset / Autoroute 30, Sorel-Tracy")
        print("     Prix estimé : 4,00 – 5,50 $/pi²")
        print("     Atout majeur : Intersection A-30/Rte 132, hub logistique régional")
    elif any(mot in secteur for mot in ["agroalimentaire", "alimentaire", "agricole", "transformation"]):
        zone_recommandee = "M-1 — Zone agro-industrielle (Sainte-Anne-de-Sorel / Saint-Robert)"
        print(f"\n  ✅ Zone recommandée : {zone_recommandee}")
        print("     Secteur : Saint-Robert ou Sainte-Anne-de-Sorel")
        print("     Prix estimé : 2,00 – 3,00 $/pi²")
        print("     Atout majeur : Proximité des terres agricoles et du fleuve")
    else:
        print(f"\n  ✅ Recommandation générale : Zone M-1, Sorel-Tracy")
        print("     Plusieurs terrains disponibles selon vos besoins spécifiques.")

    print()
    print_wrapped(
        "Prochaine étape : Je vous invite à une rencontre de 30 minutes à nos bureaux "
        "au 62 rue Élizabeth, Sorel-Tracy, pour analyser vos besoins en détail et vous "
        "présenter les terrains disponibles avec plans et données cadastrales. "
        "Appelez-moi au 450-743-2703 ou écrivez à developpement@mrcpierredesaurel.com"
    )


def run_rule_based_agent(data: dict):
    """Agent conversationnel basé sur des règles (sans API LLM)."""
    print_banner()
    print("  Bonjour ! Je suis Jean-François Leblanc, commissaire industriel de la")
    print("  MRC Pierre-De Saurel. Je suis ici pour vous accompagner dans votre")
    print("  projet d'acquisition ou de vente de terrain industriel.")
    print()
    print("  Comment puis-je vous aider aujourd'hui ?")
    print()
    print("  ┌─────────────────────────────────────────────────────────────────┐")
    print("  │  1. Comprendre le processus d'achat d'un terrain industriel     │")
    print("  │  2. Comprendre le processus de vente d'un terrain industriel    │")
    print("  │  3. Voir les zones industrielles disponibles                    │")
    print("  │  4. Programmes d'aide financière disponibles                    │")
    print("  │  5. Contacts clés et experts locaux                             │")
    print("  │  6. Analyser mon projet (questionnaire personnalisé)            │")
    print("  │  q. Quitter                                                      │")
    print("  └─────────────────────────────────────────────────────────────────┘")
    print()

    handlers = {
        "1": handle_processus_achat,
        "2": handle_processus_vente,
        "3": handle_zones_disponibles,
        "4": handle_programmes_aide,
        "5": handle_contacts,
        "6": handle_analyse_projet,
    }

    while True:
        try:
            choix = input("  Votre choix (1-6, q pour quitter) : ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            print("\n\n  Au revoir ! N'hésitez pas à me recontacter au 450-743-2703.")
            break

        if choix in ("q", "quit", "exit", "quitter"):
            print("\n  Merci pour votre intérêt envers la MRC Pierre-De Saurel.")
            print("  Pour tout projet industriel, contactez-moi :")
            print("  📞 450-743-2703 | 🌐 https://www.mrcpierredesaurel.com")
            print("  Au plaisir de collaborer avec vous !")
            break
        elif choix in handlers:
            handlers[choix](data)
            print("\n" + "─" * 78)
            print("  Que puis-je faire d'autre pour vous ?")
            print()
        else:
            print("  ❌ Choix non valide. Veuillez entrer un chiffre entre 1 et 6, ou 'q' pour quitter.")


# ---------------------------------------------------------------------------
# Mode API OpenAI
# ---------------------------------------------------------------------------

def run_openai_agent(data: dict, api_key: Optional[str] = None):
    """Agent conversationnel propulsé par l'API OpenAI (GPT-4)."""
    try:
        from openai import OpenAI
    except ImportError:
        print("❌ Erreur : Le module 'openai' n'est pas installé.")
        print("   Installez-le avec : pip install openai")
        sys.exit(1)

    api_key = api_key or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("❌ Erreur : La clé API OpenAI est requise.")
        print("   Définissez la variable d'environnement OPENAI_API_KEY.")
        sys.exit(1)

    client = OpenAI(api_key=api_key)
    system_prompt = build_system_prompt(data)
    messages = [{"role": "system", "content": system_prompt}]

    print_banner()
    print("  Mode : Agent IA propulsé par GPT-4 (OpenAI)")
    print("  Tapez 'quitter' pour terminer la conversation.")
    print()

    while True:
        try:
            user_input = input("  Vous : ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\n  Au revoir !")
            break

        if user_input.lower() in ("quitter", "quit", "exit", "q"):
            print("  Au revoir !")
            break

        if not user_input:
            continue

        messages.append({"role": "user", "content": user_input})

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.3,
                max_tokens=1500,
            )
            assistant_message = response.choices[0].message.content
            messages.append({"role": "assistant", "content": assistant_message})
            print()
            print_wrapped(f"Commissaire : {assistant_message}", width=78, indent="  ")
            print()
        except Exception as e:
            print(f"  ❌ Erreur API OpenAI : {e}")


# ---------------------------------------------------------------------------
# Mode API Anthropic (Claude)
# ---------------------------------------------------------------------------

def run_anthropic_agent(data: dict, api_key: Optional[str] = None):
    """Agent conversationnel propulsé par l'API Anthropic (Claude)."""
    try:
        import anthropic
    except ImportError:
        print("❌ Erreur : Le module 'anthropic' n'est pas installé.")
        print("   Installez-le avec : pip install anthropic")
        sys.exit(1)

    api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ Erreur : La clé API Anthropic est requise.")
        print("   Définissez la variable d'environnement ANTHROPIC_API_KEY.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    system_prompt = build_system_prompt(data)
    messages = []

    print_banner()
    print("  Mode : Agent IA propulsé par Claude (Anthropic)")
    print("  Tapez 'quitter' pour terminer la conversation.")
    print()

    while True:
        try:
            user_input = input("  Vous : ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\n  Au revoir !")
            break

        if user_input.lower() in ("quitter", "quit", "exit", "q"):
            print("  Au revoir !")
            break

        if not user_input:
            continue

        messages.append({"role": "user", "content": user_input})

        try:
            response = client.messages.create(
                model="claude-opus-4-6",
                max_tokens=1500,
                system=system_prompt,
                messages=messages,
            )
            assistant_message = response.content[0].text
            messages.append({"role": "assistant", "content": assistant_message})
            print()
            print_wrapped(f"Commissaire : {assistant_message}", width=78, indent="  ")
            print()
        except Exception as e:
            print(f"  ❌ Erreur API Anthropic : {e}")


# ---------------------------------------------------------------------------
# Point d'entrée principal
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Commissaire Industriel — MRC Pierre-De Saurel",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
            Exemples d'utilisation :
              python commissaire_industriel.py               # Mode interactif (sans API)
              python commissaire_industriel.py --openai      # Mode IA avec OpenAI GPT-4
              python commissaire_industriel.py --anthropic   # Mode IA avec Claude
        """),
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--openai", action="store_true", help="Utiliser l'API OpenAI (GPT-4o)")
    group.add_argument("--anthropic", action="store_true", help="Utiliser l'API Anthropic (Claude)")
    parser.add_argument("--api-key", type=str, help="Clé API (sinon utilise la variable d'environnement)")
    args = parser.parse_args()

    data = load_data()

    if args.openai:
        run_openai_agent(data, api_key=args.api_key)
    elif args.anthropic:
        run_anthropic_agent(data, api_key=args.api_key)
    else:
        run_rule_based_agent(data)


if __name__ == "__main__":
    main()
