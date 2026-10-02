import { ChevronLeft, ChevronRight, GraduationCap, ImageIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import type { CardData } from '../../data/sets'
import { cx } from '../../lib/cx'
import { isMastered } from '../../lib/quiz'
import { rarityHint } from '../../lib/rarity'
import { useActions, useAppState } from '../../state/store'
import { Card } from '../Card/Card'
import { CardInfo } from '../CardInfo/CardInfo'
import { RarityBadge } from '../RarityBadge/RarityBadge'
import { Sheet } from '../Sheet/Sheet'
import styles from './CardViewer.module.css'

type Props = {
  /** La liste dans laquelle on navigue (cartes du jour, d'une journée, du Pharmacodex filtré). */
  cards: CardData[]
  /** Position ouverte, ou null si la fenêtre est fermée. */
  index: number | null
  onChange: (index: number) => void
  onClose: () => void
  /** Ouvre la fiche réponses visibles (correction du quiz), quel que soit le réglage. */
  revealAnswers?: boolean
}

/** Glissement latéral minimal (px) pour changer de carte. */
const SWIPE_MIN = 48

/**
 * Fiche d'une carte dans une fenêtre centrée, avec navigation gauche / droite dans la liste
 * d'origine (flèches, glissement latéral, touches ←/→) sans quitter la fenêtre.
 */
export function CardViewer({ cards, index, onChange, onClose, revealAnswers = false }: Props) {
  const state = useAppState()
  const actions = useActions()
  const card = index !== null ? cards[index] : undefined
  const count = cards.length
  const canPrev = index !== null && index > 0
  const canNext = index !== null && index < count - 1
  const areaRef = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  // Mode révision : réglage par défaut (réponses cachées), modifiable ici le temps de la
  // fenêtre, gardé d'une carte à l'autre pour enchaîner les questions.
  const defaultQuiz = state.settings.hideAnswers && !revealAnswers
  const [quiz, setQuiz] = useState(defaultQuiz)
  const [revealedId, setRevealedId] = useState<string | null>(null)
  useEffect(() => {
    if (index === null) setQuiz(defaultQuiz)
  }, [index, defaultQuiz])
  const onAllShown = useCallback(() => setRevealedId(card?.id ?? null), [card?.id])

  const prev = () => {
    if (canPrev) onChange(index - 1)
  }
  const next = () => {
    if (canNext) onChange(index + 1)
  }

  // Touches ←/→ au clavier (ordinateur).
  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // À chaque changement de carte : retour en haut de la fenêtre.
  useEffect(() => {
    if (index === null) return
    areaRef.current?.parentElement?.scrollTo({ top: 0 })
  }, [index])

  const onPointerDown = (e: PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: PointerEvent) => {
    const s = start.current
    start.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next()
      else prev()
    }
  }

  const owned = card ? state.collection[card.id] : undefined
  const obtainedAt = owned?.at
  const visible = obtainedAt !== undefined
  const stat = card ? state.quiz.stats[card.id] : undefined
  const isBackdrop = card !== undefined && state.settings.backdropCardId === card.id

  const footer = (
    <div className={styles.nav}>
      <button type="button" className={styles.arrow} onClick={prev} disabled={!canPrev} aria-label="Carte précédente">
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
        Fermer
      </button>
      <button type="button" className={styles.arrow} onClick={next} disabled={!canNext} aria-label="Carte suivante">
        <ChevronRight size={22} aria-hidden="true" />
      </button>
    </div>
  )

  return (
    <Sheet
      open={card !== undefined}
      onClose={onClose}
      title={card ? (visible ? card.name : `Carte ${card.localId}`) : ''}
      subtitle={count > 1 && index !== null ? `${index + 1} / ${count}` : undefined}
      footer={count > 1 ? footer : undefined}
    >
      {card && (
        <div
          ref={areaRef}
          key={card.id}
          className={styles.area}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            start.current = null
          }}
        >
          <div className={styles.card}>
            {visible ? (
              <Card card={card} faceUp glow eager masked={quiz && revealedId !== card.id} />
            ) : (
              <div className={styles.missing}>
                <span className={cx(styles.number, 'tabular')}>{card.localId}</span>
                <span>Pas encore obtenue</span>
              </div>
            )}
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>Numéro</dt>
              <dd className="tabular">{card.localId}</dd>
            </div>
            <div>
              <dt>Rareté</dt>
              <dd>
                <RarityBadge rarity={card.rarity} withLabel />
              </dd>
              <dd className={styles.hint}>{rarityHint(card.rarity)}</dd>
            </div>
            {obtainedAt && (
              <div>
                <dt>Obtenue le</dt>
                <dd>{new Date(obtainedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
                {owned?.foil && <dd className={styles.foil}>Version brillante</dd>}
              </div>
            )}
            {stat && (
              <div>
                <dt>Quiz</dt>
                <dd className="tabular">
                  {stat.ok} juste{stat.ok > 1 ? 's' : ''} · {stat.ko} erreur{stat.ko > 1 ? 's' : ''}
                </dd>
                {isMastered(stat) && <dd className={styles.mastered}>Maîtrisée</dd>}
              </div>
            )}
          </dl>
          {visible && (
            <>
              <button type="button" className={cx('btn btn-secondary btn-sm', styles.quiz)} aria-pressed={quiz} onClick={() => setQuiz((q) => !q)}>
                <GraduationCap size={16} aria-hidden="true" />
                {quiz ? 'Mode révision : réponses cachées' : 'Réponses visibles : passer en révision'}
              </button>
              <CardInfo card={card} quiz={quiz} onAllShown={onAllShown} />
              {obtainedAt && (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                aria-pressed={isBackdrop}
                onClick={() => actions.setBackdrop(isBackdrop ? null : card.id)}
              >
                <ImageIcon size={18} aria-hidden="true" />
                {isBackdrop ? "Retirer du fond d'écran" : "Mettre en fond d'écran"}
              </button>
              )}
            </>
          )}
        </div>
      )}
    </Sheet>
  )
}
