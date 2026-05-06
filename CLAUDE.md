# CLAUDE.md

Guide opérationnel pour Claude Code sur ce dépôt. Ces instructions priment sur les comportements par défaut.

---

## 1. Contexte du projet

Dépôt **`jeanfrancoisleblanc28/myrepo`** — vitrine numérique du **commissaire industriel de la MRC Pierre-De Saurel** (Sorel-Tracy, Québec). Le produit combine :

- **Un tableau de bord web** (Next.js 14 App Router + Tailwind) qui présente les zones industrielles, l'organigramme DÉPS, pilote un serveur MCP local, et expose un générateur UI/UX (`/skills`).
- **Un agent conversationnel Python** (`agent/commissaire_industriel.py`) qui aide les investisseurs à trouver un terrain industriel, modes règles / OpenAI / Anthropic.
- **Des artefacts statiques HTML** (`organigramme.html`, `showcase.html`) servis tels quels.

**Langue du domaine : français (Québec).** Tout contenu destiné à l'utilisateur final (UI, messages, docs produit) doit être en français. Le code, les noms de variables et les commentaires techniques peuvent rester en anglais.

## 2. Architecture

```
myrepo/
├── src/                              # Frontend Next.js (App Router)
│   ├── app/
│   │   ├── page.tsx                  # Landing
│   │   ├── layout.tsx                # Root layout + theme provider
│   │   ├── dashboard/page.tsx        # Tableau de bord MCP
│   │   └── skills/                   # Catalogue UI/UX Pro Max
│   │       ├── page.tsx              # Catalogue + générateur de kit
│   │       ├── present/              # Mode présentation plein-écran
│   │       └── document/page.tsx     # Document client imprimable
│   ├── components/
│   │   ├── ui/                       # Primitives (button, badge, card, modal, toast,
│   │   │                             #   input, skeleton, command-palette)
│   │   ├── mcp/                      # pdf-dropzone, server-status, tool-list
│   │   ├── layout/                   # navbar, theme-provider, theme-toggle
│   │   └── skills/                   # AuroraBackground, Confetti, SkillCard,
│   │                                 #   CategoryTile, KitGenerator,
│   │                                 #   PresentationSlide, DocumentPages,
│   │                                 #   DocumentToolbar
│   ├── lib/
│   │   ├── mcp-client.ts             # Client HTTP vers localhost:8080 — SEUL point d'E/S réseau
│   │   ├── cn.ts                     # Helper clsx + tailwind-merge
│   │   ├── design-tokens.ts          # Tokens de design partagés
│   │   └── skills-data.ts            # Catalogue UI/UX (41 compétences, 9 catégories)
│   └── styles/globals.css            # Variables CSS + keyframes (aurora, flip-in, etc.)
├── agent/                            # Agent Python autonome
│   ├── commissaire_industriel.py     # CLI + moteur de règles + adapters LLM
│   ├── requirements.txt              # LLM en optionnel commenté
│   ├── README.md                     # Doc détaillée de l'agent
│   └── data/zones_industrielles.json # Source de vérité territoriale
├── docs/                             # Notes produit (non publiées)
│   ├── UIUX-SKILLS-GENERATOR-EXECUTIVE.md
│   └── chatgpt-app-plan.md
├── organigramme.html                 # Page statique autonome (DÉPS)
├── showcase.html                     # Démo statique UI/UX (cursor custom, aurora, ~950 LOC)
├── setup_mcp_pdf_server.sh           # Template d'installation (placeholders package1/2)
├── .mcp.json                         # Config serveur MCP (localhost:8080)
├── .claude/settings.json             # Permissions Claude Code (allow/deny lists)
└── .github/workflows/ci.yml          # Lint + shellcheck + python lint/test + bandit
```

**Règle de séparation** : le frontend et l'agent Python sont indépendants. Ne jamais introduire de dépendance croisée entre `src/` et `agent/`.

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
| Agent mode Claude | `python agent/commissaire_industriel.py --anthropic` |
| Agent mode OpenAI | `python agent/commissaire_industriel.py --openai` |
| Lint shell (shellcheck) | `make lint` |
| Setup global (npm + pip) | `make setup` |

**Après toute modification TypeScript**, exécuter `npm run check` (alias de `lint && typecheck`) avant de committer. La suite de tests JS reste inexistante — voir §7.

## 4. Conventions

### Git
- **Branches** : `feature/<description>` pour les nouvelles fonctionnalités ; les branches de session Claude suivent le format `claude/<slug>`.
- **Commits** : impératif court, français ou anglais accepté, aligné sur l'historique existant (ex. `Add command palette`, `Corriger le calcul des zones`).
- **Jamais** committer ni pousser sans demande explicite de l'utilisateur. Pas de `--force`, `--no-verify`, `reset --hard`, `clean -fd` (déjà bloqués dans `.claude/settings.json`).

