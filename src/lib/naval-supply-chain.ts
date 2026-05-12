/**
 * Cartographie de la chaîne d'approvisionnement navale — Sorel-Tracy.
 *
 * Source : Note stratégique « Cartographie de la chaîne d'approvisionnement
 * navale pour Sorel-Tracy » (DÉPS, 7 mai 2026), elle-même appuyée sur la
 * méthodologie Optchain d'OPTEL (2024).
 *
 * Ce module sert de source de vérité côté frontend pour la page /chaine-navale.
 * Si un registre officiel est mis en place (cf. recommandation §5.1), cette
 * structure pourra être alimentée depuis une API ou un fichier centralisé.
 */

export type SupplierStatus = "implante" | "partenaire" | "recherche";

export interface NavalSupplier {
  nom: string;
  specialites: string[];
  implantation?: string;
  statut: SupplierStatus;
  partenariatStrategique?: string;
  /**
   * Approximate [lat, lng] used for the geographic map. Illustrative until
   * validated by Service de l'urbanisme de Sorel-Tracy.
   */
  coordonnees?: [number, number];
  /** One- to two-sentence profile of the supplier's role on the chain. */
  apercu?: string;
  /** Year of founding. Mark with `estime: true` when not certified. */
  anneeFondation?: { valeur: number; estime?: boolean };
  /** Effectif approximatif (string for range notation). */
  effectifApprox?: { valeur: string; estime?: boolean };
  /** Certifications likely held; mark when typical-of-sector rather than confirmed. */
  certifications?: Array<{ nom: string; statut: "confirmee" | "typique-du-secteur" }>;
  /** IDs into the `sources` registry below. */
  sourceRefs?: string[];
}

export interface Source {
  id: string;
  numero: number;
  organisation: string;
  titre: string;
  date?: string;
  type:
    | "communique"
    | "rapport"
    | "donnees"
    | "site-officiel"
    | "methodologie"
    | "note-interne";
  url?: string;
}

export interface SupplierCategory {
  id: string;
  nom: string;
  entreprises: NavalSupplier[];
  /** Compétences ciblées lorsque la catégorie est encore à pourvoir (T2/T3). */
  competencesRecherchees?: string[];
}

export type TierColor = "primary" | "secondary" | "muted";

export interface SupplyChainTier {
  code: "T1" | "T2" | "T3";
  nom: string;
  description: string;
  couleur: TierColor;
  categories: SupplierCategory[];
}

export interface ActionStep {
  ordre: number;
  nom: string;
  description: string;
  echeance: string;
}

export interface Recommandation {
  id: string;
  titre: string;
  description: string;
}

export interface ObjectifStrategique {
  id: string;
  titre: string;
  description: string;
}

export const contexte = {
  donneurOrdresPrincipal: "Chantier Davie (Lévis, Québec)",
  programme: "Stratégie nationale de construction navale (SNCN)",
  contratInitialMilliards: 8.5,
  retombeesPrevuesMilliards: 21,
  horizonRetombees: "2040",
  engagementPmeMillions: 200,
  premiereDecoupeAcier: "Mars 2026 — Polaire Max, chantier de Lévis",
  naviresCibles: [
    "Brise-glaces lourds de classe Polaire Max",
    "Traversiers hybrides",
  ],
  sourceRefs: ["snc-canada", "davie-pr-2023", "deps-note-2026"],
} as const;

/**
 * Registre bibliographique. Chaque source porte un numéro stable utilisé pour
 * les renvois `[n]` dans le texte. N'ajouter une URL que si elle est connue
 * comme stable et publique ; sinon, indiquer seulement organisation + titre.
 */
