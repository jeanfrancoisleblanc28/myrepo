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

