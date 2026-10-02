import { describe, expect, it } from 'vitest'
import { allCards, findCard, getSet } from '../data/sets'
import { buildQuestion, buildQuiz, cardWeight, headOf, isMastered, keywords, nextStat, QUIZ_LENGTH, type QuestionKind } from './quiz'
import { seededRng } from './random'

const pool = allCards()
const pal = getSet('PAL1').cards
const KINDS: QuestionKind[] = ['side', 'ci', 'classe', 'tagline', 'action', 'antidote', 'famille']

describe('questions', () => {
  it('ont toujours une seule bonne réponse, tirée de la fiche, et des options distinctes', () => {
    const rng = seededRng(3)
    for (const card of pool) {
      for (const kind of KINDS) {
        const q = buildQuestion(card, pool, rng, kind)
        if (!q) continue
        expect(q.cardId).toBe(card.id)
        expect(q.options.length).toBeGreaterThanOrEqual(3)
        expect(new Set(q.options.map((o) => o.toLowerCase())).size).toBe(q.options.length)
        const correct = q.options[q.answer]
        if (kind === 'side') expect(card.sideEffects.map(headOf)).toContain(correct)
        if (kind === 'ci') expect(card.contraindications).toContain(correct)
        if (kind === 'classe') expect(correct).toBe(card.classe)
        if (kind === 'tagline' || kind === 'action') expect(correct).toBe(card.dci)
      }
    }
  })

  it('ne propose jamais comme fausse réponse un effet ou une contre-indication que la fiche évoque', () => {
    const rng = seededRng(5)
    for (const card of pool) {
      const mine = keywords([card.what, card.action, card.tagline, card.classe, ...card.sideEffects, ...card.contraindications].join(' '))
      for (const kind of ['side', 'ci'] as const) {
        const q = buildQuestion(card, pool, rng, kind)
        if (!q) continue
        q.options.forEach((option, i) => {
          if (i === q.answer) return
          for (const k of keywords(option)) expect(mine.has(k), `${card.dci} : « ${option} »`).toBe(false)
        })
      }
    }
  })

  it('prend les fausses réponses de nom dans d’autres familles', () => {
    const rng = seededRng(8)
    for (const card of pal) {
      const q = buildQuestion(card, pool, rng, 'tagline')
      if (!q) continue
      q.options.forEach((option, i) => {
        if (i === q.answer) return
        const other = pool.find((c) => c.dci === option)!
        expect(other.family).not.toBe(card.family)
      })
    }
  })

  it('sait poser une question sur chaque carte', () => {
    const rng = seededRng(13)
    for (const card of pool) expect(buildQuestion(card, pool, rng), card.dci).not.toBeNull()
  })
})

describe('série', () => {
  it('pose 10 questions sur des cartes possédées, sans répéter une carte s’il y en a assez', () => {
    const owned = pal.slice(0, 20)
    const quiz = buildQuiz(owned, pool, {}, seededRng(1))
    expect(quiz).toHaveLength(QUIZ_LENGTH)
    expect(new Set(quiz.map((q) => q.cardId)).size).toBe(QUIZ_LENGTH)
    for (const q of quiz) expect(owned.map((c) => c.id)).toContain(q.cardId)
  })

  it('refuse de démarrer sous 4 cartes, et complète avec des répétitions entre 4 et 9', () => {
    expect(buildQuiz(pal.slice(0, 3), pool, {}, seededRng(1))).toEqual([])
    expect(buildQuiz(pal.slice(0, 5), pool, {}, seededRng(1))).toHaveLength(QUIZ_LENGTH)
  })

  it('fait revenir plus souvent les cartes ratées', () => {
    const owned = pal.slice(0, 12)
    const missed = owned[0].id
    const stats = Object.fromEntries(owned.map((c) => [c.id, { ok: 3, ko: 0, streak: 3, at: '' }]))
    stats[missed] = { ok: 0, ko: 3, streak: 0, at: '' }
    let seen = 0
    for (let seed = 0; seed < 200; seed++) {
      if (buildQuiz(owned, pool, stats, seededRng(seed), 3).some((q) => q.cardId === missed)) seen++
    }
    expect(seen).toBeGreaterThan(120)
  })
})

describe('statistiques', () => {
  it('compte les bonnes réponses d’affilée et déclare la carte maîtrisée à 3', () => {
    let s = nextStat(undefined, true, 'a')
    s = nextStat(s, true, 'b')
    expect(isMastered(s)).toBe(false)
    s = nextStat(s, true, 'c')
    expect(isMastered(s)).toBe(true)
    expect(s).toEqual({ ok: 3, ko: 0, streak: 3, at: 'c' })
    s = nextStat(s, false, 'd')
    expect(isMastered(s)).toBe(false)
    expect(s.ko).toBe(1)
  })

  it('pèse plus lourd une carte jamais vue ou ratée qu’une carte maîtrisée', () => {
    expect(cardWeight(undefined)).toBeGreaterThan(cardWeight({ ok: 3, ko: 0, streak: 3, at: '' }))
    expect(cardWeight({ ok: 0, ko: 2, streak: 0, at: '' })).toBeGreaterThan(cardWeight({ ok: 2, ko: 0, streak: 2, at: '' }))
  })

  it('retrouve les cartes des questions', () => {
    for (const q of buildQuiz(pal, pool, {}, seededRng(2))) expect(findCard(q.cardId)).toBeDefined()
  })
})