export const sources: Source[] = [
  {
    id: "snc-canada",
    numero: 1,
    organisation: "Gouvernement du Canada — Services publics et Approvisionnement Canada",
    titre: "Stratégie nationale de construction navale (SNCN) — survol du programme",
    date: "2023–2026",
    type: "site-officiel",
    url: "https://www.canada.ca/fr/services-publics-approvisionnement.html",
  },
  {
    id: "davie-pr-2023",
    numero: 2,
    organisation: "Chantier Davie Canada Inc.",
    titre:
      "Communiqué — Davie devient le troisième chantier partenaire de la SNCN (contrat initial de 8,5 G$ pour brise-glaces et traversiers hybrides)",
    date: "Avril 2023",
    type: "communique",
  },
  {
    id: "davie-polaire-2026",
    numero: 3,
    organisation: "Chantier Davie Canada Inc.",
    titre: "Première découpe d'acier du brise-glace Polaire Max — chantier de Lévis",
    date: "Mars 2026",
    type: "communique",
  },
  {
    id: "davie-pme-200m",
    numero: 4,
    organisation: "Chantier Davie Canada Inc.",
    titre:
      "Engagement de 200 M$ auprès des PME canadiennes dans le cadre de la SNCN",
    date: "2023",
    type: "communique",
  },
  {
    id: "optel-optchain-2024",
    numero: 5,
    organisation: "OPTEL Group",
    titre:
      "Optchain — Méthodologie de cartographie de chaîne d'approvisionnement en 4 étapes (livre blanc)",
    date: "2024",
    type: "methodologie",
  },
  {
    id: "cwb-normes",
    numero: 6,
    organisation: "Bureau canadien de soudage (CWB)",
    titre:
      "CSA W47.1 — Certification des compagnies de soudage par fusion des structures en acier",
    type: "site-officiel",
    url: "https://www.cwbgroup.org",
  },
  {
    id: "naval-quebec",
    numero: 7,
    organisation: "Naval Québec — Académie de la chaîne d'approvisionnement navale",
    titre: "Programme de qualification des fournisseurs québécois",
    type: "site-officiel",
  },
  {
    id: "investissement-quebec",
    numero: 8,
    organisation: "Investissement Québec",
    titre:
      "Programmes de financement industriel et d'automatisation pour PME manufacturières",
    type: "site-officiel",
    url: "https://www.investquebec.com",
  },
  {
    id: "statcan-fabrication",
    numero: 9,
    organisation: "Statistique Canada",
    titre:
      "Industrie de la fabrication — produits métalliques et machinerie (CANSIM, table 16-10-0117-01)",
    type: "donnees",
    url: "https://www.statcan.gc.ca",
  },
  {
    id: "cegep-sorel-tracy",
    numero: 10,
    organisation: "Cégep de Sorel-Tracy",
    titre: "Programmes en techniques industrielles, génie mécanique et maintenance",
    type: "site-officiel",
  },
  {
    id: "deps-note-2026",
    numero: 11,
    organisation: "DÉPS — MRC Pierre-De Saurel",
    titre:
      "Note stratégique — Cartographie de la chaîne d'approvisionnement navale pour Sorel-Tracy (Jean-François Leblanc, CPA)",
    date: "7 mai 2026",
    type: "note-interne",
  },
  {
    id: "mrc-pierredesaurel",
    numero: 12,
    organisation: "MRC Pierre-De Saurel",
    titre:
      "Schéma d'aménagement et de développement révisé — zones M-1 et M-2, parc industriel Ludger-Simard",
    type: "site-officiel",
    url: "https://www.mrcpierredesaurel.com",
  },
];

export const objectifsStrategiques: ObjectifStrategique[] = [
  {
    id: "visibilite-maillage",
    titre: "Visibilité et maillage",
    description:
      "Permettre à Davie et à Naval Québec d'identifier rapidement les fournisseurs de niveaux 1, 2 et 3 capables de répondre aux exigences de la SNCN.",
  },
  {
    id: "gestion-risques",
    titre: "Gestion des risques",
    description:
      "Identifier les goulets d'étranglement locaux (ex. pénurie de main-d'œuvre spécialisée) et sécuriser la continuité des opérations de maintenance navale.",
  },
  {
    id: "competitivite-innovation",
    titre: "Compétitivité et innovation",
    description:
      "Favoriser les projets de développement conjoints entre PME locales et donneurs d'ordres pour des produits à forte valeur ajoutée (ex. acier haute performance).",
  },
  {
    id: "conformite-esg",
    titre: "Conformité ESG",
    description:
      "Aligner les entreprises sur les exigences environnementales des contrats fédéraux, en s'appuyant sur le statut de Technopole en écologie industrielle.",
  },
];

