# CLAUDE.md

This file provides guidance for AI assistants working with this repository.

## Repository Overview

**MyRepo** is a project repository owned by `jeanfrancoisleblanc28`, licensed under MIT. It is currently in early/scaffolding stage — the repo contains project infrastructure and configuration but no application source code yet.

## Repository Structure

```
.
├── CLAUDE.md                  # AI assistant guidance (this file)
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
├── README.md                  # Project overview
├── .gitignore                 # Ignore rules (Node, Python, IDE, OS, build artifacts)
├── .mcp.json                  # MCP server config (localhost:8080)
├── cline_mcp_config.json      # Cline MCP config for PDF server (npx @anthropic-ai/pdf-server)
└── setup_mcp_pdf_server.sh   # Setup script for MCP PDF server (Linux/Mac)
```

## Key Configuration

- **MCP Server**: Configured at `localhost:8080` via `.mcp.json`
- **PDF Server**: Uses `@anthropic-ai/pdf-server` via npx, configured in `cline_mcp_config.json`
- **Setup script**: `setup_mcp_pdf_server.sh` handles dependency installation, config setup, and validation (Linux/Mac only)

## Technology Stack

Based on `.gitignore`, the project is set up to support:
- **Node.js** (node_modules, npm/yarn)
- **Python** (__pycache__, venv)
- **C/C++** build artifacts (.o, .a, .lib)

No package manager lockfiles or dependency manifests exist yet.

## Git Conventions

- **Branch naming**: `feature/<description>` for new features (per CONTRIBUTING.md)
- **Commit messages**: Short imperative style (e.g., "Create README.md file with project details")
- **Workflow**: Fork → branch → commit → push → PR
- **Default branch**: `main`

## Contributing Workflow

1. Fork the repository
2. Create a feature branch off `main`
3. Make changes with clear commit messages
4. Ensure tests pass and documentation is updated
5. Open a Pull Request linking any related issues

## Guidelines for AI Assistants

- No build system, test framework, or linter is configured yet — do not assume their presence
- When adding source code, follow the `.gitignore` patterns to determine appropriate languages and directory structure
- Do not commit `node_modules/`, `__pycache__/`, IDE configs, or OS-specific files
- Keep commit messages short and in imperative mood, matching existing history style
- Update README.md and CONTRIBUTING.md when adding significant new features or changing project structure
- The `setup_mcp_pdf_server.sh` script references placeholder packages (`package1`, `package2`) — it is a template, not production-ready
## Skills à Forte Valeur Ajoutée pour Claude

Ces compétences permettent à Claude de maximiser son impact dans ce projet.

### Analyse & Raisonnement
- **Décomposition de problèmes complexes** : Identifier les sous-problèmes, les dépendances et proposer une approche structurée étape par étape
- **Revue de code approfondie** : Détecter les bugs, anti-patterns, vulnérabilités de sécurité et proposer des refactorisations claires avec justifications
- **Raisonnement multi-étapes** : Chaîner des inférences logiques pour résoudre des problèmes nécessitant plusieurs niveaux de réflexion

### Développement & Ingénierie Logicielle
- **Génération de code de production** : Écrire du code robuste, testé, documenté et respectant les conventions du projet (Node.js, Python, C/C++)
- **Architecture logicielle** : Concevoir des systèmes modulaires, scalables et maintenables (microservices, patterns MVC/MVVM, clean architecture)
- **Intégration MCP (Model Context Protocol)** : Configurer, déboguer et étendre les serveurs MCP (ex. `localhost:8080`, `@anthropic-ai/pdf-server`)
- **Automatisation CI/CD** : Créer et optimiser des pipelines GitHub Actions pour les tests, builds et déploiements automatiques
- **Sécurité applicative** : Identifier les failles OWASP, proposer des correctifs et auditer les configurations sensibles