### Frontend (Next.js / React)
- Utiliser l'**alias `@/*`** (configuré dans `tsconfig.json`) pour tout import interne : `import { cn } from "@/lib/cn"`.
- Composants UI : pattern **shadcn-like** — composition via `cn()`, variants via props, pas de styled-components.
- **Accessibilité** : cibler WCAG 2.2 AA (contrastes, focus visible, navigation clavier, ARIA sur les composants interactifs). Respecter `prefers-reduced-motion` pour toute animation.
- **Client component** : ajouter `"use client"` seulement si nécessaire (état, effets, événements). Privilégier les Server Components.
- **E/S réseau** : passer exclusivement par `src/lib/mcp-client.ts`. Ne pas appeler `fetch` directement depuis les composants.
- **Catalogue skills** : toute nouvelle compétence ou catégorie va dans `src/lib/skills-data.ts` (source unique consommée par `/skills`, `/skills/present`, `/skills/document` et la command palette).

### Agent Python
- Python 3.8+ compatible, **sans dépendances externes** pour le mode règles (garder `requirements.txt` minimal — LLM en optionnel commenté).
- Toute nouvelle donnée territoriale va dans `agent/data/zones_industrielles.json`, pas en dur dans le code.
- Garder les trois modes (`rule_based` / `openai` / `anthropic`) fonctionnellement équivalents quand c'est possible.
- **Formatage CI** : Python est vérifié par `black --check` (ligne 120) et `flake8` (`--max-line-length=120 --extend-ignore=E203,W503`). Lancer `black .` localement avant de committer.

### Style de fichier (vérifié en CI)
- **Pas de trailing whitespace** sur `*.md`, `*.yml`, `*.sh`, `*.py` — la CI échoue sinon.
- **YAML** validé par `yamllint -d relaxed` sur `.github/workflows/ci.yml`.

## 5. Pièges spécifiques à éviter

- **`src/lib/mcp-client.ts` (`analyzePdf`)** : l'override `headers: {}` est volontaire — ne PAS y remettre `Content-Type: application/json`, sinon le boundary `multipart/form-data` est cassé.
- **`setup_mcp_pdf_server.sh`** : contient des placeholders (`package1`, `package2`) — c'est un template, ne pas le traiter comme un script de production.
- **`organigramme.html` et `showcase.html`** : fichiers statiques autonomes (pas de pipeline de build) — modifier le HTML/CSS/JS inline, ne pas tenter de migrer vers React sans instruction explicite.
- **Données sensibles** : ne jamais committer de clé API (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) ni de coordonnées privées. `.claude/settings.json` bloque déjà la lecture de `.env*`, `*.pem`, `*.key`.
- **`next-env.d.ts`** est dans `.gitignore` — ne pas le committer si Next le régénère.
- Le serveur MCP local (`localhost:8080`) n'est **pas lancé automatiquement** dans l'environnement Claude — tout test qui en dépend échouera ; utiliser des mocks.
- **Skills générés par seed** : `generateKit({seed})` dans `skills-data.ts` doit rester déterministe (mulberry32) — ne pas substituer `Math.random` sans préserver le partage par URL (`?ids=…`).

## 6. Structure de dépendances à maintenir

- **Pas de nouveau gestionnaire de paquets** (rester sur npm). Pas de `pnpm` / `yarn` / `bun` sans demande.
- **Pas de nouveau framework CSS** (Tailwind uniquement).
- **Pas de librairie d'état global** (Zustand, Redux, Jotai) sans justification — React state + props suffisent pour l'instant.
- Avant d'ajouter une dépendance npm, vérifier que `clsx`, `tailwind-merge`, ou `lucide-react` ne couvrent pas déjà le besoin.
- Côté skills/présentation, favoriser les API natives (View Transitions API, Canvas, `requestAnimationFrame`) plutôt que `framer-motion` ou `canvas-confetti`.

## 7. État actuel des tests

**Aucun fichier de test n'existe** (ni `test_*.py`, ni `*.test.ts(x)`, ni `*.spec.*`). Le job `python-test` de la CI passe en no-op tant qu'aucun fichier n'est trouvé. Les autres jobs CI (`lint`, `shellcheck`, `python-lint`, `security` via bandit) sont en revanche bloquants.

Si on demande à Claude d'ajouter une fonctionnalité à risque (logique de recommandation, client MCP, parser de zones), proposer en priorité d'ajouter une suite de tests (Vitest côté front, pytest côté agent) plutôt que d'empiler du code non testé.

## 8. Comportements attendus de Claude

- **Lire avant de modifier** : toujours `Read` un fichier avant de l'éditer.
- **Réponses concises** : en français si l'utilisateur écrit en français, en anglais sinon. Pas d'emoji sauf demande.
- **Pas de refactor spontané** : corriger un bug ne justifie pas de réorganiser le fichier.
- **Pas de fichier `.md` de doc créé sans demande** — ce projet a déjà README / CONTRIBUTING / CHANGELOG / CLAUDE.md / `agent/README.md` / `docs/*.md`.
- **Commits et push** : uniquement sur demande explicite, et sur la branche indiquée dans la session.
- **Escalader tôt** quand l'ambiguïté est architecturale (ex. ajout d'une lib, modification de `.mcp.json`, changement de l'organigramme, refonte du catalogue skills) — utiliser `AskUserQuestion`.

## 9. Contact métier

MRC Pierre-De Saurel — Direction du développement économique
62, rue Élizabeth, Sorel-Tracy (Québec) J3P 1L4 — 450-743-2703
