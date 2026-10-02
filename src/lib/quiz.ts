// Quiz : des questions à choix multiples fabriquées à partir des fiches, sur les cartes
// gagnées. Aucun contenu à écrire en plus : la bonne réponse vient de la fiche de la carte,
// les mauvaises viennent des fiches d'autres familles, filtrées pour ne jamais proposer
// comme « fausse » une réponse que la fiche de la carte pourrait contenir.
// Les cartes ratées reviennent plus souvent ; trois bonnes réponses d'affilée = maîtrisée.

import type { CardData } from '../data/sets'
import { FAMILIES } from './families'
import { type Rng, pickOne, pickWeighted } from './random'

export type QuestionKind = 'side' | 'ci' | 'classe' | 'tagline' | 'action' | 'antidote' | 'famille'

export type Question = {
  cardId: string
  kind: QuestionKind
  /** La question posée. */
  prompt: string
  /** Texte cité sous la question (phrase-titre, mode d'action), le cas échéant. */
  quote?: string
  /** La réponse est-elle le nom du médicament (on ne l'affiche donc pas avec la question) ? */
  asksName: boolean
  options: string[]
  /** Index de la bonne réponse dans `options`. */
  answer: number
}

export type QuizStat = { ok: number; ko: number; streak: number; at: string }
export type QuizStats = Record<string, QuizStat>

/** Bonnes réponses d'affilée pour qu'une carte soit « maîtrisée ». */
export const MASTERY_STREAK = 3
/** Questions par série. */
export const QUIZ_LENGTH = 10
/** Cartes possédées minimum pour lancer une série. */
export const QUIZ_MIN_CARDS = 4

export function isMastered(stat: QuizStat | undefined): boolean {
  return (stat?.streak ?? 0) >= MASTERY_STREAK
}

/** Poids de tirage d'une carte : jamais vue et souvent ratée d'abord, maîtrisée rarement. */
export function cardWeight(stat: QuizStat | undefined): number {
  if (!stat) return 3
  if (isMastered(stat)) return 0.5
  return Math.max(0.8, 1.5 + stat.ko * 1.5 - stat.streak * 0.5)
}

/** Nouvelle statistique d'une carte après une réponse. */
export function nextStat(stat: QuizStat | undefined, correct: boolean, at: string): QuizStat {
  const s = stat ?? { ok: 0, ko: 0, streak: 0, at }
  return correct ? { ok: s.ok + 1, ko: s.ko, streak: s.streak + 1, at } : { ok: s.ok, ko: s.ko + 1, streak: 0, at }
}

// ---------- Texte : mots-clés pour repérer les recouvrements ----------

const STOP = new Set([
  'avant', 'apres', 'aussi', 'autre', 'autres', 'avec', 'cause', 'chez', 'comme', 'contre', 'dans', 'debut', 'depuis', 'donc',
  'entre', 'faible', 'forte', 'fortes', 'jamais', 'leger', 'moins', 'notamment', 'parfois', 'patient', 'plus', 'pour', 'prudence',
  'risque', 'sans', 'severe', 'severes', 'sous', 'souvent', 'surtout', 'surveiller', 'toujours', 'traitement', 'tres', 'association',
  'associe', 'associee', 'insuffisance', 'connu', 'connue', 'recent', 'recente', 'grave', 'graves', 'rare', 'rares', 'frequent',
  'frequents', 'possible', 'medicament', 'medicaments', 'dose', 'doses', 'surdosage', 'sujet',
])

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

/** Racines (6 premières lettres) des mots significatifs d'un texte. */
export function keywords(text: string): Set<string> {
  const out = new Set<string>()
  for (const word of normalize(text).split(/[^a-z0-9]+/)) {
    if (word.length < 5 || STOP.has(word)) continue
    out.add(word.slice(0, 6))
  }
  return out
}

function overlaps(a: Set<string>, b: Set<string>): boolean {
  for (const k of a) if (b.has(k)) return true
  return false
}