export const niveaux: SupplyChainTier[] = [
  {
    code: "T1",
    nom: "Niveau 1 — Fournisseurs directs à Davie",
    description:
      "Entreprises fournissant des systèmes complets, des services d'ingénierie majeurs ou des composants critiques directement au chantier.",
    couleur: "primary",
    categories: [
      {
        id: "t1-maintenance",
        nom: "Maintenance et réparation navale",
        entreprises: [
          {
            nom: "Divex Marine",
            specialites: [
              "Plongée industrielle",
              "Inspection sous-marine",
              "Réparation de coque",
            ],
            implantation: "Sorel-Tracy",
            statut: "implante",
            coordonnees: [46.0568, -73.1162],
            apercu:
              "Plongée commerciale et inspection sous-marine sur les navires de la flotte Davie et les installations portuaires du Saint-Laurent.",
            effectifApprox: { valeur: "10–50", estime: true },
            certifications: [
              { nom: "ADC International — plongée commerciale", statut: "typique-du-secteur" },
            ],
            sourceRefs: ["deps-note-2026"],
          },
          {
            nom: "Mount Royal Walsh",
            specialites: [
              "Réparation et conversion de navires",
              "Travaux de cale sèche",
            ],
            implantation: "Sorel-Tracy",
            statut: "implante",
            coordonnees: [46.0590, -73.1095],
            apercu:
              "Atelier de réparation et conversion navale en bord de fleuve, à proximité immédiate du quai commercial du port de Sorel.",
            effectifApprox: { valeur: "50–200", estime: true },
            certifications: [
              { nom: "CWB W47.1 — soudage de structures", statut: "typique-du-secteur" },
              { nom: "ISO 9001", statut: "typique-du-secteur" },
            ],
            sourceRefs: ["deps-note-2026", "cwb-normes"],
          },
          {
            nom: "Groupe Océan",
            specialites: [
              "Remorquage",
              "Construction et réparation navale",
              "Services portuaires",
            ],
            implantation: "Sorel-Tracy",
            statut: "implante",
            coordonnees: [46.0540, -73.1075],
            apercu:
              "Acteur intégré du transport maritime québécois : remorquage, services portuaires, chantiers de l'Isle-aux-Coudres et de l'Île-aux-Grues. Présence régionale solide.",
            anneeFondation: { valeur: 1972 },
            effectifApprox: { valeur: "1000+", estime: true },
            certifications: [
              { nom: "ISO 9001 / 14001 / 45001", statut: "typique-du-secteur" },
            ],
            sourceRefs: ["deps-note-2026"],
          },
        ],
      },
      {
        id: "t1-metallurgie",
        nom: "Métallurgie lourde",
        entreprises: [
          {
            nom: "Finkl Steel — Les Forges de Sorel",
            specialites: [
              "Pièces forgées de grande dimension",
              "Acier haute performance",
            ],
            implantation: "Sorel-Tracy",
            statut: "implante",
            partenariatStrategique: "Partenariat avec TKMS (Allemagne)",
            coordonnees: [46.0508, -73.1184],
            apercu:
              "Complexe sidérurgique historique de Sorel-Tracy (Les Forges de Sorel), spécialisé dans la forge ouverte de pièces massives pour l'énergie, l'aérospatiale et la défense. Capacité de coulée et de forge structurante pour les coques de brise-glaces lourds.",
            anneeFondation: { valeur: 1916, estime: true },
            effectifApprox: { valeur: "200–500", estime: true },
            certifications: [
              { nom: "ISO 9001", statut: "typique-du-secteur" },
              { nom: "ISO 14001", statut: "typique-du-secteur" },
              { nom: "AISI / SAE — aciers haute performance", statut: "typique-du-secteur" },
            ],
            sourceRefs: ["deps-note-2026"],
          },
        ],
      },
    ],
  },
  {
    code: "T2",
    nom: "Niveau 2 — Sous-traitants des fournisseurs de niveau 1",
    description:
      "Fournisseurs de matériaux, sous-assemblages et services spécialisés nécessaires aux donneurs d'ordres directs.",
    couleur: "secondary",
    categories: [
      {
        id: "t2-usinage",
        nom: "Usinage et soudure spécialisée",
        entreprises: [],
        competencesRecherchees: [
          "Ateliers de fabrication métallique",
          "Soudure haute pression",
          "Découpe automatisée et robotisée",
          "Certification CWB (Bureau canadien de soudage)",
        ],
      },
      {
        id: "t2-mecanique",
        nom: "Mécanique et hydraulique",
        entreprises: [],
        competencesRecherchees: [
          "Pompes industrielles",
          "Valves haute pression",
          "Systèmes de tuyauterie industrielle",
          "Vérins et circuits hydrauliques",
        ],
      },
      {
        id: "t2-environnement",
        nom: "Services environnementaux",
        entreprises: [],
        competencesRecherchees: [
          "Traitement des eaux industrielles",
          "Gestion des matières résiduelles",
          "Décontamination et écologie industrielle",
        ],
      },
    ],
  },
  {
    code: "T3",
    nom: "Niveau 3 — Matières premières et services de base",
    description:
      "Fournitures industrielles, logistique et formation soutenant l'ensemble de la chaîne.",
    couleur: "muted",
    categories: [
      {
        id: "t3-fournitures",
        nom: "Fournitures industrielles",
        entreprises: [],
        competencesRecherchees: [
          "Quincaillerie industrielle",
          "Gaz de soudage",
          "Équipements de protection individuelle (EPI)",
        ],
      },
      {
        id: "t3-logistique",
        nom: "Logistique et transport",
        entreprises: [],
        competencesRecherchees: [
          "Transporteurs spécialisés (charges hors normes)",
          "Manutention portuaire",
          "Logistique fluviale et ferroviaire",
        ],
      },
      {
        id: "t3-formation",
        nom: "Formation et capital humain",
        entreprises: [
          {
            nom: "Cégep de Sorel-Tracy",
            specialites: ["Techniques industrielles", "Génie mécanique"],
            implantation: "Sorel-Tracy",
            statut: "partenaire",
            coordonnees: [46.0436, -73.1180],
            apercu:
              "Cégep régional desservant la MRC Pierre-De Saurel. Diplôme d'études collégiales en techniques industrielles, électronique industrielle, génie mécanique et maintenance.",
            anneeFondation: { valeur: 1968 },
            effectifApprox: { valeur: "≈1 500 étudiants", estime: true },
            sourceRefs: ["cegep-sorel-tracy", "deps-note-2026"],
          },
          {
            nom: "CFPEAST",
            specialites: [
              "Programme en construction navale (lancement automne 2026)",
            ],
            implantation: "Sorel-Tracy",
            statut: "partenaire",
            coordonnees: [46.0418, -73.1212],
            apercu:
              "Centre de formation professionnelle de l'Est. Lance un programme dédié en construction navale à l'automne 2026, en réponse aux besoins de main-d'œuvre identifiés par la SNCN.",
            sourceRefs: ["deps-note-2026"],
          },
        ],
      },
    ],
  },
];

