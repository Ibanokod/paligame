import { BadgeCheck, Check, RotateCcw, X } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Card } from '../../components/Card/Card'
import { CardViewer } from '../../components/CardViewer/CardViewer'
import { allCards, findCard, getSet, type CardData } from '../../data/sets'
import { cx } from '../../lib/cx'
import { FAMILIES } from '../../lib/families'
import { buildQuiz, isMastered, QUIZ_LENGTH, QUIZ_MIN_CARDS, type Question } from '../../lib/quiz'
import { defaultRng } from '../../lib/random'
import { useActions, useAppState } from '../../state/store'
import styles from './QuizScreen.module.css'

type Scope = 'set' | 'all'

type Session = {
  questions: Question[]
  index: number
  /** Réponse choisie à la question en cours, ou null. */
  picked: number | null
  /** Ids des cartes ratées, dans l'ordre. */
  missed: string[]
  score: number
  done: boolean
}

/**
 * Le quiz : des séries de 10 questions à choix multiples, fabriquées à partir des fiches des
 * cartes gagnées. Les cartes ratées reviennent plus souvent ; trois bonnes réponses
 * d'affilée et la carte est « maîtrisée » (badge dans le Pharmacodex).
 */
export function QuizScreen() {
  const state = useAppState()
  const actions = useActions()
  const set = getSet(state.settings.setId)
  const [scope, setScope] = useState<Scope>('set')
  const [session, setSession] = useState<Session | null>(null)
  const [viewer, setViewer] = useState<{ cards: CardData[]; index: number } | null>(null)

  const pool = allCards()
  const ownedAll = pool.filter((c) => state.collection[c.id])
  const owned = scope === 'set' ? ownedAll.filter((c) => c.id.startsWith(`${set.id}-`)) : ownedAll
  const mastered = owned.filter((c) => isMastered(state.quiz.stats[c.id])).length
  const missing = Math.max(0, QUIZ_MIN_CARDS - owned.length)

  const start = () => {
    const questions = buildQuiz(owned, pool, state.quiz.stats, defaultRng)
    if (questions.length > 0) setSession({ questions, index: 0, picked: null, missed: [], score: 0, done: false })
  }

  const viewerEl = (
    <CardViewer
      cards={viewer?.cards ?? []}
      index={viewer?.index ?? null}
      onChange={(index) => setViewer((v) => (v ? { ...v, index } : v))}
      onClose={() => setViewer(null)}
      revealAnswers
    />
  )

  if (session && !session.done) {
    const q = session.questions[session.index]
    const card = findCard(q.cardId)!
    const answered = session.picked !== null
    const correct = session.picked === q.answer
    const last = session.index === session.questions.length - 1

    const pick = (i: number) => {
      if (answered) return
      const ok = i === q.answer
      actions.quizAnswer(q.cardId, ok)
      setSession({ ...session, picked: i, score: session.score + (ok ? 1 : 0), missed: ok ? session.missed : [...session.missed, q.cardId] })
    }
    const next = () => {
      if (last) {
        actions.quizDone(session.score)
        setSession({ ...session, done: true })
      } else setSession({ ...session, index: session.index + 1, picked: null })
    }

    return (
      <div className={styles.screen}>
        <header className={styles.playHead}>
          <span className="tabular">
            Question {session.index + 1} / {session.questions.length}
          </span>
          <span className={cx(styles.score, 'tabular')}>
            {session.score} {session.score > 1 ? 'bonnes réponses' : 'bonne réponse'}
          </span>
        </header>
        <div className={styles.progress} aria-hidden="true">
          <div className={styles.progressFill} style={{ width: `${((session.index + (answered ? 1 : 0)) / session.questions.length) * 100}%` }} />
        </div>

        <section className={styles.question} style={{ '--h': FAMILIES[card.family].hue } as CSSProperties} aria-live="polite">
          {!q.asksName && (
            <p className={styles.subject}>
              {q.kind !== 'classe' && q.kind !== 'famille' && <span className={styles.family}>{FAMILIES[card.family].short}</span>}
              <strong>{card.dci}</strong>
            </p>
          )}
          <h1 className={styles.prompt}>{q.prompt}</h1>
          {q.quote && <blockquote className={styles.quote}>{q.quote}</blockquote>}
        </section>

        <ol className={styles.options}>
          {q.options.map((option, i) => (
            <li key={option}>
              <button
                type="button"
                className={cx(
                  styles.option,
                  answered && i === q.answer && styles.optionGood,
                  answered && i === session.picked && i !== q.answer && styles.optionBad,
                )}
                disabled={answered}
                onClick={() => pick(i)}
              >
                <span className={styles.letter} aria-hidden="true">
                  {answered && i === q.answer ? <Check size={16} /> : answered && i === session.picked ? <X size={16} /> : String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
              </button>
            </li>
          ))}
        </ol>

        {answered && (
          <div className={styles.feedback}>
            <p className={cx(styles.verdict, correct ? styles.verdictGood : styles.verdictBad)}>
              {correct ? 'Bonne réponse !' : `Pas tout à fait : la bonne réponse est en vert${q.asksName ? ` (${card.dci})` : ''}.`}
            </p>
            <div className={styles.feedbackRow}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewer({ cards: [card], index: 0 })}>
                Voir la fiche
              </button>
              <button type="button" className="btn btn-primary" onClick={next}>
                {last ? 'Voir le résultat' : 'Question suivante'}
              </button>
            </div>
          </div>
        )}
        <button type="button" className={cx('btn btn-ghost btn-sm', styles.quit)} onClick={() => setSession(null)}>
          Arrêter la série
        </button>
        {viewerEl}
      </div>
    )
  }

  if (session && session.done) {
    const missedCards = [...new Set(session.missed)].map((id) => findCard(id)).filter((c): c is CardData => c !== undefined)
    const total = session.questions.length
    return (
      <div className={styles.screen}>
        <header className={styles.result}>
          <p className={styles.resultLabel}>Résultat</p>
          <p className={cx(styles.resultScore, 'tabular')}>
            {session.score} / {total}
          </p>
          <p className={styles.resultText}>{resultText(session.score, total)}</p>
        </header>
        {missedCards.length > 0 ? (
          <section className={styles.block}>
            <h2 className={styles.h2}>À revoir</h2>
            <ul className={styles.grid}>
              {missedCards.map((card, i) => (
                <li key={card.id}>
                  <Card card={card} faceUp onClick={() => setViewer({ cards: missedCards, index: i })} />
                </li>
              ))}
            </ul>
            <p className={styles.hint}>Ces cartes reviendront plus souvent dans les prochaines séries.</p>
          </section>
        ) : (
          <p className={styles.hint}>Sans faute. Les cartes réussies trois fois de suite passent maîtrisées.</p>
        )}
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary btn-block btn-lg" onClick={start}>
            <RotateCcw size={18} aria-hidden="true" /> Nouvelle série
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => setSession(null)}>
            Retour
          </button>
        </div>
        {viewerEl}
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <header>
        <h1 className={styles.title}>Quiz</h1>
        <p className={styles.sub}>{QUIZ_LENGTH} questions tirées des fiches de tes cartes gagnées.</p>
      </header>

      <div className={styles.segmented} role="group" aria-label="Cartes interrogées">
        <button type="button" className={cx(styles.segment, scope === 'set' && styles.segmentActive)} aria-pressed={scope === 'set'} onClick={() => setScope('set')}>
          {set.name}
        </button>
        <button type="button" className={cx(styles.segment, scope === 'all' && styles.segmentActive)} aria-pressed={scope === 'all'} onClick={() => setScope('all')}>
          Toutes mes cartes
        </button>
      </div>

      <dl className={styles.tiles}>
        <div>
          <dt>Cartes</dt>
          <dd className="tabular">{owned.length}</dd>
        </div>
        <div>
          <dt>
            <BadgeCheck size={14} aria-hidden="true" /> Maîtrisées
          </dt>
          <dd className="tabular">{mastered}</dd>
        </div>
        <div>
          <dt>Meilleur score</dt>
          <dd className="tabular">
            {state.quiz.best}
            <small>/{QUIZ_LENGTH}</small>
          </dd>
        </div>
      </dl>

      <button type="button" className="btn btn-primary btn-block btn-lg" disabled={missing > 0} onClick={start}>
        Lancer une série
      </button>
      {missing > 0 ? (
        <p className={styles.hint}>
          Encore {missing} {missing > 1 ? 'cartes' : 'carte'} à gagner pour débloquer le quiz{scope === 'set' ? ' sur cette extension' : ''}.
        </p>
      ) : (
        <p className={styles.hint}>
          Effets indésirables, contre-indications, classe, mode d'action, antidote : les questions viennent des fiches. Les cartes ratées reviennent plus souvent ; trois
          bonnes réponses d'affilée et la carte est maîtrisée.
        </p>
      )}
      {viewerEl}
    </div>
  )
}

function resultText(score: number, total: number): string {
  const r = score / total
  if (r === 1) return 'Sans faute, bravo !'
  if (r >= 0.8) return 'Très bien, presque parfait.'
  if (r >= 0.5) return 'Bien, quelques fiches à relire.'
  return 'On relit les fiches et on recommence : c’est comme ça qu’on retient.'
}
