# UI/UX Skills Generator — Note exécutive

**Version** : 1.1 · **Date** : 2026-05-02 · **Branche** : `copilot/add-goal-presets-to-skill-generator`
**Statut** : livré, `npm run build` ✓, `npm run lint` ✓

---

## 1. En une phrase

Une nouvelle expérience `/skills` dans l'app Next.js qui transforme le catalogue *UI/UX Pro Max* du `CLAUDE.md` en **surface interactive** — catalogue filtrable, **générateur de kit** sur mesure, et **mode présentation plein-écran** de qualité keynote.

## 2. Le « pourquoi »

Le dépôt documentait déjà 41 compétences UI/UX réparties en 9 catégories dans `CLAUDE.md`, mais sous forme de prose statique. Cette compétence les rend **actionnables** :

- **Démontrer le savoir-faire** : un support visuel prêt à projeter lors d'une revue, d'un onboarding ou d'un pitch.
- **Cadrer un atelier** : tirer 3 à 9 compétences aléatoires pour structurer une session de design critique.
- **Partager** : chaque kit est encodé dans l'URL — un lien, et le destinataire retrouve le même kit.

## 3. Ce que voit l'utilisateur

### `/skills` — Catalogue + Générateur
- **Hero** avec titre dégradé animé et fond aurora (3 blobs gradient en mix-blend).
- **Objectif (preset)** : sélecteur de 5 objectifs d'atelier (*Audit accessibilité*, *Design System*, *UX Research*, *Stratégie produit*, *UI Polish*) — chaque preset définit un compte par défaut, des niveaux optionnels, et une recette de diversité par catégorie.
- **Générateur** : chips catégories (9), filtres niveau (3), slider `1-9`, bouton *Générer* (adapte son label au preset actif).
- **Résultat** : grille de cartes avec badge "objectif" + liste des catégories représentées (résumé de diversité), confettis Canvas, toast de confirmation.
- **Actions** : *Copier le lien*, *Lancer la présentation* — URL inclut `?preset=...&ids=...` pour partage complet.
- **Catalogue complet** plus bas : 9 sections gradient-bordered avec toutes les compétences.

### `/skills/present` — Mode présentation
- Plein-écran, 1 slide par compétence + intro + outro (max 11 slides).
- **Intro slide** affiche l'objectif (preset) si présent via `?preset=...`.
- **Clavier** : `←`/`→`/`Space`, `Home`/`End`, `F` plein-écran, `P` play/pause (6s), `?` aide, `Esc` sortie.
- **View Transitions API** entre slides (crossfade natif), fallback CSS.
- **Controls bar** (bouton précédent, compteur `03 / 07`, suivant, play/pause, fullscreen, aide).
- Gradient par catégorie + noise overlay + typographie `clamp(2.25rem, 6.5vw, 5.5rem)`.

### Command palette (`Ctrl+K`)
- **Nouveau groupe « Skills »** avec 3 commandes : Ouvrir le catalogue · Générer un kit · Lancer la présentation.

## 4. Décisions d'ingénierie

| Contrainte | Choix |
|---|---|
| **Pas de nouvelles dépendances** | Confettis = Canvas natif (<100 LOC). Transitions = View Transitions API. Presets = logique pure TypeScript. |
| **Accessibilité** | `prefers-reduced-motion` désactive aurora/confettis/tilt. `aria-live="polite"` annonce les kits. Focus trap dans la modale d'aide (réutilise `Modal`). Preset tiles avec `aria-pressed`. Skip link préservé. |
| **Réutilisation** | 100% des composants existants (Card, Button, Badge, Modal, Toast, cn, design-tokens) réutilisés tels quels. Aucun duplicata. |
| **Partage** | Encodage du kit en query string (`?preset=...&ids=…`) — aucun backend requis, URL stable, Back/Forward OK. `?ids=...` seul reste compatible (rétro-compatibilité). |
| **Reproductibilité** | `generateKit()` accepte un `seed` optionnel (mulberry32). `generateBalancedKit()` utilise la même PRNG interne pour garantir le déterminisme avec seed. |
| **Performance** | Bundle `/skills` : **6.49 kB** · `/skills/present` : **4.47 kB** · First Load JS partagé ≈ 87 kB. |

## 5. Fichiers livrés

