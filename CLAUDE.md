# CLAUDE.md

Guide opérationnel pour Claude Code sur ce dépôt. Ces instructions priment sur les comportements par défaut.

---

## 1. Contexte du projet

Dépôt **`jeanfrancoisleblanc28/myrepo`** — vitrine numérique du **commissaire industriel de la MRC Pierre-De Saurel** (Sorel-Tracy, Québec). Le produit combine :

- **Un site Next.js 14 + Tailwind** qui héberge plusieurs vitrines : tableau de bord MCP, organigramme DÉPS, cartographie de la chaîne d'approvisionnement navale, et un générateur de kit UI/UX avec mode présentation.
- **Un agent conversationnel Python** (`agent/commissaire_industriel.py`) qui aide les investisseurs à trouver un terrain industriel, modes règles / OpenAI / Anthropic.
- **Deux pages HTML statiques autonomes** (`organigramme.html`, `showcase.html`) — pas de build.

**Langue du domaine : français (Québec).** Tout contenu destiné à l'utilisateur final (UI, messages, docs produit) doit être en français. Le code, les noms de variables et les commentaires techniques peuvent rester en anglais.

## 2. Architecture

```
myrepo/
├── src/                              # Frontend Next.js (App Router)
│   ├── app/
│   │   ├── layout.tsx                # Root layout : ThemeProvider, ToastProvider, Navbar, CommandPalette
│   │   ├── page.tsx                  # Accueil
│   │   ├── dashboard/page.tsx        # Tableau de bord MCP
│   │   ├── chaine-navale/page.tsx    # Cartographie fournisseurs navals (Davie)
│   │   └── skills/
│   │       ├── page.tsx              # Catalogue + générateur de kit UI/UX
│   │       ├── present/              # Mode présentation plein écran
│   │       └── document/             # Mode document imprimable
│   ├── components/
│   │   ├── ui/                       # Primitives shadcn-like (button, modal, toast, command-palette, badge, card, input, skeleton)
│   │   ├── mcp/                      # Intégration serveur MCP (pdf-dropzone, server-status, tool-list)
│   │   ├── skills/                   # Générateur UI/UX : KitGenerator, SkillCard, CategoryTile, AuroraBackground, Confetti, PresentationSlide, DocumentPages, DocumentToolbar
│   │   └── layout/                   # navbar, theme-provider, theme-toggle
│   ├── lib/
│   │   ├── mcp-client.ts             # Client HTTP vers localhost:8080 — SEUL point d'E/S réseau
│   │   ├── skills-data.ts            # Catalogue de compétences UI/UX + presets + générateur de kit
│   │   ├── naval-supply-chain.ts     # Données chaîne d'approvisionnement navale (niveaux 1/2/3)
│   │   ├── cn.ts                     # Helper clsx + tailwind-merge
│   │   └── design-tokens.ts          # Tokens de design partagés
│   └── styles/
│       ├── globals.css
│       └── print.css                 # Styles dédiés au mode document/impression
├── agent/                            # Agent Python autonome
│   ├── commissaire_industriel.py     # CLI + moteur de règles + adapters LLM
│   ├── data/zones_industrielles.json # Source de vérité territoriale
│   └── requirements.txt              # Vide par défaut ; LLM en optionnel commenté
├── docs/                             # Notes produit/stratégie (français)
│   ├── UIUX-SKILLS-GENERATOR-EXECUTIVE.md
│   ├── ai-agents-dga-deps.md
│   └── chatgpt-app-plan.md
├── public/                           # Assets statiques (ex. chaine-navale.pdf)
├── organigramme.html                 # Page statique autonome (DÉPS)
├── showcase.html                     # Vitrine HTML statique autonome
├── .mcp.json                         # Config serveur MCP (localhost:8080)
├── next.config.js                    # reactStrictMode
└── .github/workflows/ci.yml          # Lint (whitespace + YAML) + shellcheck + flake8/black + pytest + bandit
```

**Règle de séparation** :
- Frontend (`src/`) et agent Python (`agent/`) sont indépendants — pas de dépendance croisée.
- Les pages HTML statiques (`organigramme.html`, `showcase.html`) ne participent pas au pipeline Next.js.

## 3. Commandes à connaître

| Objectif | Commande |
|---|---|
| Installer les deps frontend | `npm install` |
| Dev server Next.js | `npm run dev` |
| Build de production | `npm run build` |
| Démarrer en production | `npm run start` |
| Lint ESLint | `npm run lint` |
| Type-check TypeScript | `npm run typecheck` |
| Lint + typecheck combinés | `npm run check` |
| Lancer l'agent (mode règles) | `python agent/commissaire_industriel.py` |
| Agent mode OpenAI | `python agent/commissaire_industriel.py --openai` |
| Agent mode Claude | `python agent/commissaire_industriel.py --anthropic` |
| Lint shell (via Makefile) | `make lint` |
| Setup combiné npm + pip | `make setup` |

**Après toute modification TypeScript**, exécuter `npm run check` avant de committer. Aucun framework de test côté front pour l'instant (voir §7).

## 4. Conventions

### Git
- **Branches** : `feature/<description>` pour les nouvelles fonctionnalités ; les branches de session Claude suivent le format `claude/<slug>`.
- **Commits** : impératif court, français ou anglais accepté, aligné sur l'historique existant (ex. `Add command palette`, `Corriger le calcul des zones`, `Add naval supply chain mapping page`).
- **Jamais** committer sans demande explicite de l'utilisateur.