export interface AnalyseSection {
  id: string;
  titre: string;
  paragraphes: string[];
  sourceRefs?: string[];
}

export const analyseStrategique: AnalyseSection[] = [
  {
    id: "positionnement",
    titre: "Positionnement de Sorel-Tracy dans la SNCN",
    paragraphes: [
      "La SNCN a été lancée par le gouvernement du Canada en 2010 pour renouveler la flotte fédérale (Garde côtière + Marine royale) via deux chantiers partenaires : Irving (Halifax) et Seaspan (Vancouver). L'ajout de Davie en avril 2023 comme troisième chantier majeur ouvre une fenêtre stratégique pour le tissu industriel québécois — et plus particulièrement pour la grande région de Sorel-Tracy, deuxième pôle sidérurgique du Québec après Sept-Îles.",
      "Sorel-Tracy combine trois atouts rares au Canada : un accès direct au fleuve Saint-Laurent (tirant d'eau 8 m), une expertise sidérurgique multi-générationnelle (Les Forges de Sorel opèrent en continu depuis le début du XXᵉ siècle), et un écosystème portuaire spécialisé en intervention sur navires. Cette combinaison sature plusieurs niveaux de la chaîne d'approvisionnement attendue par Davie pour les brise-glaces de classe Polaire Max.",
    ],
    sourceRefs: ["snc-canada", "davie-pr-2023", "deps-note-2026"],
  },
  {
    id: "risques",
    titre: "Risques identifiés — main-d'œuvre et qualification",
    paragraphes: [
      "Le principal goulot d'étranglement attendu n'est pas la capacité industrielle mais la disponibilité de main-d'œuvre qualifiée : soudeurs CWB W47.1 toutes positions, monteurs-ajusteurs, et techniciens en automatisation. Le lancement du programme en construction navale au CFPEAST à l'automne 2026 constitue une réponse directe à ce risque, mais le délai de formation (12–24 mois) crée une fenêtre de vulnérabilité jusqu'en 2028.",
      "La certification des fournisseurs québécois aux normes fédérales (W47.1, ISO 9001, ITAR pour les composants à usage défense) demande typiquement 6 à 18 mois et un investissement de l'ordre de 50 à 250 k$ par PME. Sans programme d'accompagnement structuré, peu de PME locales pourront se conformer dans les délais du carnet de commandes Davie.",
    ],
    sourceRefs: ["cwb-normes", "naval-quebec", "deps-note-2026"],
  },
  {
    id: "opportunites",
    titre: "Opportunités — verticalisation et exportation",
    paragraphes: [
      "Au-delà des contrats directs Davie, la chaîne d'approvisionnement navale crée un effet d'entraînement vers des marchés adjacents : maintenance commerciale (flotte de Algoma, CSL, FedNav), énergie offshore, et marchés européens via le partenariat Finkl Steel — TKMS (Allemagne). L'engagement de 200 M$ de Davie auprès des PME canadiennes représente un plancher, pas un plafond.",
      "Le statut de Technopole en écologie industrielle de Sorel-Tracy ouvre par ailleurs un axe ESG sous-exploité : les navires de la SNCN intègrent des cahiers des charges environnementaux stricts (émissions, batteries hybrides, recyclage en fin de vie), où l'expertise locale en valorisation des matières résiduelles industrielles peut se positionner.",
    ],
    sourceRefs: ["davie-pme-200m", "investissement-quebec", "deps-note-2026"],
  },
];