/** Tout ce que dit la fiche d'une carte, en mots-clés. */
function cardKeywords(card: CardData): Set<string> {
  return keywords([card.what, card.action, card.tagline, card.classe, ...card.sideEffects, ...card.contraindications].join(' '))
}

/** Débuts de ligne qui posent un contexte (« Usage prolongé : atteinte de la vessie ») : on garde tout. */
const CONTEXT = /^(usage|arret|surdosage|association|effet|traitement|au long cours|en iv|iv|sc|per os|patch|forme|repas|si |chez|rare|tres rare)/

/** Partie principale d'une ligne de fiche : « Constipation : laxatif d'emblée » -> « Constipation ». */
export function headOf(line: string): string {
  const i = line.indexOf(' : ')
  if (i <= 0 || CONTEXT.test(normalize(line))) return line.trim()
  return line.slice(0, i).trim()
}

/** Lignes trop générales pour servir de fausse réponse (vraies pour presque tout médicament). */
const GENERIC = /bien tolere|hypersensib|allerg|nausee|vomiss|cephal|vertige|somnolen|fatigue|diarrh|eruption|douleur au point|point d.injection|reaction locale|troubles digestifs|prurit|grossesse|allaitement|sujet age|pas de contre|prudence|insuffisance (hepat|renal)/

/**
 * Consignes de soin rangées dans la fiche (dilution, double contrôle, dosages...) : utiles à
 * lire, mais ce ne sont ni des effets indésirables ni des situations à poser en question.
 */
const PRACTICAL = /ne traite pas|inefficace|dilu|melang|tubulure|voie (dediee|a part|veineuse dediee)|double controle|seringue|ampoule|protocole|cristaux|ne pas attendre|incompatib|doses en|jamais en (iv|sc|im)|relais|dosage|prelev|pic et|erreur|bolus|rincage|reconstitution|tracabilit|cytotoxique|changement de|arret du pse|pse sur|repas (saute|non pris)|^hypo :|patch porte|effet durable|glycosurie|stylo|aspirer|pas d.antithrombotique|ne pas confondre|interchangeable|preleve/

