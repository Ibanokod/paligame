// Raretés de Paligame, dans l'ordre croissant (sert au repli et à l'affichage).
// La rareté d'une carte reflète la fréquence d'utilisation du médicament en soins palliatifs :
// « Courant » sort tous les jours en service, « Exceptionnel » ne se voit presque jamais.
// Les symboles reprennent ceux du jeu d'origine (◊, ☆, ♛), que l'on connaît déjà.

export const RARITIES = ['Courant', 'Fréquent', 'Occasionnel', 'Rare', 'Très rare', 'Exceptionnel'] as const

export type Rarity = (typeof RARITIES)[number]

/** Première rareté considérée « rare » (cartes garanties au-delà de 1,5 L). */
export const RARE_MIN: Rarity = 'Rare'

const SYMBOLS: Record<Rarity, string> = {
  Courant: '◊',
  Fréquent: '◊◊',
  Occasionnel: '◊◊◊',
  Rare: '☆',
  'Très rare': '☆☆',
  Exceptionnel: '♛',
}

const HINTS: Record<Rarity, string> = {
  Courant: 'Utilisé tous les jours en service',
  Fréquent: 'Prescrit très souvent',
  Occasionnel: 'Sort pour des situations précises',
  Rare: 'Réservé à certaines indications',
  'Très rare': 'Prescription spécialisée',
  Exceptionnel: 'Presque jamais vu en stage',
}

/** Famille visuelle : pilote la couleur du halo et des badges (voir DESIGN.md). */
export type RarityFamily = 'diamond' | 'star' | 'crown'

export function isRarity(value: string): value is Rarity {
  return (RARITIES as readonly string[]).includes(value)
}

export function rarityRank(rarity: Rarity): number {
  return RARITIES.indexOf(rarity)
}

export function raritySymbol(rarity: Rarity): string {
  return SYMBOLS[rarity]
}

/** Ce que la rareté veut dire, en une ligne (fiche de carte, Pharmacodex). */
export function rarityHint(rarity: Rarity): string {
  return HINTS[rarity]
}

export function rarityFamily(rarity: Rarity): RarityFamily {
  if (rarity === 'Exceptionnel') return 'crown'
  if (rarity === 'Rare' || rarity === 'Très rare') return 'star'
  return 'diamond'
}

export function isRare(rarity: Rarity): boolean {
  return rarityRank(rarity) >= rarityRank(RARE_MIN)
}

/** Nom de la variable CSS de couleur de la famille (tokens.css). */
export function rarityCssVar(rarity: Rarity): string {
  switch (rarityFamily(rarity)) {
    case 'crown':
      return '--rarity-crown'
    case 'star':
      return '--rarity-star'
    default:
      return '--rarity-diamond'
  }
}