export interface TimelineEvent {
  date: string;
  triLabel: string;
  titre: string;
  description: string;
  statut: "passe" | "en-cours" | "a-venir";
  sourceRefs?: string[];
}

export const friseSNCN: TimelineEvent[] = [
  {
    date: "2010",
    triLabel: "2010",
    titre: "Lancement de la SNCN",
    description:
      "Le gouvernement du Canada établit la Stratégie nationale de construction navale et désigne Irving (Halifax) et Seaspan (Vancouver) comme chantiers partenaires.",
    statut: "passe",
    sourceRefs: ["snc-canada"],
  },
  {
    date: "Avril 2023",
    triLabel: "2023-04",
    titre: "Davie devient le 3ᵉ chantier partenaire",
    description:
      "Signature du contrat-cadre Davie-SNCN. Carnet initial de 8,5 G$ pour brise-glaces lourds (programme Polaire Max) et traversiers hybrides.",
    statut: "passe",
    sourceRefs: ["davie-pr-2023"],
  },
  {
    date: "Mars 2026",
    triLabel: "2026-03",
    titre: "Première découpe d'acier — Polaire Max",
    description:
      "Cérémonie de découpe d'acier du premier brise-glace lourd Polaire Max au chantier de Lévis.",
    statut: "passe",
    sourceRefs: ["davie-polaire-2026"],
  },
  {
    date: "Q2–Q3 2026",
    triLabel: "2026-06",
    titre: "Cartographie DÉPS et appel aux PME",
    description:
      "Le DÉPS engage les fournisseurs T1 puis lance un appel à inscription pour les PME T2/T3 dans une base centralisée.",
    statut: "en-cours",
    sourceRefs: ["deps-note-2026", "optel-optchain-2024"],
  },
  {
    date: "Automne 2026",
    triLabel: "2026-09",
    titre: "Lancement du programme CFPEAST",
    description:
      "Premier programme dédié en construction navale au CFPEAST de Sorel-Tracy — réponse à la pénurie attendue de soudeurs CWB.",
    statut: "a-venir",
    sourceRefs: ["deps-note-2026"],
  },
  {
    date: "Q4 2026",
    triLabel: "2026-12",
    titre: "Qualification des PME",
    description:
      "Programme de mise à niveau ISO/CWB avec Naval Québec et Investissement Québec.",
    statut: "a-venir",
    sourceRefs: ["naval-quebec", "investissement-quebec"],
  },
  {
    date: "2040",
    triLabel: "2040",
    titre: "Horizon des retombées",
    description:
      "Cible de retombées économiques de 21 G$ communiquée par Davie pour l'ensemble du programme SNCN.",
    statut: "a-venir",
    sourceRefs: ["davie-pr-2023"],
  },
];

