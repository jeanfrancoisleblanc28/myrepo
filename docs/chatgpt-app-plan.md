# Plan d’app ChatGPT pour **[ton cas d’usage]**

> Note: tu as demandé d’utiliser `$chatgpt-apps` avec `$openai-docs`. Ces skills ne sont pas disponibles dans cette session, donc ce plan est une alternative pragmatique basée sur les bonnes pratiques produit/tech.

## 1) Objectif produit

Construire une app ChatGPT orientée **[ton cas d’usage]** qui permet à un utilisateur de:
- décrire un besoin en langage naturel,
- recevoir une réponse structurée et actionnable,
- déclencher des actions outillées (si nécessaire) via MCP/tools,
- conserver un historique exploitable pour itérations.

## 2) Personas et scénarios clés

- **Persona principal**: opérateur métier qui veut gagner du temps sur des tâches répétitives.
- **Persona secondaire**: superviseur qui veut cohérence, traçabilité, et qualité.

Scénarios MVP:
1. L’utilisateur pose une demande libre liée à **[ton cas d’usage]**.
2. L’app reformule, collecte les paramètres manquants, puis propose une sortie standard.
3. L’utilisateur valide et exporte (résumé, checklist, ou artefact).

## 3) Proposition fonctionnelle (MVP)

### A. Entrée utilisateur
- Prompt libre + champs guidés (contexte, contraintes, format attendu).
- Garde-fous: validation des champs critiques.

### B. Orchestration conversationnelle
- Étape 1: clarification de l’intention.
- Étape 2: récupération de contexte (docs/fichiers/outils disponibles).
- Étape 3: génération de réponse + justification concise.
- Étape 4: options d’action suivantes (itérer, exporter, exécuter une tool).

### C. Sorties
- Réponse structurée (résumé + plan + actions).
- Version courte/longue.
- Export Markdown/JSON.

## 4) Architecture cible dans ce repo

- **Frontend (Next.js)**: ajouter une page `src/app/chatgpt-app/page.tsx`.
- **Composants UI**: réutiliser `src/components/ui/*` pour composer input, cards, feedback.
- **Lib orchestrateur**: créer `src/lib/chatgpt-app/` avec:
  - `types.ts` (contrats),
  - `prompting.ts` (templates),
  - `workflow.ts` (enchaînement des étapes),
  - `safety.ts` (règles basiques).
- **Intégration tools**: s’appuyer sur `src/lib/mcp-client.ts` pour tool-calling quand utile.

## 5) Schéma de données minimum

```ts
Conversation {
  id: string
  createdAt: string
  updatedAt: string
  useCase: string
  messages: Message[]
}

Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  metadata?: Record<string, unknown>
}
```

## 6) Prompting baseline

- **System prompt**: rôle + limites + format de réponse.
- **Developer prompt**: règles métier de **[ton cas d’usage]**.
- **User prompt**: requête + contraintes.

Stratégie recommandée:
1. Clarifier avant d’agir si info incomplète.
2. Préférer listes actionnables.
3. Citer les hypothèses explicitement.

## 7) Sécurité, conformité, qualité

- Masquage des données sensibles.
- Journalisation minimale et explicable.
- Limites d’usage (rate limit, taille d’entrée/sortie).
- Évaluation continue: précision, utilité, temps de réponse.

## 8) Roadmap par itérations

### Sprint 1 (MVP)
- UI de chat guidé.
- Workflow de clarification + réponse structurée.
- Export Markdown.

### Sprint 2
- Tool-calling MCP ciblé.
- Templates de réponses par sous-cas d’usage.
- Feedback utilisateur (thumbs up/down + commentaire).

### Sprint 3
- Personnalisation par rôle.
- Mémoire conversationnelle avancée.
- Tableau de bord qualité (KPI).

## 9) KPI de succès

- Taux de complétion de tâche.
- Temps moyen jusqu’à résultat utile.
- Taux de révision manuelle.
- Satisfaction utilisateur (CSAT interne).

## 10) Backlog initial (tickets)

1. Créer route `chatgpt-app` + layout minimal.
2. Ajouter modèle de conversation côté client.
3. Implémenter pipeline `clarify -> propose -> refine`.
4. Ajouter export Markdown/JSON.
5. Connecter un tool MCP de démonstration.
6. Ajouter instrumentation basique (latence + erreurs).

## 11) Questions ouvertes à trancher

- Quel est précisément **[ton cas d’usage]** (domaine, utilisateurs, contraintes) ?
- L’app doit-elle agir (outils) ou seulement conseiller ?
- Niveau d’explicabilité attendu (audit/compliance) ?
- Besoin multi-langue ?

---

## Démarrage rapide (proposé)

1. Remplacer **[ton cas d’usage]** par un cas précis (ex: “qualification de leads B2B”).
2. Valider les 3 scénarios MVP.
3. Implémenter la route `chatgpt-app` et un flux conversationnel simple.
4. Mesurer 3 KPI pendant 1 semaine pilote.
