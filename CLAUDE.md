# CLAUDE.md

Guide opérationnel pour Claude Code sur ce dépôt. Ces instructions priment sur les comportements par défaut.

---

## 1. Contexte du projet

Dépôt **`jeanfrancoisleblanc28/myrepo`** — vitrine numérique du **commissaire industriel de la MRC Pierre-De Saurel** (Sorel-Tracy, Québec). Le produit combine :

- **Un tableau de bord web** (Next.js 14 App Router + Tailwind) pour présenter les zones industrielles, la chaîne d'approvisionnement navale, un générateur de kit UI/UX, et piloter un serveur MCP local.
- **Un agent conversationnel Python** (`agent/commissaire_industriel.py`) qui aide les investisseurs à trouver un terrain industriel, modes règles / OpenAI / Anthropic.
- **Des livrables HTML statiques autonomes** (organigramme DÉPS, états financiers, showcase UI) servis directement sans pipeline de build.

**Langue du domaine : français (Québec).** Tout contenu destiné à l'utilisateur final (UI, messages, docs produit) doit être en français. Le code, les noms de variables et les commentaires techniques peuvent rester en anglais.

## 2. Architecture

```
myrepo/
├── src/                              # Frontend Next.js 14 (App Router, RSC par défaut)
│   ├── app/
│   │   ├── page.tsx                  # Accueil
│   │   ├── layout.tsx                # Layout racine (navbar, theme provider)
│   │   ├── dashboard/                # Dashboard MCP (upload PDF, statut serveur, outils)
│   │   ├── chaine-navale/            # Cartographie chaîne d'approvisionnement navale
│   │   └── skills/                   # Catalogue UI/UX + générateur de kit
│   │       ├── document/             # Mode "document" (export imprimable)
│   │       └── present/              # Mode "présentation" (keynote-like)
│   ├── components/
│   │   ├── ui/                       # Primitives (badge, button, card, command-palette, input, modal, skeleton, toast)
│   │   ├── mcp/                      # Intégration serveur MCP (pdf-dropzone, server-status, tool-list)
│   │   ├── layout/                   # navbar, theme-provider, theme-toggle
│   │   └── skills/                   # Composants /skills (AuroraBackground, CategoryTile, Confetti,
│   │                                 #   DocumentPages, DocumentToolbar, KitGenerator,
│   │                                 #   PresentationSlide, SkillCard)
│   ├── lib/
│   │   ├── mcp-client.ts             # Client HTTP vers localhost:8080 — SEUL point d'E/S réseau
│   │   ├── cn.ts                     # Helper clsx + tailwind-merge
│   │   ├── design-tokens.ts          # Tokens de design partagés
│   │   ├── skills-data.ts            # Catalogue UI/UX (catégories + skills) — source de vérité
│   │   └── naval-supply-chain.ts     # Données structurées pour /chaine-navale
│   └── styles/
│       ├── globals.css               # Tailwind + variables de thème
│       └── print.css                 # Styles d'impression (mode document)
├── agent/                            # Agent Python autonome
│   ├── commissaire_industriel.py     # CLI + moteur de règles + adapters LLM
│   ├── data/zones_industrielles.json # Source de vérité territoriale
│   ├── requirements.txt              # Dépendances LLM commentées (mode règles = 0 dep)
│   └── README.md                     # Doc utilisateur de l'agent
├── docs/                             # Documents produit (.md) — plans, executive summaries
├── prompts/                          # Personas (ex. dga_consultant.md, cf. §10)
├── public/                           # Assets statiques (ex. chaine-navale.pdf)
├── organigramme.html                 # Page statique autonome (DÉPS)
├── etats-financiers-deps-2025.html   # Cahier d'administrateur — états financiers
├── showcase.html                     # Showcase UI/UX (single-file)
├── .mcp.json                         # Config serveur MCP (localhost:8080)
├── .claude/settings.json             # Permissions Claude Code (allow/deny lists)
└── .github/workflows/ci.yml          # Lint, shellcheck, black, flake8, bandit, pytest, yamllint
```