function isGeneric(line: string): boolean {
  const n = normalize(line)
  return GENERIC.test(n) || PRACTICAL.test(n)
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Jusqu'à `n` fausses réponses distinctes, différentes de la bonne. */
function pickDistractors(candidates: string[], correct: string, n: number, rng: Rng): string[] {
  const seen = new Set([normalize(correct)])
  const out: string[] = []
  for (const c of shuffle(candidates, rng)) {
    const key = normalize(c)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(c)
    if (out.length === n) break
  }
  return out
}

function finish(card: CardData, kind: QuestionKind, prompt: string, correct: string, distractors: string[], rng: Rng, extra: Partial<Question> = {}): Question | null {
  if (distractors.length < 2) return null
  const options = shuffle([correct, ...distractors], rng)
  return { cardId: card.id, kind, prompt, asksName: false, options, answer: options.indexOf(correct), ...extra }
}

/** Le nom du médicament apparaît-il dans le texte (la question donnerait la réponse) ? */
function namesItself(card: CardData, text: string): boolean {
  const first = normalize(card.dci).split(/[^a-z0-9]+/).find((w) => w.length >= 4)
  return first ? normalize(text).includes(first.slice(0, 6)) : false
}

// ---------- Fabrication d'une question ----------

const KIND_WEIGHTS: Record<QuestionKind, number> = { side: 3, ci: 2, classe: 2, tagline: 1.5, action: 1.5, antidote: 1, famille: 0.6 }

/**
 * Une question sur `card`. `pool` = toutes les cartes connues, d'où viennent les fausses
 * réponses (jamais de la même famille, jamais un recouvrement avec la fiche de la carte).
 * Rend null si aucune question fiable n'a pu être construite.
 */
export function buildQuestion(card: CardData, pool: readonly CardData[], rng: Rng, kind?: QuestionKind): Question | null {
  const others = pool.filter((c) => c.family !== card.family && c.id !== card.id)
  const mine = cardKeywords(card)
  const build: Record<QuestionKind, () => Question | null> = {
    side: () => {
      const goods = card.sideEffects.filter((s) => !isGeneric(s))
      if (goods.length === 0) return null
      const correct = headOf(pickOne(goods, rng))
      const candidates = others.flatMap((c) => c.sideEffects).filter((s) => !isGeneric(s) && !overlaps(keywords(s), mine)).map(headOf)
      return finish(card, 'side', `Lequel de ces effets indésirables figure sur la fiche de ${card.dci} ?`, correct, pickDistractors(candidates, correct, 3, rng), rng)
    },
    ci: () => {
      const goods = card.contraindications.filter((s) => !isGeneric(s))
      if (goods.length === 0) return null
      const correct = pickOne(goods, rng)
      const candidates = others.flatMap((c) => c.contraindications).filter((s) => !isGeneric(s) && !overlaps(keywords(s), mine))
      return finish(card, 'ci', `Laquelle de ces situations est une contre-indication de ${card.dci} d'après sa fiche ?`, correct, pickDistractors(candidates, correct, 3, rng), rng)
    },
    classe: () => {
      const candidates = others.map((c) => c.classe).filter((c) => normalize(c) !== normalize(card.classe))
      return finish(card, 'classe', `À quelle classe appartient ${card.dci} ?`, card.classe, pickDistractors(candidates, card.classe, 3, rng), rng)
    },
    tagline: () => {
      if (namesItself(card, card.tagline)) return null
      const candidates = others.map((c) => c.dci)
      return finish(card, 'tagline', 'Quel médicament correspond à cette description ?', card.dci, pickDistractors(candidates, card.dci, 3, rng), rng, {
        quote: card.tagline,
        asksName: true,
      })
    },
    action: () => {
      if (namesItself(card, card.action)) return null
      const candidates = others.map((c) => c.dci)
      return finish(card, 'action', 'Quel médicament agit de cette façon ?', card.dci, pickDistractors(candidates, card.dci, 3, rng), rng, {
        quote: card.action,
        asksName: true,
      })
    },
    antidote: () => {
      if (!card.antidote) return null
      const correct = headOf(card.antidote.split(' (')[0])
      const candidates = others.filter((c) => c.antidote).map((c) => headOf(c.antidote!.split(' (')[0]))
      return finish(card, 'antidote', `Quel est l'antidote de ${card.dci} ?`, correct, pickDistractors(candidates, correct, 3, rng), rng)
    },
    famille: () => {
      const correct = FAMILIES[card.family].label
      const candidates = [...new Set(others.map((c) => FAMILIES[c.family].label))]
      return finish(card, 'famille', `Dans quelle famille range-t-on ${card.dci} ?`, correct, pickDistractors(candidates, correct, 3, rng), rng)
    },
  }
  if (kind) return build[kind]()
  // On essaie les types dans un ordre tiré au sort (pondéré) jusqu'à en réussir un.
  const remaining = { ...KIND_WEIGHTS }
  while (Object.keys(remaining).length > 0) {
    const k = pickWeighted(remaining, rng)
    delete remaining[k]
    const q = build[k]()
    if (q) return q
  }
  return null
}

/**
 * Une série de questions sur les cartes possédées : tirage pondéré (cartes jamais vues et
 * ratées d'abord), une carte au plus une fois tant qu'il en reste.
 */
export function buildQuiz(owned: readonly CardData[], pool: readonly CardData[], stats: QuizStats, rng: Rng, length = QUIZ_LENGTH): Question[] {
  if (owned.length < QUIZ_MIN_CARDS) return []
  const questions: Question[] = []
  let available = owned.slice()
  let guard = 0
  while (questions.length < length && guard++ < length * 6) {
    if (available.length === 0) available = owned.slice()
    const weights: Record<string, number> = {}
    for (const c of available) weights[c.id] = cardWeight(stats[c.id])
    const id = pickWeighted(weights, rng)
    const card = available.find((c) => c.id === id)!
    available = available.filter((c) => c.id !== id)
    const q = buildQuestion(card, pool, rng)
    if (q) questions.push(q)
  }
  return questions
}
