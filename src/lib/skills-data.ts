/**
 * UI/UX Pro Max skills catalog — extracted from CLAUDE.md.
 * Used by /skills catalog, generator, and presentation mode.
 */

export type SkillLevel = "fundamental" | "advanced" | "expert";

export interface Skill {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
  level: SkillLevel;
}

export interface SkillCategory {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  /** Tailwind gradient classes (e.g. "from-violet-500 via-fuchsia-500 to-pink-500") */
  gradient: string;
  /** Tailwind text color for category accents */
  accentText: string;
  /** Tailwind ring color for focus/glow */
  accentRing: string;
}

export const categories: SkillCategory[] = [
  {
    id: "design-system",
    title: "Design System & Architecture Visuelle",
    emoji: "🎨",
    blurb: "Fondations visuelles scalables : tokens, typographie, couleurs, grilles, icônes.",
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    accentText: "text-fuchsia-500",
    accentRing: "ring-fuchsia-500/40",
  },
  {
    id: "components",
    title: "Composants & Patterns UI",
    emoji: "🧩",
    blurb: "Briques réutilisables : formulaires, navigation, data viz, feedback.",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    accentText: "text-cyan-500",
    accentRing: "ring-cyan-500/40",
  },
  {
    id: "ux",
    title: "Expérience Utilisateur",
    emoji: "🧭",
    blurb: "Recherche, architecture d'information, wireframes, tests, design thinking.",
    gradient: "from-emerald-500 via-teal-500 to-sky-500",
    accentText: "text-emerald-500",
    accentRing: "ring-emerald-500/40",
  },
  {
    id: "responsive",
    title: "Responsive & Adaptive Design",
    emoji: "📱",
    blurb: "Mobile-first, breakpoints fluides, touch gestures, multi-plateforme.",
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    accentText: "text-orange-500",
    accentRing: "ring-orange-500/40",
  },
  {
    id: "a11y",
    title: "Accessibilité (a11y)",
    emoji: "♿",
    blurb: "WCAG 2.2, ARIA, navigation clavier, accessibilité cognitive, audits.",
    gradient: "from-indigo-500 via-purple-500 to-violet-500",
    accentText: "text-indigo-500",
    accentRing: "ring-indigo-500/40",
  },
  {
    id: "performance",
    title: "Performance & Optimisation Frontend",
    emoji: "⚡",
    blurb: "Core Web Vitals, animations GPU, rendu optimisé, assets légers.",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    accentText: "text-rose-500",
    accentRing: "ring-rose-500/40",
  },
  {
    id: "frameworks",
    title: "Frameworks & Outils UI Modernes",
    emoji: "🛠️",
    blurb: "React/Next.js, Tailwind, shadcn/ui, Figma, CSS avancé.",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    accentText: "text-sky-500",
    accentRing: "ring-sky-500/40",
  },
  {
    id: "motion",
    title: "Motion Design & Animations",
    emoji: "✨",
    blurb: "12 principes Disney, transitions d'état, scroll-driven, Lottie, SVG animé.",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    accentText: "text-pink-500",
    accentRing: "ring-pink-500/40",
  },
  {
    id: "writing",
    title: "UX Writing & Content Design",
    emoji: "✍️",
    blurb: "Microcopy, tone of voice, i18n, content-first design.",
    gradient: "from-lime-500 via-green-500 to-emerald-500",
    accentText: "text-green-500",
    accentRing: "ring-green-500/40",
  },
];

