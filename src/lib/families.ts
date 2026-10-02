// Familles de médicaments : l'équivalent des « types » du jeu d'origine (Feu, Eau...).
// Chaque famille a sa teinte (angle de couleur HSL, décliné en fond, cadre et accent par les
// cartes) et son motif d'illustration. L'ordre est celui du Pharmacodex.

export const FAMILY_IDS = [
  'opioide',
  'antalgique',
  'sedatif',
  'neuroleptique',
  'secretions',
  'cortico',
  'digestif',
  'soins',
  'urgence',
] as const

export type FamilyId = (typeof FAMILY_IDS)[number]

/** Motif d'illustration propre à la famille (dessiné dans CardArt). */
export type Motif = 'pavot' | 'ondes' | 'lune' | 'spirale' | 'bulles' | 'soleil' | 'feuille' | 'pansement' | 'pouls'

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

export const FAMILIES: Record<FamilyId, Family> = {
  opioide: { id: 'opioide', label: 'Opioïdes', short: 'Opioïde', hue: 350, motif: 'pavot' },
  antalgique: { id: 'antalgique', label: 'Antalgiques et co-antalgiques', short: 'Antalgique', hue: 280, motif: 'ondes' },
  sedatif: { id: 'sedatif', label: 'Anxiolyse et sédation', short: 'Sédation', hue: 242, motif: 'lune' },
  neuroleptique: { id: 'neuroleptique', label: 'Neuroleptiques et antiémétiques', short: 'Neuroleptique', hue: 172, motif: 'spirale' },
  secretions: { id: 'secretions', label: 'Anticholinergiques et antisécrétoires', short: 'Antisécrétoire', hue: 205, motif: 'bulles' },
  cortico: { id: 'cortico', label: 'Corticoïdes', short: 'Corticoïde', hue: 46, motif: 'soleil' },
  digestif: { id: 'digestif', label: 'Digestif et transit', short: 'Digestif', hue: 108, motif: 'feuille' },
  soins: { id: 'soins', label: 'Bouche, peau et muqueuses', short: 'Soin local', hue: 322, motif: 'pansement' },
  urgence: { id: 'urgence', label: 'Urgences et antidotes', short: 'Urgence', hue: 20, motif: 'pouls' },
}

export function isFamilyId(value: string): value is FamilyId {
  return (FAMILY_IDS as readonly string[]).includes(value)
}

export function familyOf(id: FamilyId): Family {
  return FAMILIES[id]
}