### Frontend (Next.js / React)
- Utiliser l'**alias `@/*`** (configuré dans `tsconfig.json`) pour tout import interne : `import { cn } from "@/lib/cn"`.
- Composants UI : pattern **shadcn-like** — composition via `cn()`, variants via props, pas de styled-components.
- **Accessibilité** : cibler WCAG 2.2 AA (contrastes, focus visible, navigation clavier, ARIA sur les composants interactifs, skip-link déjà présent dans `layout.tsx`).
- **Client component** : ajouter `"use client"` seulement si nécessaire (état, effets, événements). Privilégier les Server Components — par exemple `src/app/skills/page.tsx` est server, le `KitGenerator` qu'il monte est client.
- **E/S réseau** : passer exclusivement par `src/lib/mcp-client.ts`. Ne pas appeler `fetch` directement depuis les composants.
- **Données structurées** : les catalogues (skills, supply chain) vivent dans `src/lib/*.ts` typés ; ne pas inliner ces tableaux dans les pages.
- **Navbar** (`src/components/layout/navbar.tsx`) : pour ajouter une nouvelle route dans la nav, éditer le tableau `links` — garder l'ordre cohérent avec la hiérarchie produit.

### Agent Python
- Python 3.8+ compatible, **sans dépendances externes** pour le mode règles (garder `requirements.txt` minimal — LLM en optionnel commenté).
- Toute nouvelle donnée territoriale va dans `agent/data/zones_industrielles.json`, pas en dur dans le code.
- Garder les trois modes (`rule_based` / `openai` / `anthropic`) fonctionnellement équivalents quand c'est possible.
- Le CI exécute `black --check` et `flake8 --max-line-length=120 --extend-ignore=E203,W503` — respecter ces règles.

## 5. Pièges spécifiques à éviter

- **`src/lib/mcp-client.ts:49`** : l'override `headers: {}` dans `analyzePdf` est volontaire — ne PAS y remettre `Content-Type: application/json`, sinon le boundary `multipart/form-data` est cassé.
- **`setup_mcp_pdf_server.sh`** : contient des placeholders (`package1`, `package2`) — c'est un template, ne pas le traiter comme un script de production.
- **`organigramme.html` et `showcase.html`** : fichiers statiques autonomes (pas de pipeline de build) — modifier directement le HTML inline, ne pas essayer de les migrer vers React sans instruction explicite.
- **`public/chaine-navale.pdf`** : PDF généré ; ne pas le considérer comme une source de vérité — la donnée canonique est `src/lib/naval-supply-chain.ts`.
- **Données sensibles** : ne jamais committer de clé API (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) ni de coordonnées privées. Les variables d'environnement sont lues par l'agent au runtime.
- **`next-env.d.ts`** et **`*.tsbuildinfo`** sont dans `.gitignore` — ne pas les committer si Next les régénère.
- Le serveur MCP local (`localhost:8080`) n'est **pas lancé automatiquement** dans l'environnement Claude — tout test qui en dépend échouera ; utiliser des mocks.
- **`.claude/settings.local.json`** est ignoré ; ne jamais y mettre de configuration partagée — utiliser `.claude/settings.json`.

## 6. Structure de dépendances à maintenir

- **Pas de nouveau gestionnaire de paquets** (rester sur npm). Pas de `pnpm` / `yarn` / `bun` sans demande.
- **Pas de nouveau framework CSS** (Tailwind uniquement).
- **Pas de librairie d'état global** (Zustand, Redux, Jotai) sans justification — React state + props suffisent pour l'instant.
- **Pas de librairie d'animation lourde** (Framer Motion, GSAP) — les animations actuelles (aurora, confetti, transitions de présentation) sont en CSS/Canvas natif.
- Avant d'ajouter une dépendance npm, vérifier que `clsx`, `tailwind-merge`, ou `lucide-react` ne couvrent pas déjà le besoin.
- Côté Python : ne pas ajouter de dépendance au mode règles. Les SDK LLM restent commentés dans `requirements.txt`.

## 7. État actuel des tests

**Aucune suite de tests unitaires côté front ni côté agent.** Pas de Jest / Vitest, pas de pytest réellement utilisé (le job `python-test` du CI passe à vide tant qu'aucun fichier `test_*.py` n'existe). La CI exécute :

- **Whitespace + YAML lint** (`yamllint -d relaxed`)
- **shellcheck** sur tous les `*.sh`
- **black --check** + **flake8** sur le Python
- **pytest** si des tests existent (no-op sinon)
- **bandit** (scan sécurité Python, severity ≥ medium)

Si on demande à Claude d'ajouter une fonctionnalité à risque (logique de recommandation, client MCP, générateur de kit), proposer en priorité d'ajouter une suite de tests (Vitest côté front, pytest côté agent) plutôt que d'empiler du code non testé.

## 8. Comportements attendus de Claude

- **Lire avant de modifier** : toujours `Read` un fichier avant de l'éditer.
- **Réponses concises** : en français si l'utilisateur écrit en français, en anglais sinon. Pas d'emoji sauf demande.
- **Pas de refactor spontané** : corriger un bug ne justifie pas de réorganiser le fichier.
- **Pas de fichier `.md` de doc créé sans demande** — ce projet a déjà README / CONTRIBUTING / CHANGELOG / CLAUDE.md ainsi que des notes dans `docs/`.
- **Commits et push** : uniquement sur demande explicite, et sur la branche indiquée dans la session.
- **Escalader tôt** quand l'ambiguïté est architecturale (ex. ajout d'une lib, modification de `.mcp.json`, restructuration du catalogue `skills-data.ts`, changement de l'organigramme) — utiliser `AskUserQuestion`.

## 9. Contact métier

MRC Pierre-De Saurel — Direction du développement économique
62, rue Élizabeth, Sorel-Tracy (Québec) J3P 1L4 — 450-743-2703
