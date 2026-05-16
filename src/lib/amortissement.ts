/*
  Moteur d'amortissement sécurisé DÉPS / FLI-FLS
  Version : 1.0.0

  Objectif :
  Générer un tableau d'amortissement robuste pour prêts institutionnels,
  avec support des moratoires, capitalisation AERAM, ventilation multi-tranches,
  arrondis financiers et validations strictes.

  Notes importantes :
  - Les calculs sont mensuels.
  - Les montants sont arrondis au cent près.
  - Le dernier paiement est ajusté pour éviter un solde résiduel artificiel.
  - Les tranches permettent une ventilation FLI/FLS ou autre source.
*/

export type TypeMoratoire = 'aucun' | 'capital' | 'capital_et_interets';

export type TypeTranche = 'FLI' | 'FLS' | 'AUTRE';

export interface TrancheFinancement {
  nom: string;
  type: TypeTranche;
  montant: number;
  pourcentage?: number;
}

export interface ParametresAmortissement {
  capital: number;
  tauxAnnuel: number;
  dureeMois: number;
  moratoireMois?: number;
  typeMoratoire?: TypeMoratoire;
  aeram?: boolean;
  dureeAeramMois?: number;
  tranches?: TrancheFinancement[];
  dateDebut?: string;
  precision?: number;
}

export interface LigneAmortissement {
  mois: number;
  date?: string;
  paiement: number;
  interet: number;
  capital: number;
  solde: number;
  interetsCumules: number;
  capitalCumule: number;
  phase: 'AERAM' | 'MORATOIRE' | 'AMORTISSEMENT' | 'TERMINE';
  ventilation?: VentilationTranche[];
}

export interface VentilationTranche {
  nom: string;
  type: TypeTranche;
  pourcentage: number;
  paiement: number;
  interet: number;
  capital: number;
  soldeTheorique: number;
}

export interface ResultatAmortissement {
  paiementMensuelInitial: number;
  paiementMensuelApresCapitalisation: number;
  capitalInitial: number;
  capitalApresCapitalisation: number;
  tauxMensuel: number;
  totalPaiements: number;
  totalInterets: number;
  totalCapital: number;
  soldeFinal: number;
  tableau: LigneAmortissement[];
  resumeTranches?: ResumeTranche[];
  avertissements: string[];
}

export interface ResumeTranche {
  nom: string;
  type: TypeTranche;
  montantInitial: number;
  pourcentage: number;
  totalPaiements: number;
  totalInterets: number;
  totalCapital: number;
  soldeFinalTheorique: number;
}

function round(value: number, precision = 2): number {
  const factor = Math.pow(10, precision);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} doit être un nombre supérieur à zéro.`);
  }
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} doit être un nombre supérieur ou égal à zéro.`);
  }
}

function calculerPaiementMensuel(capital: number, tauxMensuel: number, mois: number, precision = 2): number {
  assertFinitePositive(capital, 'Le capital amortissable');

  if (!Number.isInteger(mois) || mois <= 0) {
    throw new Error('Le nombre de mois amortissables doit être un entier supérieur à zéro.');
  }

  if (tauxMensuel === 0) {
    return round(capital / mois, precision);
  }

  const facteur = Math.pow(1 + tauxMensuel, mois);
  const paiement = capital * ((tauxMensuel * facteur) / (facteur - 1));

  return round(paiement, precision);
}