export const skills: Skill[] = [
  // Design System & Architecture Visuelle
  {
    id: "ds-tokens",
    title: "Création de Design Systems",
    description:
      "Concevoir des systèmes de design complets (tokens, composants, patterns) assurant cohérence et scalabilité à travers tout le produit.",
    categoryId: "design-system",
    tags: ["tokens", "cohérence", "scalabilité"],
    level: "expert",
  },
  {
    id: "ds-typography",
    title: "Typographie avancée",
    description:
      "Sélectionner et combiner des polices, définir des échelles typographiques harmonieuses, optimiser la lisibilité (line-height, letter-spacing, mesure de ligne).",
    categoryId: "design-system",
    tags: ["typographie", "lisibilité", "échelle"],
    level: "advanced",
  },
  {
    id: "ds-color",
    title: "Théorie des couleurs appliquée",
    description:
      "Créer des palettes accessibles (contraste WCAG AA/AAA), gérer les thèmes clair/sombre, utiliser la psychologie des couleurs pour guider l'attention.",
    categoryId: "design-system",
    tags: ["couleur", "WCAG", "dark mode"],
    level: "advanced",
  },
  {
    id: "ds-grid",
    title: "Grilles & Layouts",
    description:
      "Maîtriser CSS Grid, Flexbox, les grilles modulaires et les systèmes de spacing cohérents (4px/8px base grid).",
    categoryId: "design-system",
    tags: ["grid", "flexbox", "spacing"],
    level: "fundamental",
  },
  {
    id: "ds-icon",
    title: "Iconographie & Illustration",
    description:
      "Concevoir des systèmes d'icônes cohérents (SVG optimisés), choisir et intégrer des bibliothèques d'icônes (Lucide, Phosphor, Heroicons).",
    categoryId: "design-system",
    tags: ["SVG", "Lucide", "Phosphor"],
    level: "fundamental",
  },

  // Composants & Patterns UI
  {
    id: "comp-reusable",
    title: "Composants réutilisables",
    description:
      "Développer des composants UI robustes avec variants, states (hover, focus, active, disabled, loading, error) et API props bien conçues.",
    categoryId: "components",
    tags: ["variants", "states", "props"],
    level: "advanced",
  },
  {
    id: "comp-forms",
    title: "Formulaires complexes",
    description:
      "Concevoir des formulaires multi-étapes, validation en temps réel, gestion d'erreurs inline, auto-complétion et patterns de saisie optimisés.",
    categoryId: "components",
    tags: ["formulaires", "validation", "multi-steps"],
    level: "expert",
  },
  {
    id: "comp-nav",
    title: "Navigation & Information Architecture",
    description:
      "Structurer la navigation (breadcrumbs, tabs, sidebars, mega-menus), concevoir des sitemaps et des flux utilisateur logiques.",
    categoryId: "components",
    tags: ["navigation", "IA", "sitemap"],
    level: "advanced",
  },
  {
    id: "comp-dataviz",
    title: "Data Visualization",
    description:
      "Créer des tableaux de bord, graphiques interactifs, data tables triables/filtrables avec pagination et recherche.",
    categoryId: "components",
    tags: ["dashboard", "charts", "tables"],
    level: "expert",
  },
  {
    id: "comp-feedback",
    title: "Feedback & Micro-interactions",
    description:
      "Concevoir des toasts, modales, popovers, tooltips, skeleton loaders, progress indicators et animations de transition significatives.",
    categoryId: "components",
    tags: ["toast", "modal", "skeleton"],
    level: "advanced",
  },

  // Expérience Utilisateur (UX)
  {
    id: "ux-research",
    title: "Recherche utilisateur",
    description:
      "Définir des personas, conduire des analyses heuristiques, créer des user journey maps et des empathy maps.",
    categoryId: "ux",
    tags: ["personas", "heuristique", "journey"],
    level: "advanced",
  },
  {
    id: "ux-ia",
    title: "Architecture de l'information",
    description:
      "Organiser le contenu avec card sorting, tree testing, et conception de taxonomies claires.",
    categoryId: "ux",
    tags: ["card sorting", "taxonomie"],
    level: "advanced",
  },
  {
    id: "ux-wireframe",
    title: "Wireframing & Prototypage",
    description:
      "Produire des wireframes basse/haute fidélité, des prototypes interactifs et des spécifications fonctionnelles détaillées.",
    categoryId: "ux",
    tags: ["wireframe", "prototype"],
    level: "fundamental",
  },
  {
    id: "ux-usability",
    title: "Tests d'utilisabilité",
    description:
      "Concevoir des protocoles de test, définir des métriques UX (SUS, NPS, taux de complétion, temps sur tâche) et interpréter les résultats.",
    categoryId: "ux",
    tags: ["tests", "SUS", "NPS"],
    level: "expert",
  },
  {
    id: "ux-thinking",
    title: "Conception centrée utilisateur",
    description:
      "Appliquer le design thinking (empathize, define, ideate, prototype, test) à chaque étape du développement.",
    categoryId: "ux",
    tags: ["design thinking", "UCD"],
    level: "advanced",
  },

  // Responsive & Adaptive Design
  {
    id: "rsp-mobile",
    title: "Mobile-First Design",
    description:
      "Concevoir des interfaces priorisant l'expérience mobile avec progressive enhancement vers desktop.",
    categoryId: "responsive",
    tags: ["mobile", "progressive enhancement"],
    level: "fundamental",
  },
  {
    id: "rsp-fluid",
    title: "Breakpoints & Fluid Design",
    description:
      "Implémenter des layouts fluides avec clamp(), min(), max(), container queries et media queries sémantiques.",
    categoryId: "responsive",
    tags: ["clamp", "container queries"],
    level: "advanced",
  },
  {
    id: "rsp-touch",
    title: "Touch & Gesture Design",
    description:
      "Optimiser les zones tactiles (minimum 44x44px), swipe gestures, pull-to-refresh et interactions haptic-friendly.",
    categoryId: "responsive",
    tags: ["touch", "gestures", "haptic"],
    level: "advanced",
  },
  {
    id: "rsp-multi",
    title: "Multi-plateforme",
    description:
      "Adapter les patterns UI aux conventions de chaque plateforme (iOS HIG, Material Design, Windows Fluent).",
    categoryId: "responsive",
    tags: ["iOS", "Material", "Fluent"],
    level: "expert",
  },

  // Accessibilité (a11y)
  {
    id: "a11y-wcag",
    title: "WCAG 2.2 Compliance",
    description:
      "Implémenter les 4 principes (Perceivable, Operable, Understandable, Robust) aux niveaux A, AA et AAA.",
    categoryId: "a11y",
    tags: ["WCAG", "POUR"],
    level: "expert",
  },
  {
    id: "a11y-aria",
    title: "ARIA & Sémantique HTML",
    description:
      "Utiliser les rôles ARIA, landmarks, live regions et HTML sémantique pour une accessibilité optimale avec les lecteurs d'écran.",
    categoryId: "a11y",
    tags: ["ARIA", "landmarks", "screen reader"],
    level: "advanced",
  },
  {
    id: "a11y-keyboard",
    title: "Navigation clavier",
    description:
      "Assurer un focus management complet, des focus traps pour les modales, skip links et des raccourcis clavier logiques.",
    categoryId: "a11y",
    tags: ["focus", "skip link", "shortcuts"],
    level: "advanced",
  },
  {
    id: "a11y-cognitive",
    title: "Accessibilité cognitive",
    description:
      "Simplifier les parcours, réduire la charge cognitive, offrir des instructions claires et des messages d'erreur compréhensibles.",
    categoryId: "a11y",
    tags: ["cognitive load", "clarté"],
    level: "advanced",
  },
  {
    id: "a11y-audit",
    title: "Audit & Testing a11y",
    description:
      "Utiliser axe-core, Lighthouse, NVDA/VoiceOver pour tester et valider l'accessibilité de manière continue.",
    categoryId: "a11y",
    tags: ["axe", "Lighthouse", "NVDA"],
    level: "expert",
  },

  // Performance & Optimisation Frontend
  {
    id: "perf-vitals",
    title: "Core Web Vitals",
    description:
      "Optimiser LCP, FID/INP, CLS pour une expérience fluide et un bon référencement (lazy loading, image optimization, font loading strategies).",
    categoryId: "performance",
    tags: ["LCP", "INP", "CLS"],
    level: "expert",
  },
  {
    id: "perf-anim",
    title: "Animations performantes",
    description:
      "Créer des animations CSS/JS optimisées (transform, opacity uniquement sur le GPU), utiliser requestAnimationFrame, Framer Motion, GSAP.",
    categoryId: "performance",
    tags: ["GPU", "rAF", "Framer Motion"],
    level: "advanced",
  },
  {
    id: "perf-render",
    title: "Rendu optimisé",
    description:
      "Implémenter le virtual scrolling, la pagination infinie, le code splitting et le lazy loading de composants.",
    categoryId: "performance",
    tags: ["virtual scroll", "code splitting"],
    level: "advanced",
  },
  {
    id: "perf-assets",
    title: "Assets optimisés",
    description:
      "Gérer les images responsives (srcset, picture, formats WebP/AVIF), sprites SVG et optimisation des bundles CSS/JS.",
    categoryId: "performance",
    tags: ["WebP", "AVIF", "srcset"],
    level: "fundamental",
  },

  // Frameworks & Outils UI Modernes
  {
    id: "fw-react",
    title: "React / Next.js",
    description:
      "Développer des interfaces avec Server Components, Suspense, streaming SSR et App Router.",
    categoryId: "frameworks",
    tags: ["React", "Next.js", "RSC"],
    level: "advanced",
  },
  {
    id: "fw-tailwind",
    title: "Tailwind CSS",
    description:
      "Maîtriser l'utility-first CSS, la configuration avancée (plugins custom, presets) et les bonnes pratiques de composition.",
    categoryId: "frameworks",
    tags: ["Tailwind", "utility-first"],
    level: "advanced",
  },
  {
    id: "fw-components",
    title: "Bibliothèques de composants",
    description:
      "Intégrer et personnaliser shadcn/ui, Radix UI, Headless UI, Chakra UI, MUI avec thèmes sur mesure.",
    categoryId: "frameworks",
    tags: ["shadcn", "Radix", "MUI"],
    level: "advanced",
  },
  {
    id: "fw-figma",
    title: "Outils de design",
    description:
      "Traduire des maquettes Figma/Sketch en code pixel-perfect, exploiter les design tokens et l'auto-layout.",
    categoryId: "frameworks",
    tags: ["Figma", "pixel-perfect"],
    level: "advanced",
  },
  {
    id: "fw-css",
    title: "CSS avancé",
    description:
      "Maîtriser CSS Modules, CSS-in-JS (styled-components, Emotion), CSS custom properties, cascade layers et les nouvelles fonctionnalités CSS (nesting, :has(), subgrid).",
    categoryId: "frameworks",
    tags: ["CSS modules", ":has()", "subgrid"],
    level: "expert",
  },

  // Motion Design & Animations
  {
    id: "mo-principles",
    title: "Principes d'animation",
    description:
      "Appliquer les 12 principes de l'animation (Disney) au design d'interface : easing, anticipation, follow-through, staging.",
    categoryId: "motion",
    tags: ["easing", "Disney 12"],
    level: "advanced",
  },
  {
    id: "mo-transitions",
    title: "Transitions d'état",
    description:
      "Concevoir des transitions fluides entre les états de page (page transitions, shared element transitions, View Transitions API).",
    categoryId: "motion",
    tags: ["View Transitions", "shared element"],
    level: "expert",
  },
  {
    id: "mo-narrative",
    title: "Animations narratives",
    description:
      "Créer des scroll-driven animations, des onboarding animés et des illustrations interactives engageantes.",
    categoryId: "motion",
    tags: ["scroll-driven", "onboarding"],
    level: "advanced",
  },
  {
    id: "mo-lottie",
    title: "Lottie & SVG animé",
    description:
      "Intégrer des animations Lottie, animer des SVG (stroke-dasharray, morphing) et optimiser les performances d'animation.",
    categoryId: "motion",
    tags: ["Lottie", "SVG", "morphing"],
    level: "advanced",
  },

  // UX Writing & Content Design
  {
    id: "wr-microcopy",
    title: "Microcopy",
    description:
      "Rédiger des labels de boutons, messages d'erreur, placeholders, empty states et messages de confirmation clairs et empathiques.",
    categoryId: "writing",
    tags: ["microcopy", "empty states"],
    level: "advanced",
  },
  {
    id: "wr-voice",
    title: "Tone of Voice",
    description:
      "Définir et appliquer une voix de marque cohérente à travers toute l'interface (formel, amical, technique).",
    categoryId: "writing",
    tags: ["voice", "brand"],
    level: "advanced",
  },
  {
    id: "wr-i18n",
    title: "Localisation & i18n",
    description:
      "Préparer les interfaces pour la traduction (RTL, pluralisation, formatage de dates/nombres, expansion de texte).",
    categoryId: "writing",
    tags: ["i18n", "RTL", "pluralisation"],
    level: "expert",
  },
  {
    id: "wr-content-first",
    title: "Content-first Design",
    description:
      "Concevoir les interfaces autour du contenu réel, pas du lorem ipsum, pour des layouts authentiques et fonctionnels.",
    categoryId: "writing",
    tags: ["content", "authentique"],
    level: "fundamental",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers

export function getCategory(id: string): SkillCategory | undefined {
  return categories.find((c) => c.id === id);
}

export function getSkill(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}

export function getSkillsByCategory(id: string): Skill[] {
  return skills.filter((s) => s.categoryId === id);
}

/** Deterministic PRNG (mulberry32) for reproducible kits via seed. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface KitOptions {
  count: number;
  categoryIds?: string[];
  levels?: SkillLevel[];
  /** Optional seed for reproducibility */
  seed?: number;
}

/** Draw N skills matching the filters, shuffled (Fisher-Yates). */
export function generateKit({ count, categoryIds, levels, seed }: KitOptions): Skill[] {
  const pool = skills.filter((s) => {
    if (categoryIds && categoryIds.length > 0 && !categoryIds.includes(s.categoryId)) return false;
    if (levels && levels.length > 0 && !levels.includes(s.level)) return false;
    return true;
  });

  const rand = seed !== undefined ? mulberry32(seed) : () => Math.random();
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset system

/**
 * A kit preset ("objectif") defines a balanced recipe for a specific workshop goal.
 * `recipe` maps categoryId → desired number of skills from that category.
 * Remaining slots are filled with random skills from the filtered pool.
 */
export interface KitPreset {
  id: string;
  label: string;
  description: string;
  emoji: string;
  defaultCount: number;
  defaultLevels?: SkillLevel[];
  defaultCategories?: string[];
  /** How many skills to draw per category. */
  recipe: Record<string, number>;
}

export const kitPresets: KitPreset[] = [
  {
    id: "a11y-audit",
    label: "Audit accessibilité",
    description: "Auditer et corriger l'accessibilité d'une interface existante.",
    emoji: "♿",
    defaultCount: 5,
    defaultLevels: ["advanced", "expert"],
    recipe: { a11y: 2, components: 1, ux: 1, frameworks: 1 },
  },
  {
    id: "design-system",
    label: "Design System",
    description: "Construire ou consolider un système de design scalable.",
    emoji: "🎨",
    defaultCount: 6,
    recipe: { "design-system": 2, components: 2, frameworks: 1, writing: 1 },
  },
  {
    id: "ux-research",
    label: "UX Research",
    description: "Structurer une démarche de recherche utilisateur et valider les décisions.",
    emoji: "🔍",
    defaultCount: 5,
    recipe: { ux: 3, writing: 1, components: 1 },
  },
  {
    id: "product-strategy",
    label: "Stratégie produit",
    description: "Aligner UX, performance et contenu sur les objectifs business.",
    emoji: "🚀",
    defaultCount: 6,
    recipe: { ux: 2, performance: 1, writing: 1, a11y: 1, components: 1 },
  },
  {
    id: "ui-polish",
    label: "UI Polish",
    description: "Affiner les détails visuels, animations et micro-interactions.",
    emoji: "✨",
    defaultCount: 5,
    recipe: { motion: 2, components: 1, "design-system": 1, responsive: 1 },
  },
];

export function getPreset(id: string): KitPreset | undefined {
  return kitPresets.find((p) => p.id === id);
}

export interface BalancedKitOptions {
  preset: KitPreset;
  /** Overrides preset.defaultCount when provided. */
  count?: number;
  /** Overrides preset.defaultCategories when provided (and non-empty). */
  categoryIds?: string[];
  /** Overrides preset.defaultLevels when provided (and non-empty). */
  levels?: SkillLevel[];
  /** Optional seed for reproducibility. */
  seed?: number;
}

/**
 * Generate a balanced kit using a preset recipe.
 * Skills are drawn per category according to the recipe, then remaining slots
 * are filled randomly from the filtered pool. The final selection is shuffled
 * so recipe order is not always visible.
 * Fully deterministic when `seed` is provided.
 */
export function generateBalancedKit({
  preset,
  count,
  categoryIds,
  levels,
  seed,
}: BalancedKitOptions): Skill[] {
  const effectiveCount = count ?? preset.defaultCount;
  const effectiveLevels = levels && levels.length > 0 ? levels : preset.defaultLevels;
  const effectiveCategories =
    categoryIds && categoryIds.length > 0 ? categoryIds : preset.defaultCategories;

  const rand = seed !== undefined ? mulberry32(seed) : () => Math.random();

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Build base pool respecting level and category filters
  const poolBase = skills.filter((s) => {
    if (
      effectiveCategories &&
      effectiveCategories.length > 0 &&
      !effectiveCategories.includes(s.categoryId)
    )
      return false;
    if (effectiveLevels && effectiveLevels.length > 0 && !effectiveLevels.includes(s.level))
      return false;
    return true;
  });

  if (poolBase.length === 0) return [];

  const selected: Skill[] = [];
  const usedIds = new Set<string>();

  // Draw per recipe
  for (const [catId, catCount] of Object.entries(preset.recipe)) {
    if (selected.length >= effectiveCount) break;
    const catPool = poolBase.filter((s) => s.categoryId === catId);
    const picks = shuffle(catPool).slice(0, catCount);
    for (const s of picks) {
      if (selected.length >= effectiveCount) break;
      if (!usedIds.has(s.id)) {
        selected.push(s);
        usedIds.add(s.id);
      }
    }
  }

  // Fill remaining slots from the rest of the pool
  if (selected.length < effectiveCount) {
    const remaining = shuffle(poolBase.filter((s) => !usedIds.has(s.id)));
    for (const s of remaining) {
      if (selected.length >= effectiveCount) break;
      selected.push(s);
      usedIds.add(s.id);
    }
  }

  // Shuffle the final selection so recipe order stays hidden
  return shuffle(selected).slice(0, effectiveCount);
}

export function getSkillsByIds(ids: string[]): Skill[] {
  const map = new Map(skills.map((s) => [s.id, s]));
  return ids.map((id) => map.get(id)).filter((s): s is Skill => !!s);
}

export const levelLabels: Record<SkillLevel, string> = {
  fundamental: "Fondamental",
  advanced: "Avancé",
  expert: "Expert",
};

export const levelOrder: SkillLevel[] = ["fundamental", "advanced", "expert"];
