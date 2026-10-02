// Familles de médicaments : l'équivalent des « types » du jeu d'origine (Feu, Eau...).
// Chaque famille a sa teinte (angle de couleur HSL, décliné en fond, cadre et accent par les
// cartes) et son motif d'illustration. Chaque extension liste ses familles dans l'ordre de
// son Pharmacodex (src/data/sets/index.ts).

export const FAMILY_IDS = [
  // Soins palliatifs (PAL1)
  'opioide',
  'antalgique',
  'sedatif',
  'neuroleptique',
  'secretions',
  'cortico',
  'digestif',
  'soins',
  'urgence',
  // Cardiologie et coagulation (CARDIO)
  'anticoagulant',
  'antiagregant',
  'hemostase',
  'antihypertenseur',
  'rythme',
  'insuffisance',
  'lipides',
  // Anti-infectieux (INFECT)
  'betalactamine',
  'aminoside',
  'autreatb',
  'urinaire',
  'antiviral',
  'antifongique',
  // Urgences et réanimation (URGENCE)
  'amine',
  'anesthesie',
  'respiratoire',
  'electrolyte',
  'antidote',
  'neuro',
  // Diabète et endocrinologie (ENDO)
  'insuline',
  'antidiabetique',
  'hormone',
] as const

export type FamilyId = (typeof FAMILY_IDS)[number]

/** Motif d'illustration propre à la famille (dessiné dans CardArt). */
export type Motif =
  | 'pavot'
  | 'ondes'
  | 'lune'
  | 'spirale'
  | 'bulles'
  | 'soleil'
  | 'feuille'
  | 'pansement'
  | 'pouls'
  | 'goutte'
  | 'disques'
  | 'filet'
  | 'coeur'
  | 'lactame'
  | 'bacterie'
  | 'virus'
  | 'champignon'
  | 'eclair'
  | 'bouclier'
  | 'sucre'
  | 'papillon'

export type Family = {
  id: FamilyId
  /** Nom complet (fiche, filtres). */
  label: string
  /** Nom court (bandeau de carte). */
  short: string
  /** Teinte HSL de 0 à 360. */
  hue: number
  motif: Motif
}

const f = (id: FamilyId, label: string, short: string, hue: number, motif: Motif): Family => ({ id, label, short, hue, motif })

export const FAMILIES: Record<FamilyId, Family> = {
  opioide: f('opioide', 'Opioïdes', 'Opioïde', 350, 'pavot'),
  antalgique: f('antalgique', 'Antalgiques et co-antalgiques', 'Antalgique', 280, 'ondes'),
  sedatif: f('sedatif', 'Anxiolyse et sédation', 'Sédation', 242, 'lune'),
  neuroleptique: f('neuroleptique', 'Neuroleptiques et antiémétiques', 'Neuroleptique', 172, 'spirale'),
  secretions: f('secretions', 'Anticholinergiques et antisécrétoires', 'Antisécrétoire', 205, 'bulles'),
  cortico: f('cortico', 'Corticoïdes', 'Corticoïde', 46, 'soleil'),
  digestif: f('digestif', 'Digestif et transit', 'Digestif', 108, 'feuille'),
  soins: f('soins', 'Bouche, peau et muqueuses', 'Soin local', 322, 'pansement'),
  urgence: f('urgence', 'Urgences et antidotes', 'Urgence', 20, 'pouls'),

  anticoagulant: f('anticoagulant', 'Anticoagulants', 'Anticoagulant', 355, 'goutte'),
  antiagregant: f('antiagregant', 'Antiagrégants plaquettaires', 'Antiagrégant', 22, 'disques'),
  hemostase: f('hemostase', 'Antidotes et hémostase', 'Hémostase', 46, 'filet'),
  antihypertenseur: f('antihypertenseur', 'Antihypertenseurs', 'Antihypertenseur', 205, 'ondes'),
  rythme: f('rythme', 'Bêtabloquants et antiarythmiques', 'Rythme', 275, 'pouls'),
  insuffisance: f('insuffisance', 'Insuffisance cardiaque et angor', 'Cœur', 330, 'coeur'),
  lipides: f('lipides', 'Hypolipémiants', 'Lipides', 95, 'bulles'),

  betalactamine: f('betalactamine', 'Bêtalactamines', 'Bêtalactamine', 145, 'lactame'),
  aminoside: f('aminoside', 'Aminosides, glycopeptides et dernier recours', 'Aminoside', 185, 'bacterie'),
  autreatb: f('autreatb', 'Macrolides et autres antibiotiques', 'Antibiotique', 110, 'bacterie'),
  urinaire: f('urinaire', 'Quinolones et antibiotiques urinaires', 'Urinaire', 52, 'goutte'),
  antiviral: f('antiviral', 'Antiviraux', 'Antiviral', 300, 'virus'),
  antifongique: f('antifongique', 'Antifongiques et antiparasitaires', 'Antifongique', 25, 'champignon'),

  amine: f('amine', 'Catécholamines et vasopresseurs', 'Amine', 0, 'eclair'),
  anesthesie: f('anesthesie', 'Anesthésie et curares', 'Anesthésie', 235, 'lune'),
  respiratoire: f('respiratoire', 'Respiratoire et allergie', 'Respiratoire', 195, 'bulles'),
  electrolyte: f('electrolyte', 'Solutés et électrolytes', 'Soluté', 175, 'goutte'),
  antidote: f('antidote', 'Antidotes et toxicologie', 'Antidote', 135, 'bouclier'),
  neuro: f('neuro', 'Neurologie d’urgence et thrombolyse', 'Neuro', 285, 'spirale'),

  insuline: f('insuline', 'Insulines', 'Insuline', 200, 'sucre'),
  antidiabetique: f('antidiabetique', 'Antidiabétiques non insuliniques', 'Antidiabétique', 150, 'feuille'),
  hormone: f('hormone', 'Thyroïde, surrénales et hypophyse', 'Hormone', 320, 'papillon'),
}

export function isFamilyId(value: string): value is FamilyId {
  return (FAMILY_IDS as readonly string[]).includes(value)
}

export function familyOf(id: FamilyId): Family {
  return FAMILIES[id]
}