**Règle de séparation** : le frontend et l'agent Python sont indépendants. Ne jamais introduire de dépendance croisée entre `src/` et `agent/`.

**Pages HTML statiques** (`organigramme.html`, `etats-financiers-deps-2025.html`, `showcase.html`) : autonomes, sans pipeline de build, modifier directement le HTML/CSS/JS inline.

## 3. Commandes à connaître

| Objectif | Commande |
|---|---|
| Installer les deps frontend | `npm install` |
| Dev server Next.js | `npm run dev` |
| Build de production | `npm run build` |
| Lint ESLint | `npm run lint` |
| Type-check TypeScript | `npm run typecheck` |
| Lint + typecheck combinés | `npm run check` |
| Lancer l'agent (mode règles) | `python agent/commissaire_industriel.py` |
| Agent mode OpenAI | `python agent/commissaire_industriel.py --openai` |
| Agent mode Claude | `python agent/commissaire_industriel.py --anthropic` |
| Lint shell | `make lint` |
| Setup full (npm + pip) | `make setup` |

**Après toute modification TypeScript**, exécuter `npm run check` avant de committer. Il n'y a pas de tests unitaires applicatifs (voir §7).

## 4. Conventions

### Git
- **Branches** : `feature/<description>` pour les nouvelles fonctionnalités ; les branches de session Claude suivent le format `claude/<slug>`.
- **Commits** : impératif court, français ou anglais accepté, aligné sur l'historique existant (ex. `Add command palette`, `Corriger le calcul des zones`).
- **Jamais** committer sans demande explicite de l'utilisateur.

### Frontend (Next.js / React)
- Utiliser l'**alias `@/*`** (configuré dans `tsconfig.json`) pour tout import interne : `import { cn } from "@/lib/cn"`.
- Composants UI : pattern **shadcn-like** — composition via `cn()`, variants via props, pas de styled-components.
- **Accessibilité** : cibler WCAG 2.2 AA (contrastes, focus visible, navigation clavier, ARIA sur les composants interactifs).
- **Client component** : ajouter `"use client"` seulement si nécessaire (état, effets, événements). Privilégier les Server Components.
- **E/S réseau** : passer exclusivement par `src/lib/mcp-client.ts`. Ne pas appeler `fetch` directement depuis les composants.
- **Données métier** : tout contenu structuré (skills, fournisseurs navals, zones industrielles) vit dans `src/lib/*-data.ts` ou `agent/data/*.json` — pas en dur dans les composants ou pages.

### Agent Python
- Python 3.8+ compatible, **sans dépendances externes** pour le mode règles (garder `requirements.txt` minimal — LLM en optionnel commenté).
- Toute nouvelle donnée territoriale va dans `agent/data/zones_industrielles.json`, pas en dur dans le code.
- Garder les trois modes (`rule_based` / `openai` / `anthropic`) fonctionnellement équivalents quand c'est possible.
- Le CI applique **`black`** (format) et **`flake8`** (line length 120, ignore E203/W503) — exécuter `black .` localement avant push si le job de format échoue.

## 5. Pièges spécifiques à éviter

- **`src/lib/mcp-client.ts:49`** : l'override `headers: {}` dans `analyzePdf` est volontaire — ne PAS y remettre `Content-Type: application/json`, sinon le boundary `multipart/form-data` est cassé.
- **`setup_mcp_pdf_server.sh`** : contient des placeholders (`package1`, `package2`) — c'est un template, ne pas le traiter comme un script de production.
- **Pages HTML statiques** (`organigramme.html`, `etats-financiers-deps-2025.html`, `showcase.html`) : pas de pipeline de build — modifier directement le HTML/CSS/JS inline, ne pas tenter de migrer vers React sans instruction explicite.
- **Données sensibles** : ne jamais committer de clé API (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) ni de coordonnées privées. Les variables d'environnement sont lues par l'agent au runtime. `.claude/settings.json` bloque déjà la lecture de `.env*` et `*.pem`/`*.key`.
- **`next-env.d.ts`** et **`*.tsbuildinfo`** sont dans `.gitignore` — ne pas les committer si Next/TS les régénèrent.
- Le serveur MCP local (`localhost:8080`) n'est **pas lancé automatiquement** dans l'environnement Claude — tout test qui en dépend échouera ; utiliser des mocks ou stubber `mcp-client.ts`.
- **Trailing whitespace** : le CI échoue sur tout espace en fin de ligne dans `*.md`, `*.yml`, `*.sh`, `*.py`. Configurer son éditeur ou exécuter `sed -i 's/ *$//' fichier` avant push.
- **`public/chaine-navale.pdf`** est un artefact généré à partir de `/chaine-navale` — ne pas l'éditer à la main ; régénérer depuis la page si le contenu change.

