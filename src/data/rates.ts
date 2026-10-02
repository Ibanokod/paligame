// Tables de probabilités des boosters, en pourcentages. Même mécanique que le jeu d'origine
// (3 cartes courantes, une 4e et une 5e carte tirées dans des tables, paquet rare possible),
// avec des chiffres adaptés à un jeu de 74 cartes : les rares peuvent tomber au hasard dès
// la première carte, et au-delà de 1,5 L on ne tire plus que des rares.
// Les poids sont normalisés au tirage : une somme à 99,99 ne pose aucun problème.

import type { Rarity } from '../lib/rarity'

export type RarityTable = Partial<Record<Rarity, number>>

export type RateSet = {
  /** Cartes 1 à 3 d'un booster. */
  common: RarityTable
  /** 4e carte d'un booster (sert aussi à la carte seule des 0,5 L et 1 L). */
  slot4: RarityTable
  /** 5e carte d'un booster. */
  slot5: RarityTable
  /** Chaque carte d'un paquet rare (sert aussi aux cartes garanties au-delà de 1,5 L). */
  rarePack: RarityTable
  /** Probabilité qu'un booster soit un paquet rare, en %. */
  rarePackChance: number
  /** Probabilité qu'une carte tirée sorte en version brillante (finition holographique), en %. */
  foilChance: number
}

export const RATES: RateSet = {
  common: { Courant: 100 },
  slot4: {
    Fréquent: 60,
    Occasionnel: 28,
    Rare: 9,
    'Très rare': 2.5,
    Exceptionnel: 0.5,
  },
  slot5: {
    Fréquent: 35,
    Occasionnel: 35,
    Rare: 20,
    'Très rare': 7,
    Exceptionnel: 3,
  },
  rarePack: {
    Rare: 70,
    'Très rare': 22,
    Exceptionnel: 8,
  },
  rarePackChance: 2,
  foilChance: 6,
}

export function ratesForSet(_setId: string): RateSet {
  return RATES
}
