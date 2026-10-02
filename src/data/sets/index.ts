// Accès aux extensions embarquées. Le contenu des cartes est écrit à la main, un dossier par
// extension et un fichier par famille, dans src/data/cards/<extension>/<famille>.json (voir
// content/SPEC.md) ; on l'assemble ici dans l'ordre des familles de chaque extension, on
// numérote, et on fournit une validation utilisée par les tests.

import { isFamilyId, type FamilyId } from '../../lib/families'
import { isRarity, type Rarity } from '../../lib/rarity'

export const FORMS = [
  'comprime',
  'gelule',
  'solution',
  'injectable',
  'patch',
  'spray',
  'gaz',
  'suppositoire',
  'creme',
  'collyre',
  'sachet',
  'bain-de-bouche',
  'stylo',
  'poche',
] as const

export type Form = (typeof FORMS)[number]

export const ROUTES: Record<string, string> = {
  PO: 'Orale',
  SL: 'Sublinguale',
  SC: 'Sous-cutanée',
  IV: 'Intraveineuse',
  IM: 'Intramusculaire',
  TD: 'Transdermique',
  IN: 'Intranasale',
  TM: 'Transmuqueuse',
  IR: 'Rectale',
  Inhalée: 'Inhalée',
  Locale: 'Locale',
}

export type FunKind = 'anecdote' | 'culture' | 'mnemo' | 'humour'

export const FUN_LABELS: Record<FunKind, string> = {
  anecdote: 'Anecdote',
  culture: 'Culture',
  mnemo: 'Moyen mnémo',
  humour: 'Le mot pour sourire',
}

/** Une carte telle qu'écrite dans src/data/cards/*.json. */
export type CardContent = {
  dci: string
  family: FamilyId
  rarity: Rarity
  classe: string
  brands: string[]
  forms: Form[]
  routes: string[]
  /** Ce que c'est, en une ligne (affiché sur la carte). */
  tagline: string
  /** Qu'est-ce que c'est : classe et indications en soins palliatifs. */
  what: string
  action: string
  sideEffects: string[]
  contraindications: string[]
  antidote: string | null
  fun: { kind: FunKind; text: string }
}

export type CardData = CardContent & {
  /** « PAL1-012 » */
  id: string
  /** « 012 » */
  localId: string
  /** Nom affiché : la DCI. */
  name: string
}

export type SetData = {
  id: string
  name: string
  /** Teinte du paquet (booster) de l'extension. */
  hue: number
  families: FamilyId[]
  cards: CardData[]
}

/** Longueurs maximales (content/SPEC.md) : la carte reste un mémo. */
export const LIMITS = {
  classe: 50,
  tagline: 60,
  what: 220,
  action: 220,
  sideEffect: 60,
  contraindication: 70,
  fun: 220,
} as const

const files = import.meta.glob<CardContent[]>('../cards/*/*.json', { eager: true, import: 'default' })

type SetDef = Omit<SetData, 'cards'>

/** Les extensions, dans l'ordre d'affichage. Les ids des cartes sont préfixés par l'id de l'extension. */
const SET_DEFS: SetDef[] = [
  {
    id: 'PAL1',
    name: 'Soins palliatifs',
    hue: 213,
    families: ['opioide', 'antalgique', 'sedatif', 'neuroleptique', 'secretions', 'cortico', 'digestif', 'soins', 'urgence'],
  },
  {
    id: 'CARDIO',
    name: 'Cardiologie et coagulation',
    hue: 352,
    families: ['anticoagulant', 'antiagregant', 'hemostase', 'antihypertenseur', 'rythme', 'insuffisance', 'lipides'],
  },
  {
    id: 'INFECT',
    name: 'Anti-infectieux',
    hue: 150,
    families: ['betalactamine', 'aminoside', 'autreatb', 'urinaire', 'antiviral', 'antifongique'],
  },
  {
    id: 'URGENCE',
    name: 'Urgences et réanimation',
    hue: 22,
    families: ['amine', 'anesthesie', 'respiratoire', 'electrolyte', 'antidote', 'neuro'],
  },
  {
    id: 'ENDO',
    name: 'Diabète et endocrinologie',
    hue: 268,
    families: ['insuline', 'antidiabetique', 'hormone'],
  },
]

export const DEFAULT_SET_ID = 'PAL1'

