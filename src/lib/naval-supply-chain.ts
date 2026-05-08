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
} as const;

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
          },
          {
            nom: "Mount Royal Walsh",
            specialites: [
              "Réparation et conversion de navires",
              "Travaux de cale sèche",
            ],
            implantation: "Sorel-Tracy",
            statut: "implante",
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
          },
          {
            nom: "CFPEAST",
            specialites: [
              "Programme en construction navale (lancement automne 2026)",
            ],
            implantation: "Sorel-Tracy",
            statut: "partenaire",
          },
        ],
      },
    ],
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
