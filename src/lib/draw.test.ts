import { describe, expect, it } from 'vitest'
import { RATES, type RarityTable } from '../data/rates'
import { BOOSTER_SIZE, drawBooster, drawCard, drawFoils, drawForThreshold, drawRareCard, drawSingleCard, resolveRarity, type DrawableCard, type DrawContext } from './draw'
import { pickWeighted, seededRng } from './random'
import { RARITIES, type Rarity, isRare } from './rarity'

/** Jeu de cartes synthétique : `perRarity` cartes pour chaque rareté demandée. */
function makeCards(perRarity: number, rarities: readonly Rarity[] = RARITIES): DrawableCard[] {
  const cards: DrawableCard[] = []
  for (const rarity of rarities) for (let i = 0; i < perRarity; i++) cards.push({ id: `${rarity}#${i}`, rarity })
  return cards
}

function rarityOf(cards: readonly DrawableCard[], id: string): Rarity {
  return cards.find((c) => c.id === id)!.rarity
}

function context(cards: DrawableCard[], owned: string[] = [], seed = 42): DrawContext {
  return { cards, owned: new Set(owned), rates: RATES, rng: seededRng(seed) }
}

/** Répartition observée (en %) d'une table sur n tirages. */
function distribution(table: RarityTable, n: number, seed = 7): Map<string, number> {
  const rng = seededRng(seed)
  const counts = new Map<string, number>()
  for (let i = 0; i < n; i++) {
    const key = pickWeighted(table, rng)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  for (const [k, v] of counts) counts.set(k, (v / n) * 100)
  return counts
}

describe('tables de tirage', () => {
  it.each([
    ['4e carte', RATES.slot4],
    ['5e carte', RATES.slot5],
    ['paquet rare', RATES.rarePack],
  ])('%s : chaque rareté tombe à ± 0,4 point de la table', (_name, table) => {
    const observed = distribution(table, 200_000)
    for (const [rarity, expected] of Object.entries(table) as [Rarity, number][]) {
      expect(Math.abs((observed.get(rarity) ?? 0) - expected)).toBeLessThan(0.4)
    }
  })

  it('les tables somment à 100', () => {
    for (const table of [RATES.common, RATES.slot4, RATES.slot5, RATES.rarePack]) {
      const sum = Object.values(table).reduce((s, w) => s + (w ?? 0), 0)
      expect(Math.abs(sum - 100)).toBeLessThan(0.05)
    }
  })

  it('les cartes seules ne sont jamais courantes, les rares peuvent tomber au hasard', () => {
    expect(RATES.slot4.Courant).toBeUndefined()
    expect(RATES.slot4.Rare).toBeGreaterThan(0)
    expect(RATES.slot4.Exceptionnel).toBeGreaterThan(0)
  })

  it('au-delà de 1,5 L, la table ne contient que des rares', () => {
    for (const rarity of Object.keys(RATES.rarePack) as Rarity[]) expect(isRare(rarity)).toBe(true)
  })
})

describe('repli de rareté', () => {
  it('garde la rareté voulue quand elle est disponible', () => {
    expect(resolveRarity('Rare', () => true)).toBe('Rare')
  })

  it('monte d’abord, puis descend', () => {
    const only = (available: Rarity[]) => (r: Rarity) => available.includes(r)
    expect(resolveRarity('Rare', only(['Exceptionnel', 'Courant']))).toBe('Exceptionnel')
    expect(resolveRarity('Rare', only(['Courant', 'Occasionnel']))).toBe('Occasionnel')
    expect(resolveRarity('Exceptionnel', only(['Courant']))).toBe('Courant')
  })

  it('rend null quand plus rien n’est disponible', () => {
    expect(resolveRarity('Courant', () => false)).toBeNull()
  })
})

describe('tirage d’une carte', () => {
  it('ne tire jamais une carte possédée', () => {
    const cards = makeCards(3)
    const owned = cards.filter((c) => c.rarity === 'Fréquent' || c.rarity === 'Occasionnel').map((c) => c.id)
    const ctx = context(cards, owned)
    for (let i = 0; i < 500; i++) {
      const card = drawCard(RATES.slot4, ctx)
      expect(card).not.toBeNull()
      expect(owned).not.toContain(card!.id)
    }
  })

  it('suit la table quand toutes les raretés sont disponibles', () => {
    const cards = makeCards(40)
    const ctx = context(cards, [], 3)
    const counts = new Map<Rarity, number>()
    const n = 20_000
    for (let i = 0; i < n; i++) {
      const card = drawCard(RATES.slot4, ctx)!
      counts.set(card.rarity, (counts.get(card.rarity) ?? 0) + 1)
    }
    const frequent = ((counts.get('Fréquent') ?? 0) / n) * 100
    expect(frequent).toBeGreaterThan(58)
    expect(frequent).toBeLessThan(62)
    expect(counts.get('Courant') ?? 0).toBe(0)
  })

  it('se replie quand la rareté tirée est épuisée', () => {
    // Seules des courantes et une exceptionnelle existent ; la table veut une rare : on monte.
    const cards = [...makeCards(5, ['Courant']), { id: 'top', rarity: 'Exceptionnel' as Rarity }]
    const ctx = context(cards)
    expect(drawCard({ Rare: 100 }, ctx)!.id).toBe('top')
    // Exceptionnelle possédée : on redescend sur les courantes.
    const ctx2 = context(cards, ['top'])
    expect(drawCard({ Rare: 100 }, ctx2)!.rarity).toBe('Courant')
  })

  it('rend null quand la collection est complète', () => {
    const cards = makeCards(2)
    const ctx = context(cards, cards.map((c) => c.id))
    expect(drawCard(RATES.slot4, ctx)).toBeNull()
    expect(drawSingleCard(ctx)).toEqual([])
    expect(drawRareCard(ctx)).toEqual([])
    expect(drawBooster(ctx)).toEqual({ cardIds: [], rarePack: false })
  })
})

describe('carte rare garantie', () => {
  it('donne toujours une rare ou mieux tant qu’il en reste', () => {
    const cards = makeCards(10)
    const ctx = context(cards, [], 11)
    for (let i = 0; i < 300; i++) {
      const [id] = drawRareCard(ctx)
      expect(isRare(rarityOf(cards, id))).toBe(true)
    }
  })
})

describe('booster', () => {
  it('donne 3 cartes distinctes : 2 courantes puis une carte surprise', () => {
    const cards = makeCards(30)
    const ctx = context(cards, [], 5)
    let rarePacks = 0
    for (let i = 0; i < 200; i++) {
      const { cardIds, rarePack } = drawBooster(ctx)
      expect(cardIds).toHaveLength(BOOSTER_SIZE)
      expect(new Set(cardIds).size).toBe(BOOSTER_SIZE)
      if (rarePack) {
        rarePacks++
        continue
      }
      expect(cardIds.slice(0, 2).map((id) => rarityOf(cards, id))).toEqual(['Courant', 'Courant'])
      expect(rarityOf(cards, cardIds[2])).not.toBe('Courant')
    }
    expect(rarePacks).toBeLessThan(20)
  })

  it('ne répète pas une carte même s’il ne reste qu’une courante', () => {
    const cards = [...makeCards(1, ['Courant']), ...makeCards(5, ['Fréquent'])]
    const ctx = context(cards)
    const { cardIds } = drawBooster(ctx)
    expect(new Set(cardIds).size).toBe(cardIds.length)
  })

  it('devient un paquet rare quand le hasard passe sous le seuil', () => {
    const cards = makeCards(10)
    let calls = 0
    const rng = () => (calls++ === 0 ? 0.001 : 0.5)
    const { cardIds, rarePack } = drawBooster({ cards, owned: new Set(), rates: RATES, rng })
    expect(rarePack).toBe(true)
    expect(cardIds).toHaveLength(BOOSTER_SIZE)
    for (const id of cardIds) expect(isRare(rarityOf(cards, id))).toBe(true)
  })

  it('reste un booster normal quand le hasard est au-dessus', () => {
    const cards = makeCards(10)
    const { rarePack } = drawBooster({ cards, owned: new Set(), rates: RATES, rng: () => 0.999 })
    expect(rarePack).toBe(false)
  })
})

describe('versions brillantes', () => {
  it('sortent au hasard, carte par carte, parmi les cartes tirées seulement', () => {
    const ids = Array.from({ length: 20_000 }, (_, i) => `c${i}`)
    const foils = drawFoils(ids, context(makeCards(1), [], 9))
    const rate = (foils.length / ids.length) * 100
    expect(rate).toBeGreaterThan(RATES.foilChance - 0.6)
    expect(rate).toBeLessThan(RATES.foilChance + 0.6)
    for (const id of foils) expect(ids).toContain(id)
  })
})

describe('tirage par seuil', () => {
  it('associe le bon type de récompense à chaque seuil', () => {
    const cards = makeCards(10)
    const ctx = context(cards)
    expect(drawForThreshold(500, ctx)).toMatchObject({ kind: 'card' })
    expect(drawForThreshold(500, ctx).cardIds).toHaveLength(1)
    const booster = drawForThreshold(1500, ctx)
    expect(booster.kind).toBe('booster')
    expect(booster.cardIds).toHaveLength(BOOSTER_SIZE)
    expect(drawForThreshold(2000, ctx)).toMatchObject({ kind: 'rare-card' })
  })
})