function buildSet(def: SetDef): SetData {
  const cards: CardData[] = []
  for (const family of def.families) {
    for (const content of files[`../cards/${def.id}/${family}.json`] ?? []) {
      const localId = String(cards.length + 1).padStart(3, '0')
      cards.push({ ...content, id: `${def.id}-${localId}`, localId, name: content.dci })
    }
  }
  return { ...def, cards }
}

const SETS: Record<string, SetData> = Object.fromEntries(SET_DEFS.map((def) => [def.id, buildSet(def)]))

/** Extension par id ; une extension inconnue (ancienne sauvegarde) retombe sur Soins palliatifs. */
export function getSet(setId: string): SetData {
  return SETS[setId] ?? SETS[DEFAULT_SET_ID]
}

export function isSetId(setId: string): boolean {
  return setId in SETS
}

/** Extensions qui ont des cartes, dans l'ordre d'affichage. */
export function listSets(): SetData[] {
  return SET_DEFS.map((def) => SETS[def.id]).filter((set) => set.cards.length > 0)
}

const indexCache = new WeakMap<SetData, Map<string, CardData>>()

/** Carte par id dans une extension, avec un index construit une seule fois par extension. */
export function cardById(set: SetData, id: string): CardData | undefined {
  let index = indexCache.get(set)
  if (!index) {
    index = new Map(set.cards.map((card) => [card.id, card]))
    indexCache.set(set, index)
  }
  return index.get(id)
}

/** Carte par id, quelle que soit son extension (l'id commence par celui de l'extension). */
export function findCard(id: string): CardData | undefined {
  const set = SETS[id.slice(0, id.lastIndexOf('-'))]
  return set ? cardById(set, id) : undefined
}

/** Toutes les cartes de toutes les extensions (quiz : réponses fausses plausibles). */
export function allCards(): CardData[] {
  return listSets().flatMap((set) => set.cards)
}

/** Liste les problèmes d'un jeu de données (vide = tout va bien). */
export function validateSet(set: SetData): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  const names = new Set<string>()
  const tooLong = (card: CardData, field: string, value: string, max: number) => {
    if (value.length > max) problems.push(`${card.dci} : ${field} trop long (${value.length} > ${max})`)
  }
  for (const card of set.cards) {
    if (ids.has(card.id)) problems.push(`id en double : ${card.id}`)
    ids.add(card.id)
    if (names.has(card.dci)) problems.push(`DCI en double : ${card.dci}`)
    names.add(card.dci)
    if (!isRarity(card.rarity)) problems.push(`rareté inconnue pour ${card.dci} : ${String(card.rarity)}`)
    if (!isFamilyId(card.family)) problems.push(`famille inconnue pour ${card.dci} : ${String(card.family)}`)
    if (!card.dci || !card.classe || !card.tagline || !card.what || !card.action) problems.push(`champ vide : ${card.dci || card.id}`)
    if (card.forms.length === 0 || card.forms.some((f) => !(FORMS as readonly string[]).includes(f))) problems.push(`forme inconnue pour ${card.dci}`)
    if (card.routes.length === 0 || card.routes.some((r) => !(r in ROUTES))) problems.push(`voie inconnue pour ${card.dci} : ${card.routes.join(', ')}`)
    if (card.sideEffects.length < 3 || card.sideEffects.length > 5) problems.push(`${card.dci} : ${card.sideEffects.length} effets indésirables (3 à 5)`)
    if (card.contraindications.length < 2 || card.contraindications.length > 4) problems.push(`${card.dci} : ${card.contraindications.length} contre-indications (2 à 4)`)
    if (!card.fun || !(card.fun.kind in FUN_LABELS) || !card.fun.text) problems.push(`${card.dci} : anecdote absente ou mal typée`)
    tooLong(card, 'classe', card.classe, LIMITS.classe)
    tooLong(card, 'tagline', card.tagline, LIMITS.tagline)
    tooLong(card, 'what', card.what, LIMITS.what)
    tooLong(card, 'action', card.action, LIMITS.action)
    for (const s of card.sideEffects) tooLong(card, 'effet indésirable', s, LIMITS.sideEffect)
    for (const c of card.contraindications) tooLong(card, 'contre-indication', c, LIMITS.contraindication)
    if (card.fun) tooLong(card, 'anecdote', card.fun.text, LIMITS.fun)
  }
  return problems
}
