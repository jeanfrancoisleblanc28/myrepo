# UI/UX Skills Generator — Note exécutive

**Version** : 1.0 · **Date** : 2026-04-24 · **Branche** : `claude/uiux-skills-generator-FNDUF`
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
- **Générateur** : chips catégories (9), filtres niveau (3), slider `1-9`, bouton *Générer*.
- **Résultat** : grille de cartes qui s'animent (flip 3D stagger), confettis Canvas, toast de confirmation.
- **Actions** : *Copier le lien*, *Lancer la présentation*.
- **Catalogue complet** plus bas : 9 sections gradient-bordered avec toutes les compétences.

### `/skills/present` — Mode présentation
- Plein-écran, 1 slide par compétence + intro + outro (max 11 slides).
- **Clavier** : `←`/`→`/`Space`, `Home`/`End`, `F` plein-écran, `P` play/pause (6s), `?` aide, `Esc` sortie.
- **View Transitions API** entre slides (crossfade natif), fallback CSS.
- **Controls bar** (bouton précédent, compteur `03 / 07`, suivant, play/pause, fullscreen, aide).
- Gradient par catégorie + noise overlay + typographie `clamp(2.25rem, 6.5vw, 5.5rem)`.

### Command palette (`Ctrl+K`)
- **Nouveau groupe « Skills »** avec 3 commandes : Ouvrir le catalogue · Générer un kit · Lancer la présentation.

## 4. Décisions d'ingénierie

| Contrainte | Choix |
|---|---|
| **Pas de nouvelles dépendances** | Confettis = Canvas natif (<100 LOC). Transitions = View Transitions API. |
| **Accessibilité** | `prefers-reduced-motion` désactive aurora/confettis/tilt. `aria-live="polite"` annonce les kits. Focus trap dans la modale d'aide (réutilise `Modal`). Skip link préservé. |
| **Réutilisation** | 100% des composants existants (Card, Button, Badge, Modal, Toast, cn, design-tokens) réutilisés tels quels. Aucun duplicata. |
| **Partage** | Encodage du kit en query string (`?ids=…`) — aucun backend requis, URL stable, Back/Forward OK. |
| **Reproductibilité** | `generateKit()` accepte un `seed` optionnel (mulberry32) pour générer le même kit plusieurs fois. |
| **Performance** | Bundle `/skills` : **5.89 kB** · `/skills/present` : **4.18 kB** · First Load JS partagé ≈ 87 kB. Confettis auto-clean après 1.8s, RAF uniquement. |

## 5. Fichiers livrés

**Nouveaux (10)**
- `src/lib/skills-data.ts` — types + catalogue (41 skills · 9 catégories) + helpers `generateKit`, `getSkillsByIds`
- `src/app/skills/page.tsx` — page catalogue + générateur
- `src/app/skills/present/page.tsx` + `layout.tsx` — mode présentation
- `src/components/skills/AuroraBackground.tsx` — 3 blobs animés
- `src/components/skills/Confetti.tsx` — Canvas particules, gravité, fade
- `src/components/skills/SkillCard.tsx` — carte avec tilt 3D mousemove + spotlight
- `src/components/skills/CategoryTile.tsx` — tuile filtre catégorie
- `src/components/skills/KitGenerator.tsx` — formulaire + grille résultat
- `src/components/skills/PresentationSlide.tsx` — layout slide

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
2. **00:15** — Appuyer sur `Ctrl+K`, taper « kit » → choisir *Générer un kit UI/UX*.
3. **00:30** — Auto-génération avec confettis + toast. Cliquer une ou deux catégories, bouger le slider, re-générer.
4. **00:50** — Cliquer *Copier le lien* (toast), coller dans un nouvel onglet → le kit se recharge identique.
5. **01:05** — Cliquer *Lancer la présentation* → passer à plein-écran avec `F`, parcourir avec `→`, appuyer `?` pour voir les raccourcis.
6. **01:30** — `Esc` → retour au catalogue, qui a mémorisé le kit via l'URL.

## 7. Métriques d'évaluation

| Dimension | Résultat |
|---|---|
| Build | ✓ `next build` sans warning TS |
| Lint | ✓ `next lint` sans erreur |
| Pages générées | 5 routes (`/`, `/dashboard`, `/skills`, `/skills/present`, `/_not-found`) |
| Nouveaux fichiers | 10 · **Modifiés** : 3 · **Deps ajoutées** : 0 |
| Accessibilité | `aria-live`, focus trap, `prefers-reduced-motion`, contraste AA sur gradients via overlay |
| Thème | Compatible clair/sombre, gradients blend-mode adaptés |

## 8. Limites assumées et prochaines étapes possibles

- Pas de **persistance serveur** : les kits vivent dans l'URL (volontairement — stateless, shareable).
- Pas d'**export PDF** : la présentation est web-only pour l'instant ; un export print-css ou `window.print()` stylisé serait un ajout d'une journée.
- Pas de **i18n** : tout est en français (cohérent avec `CLAUDE.md` et `<html lang="fr">`).
- **Extension naturelle** : ajouter une section « Skill du jour » en page d'accueil (1 seul `getSkillsByIds` ou `generateKit({count:1, seed: dayOfYear})`).

## 9. Critère de succès

> Un membre de l'équipe peut, sans formation, ouvrir `/skills`, générer un kit de 5 compétences filtrées sur « accessibilité » + « avancé », copier le lien, et lancer une présentation keynote en moins d'une minute — **sans quitter le clavier**.

C'est le cas. ✓