### Intelligence Artificielle & Agents
- **Conception d'agents IA** : Concevoir des agents autonomes avec boucles de raisonnement, mémoire et utilisation d'outils (tool use)
- **Prompt engineering avancé** : Rédiger des prompts optimisés, des chaînes de pensée (CoT) et des instructions système robustes
- **Orchestration multi-agents** : Coordonner plusieurs agents spécialisés avec partage de contexte et gestion des erreurs
- **Évaluation de modèles** : Définir des métriques, créer des benchmarks et interpréter les résultats d'évaluation LLM

### Communication & Documentation
- **Rédaction technique** : Produire des READMEs, specs, ADRs (Architecture Decision Records) et guides utilisateur clairs et précis
- **Synthèse et vulgarisation** : Expliquer des concepts complexes à différents niveaux d'expertise (technique, métier, exécutif)
- **Traduction entre domaines** : Traduire les besoins métier en spécifications techniques et inversement

### Productivité & Collaboration
- **Revue de Pull Requests** : Analyser les changements, fournir des commentaires constructifs et suggérer des améliorations concrètes
- **Gestion de projet technique** : Décomposer des épics en tâches actionnables, estimer les efforts et identifier les risques
- **Debugging systématique** : Utiliser une approche hypothético-déductive pour isoler et corriger les bugs rapidement

### UI/UX Pro Max

Compétences avancées en conception d'interfaces et d'expériences utilisateur pour créer des produits exceptionnels.

#### Design System & Architecture Visuelle
- **Création de Design Systems** : Concevoir des systèmes de design complets (tokens, composants, patterns) assurant cohérence et scalabilité à travers tout le produit
- **Typographie avancée** : Sélectionner et combiner des polices, définir des échelles typographiques harmonieuses, optimiser la lisibilité (line-height, letter-spacing, mesure de ligne)
- **Théorie des couleurs appliquée** : Créer des palettes accessibles (contraste WCAG AA/AAA), gérer les thèmes clair/sombre, utiliser la psychologie des couleurs pour guider l'attention
- **Grilles & Layouts** : Maîtriser CSS Grid, Flexbox, les grilles modulaires et les systèmes de spacing cohérents (4px/8px base grid)
- **Iconographie & Illustration** : Concevoir des systèmes d'icônes cohérents (SVG optimisés), choisir et intégrer des bibliothèques d'icônes (Lucide, Phosphor, Heroicons)

#### Composants & Patterns UI
- **Composants réutilisables** : Développer des composants UI robustes avec variants, states (hover, focus, active, disabled, loading, error) et API props bien conçues
- **Formulaires complexes** : Concevoir des formulaires multi-étapes, validation en temps réel, gestion d'erreurs inline, auto-complétion et patterns de saisie optimisés
- **Navigation & Information Architecture** : Structurer la navigation (breadcrumbs, tabs, sidebars, mega-menus), concevoir des sitemaps et des flux utilisateur logiques
- **Data Visualization** : Créer des tableaux de bord, graphiques interactifs, data tables triables/filtrables avec pagination et recherche
- **Feedback & Micro-interactions** : Concevoir des toasts, modales, popovers, tooltips, skeleton loaders, progress indicators et animations de transition significatives

#### Expérience Utilisateur (UX)
- **Recherche utilisateur** : Définir des personas, conduire des analyses heuristiques, créer des user journey maps et des empathy maps
- **Architecture de l'information** : Organiser le contenu avec card sorting, tree testing, et conception de taxonomies claires
- **Wireframing & Prototypage** : Produire des wireframes basse/haute fidélité, des prototypes interactifs et des spécifications fonctionnelles détaillées
- **Tests d'utilisabilité** : Concevoir des protocoles de test, définir des métriques UX (SUS, NPS, taux de complétion, temps sur tâche) et interpréter les résultats
- **Conception centrée utilisateur** : Appliquer le design thinking (empathize, define, ideate, prototype, test) à chaque étape du développement

