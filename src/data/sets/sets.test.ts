import { describe, expect, it } from 'vitest'
import { FAMILY_IDS } from '../../lib/families'
import { RARITIES } from '../../lib/rarity'
import { getSet, validateSet } from './index'

describe('extension Soins palliatifs (PAL1)', () => {
  const set = getSet('PAL1')

  it('contient 74 cartes valides : champs remplis, longueurs de mémo respectées', () => {
    expect(set.id).toBe('PAL1')
    expect(set.cards).toHaveLength(74)
    expect(validateSet(set)).toEqual([])
  })

  it('numérote dans l’ordre des familles, de 001 à 074', () => {
    expect(set.cards[0].id).toBe('PAL1-001')
    expect(set.cards[0].dci).toBe('Morphine')
    expect(set.cards.at(-1)!.id).toBe('PAL1-074')
    const order = set.cards.map((c) => FAMILY_IDS.indexOf(c.family))
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('a des cartes dans chaque rareté et chaque famille', () => {
    for (const rarity of RARITIES) expect(set.cards.some((c) => c.rarity === rarity)).toBe(true)
    for (const family of FAMILY_IDS) expect(set.cards.some((c) => c.family === family)).toBe(true)
  })
})
