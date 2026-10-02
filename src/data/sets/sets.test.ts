import { describe, expect, it } from 'vitest'
import { RARITIES } from '../../lib/rarity'
import { allCards, findCard, getSet, isSetId, listSets, validateSet } from './index'

describe('extension Soins palliatifs (PAL1)', () => {
  const set = getSet('PAL1')

  it('contient 74 cartes, numérotées de 001 à 074 en commençant par la morphine', () => {
    expect(set.cards).toHaveLength(74)
    expect(set.cards[0].id).toBe('PAL1-001')
    expect(set.cards[0].dci).toBe('Morphine')
    expect(set.cards.at(-1)!.id).toBe('PAL1-074')
  })
})

describe('toutes les extensions', () => {
  it.each(listSets().map((set) => [set.id, set] as const))('%s : cartes valides, champs remplis, longueurs de mémo respectées', (_id, set) => {
    expect(validateSet(set)).toEqual([])
  })

  it.each(listSets().map((set) => [set.id, set] as const))('%s : chaque famille a des cartes, rangées dans l’ordre des familles', (_id, set) => {
    for (const family of set.families) expect(set.cards.some((c) => c.family === family)).toBe(true)
    const order = set.cards.map((c) => set.families.indexOf(c.family))
    expect(order.every((i) => i >= 0)).toBe(true)
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it.each(listSets().map((set) => [set.id, set] as const))('%s : au moins une carte courante et une carte rare ou mieux', (_id, set) => {
    expect(set.cards.some((c) => c.rarity === 'Courant')).toBe(true)
    expect(set.cards.some((c) => RARITIES.indexOf(c.rarity) >= RARITIES.indexOf('Rare'))).toBe(true)
  })

  it('une DCI n’apparaît que dans une seule extension', () => {
    const seen = new Map<string, string>()
    const duplicates: string[] = []
    for (const card of allCards()) {
      const key = card.dci.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      if (seen.has(key)) duplicates.push(`${card.dci} (${seen.get(key)} et ${card.id})`)
      seen.set(key, card.id)
    }
    expect(duplicates).toEqual([])
  })

  it('retrouve une carte par son id quelle que soit l’extension', () => {
    for (const card of allCards()) expect(findCard(card.id)).toBe(card)
    expect(findCard('INCONNU-001')).toBeUndefined()
  })

  it('retombe sur Soins palliatifs pour une extension inconnue', () => {
    expect(isSetId('A1')).toBe(false)
    expect(getSet('A1').id).toBe('PAL1')
  })
})