#### Responsive & Adaptive Design
- **Mobile-First Design** : Concevoir des interfaces priorisant l'expérience mobile avec progressive enhancement vers desktop
- **Breakpoints & Fluid Design** : Implémenter des layouts fluides avec clamp(), min(), max(), container queries et media queries sémantiques
- **Touch & Gesture Design** : Optimiser les zones tactiles (minimum 44x44px), swipe gestures, pull-to-refresh et interactions haptic-friendly
- **Multi-plateforme** : Adapter les patterns UI aux conventions de chaque plateforme (iOS HIG, Material Design, Windows Fluent)

#### Accessibilité (a11y)
- **WCAG 2.2 Compliance** : Implémenter les 4 principes (Perceivable, Operable, Understandable, Robust) aux niveaux A, AA et AAA
- **ARIA & Sémantique HTML** : Utiliser les rôles ARIA, landmarks, live regions et HTML sémantique pour une accessibilité optimale avec les lecteurs d'écran
- **Navigation clavier** : Assurer un focus management complet, des focus traps pour les modales, skip links et des raccourcis clavier logiques
- **Accessibilité cognitive** : Simplifier les parcours, réduire la charge cognitive, offrir des instructions claires et des messages d'erreur compréhensibles
- **Audit & Testing a11y** : Utiliser axe-core, Lighthouse, NVDA/VoiceOver pour tester et valider l'accessibilité de manière continue

#### Performance & Optimisation Frontend
- **Core Web Vitals** : Optimiser LCP, FID/INP, CLS pour une expérience fluide et un bon référencement (lazy loading, image optimization, font loading strategies)
- **Animations performantes** : Créer des animations CSS/JS optimisées (transform, opacity uniquement sur le GPU), utiliser requestAnimationFrame, Framer Motion, GSAP
- **Rendu optimisé** : Implémenter le virtual scrolling, la pagination infinie, le code splitting et le lazy loading de composants
- **Assets optimisés** : Gérer les images responsives (srcset, picture, formats WebP/AVIF), sprites SVG et optimisation des bundles CSS/JS

#### Frameworks & Outils UI Modernes
- **React / Next.js** : Développer des interfaces avec Server Components, Suspense, streaming SSR et App Router
- **Tailwind CSS** : Maîtriser l'utility-first CSS, la configuration avancée (plugins custom, presets) et les bonnes pratiques de composition
- **Bibliothèques de composants** : Intégrer et personnaliser shadcn/ui, Radix UI, Headless UI, Chakra UI, MUI avec thèmes sur mesure
- **Outils de design** : Traduire des maquettes Figma/Sketch en code pixel-perfect, exploiter les design tokens et l'auto-layout
- **CSS avancé** : Maîtriser CSS Modules, CSS-in-JS (styled-components, Emotion), CSS custom properties, cascade layers et les nouvelles fonctionnalités CSS (nesting, :has(), subgrid)

#### Motion Design & Animations
- **Principes d'animation** : Appliquer les 12 principes de l'animation (Disney) au design d'interface : easing, anticipation, follow-through, staging
- **Transitions d'état** : Concevoir des transitions fluides entre les états de page (page transitions, shared element transitions, View Transitions API)
- **Animations narratives** : Créer des scroll-driven animations, des onboarding animés et des illustrations interactives engageantes
- **Lottie & SVG animé** : Intégrer des animations Lottie, animer des SVG (stroke-dasharray, morphing) et optimiser les performances d'animation

#### UX Writing & Content Design
- **Microcopy** : Rédiger des labels de boutons, messages d'erreur, placeholders, empty states et messages de confirmation clairs et empathiques
- **Tone of Voice** : Définir et appliquer une voix de marque cohérente à travers toute l'interface (formel, amical, technique)
- **Localisation & i18n** : Préparer les interfaces pour la traduction (RTL, pluralisation, formatage de dates/nombres, expansion de texte)
- **Content-first Design** : Concevoir les interfaces autour du contenu réel, pas du lorem ipsum, pour des layouts authentiques et fonctionnels

