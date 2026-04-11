# Agent Commissaire Industriel — MRC Pierre-De Saurel

>  — Le meilleur commissaire industriel au monde, au service de la MRC Pierre-De Saurel (Sorel-Tracy, Québec).

## Description

Cet agent conversationnel accompagne investisseurs, entrepreneurs et promoteurs dans toutes les étapes d'une transaction immobilière industrielle sur le territoire de la **MRC Pierre-De Saurel**.

L'agent dispose de trois modes de fonctionnement :

| Mode | Description | Prérequis |
|------|-------------|-----------|
| **Interactif (défaut)** | Menu guidé basé sur des règles, sans API externe | Python 3.8+ seulement |
| **OpenAI GPT-4** | Conversation libre propulsée par GPT-4o | Clé API OpenAI |
| **Anthropic Claude** | Conversation libre propulsée par Claude | Clé API Anthropic |

---

## Installation

```bash
# Mode de base (aucune dépendance)
cd agent/
python commissaire_industriel.py

# Mode OpenAI
pip install openai
export OPENAI_API_KEY="sk-..."
python commissaire_industriel.py --openai

# Mode Anthropic (Claude)
pip install anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
python commissaire_industriel.py --anthropic
```

---

## Utilisation

### Mode interactif (sans API)

```
python commissaire_industriel.py
```

L'agent présente un menu avec 6 options :
1. Processus d'achat d'un terrain industriel (9 étapes détaillées)
2. Processus de vente d'un terrain industriel (5 étapes détaillées)
3. Zones industrielles disponibles (M-1 et M-2 par municipalité)
4. Programmes d'aide financière (MRC, FARR, Investissement Québec, fédéral)
5. Contacts clés et experts locaux
6. Analyse de projet personnalisée (questionnaire interactif)

### Mode IA (conversation libre)

```
python commissaire_industriel.py --openai
# ou
python commissaire_industriel.py --anthropic
```

Posez vos questions en langage naturel, par exemple :
- *"J'ai besoin d'un terrain de 5 hectares pour une usine pétrochimique avec accès au fleuve"*
- *"Quelles sont les étapes pour vendre mon terrain industriel à Sorel-Tracy ?"*
- *"Quels programmes d'aide financière sont disponibles pour mon projet ?"*

---

## Structure des données

```
agent/
├── commissaire_industriel.py     # Agent principal
├── requirements.txt              # Dépendances Python
├── README.md                     # Ce fichier
└── data/
    └── zones_industrielles.json  # Données territoriales MRC Pierre-De Saurel
```

### Données disponibles (`zones_industrielles.json`)

- **Zones industrielles** par municipalité : superficie, prix, infrastructures, accès
- **Avantages concurrentiels** du territoire
- **Programmes d'aide financière** : MRC, FARR, Investissement Québec, fédéral
- **Contacts clés** : MRC, CLD, urbanisme, registre foncier, MELCCFP
- **Réglementation** applicable
- **Processus détaillé** d'achat et de vente (étapes avec descriptions)

---

## Territoire couvert — MRC Pierre-De Saurel

| Municipalité | Zone | Superficie disponible | Prix estimé |
|---|---|---|---|
| Sorel-Tracy | M-1 (légère) | 45 ha | 4,50 $/pi² |
| Sorel-Tracy | M-2 (lourde) | 120 ha | 3,25 $/pi² |
| Saint-Joseph-de-Sorel | M-1 | 12 ha | 3,75 $/pi² |
| Sainte-Anne-de-Sorel | M-1 | 8 ha | 2,80 $/pi² |
| Saint-Robert | M-1 | 6 ha | 2,20 $/pi² |
| Massueville | M-1 | 3 ha | 2,00 $/pi² |

### Atouts stratégiques du territoire

- 🚢 **Port de Sorel** — Accès direct au fleuve Saint-Laurent (navigation internationale)
- 🛣️ **Autoroute 30** — Lien direct vers Montréal, les ponts et les États-Unis
- 🚂 **Desserte CN/CP** — Transport ferroviaire de matières lourdes
- ⚡ **Énergie compétitive** — Tarif industriel Hydro-Québec (L/M)
- 👷 **Main-d'œuvre qualifiée** — Tradition industrielle depuis 1880 (ArcelorMittal, pétrochimie)
- 📍 **Position stratégique** — 75 km de Montréal, 175 km de Québec, 100 km des États-Unis

---

## Contact

**MRC Pierre-De Saurel — Direction du développement économique**
📍 62, rue Élizabeth, Sorel-Tracy (Québec) J3P 1L4
📞 450-743-2703
🌐 https://www.mrcpierredesaurel.com
