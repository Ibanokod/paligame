// Forme des données sauvegardées (localStorage `paligame.v1`). Toute évolution passe par une
// nouvelle version et une migration dans persistence.ts, sauf ajout d'un réglage optionnel
// (complété par sa valeur par défaut au chargement).

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
  /** 1 carte, 5 cartes, ou aucune si la collection est complète (ids « PAL1-012 »). */
  cardIds: string[]
  rarePack?: boolean
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
  /** Style de dessin des cartes (trois propositions à départager). */
  cardStyle: CardStyle
}

export const CARD_STYLES = ['classique', 'memo', 'galerie'] as const
export type CardStyle = (typeof CARD_STYLES)[number]

export type Owned = { at: string; foil?: boolean }

export type State = {
  version: 1
  settings: Settings
  entries: Entry[]
  rewards: Reward[]
  /** Carte possédée -> date d'obtention, et finition brillante si elle est sortie ainsi. */
  collection: Record<string, Owned>
}

export const DEFAULT_SETTINGS: Settings = { goalMl: 1500, quickAddMl: 150, setId: 'PAL1', backdropCardId: null, cardStyle: 'classique' }

export function initialState(): State {
  return { version: 1, settings: { ...DEFAULT_SETTINGS }, entries: [], rewards: [], collection: {} }
}