## 6. Structure de dépendances à maintenir

- **Pas de nouveau gestionnaire de paquets** (rester sur npm). Pas de `pnpm` / `yarn` / `bun` sans demande.
- **Pas de nouveau framework CSS** (Tailwind uniquement).
- **Pas de librairie d'état global** (Zustand, Redux, Jotai) sans justification — React state + props suffisent pour l'instant.
- Avant d'ajouter une dépendance npm, vérifier que `clsx`, `tailwind-merge`, ou `lucide-react` ne couvrent pas déjà le besoin.
- Côté Python : garder le mode règles à **zéro dépendance**. Les SDKs `openai` / `anthropic` restent commentés dans `requirements.txt`.

## 7. État actuel des tests & CI

**Aucune suite de tests applicatifs n'est configurée** (pas de Jest / Vitest côté front, pas de pytest réel côté agent — le job `python-test` du CI passe silencieusement quand aucun `test_*.py` n'existe).

Le CI (`.github/workflows/ci.yml`) exécute néanmoins :
1. **`lint`** : trailing whitespace + `yamllint` sur les workflows
2. **`shellcheck`** : `--severity=warning` sur tous les `*.sh`
3. **`python-lint`** : `black --check` + `flake8 --max-line-length=120`
4. **`python-test`** : `pytest --cov` (no-op si aucun test trouvé)
5. **`security`** : `bandit -r .` (severity medium, non-bloquant)

Si on demande à Claude d'ajouter une fonctionnalité à risque (logique de recommandation, client MCP, parser de données), **proposer en priorité d'ajouter une suite de tests** (Vitest côté front, pytest côté agent) plutôt que d'empiler du code non testé.

## 8. Comportements attendus de Claude

- **Lire avant de modifier** : toujours `Read` un fichier avant de l'éditer.
- **Réponses concises** : en français si l'utilisateur écrit en français, en anglais sinon. Pas d'emoji sauf demande.
- **Pas de refactor spontané** : corriger un bug ne justifie pas de réorganiser le fichier.
- **Pas de fichier `.md` de doc créé sans demande** — ce projet a déjà README / CONTRIBUTING / CHANGELOG / CLAUDE.md et un dossier `docs/`.
- **Commits et push** : uniquement sur demande explicite, et sur la branche indiquée dans la session.
- **Escalader tôt** quand l'ambiguïté est architecturale (ex. ajout d'une lib, modification de `.mcp.json`, changement de l'organigramme, refonte de `skills-data.ts` ou `naval-supply-chain.ts`) — utiliser `AskUserQuestion`.

## 9. Contact métier

MRC Pierre-De Saurel — Direction du développement économique
62, rue Élizabeth, Sorel-Tracy (Québec) J3P 1L4 — 450-743-2703

## 10. Persona DGA — pour livrables non-techniques

Quand JFL demande une **analyse financière, un mémo CA/CIC, une fiche projet
FLI/FLS, une note stratégique** ou tout autre **livrable destiné à un comité
(et non du code)**, lire d'abord `prompts/dga_consultant.md` et appliquer la
persona qui y est définie (règles d'anti-invention, traçabilité, gabarits,
format Québec).

Pour les **tâches de développement** (code, tests, lint, refactor, CI), ignorer
cette section et suivre §1-9.
