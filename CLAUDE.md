# CLAUDE.md

Guide opérationnel pour Claude Code sur ce dépôt. Ces instructions priment sur les comportements par défaut.

---

## 1. Contexte du projet

Dépôt **`jeanfrancoisleblanc28/myrepo`** — vitrine numérique du **commissaire industriel de la MRC Pierre-De Saurel** (Sorel-Tracy, Québec). Le produit combine :

- **Un tableau de bord web** (Next.js 14 + Tailwind) pour présenter les zones industrielles, l'organigramme DÉPS, et piloter un serveur MCP local.
- **Un agent conversationnel Python** (`agent/commissaire_industriel.py`) qui aide les investisseurs à trouver un terrain industriel, modes règles / OpenAI / Anthropic.

**Langue du domaine : français (Québec).** Tout contenu destiné à l'utilisateur final (UI, messages, docs produit) doit être en français. Le code, les noms de variables et les commentaires techniques peuvent rester en anglais.

## 2. Architecture

```
myrepo/
├── src/                          # Frontend Next.js (App Router)
│   ├── app/                      # Routes : /, /dashboard, layout
│   ├── components/
│   │   ├── ui/                   # Primitives (button, modal, toast, command-palette…)
│   │   ├── mcp/                  # Intégration serveur MCP (pdf-dropzone, server-status, tool-list)
│   │   └── layout/               # navbar, theme-provider, theme-toggle
│   ├── lib/
│   │   ├── mcp-client.ts         # Client HTTP vers localhost:8080 — SEUL point d'E/S réseau
│   │   ├── cn.ts                 # Helper clsx + tailwind-merge
│   │   └── design-tokens.ts      # Tokens de design partagés
│   └── styles/globals.css
├── agent/                        # Agent Python autonome
│   ├── commissaire_industriel.py # CLI + moteur de règles + adapters LLM
│   └── data/zones_industrielles.json  # Source de vérité territoriale
├── organigramme.html             # Page statique autonome (DÉPS)
├── .mcp.json                     # Config serveur MCP (localhost:8080)
└── .github/workflows/ci.yml      # Lint + shellcheck (aucun test)
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
| Lancer l'agent (mode règles) | `python agent/commissaire_industriel.py` |
| Agent mode Claude | `python agent/commissaire_industriel.py --anthropic` |
| Lint shell | `make lint` |

**Après toute modification TypeScript**, exécuter `npm run lint && npm run typecheck` avant de committer. Il n'y a pas de suite de tests (voir §7).

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

### Agent Python
- Python 3.8+ compatible, **sans dépendances externes** pour le mode règles (garder `requirements.txt` minimal — LLM en optionnel commenté).
- Toute nouvelle donnée territoriale va dans `agent/data/zones_industrielles.json`, pas en dur dans le code.
- Garder les trois modes (`rule_based` / `openai` / `anthropic`) fonctionnellement équivalents quand c'est possible.

## 5. Pièges spécifiques à éviter

- **`src/lib/mcp-client.ts:49`** : l'override `headers: {}` dans `analyzePdf` est volontaire — ne PAS y remettre `Content-Type: application/json`, sinon le boundary `multipart/form-data` est cassé.
- **`setup_mcp_pdf_server.sh`** : contient des placeholders (`package1`, `package2`) — c'est un template, ne pas le traiter comme un script de production.
- **`organigramme.html`** : fichier statique autonome (pas de pipeline de build) — modifier directement le HTML inline, ne pas essayer de le migrer vers React sans instruction explicite.
- **Données sensibles** : ne jamais committer de clé API (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) ni de coordonnées privées. Les variables d'environnement sont lues par l'agent au runtime.
- **`next-env.d.ts`** est dans `.gitignore` — ne pas le committer si Next le régénère.
- Le serveur MCP local (`localhost:8080`) n'est **pas lancé automatiquement** dans l'environnement Claude — tout test qui en dépend échouera ; utiliser des mocks.

## 6. Structure de dépendances à maintenir

- **Pas de nouveau gestionnaire de paquets** (rester sur npm). Pas de `pnpm` / `yarn` / `bun` sans demande.
- **Pas de nouveau framework CSS** (Tailwind uniquement).
- **Pas de librairie d'état global** (Zustand, Redux, Jotai) sans justification — React state + props suffisent pour l'instant.
- Avant d'ajouter une dépendance npm, vérifier que `clsx`, `tailwind-merge`, ou `lucide-react` ne couvrent pas déjà le besoin.

## 7. État actuel des tests

**Aucune infrastructure de test n'est configurée.** Pas de Jest / Vitest / pytest, pas de coverage, CI ne fait que lint + shellcheck. Si on demande à Claude d'ajouter une fonctionnalité à risque (logique de recommandation, client MCP), proposer en priorité d'ajouter une suite de tests (Vitest côté front, pytest côté agent) plutôt que d'empiler du code non testé.

## 8. Comportements attendus de Claude

- **Lire avant de modifier** : toujours `Read` un fichier avant de l'éditer.
- **Réponses concises** : en français si l'utilisateur écrit en français, en anglais sinon. Pas d'emoji sauf demande.
- **Pas de refactor spontané** : corriger un bug ne justifie pas de réorganiser le fichier.
- **Pas de fichier `.md` de doc créé sans demande** — ce projet a déjà README / CONTRIBUTING / CHANGELOG / CLAUDE.md.
- **Commits et push** : uniquement sur demande explicite, et sur la branche indiquée dans la session.
- **Escalader tôt** quand l'ambiguïté est architecturale (ex. ajout d'une lib, modification de `.mcp.json`, changement de l'organigramme) — utiliser `AskUserQuestion`.

## 9. Contact métier

MRC Pierre-De Saurel — Direction du développement économique
62, rue Élizabeth, Sorel-Tracy (Québec) J3P 1L4 — 450-743-2703