export const planAction: ActionStep[] = [
  {
    ordre: 1,
    nom: "Engagement initial (niveau 1)",
    description:
      "Contacter les grands donneurs d'ordres déjà implantés (Divex Marine, Finkl Steel, Groupe Océan, Mount Royal Walsh) pour recenser leurs capacités et besoins actuels.",
    echeance: "Q2 2026",
  },
  {
    ordre: 2,
    nom: "Extension aux PME (niveaux 2 et 3)",
    description:
      "Lancer un appel à l'écosystème manufacturier local (sidérurgie, mécanique, électrique) pour s'inscrire dans une base de données centralisée du DÉPS.",
    echeance: "Q3 2026",
  },
  {
    ordre: 3,
    nom: "Qualification et conformité",
    description:
      "Accompagner les entreprises, en collaboration avec l'Académie de la chaîne d'approvisionnement navale du Québec (Naval Québec), pour obtenir les certifications requises (ISO, normes de soudure CWB).",
    echeance: "Q4 2026",
  },
  {
    ordre: 4,
    nom: "Gestion continue",
    description:
      "Maintenir un tableau de bord dynamique des capacités régionales à présenter régulièrement à Davie et au gouvernement fédéral.",
    echeance: "Continu",
  },
];

export const recommandations: Recommandation[] = [
  {
    id: "registre",
    titre: "Création d'un registre officiel",
    description:
      "Mandater le DÉPS pour colliger et structurer les données des entreprises locales à potentiel naval d'ici la fin du Q3 2026.",
  },
  {
    id: "maillage-b2b",
    titre: "Maillage proactif",
    description:
      "Organiser une rencontre B2B à Sorel-Tracy entre les acheteurs de Davie, Naval Québec et les entreprises manufacturières régionales.",
  },
  {
    id: "soutien-mise-a-niveau",
    titre: "Soutien à la mise à niveau",
    description:
      "Mettre en place un fonds ou un programme d'accompagnement (avec Investissement Québec) pour aider les PME à se conformer aux normes de Davie et à investir dans la robotisation (ex. découpe automatisée).",
  },
];

export const atoutsRegionaux = [
  "Accès direct au fleuve Saint-Laurent (tirant d'eau 8 m)",
  "Parc industriel Ludger-Simard et zone industrialo-portuaire",
  "Desserte ferroviaire CN/CP",
  "300 ans d'expertise en construction navale",
  "Statut de Technopole en écologie industrielle",
  "Main-d'œuvre industrielle qualifiée (tradition sidérurgique et pétrochimique)",
];

export const statusLabels: Record<SupplierStatus, string> = {
  implante: "Implanté",
  partenaire: "Partenaire",
  recherche: "À pourvoir",
};

export const statusBadgeVariant: Record<
  SupplierStatus,
  "success" | "secondary" | "outline"
> = {
  implante: "success",
  partenaire: "secondary",
  recherche: "outline",
};

export const totalEntreprisesCartographiees = niveaux.reduce(
  (acc, tier) =>
    acc +
    tier.categories.reduce(
      (catAcc, cat) => catAcc + cat.entreprises.length,
      0,
    ),
  0,
);

export interface SupplierGeoPoint extends NavalSupplier {
  tierCode: SupplyChainTier["code"];
  tierNom: string;
  categorieNom: string;
  coordonnees: [number, number];
}

export const fournisseursGeoreferences: SupplierGeoPoint[] = niveaux.flatMap(
  (tier) =>
    tier.categories.flatMap((category) =>
      category.entreprises
        .filter(
          (e): e is NavalSupplier & { coordonnees: [number, number] } =>
            Array.isArray(e.coordonnees),
        )
        .map<SupplierGeoPoint>((e) => ({
          ...e,
          tierCode: tier.code,
          tierNom: tier.nom,
          categorieNom: category.nom,
          coordonnees: e.coordonnees,
        })),
    ),
);
