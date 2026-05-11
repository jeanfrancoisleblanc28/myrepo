/**
 * Zones industrielles de la MRC Pierre-De Saurel.
 *
 * Données géographiques approximatives utilisées pour la carte interactive de
 * la page /chaine-navale. Le module reflète une partie du contenu de
 * `agent/data/zones_industrielles.json` (côté agent Python) mais sans
 * dépendance croisée — il ajoute simplement les coordonnées qui n'existent
 * pas dans la source côté agent.
 *
 * IMPORTANT : les polygones et coordonnées sont des approximations pour
 * visualisation. Une validation géomatique avec le Service de l'urbanisme de
 * Sorel-Tracy est requise avant tout usage officiel.
 */

export type ZoneCode = "M-1" | "M-2";

export interface IndustrialZone {
  id: string;
  code: ZoneCode;
  nom: string;
  description: string;
  /** Polygon outline as [lat, lng] pairs (closed loop). */
  contour: Array<[number, number]>;
  /** Approximate centroid for label placement. */
  centroide: [number, number];
}

export const mrcCentre: [number, number] = [46.045, -73.115];

export const zonesIndustrielles: IndustrialZone[] = [
  {
    id: "sorel-m2-port",
    code: "M-2",
    nom: "Zone industrialo-portuaire — Sorel-Tracy",
    description:
      "Industrie lourde, sidérurgie, pétrochimie. Accès quai fluvial (tirant d'eau 8 m), voie ferrée CN/CP, autoroute 30.",
    contour: [
      [46.0470, -73.1300],
      [46.0610, -73.1240],
      [46.0700, -73.1060],
      [46.0620, -73.0950],
      [46.0500, -73.1050],
      [46.0460, -73.1190],
      [46.0470, -73.1300],
    ],
    centroide: [46.0560, -73.1130],
  },
  {
    id: "sorel-m1-fiset",
    code: "M-1",
    nom: "Parc industriel Ludger-Simard / Boulevard Fiset",
    description:
      "Industries légères, entrepôts, ateliers de fabrication métallique. Accès route 132 et autoroute 30.",
    contour: [
      [46.0380, -73.1280],
      [46.0455, -73.1245],
      [46.0470, -73.1140],
      [46.0395, -73.1135],
      [46.0360, -73.1210],
      [46.0380, -73.1280],
    ],
    centroide: [46.0415, -73.1200],
  },
  {
    id: "saint-joseph-m1",
    code: "M-1",
    nom: "Zone industrielle légère — Saint-Joseph-de-Sorel",
    description:
      "Industriel léger, commercial lourd. Accès route 132, pont Turcotte vers Sorel-Tracy.",
    contour: [
      [46.0490, -73.1380],
      [46.0540, -73.1340],
      [46.0530, -73.1280],
      [46.0480, -73.1310],
      [46.0490, -73.1380],
    ],
    centroide: [46.0510, -73.1330],
  },
];

export const zoneColor: Record<ZoneCode, { fill: string; stroke: string }> = {
  "M-2": { fill: "#dc2626", stroke: "#991b1b" },
  "M-1": { fill: "#2563eb", stroke: "#1e40af" },
};