function ajouterMois(dateIso: string, moisAAjouter: number): string {
  const date = new Date(`${dateIso}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error('La date de début doit être au format ISO AAAA-MM-JJ.');
  }

  date.setMonth(date.getMonth() + moisAAjouter);
  return date.toISOString().slice(0, 10);
}

function validerParametres(params: ParametresAmortissement): Required<Pick<ParametresAmortissement,
  'moratoireMois' | 'typeMoratoire' | 'aeram' | 'dureeAeramMois' | 'precision'
>> {
  assertFinitePositive(params.capital, 'Le capital');
  assertFiniteNonNegative(params.tauxAnnuel, 'Le taux annuel');

  if (!Number.isInteger(params.dureeMois) || params.dureeMois <= 0) {
    throw new Error('La durée doit être un nombre entier de mois supérieur à zéro.');
  }

  const moratoireMois = params.moratoireMois ?? 0;
  const typeMoratoire = params.typeMoratoire ?? 'aucun';
  const aeram = params.aeram ?? false;
  const dureeAeramMois = params.dureeAeramMois ?? (aeram ? 12 : 0);
  const precision = params.precision ?? 2;

  if (!Number.isInteger(moratoireMois) || moratoireMois < 0) {
    throw new Error('Le moratoire doit être un nombre entier de mois supérieur ou égal à zéro.');
  }

  if (moratoireMois >= params.dureeMois) {
    throw new Error('Le moratoire doit être inférieur à la durée totale du prêt.');
  }

  if (!Number.isInteger(dureeAeramMois) || dureeAeramMois < 0) {
    throw new Error('La durée AERAM doit être un nombre entier de mois supérieur ou égal à zéro.');
  }

  if (dureeAeramMois >= params.dureeMois) {
    throw new Error('La durée AERAM doit être inférieure à la durée totale du prêt.');
  }

  if (!Number.isInteger(precision) || precision < 0 || precision > 6) {
    throw new Error('La précision doit être un entier entre 0 et 6.');
  }

  if (params.capital > Number.MAX_SAFE_INTEGER) {
    throw new Error('Le capital dépasse la limite numérique sécuritaire de JavaScript.');
  }

  if (params.tranches?.length) {
    const totalTranches = round(
      params.tranches.reduce((sum, tranche) => sum + tranche.montant, 0),
      precision
    );

    if (Math.abs(totalTranches - round(params.capital, precision)) > 0.01) {
      throw new Error('La somme des tranches doit correspondre au capital total.');
    }

    params.tranches.forEach((tranche, index) => {
      assertFinitePositive(tranche.montant, `Le montant de la tranche ${index + 1}`);

      if (!tranche.nom.trim()) {
        throw new Error(`La tranche ${index + 1} doit avoir un nom.`);
      }
    });
  }

  return { moratoireMois, typeMoratoire, aeram, dureeAeramMois, precision };
}

function determinerPhase(mois: number, dureeAeramMois: number, moratoireMois: number): LigneAmortissement['phase'] {
  if (mois <= dureeAeramMois) return 'AERAM';
  if (mois <= dureeAeramMois + moratoireMois) return 'MORATOIRE';
  return 'AMORTISSEMENT';
}

function preparerTranches(tranches: TrancheFinancement[] | undefined, capital: number, precision: number): VentilationTranche[] | undefined {
  if (!tranches?.length) return undefined;

  return tranches.map((tranche) => ({
    nom: tranche.nom,
    type: tranche.type,
    pourcentage: round(tranche.montant / capital, 8),
    paiement: 0,
    interet: 0,
    capital: 0,
    soldeTheorique: round(tranche.montant, precision),
  }));
}

function ventilerLigne(
  tranches: VentilationTranche[] | undefined,
  paiement: number,
  interet: number,
  capitalPaye: number,
  precision: number
): VentilationTranche[] | undefined {
  if (!tranches) return undefined;

  return tranches.map((tranche) => {
    const paiementTranche = round(paiement * tranche.pourcentage, precision);
    const interetTranche = round(interet * tranche.pourcentage, precision);
    const capitalTranche = round(capitalPaye * tranche.pourcentage, precision);
    const nouveauSolde = round(Math.max(0, tranche.soldeTheorique - capitalTranche), precision);

    tranche.soldeTheorique = nouveauSolde;

    return {
      nom: tranche.nom,
      type: tranche.type,
      pourcentage: tranche.pourcentage,
      paiement: paiementTranche,
      interet: interetTranche,
      capital: capitalTranche,
      soldeTheorique: nouveauSolde,
    };
  });
}

export function calculAmortissementSecurise(params: ParametresAmortissement): ResultatAmortissement {
  const {
    moratoireMois,
    typeMoratoire,
    aeram,
    dureeAeramMois,
    precision,
  } = validerParametres(params);

  const capitalInitial = round(params.capital, precision);
  const tauxMensuel = params.tauxAnnuel / 100 / 12;
  const avertissements: string[] = [];

  if (aeram && typeMoratoire !== 'aucun') {
    avertissements.push(
      'AERAM et moratoire sont activés simultanément. L’ordre appliqué est : AERAM, puis moratoire, puis amortissement.'
    );
  }

  const moisAvantAmortissement = dureeAeramMois + moratoireMois;
  const moisAmortissables = params.dureeMois - moisAvantAmortissement;

  if (moisAmortissables <= 0) {
    throw new Error('La période amortissable doit être supérieure à zéro mois.');
  }

  const paiementMensuelInitial = calculerPaiementMensuel(
    capitalInitial,
    tauxMensuel,
    params.dureeMois - moratoireMois,
    precision
  );

  const tableau: LigneAmortissement[] = [];
  let solde = capitalInitial;
  let interetsCumules = 0;
  let capitalCumule = 0;
  let paiementMensuelApresCapitalisation = 0;
  let paiementMensuelCourant = paiementMensuelInitial;
  let capitalApresCapitalisation = capitalInitial;
  const tranchesActives = preparerTranches(params.tranches, capitalInitial, precision);

  for (let mois = 1; mois <= params.dureeMois; mois++) {
    const phase = determinerPhase(mois, dureeAeramMois, moratoireMois);
    const interet = round(solde * tauxMensuel, precision);
    let paiement = 0;
    let capitalPaye = 0;

    if (phase === 'AERAM') {
      paiement = 0;
      capitalPaye = 0;
      solde = round(solde + interet, precision);

      if (mois === dureeAeramMois) {
        capitalApresCapitalisation = solde;
        paiementMensuelApresCapitalisation = calculerPaiementMensuel(
          capitalApresCapitalisation,
          tauxMensuel,
          params.dureeMois - mois,
          precision
        );
        paiementMensuelCourant = paiementMensuelApresCapitalisation;
      }
    } else if (phase === 'MORATOIRE') {
      if (typeMoratoire === 'capital_et_interets') {
        paiement = 0;
        capitalPaye = 0;
        solde = round(solde + interet, precision);
      } else if (typeMoratoire === 'capital') {
        paiement = interet;
        capitalPaye = 0;
      } else {
        paiement = paiementMensuelCourant;
        capitalPaye = round(Math.min(paiement - interet, solde), precision);
        paiement = round(interet + capitalPaye, precision);
        solde = round(solde - capitalPaye, precision);
      }

      if (mois === moisAvantAmortissement && (typeMoratoire === 'capital_et_interets')) {
        capitalApresCapitalisation = solde;
        paiementMensuelApresCapitalisation = calculerPaiementMensuel(
          capitalApresCapitalisation,
          tauxMensuel,
          params.dureeMois - mois,
          precision
        );
        paiementMensuelCourant = paiementMensuelApresCapitalisation;
      }
    } else {
      if (paiementMensuelApresCapitalisation === 0 && (aeram || typeMoratoire === 'capital_et_interets')) {
        capitalApresCapitalisation = solde;
        paiementMensuelApresCapitalisation = calculerPaiementMensuel(
          capitalApresCapitalisation,
          tauxMensuel,
          params.dureeMois - mois + 1,
          precision
        );
        paiementMensuelCourant = paiementMensuelApresCapitalisation;
      }

      paiement = paiementMensuelCourant;
      capitalPaye = round(Math.min(paiement - interet, solde), precision);

      if (capitalPaye >= solde || mois === params.dureeMois) {
        capitalPaye = solde;
        paiement = round(interet + capitalPaye, precision);
      }

      solde = round(Math.max(0, solde - capitalPaye), precision);
    }

    interetsCumules = round(interetsCumules + interet, precision);
    capitalCumule = round(capitalCumule + capitalPaye, precision);

    const ventilation = ventilerLigne(
      tranchesActives,
      paiement,
      interet,
      capitalPaye,
      precision
    );

    tableau.push({
      mois,
      date: params.dateDebut ? ajouterMois(params.dateDebut, mois - 1) : undefined,
      paiement: round(paiement, precision),
      interet,
      capital: capitalPaye,
      solde,
      interetsCumules,
      capitalCumule,
      phase: solde === 0 ? 'TERMINE' : phase,
      ventilation,
    });

    if (solde === 0) {
      break;
    }
  }

  const totalPaiements = round(tableau.reduce((sum, ligne) => sum + ligne.paiement, 0), precision);
  const totalInterets = round(tableau.reduce((sum, ligne) => sum + ligne.interet, 0), precision);
  const totalCapital = round(tableau.reduce((sum, ligne) => sum + ligne.capital, 0), precision);
  const soldeFinal = tableau.length ? tableau[tableau.length - 1].solde : capitalInitial;

  let resumeTranches: ResumeTranche[] | undefined;

  if (params.tranches?.length) {
    resumeTranches = params.tranches.map((tranche) => {
      const pourcentage = round(tranche.montant / capitalInitial, 8);
      const totalPaiementsTranche = round(totalPaiements * pourcentage, precision);
      const totalInteretsTranche = round(totalInterets * pourcentage, precision);
      const totalCapitalTranche = round(totalCapital * pourcentage, precision);
      const soldeFinalTheorique = round(Math.max(0, tranche.montant - totalCapitalTranche), precision);

      return {
        nom: tranche.nom,
        type: tranche.type,
        montantInitial: round(tranche.montant, precision),
        pourcentage,
        totalPaiements: totalPaiementsTranche,
        totalInterets: totalInteretsTranche,
        totalCapital: totalCapitalTranche,
        soldeFinalTheorique,
      };
    });
  }

  return Object.freeze({
    paiementMensuelInitial,
    paiementMensuelApresCapitalisation,
    capitalInitial,
    capitalApresCapitalisation,
    tauxMensuel,
    totalPaiements,
    totalInterets,
    totalCapital,
    soldeFinal,
    tableau,
    resumeTranches,
    avertissements,
  });
}

// Exemple d'utilisation FLI/FLS
export const exempleSimulationFLIFLS = calculAmortissementSecurise({
  capital: 100000,
  tauxAnnuel: 8,
  dureeMois: 60,
  moratoireMois: 6,
  typeMoratoire: 'capital',
  aeram: false,
  dateDebut: '2026-06-01',
  tranches: [
    { nom: 'Fonds local d’investissement', type: 'FLI', montant: 60000 },
    { nom: 'Fonds local de solidarité', type: 'FLS', montant: 40000 },
  ],
});

// Exemple d'utilisation AERAM
export const exempleSimulationAERAM = calculAmortissementSecurise({
  capital: 50000,
  tauxAnnuel: 3,
  dureeMois: 36,
  aeram: true,
  dureeAeramMois: 12,
  dateDebut: '2026-06-01',
});