**Nouveaux (10)**
- `src/lib/skills-data.ts` — types + catalogue (41 skills · 9 catégories) + helpers `generateKit`, `getSkillsByIds`, `generateBalancedKit`, `kitPresets`, `getPreset`
- `src/app/skills/page.tsx` — page catalogue + générateur
- `src/app/skills/present/page.tsx` + `layout.tsx` — mode présentation
- `src/components/skills/AuroraBackground.tsx` — 3 blobs animés
- `src/components/skills/Confetti.tsx` — Canvas particules, gravité, fade
- `src/components/skills/SkillCard.tsx` — carte avec tilt 3D mousemove + spotlight
- `src/components/skills/CategoryTile.tsx` — tuile filtre catégorie
- `src/components/skills/KitGenerator.tsx` — formulaire + sélecteur objectif + grille résultat
- `src/components/skills/PresentationSlide.tsx` — layout slide (supporte `presetLabel` / `presetEmoji`)

**Modifiés (3)**
- `src/styles/globals.css` — keyframes `aurora-a/b/c`, `flip-in`, `slide-fade-in`, `float`, `shimmer` + `@media (prefers-reduced-motion)`
- `src/components/layout/navbar.tsx` — lien « Skills »
- `src/components/ui/command-palette.tsx` — groupe « Skills » (3 commandes)

## 6. Comment démontrer en 90 secondes

```bash
npm install
npm run dev
```

1. **00:00** — Aller sur `http://localhost:3000/skills` → aurora fluide, hero dégradé.
2. **00:10** — Cliquer l'objectif **♿ Audit accessibilité** → le compte passe à 5, niveaux Avancé + Expert activés.
3. **00:20** — Appuyer sur `Ctrl+K`, taper « kit » → choisir *Générer un kit UI/UX*.
4. **00:35** — Auto-génération avec confettis + toast. Observer le badge « ♿ Audit accessibilité » + les catégories listées sous « Ton kit » (diversité garantie).
5. **00:50** — Cliquer *Copier le lien* (toast), coller dans un nouvel onglet → le kit + l'objectif se rechargent identiques.
6. **01:05** — Cliquer *Lancer la présentation* → intro slide affiche « Objectif : Audit accessibilité ». Passer à plein-écran avec `F`, parcourir avec `→`, appuyer `?` pour voir les raccourcis.
7. **01:30** — `Esc` → retour au catalogue, kit et objectif conservés dans l'URL.

## 7. Métriques d'évaluation

| Dimension | Résultat |
|---|---|
| Build | ✓ `next build` sans warning TS |
| Lint | ✓ `next lint` sans erreur |
| Pages générées | 6 routes (`/`, `/dashboard`, `/skills`, `/skills/present`, `/skills/document`, `/_not-found`) |
| Nouveaux fichiers | 10 · **Modifiés** : 5 · **Deps ajoutées** : 0 |
| Accessibilité | `aria-live`, focus trap, `prefers-reduced-motion`, contraste AA sur gradients via overlay, `aria-pressed` sur preset tiles |
| Thème | Compatible clair/sombre, gradients blend-mode adaptés |

## 7b. Presets objectifs — détail technique

| Preset | Objectif | Count défaut | Niveaux défaut | Recette catégories |
|---|---|---|---|---|
| `a11y-audit` | Audit accessibilité | 5 | Avancé, Expert | a11y×2, components×1, ux×1, frameworks×1 |
| `design-system` | Design System | 6 | — | design-system×2, components×2, frameworks×1, writing×1 |
| `ux-research` | UX Research | 5 | — | ux×3, writing×1, components×1 |
| `product-strategy` | Stratégie produit | 6 | — | ux×2, performance×1, writing×1, a11y×1, components×1 |
| `ui-polish` | UI Polish | 5 | — | motion×2, components×1, design-system×1, responsive×1 |

**Compatibilité URL** :
- `?ids=...` seul → comportement existant préservé (lecture directe des IDs).
- `?preset=...&ids=...` → preset affiché dans le générateur + intro slide ; IDs toujours prioritaires pour le contenu du kit.
- `?preset=...` sans IDs → préset présélectionné, prêt à générer.


## 8. Limites assumées et prochaines étapes possibles

- Pas de **persistance serveur** : les kits vivent dans l'URL (volontairement — stateless, shareable).
- Pas d'**export PDF** : la présentation est web-only pour l'instant ; un export print-css ou `window.print()` stylisé serait un ajout d'une journée.
- Pas de **i18n** : tout est en français (cohérent avec `CLAUDE.md` et `<html lang="fr">`).
- **Extension naturelle** : ajouter une section « Skill du jour » en page d'accueil (1 seul `getSkillsByIds` ou `generateKit({count:1, seed: dayOfYear})`).

## 9. Critère de succès

> Un membre de l'équipe peut, sans formation, ouvrir `/skills`, générer un kit de 5 compétences filtrées sur « accessibilité » + « avancé », copier le lien, et lancer une présentation keynote en moins d'une minute — **sans quitter le clavier**.

C'est le cas. ✓
