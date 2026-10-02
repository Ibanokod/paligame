// Forme des données sauvegardées (localStorage `paligame.v1`). Toute évolution passe par une
// nouvelle version et une migration dans persistence.ts, sauf ajout d'un réglage optionnel
// (complété par sa valeur par défaut au chargement).

import type { QuizStats } from '../lib/quiz'
import type { RewardKind } from '../lib/rewards'

export type Entry = {
  id: string
  /** Date et heure de la prise, ISO. */
  at: string
  ml: number
}

export type Reward = {
  id: string
  at: string
  /** Jour local AAAA-MM-JJ auquel la récompense appartient. */
  day: string
  kind: RewardKind
  thresholdMl: number
  /** 1 carte, 3 cartes (booster), ou aucune si la collection est complète (ids « PAL1-012 »). */
  cardIds: string[]
  rarePack?: boolean
  /** Extension tirée (le paquet en prend la couleur et le nom). */
  setId?: string
  /** Cartes de la récompense sorties en version brillante. */
  foilIds?: string[]
  /** Nombre de cartes déjà retournées (reprise si l'appli est fermée en cours). */
  revealed: number
  /** L'écran de révélation a été fermé par l'utilisateur. */
  seen: boolean
}

export type Settings = {
  goalMl: number
  quickAddMl: number
  setId: string
  /** Carte choisie comme fond d'écran de l'accueil ; null = la dernière carte obtenue. */
  backdropCardId: string | null
  /** Mode révision : les réponses des fiches sont cachées jusqu'au tap (par défaut). */
  hideAnswers: boolean
}

export type Owned = { at: string; foil?: boolean }

/** Quiz : résultats par carte, et meilleur score d'une série (sur 10). */
export type QuizState = {
  stats: QuizStats
  best: number
  sessions: number
}

export const EMPTY_QUIZ: QuizState = { stats: {}, best: 0, sessions: 0 }

export type State = {
  version: 1
  settings: Settings
  entries: Entry[]
  rewards: Reward[]
  /** Carte possédée -> date d'obtention, et finition brillante si elle est sortie ainsi. */
  collection: Record<string, Owned>
  quiz: QuizState
}

export const DEFAULT_SETTINGS: Settings = { goalMl: 1500, quickAddMl: 150, setId: 'PAL1', backdropCardId: null, hideAnswers: true }

export function initialState(): State {
  return { version: 1, settings: { ...DEFAULT_SETTINGS }, entries: [], rewards: [], collection: {}, quiz: { ...EMPTY_QUIZ, stats: {} } }
}
