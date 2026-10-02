import { useState, type CSSProperties, type ReactNode } from 'react'
import { FUN_LABELS, ROUTES, type CardData } from '../../data/sets'
import { cx } from '../../lib/cx'
import { FAMILIES } from '../../lib/families'
import { cardPalette } from '../Card/CardArt'
import styles from './CardInfo.module.css'

type Props = {
  card: CardData
  compact?: boolean
  /** Mode révision : les réponses sont masquées jusqu'à ce qu'on les touche. */
  quiz?: boolean
}

type SectionId = 'what' | 'action' | 'side' | 'ci'

/**
 * Fiche mémo sous la carte : les cinq rubriques demandées (qu'est-ce que c'est, effets
 * indésirables, contre-indications, mode d'action, et le mot pour retenir), dans l'ordre
 * du cours : on comprend ce que c'est et comment ça agit avant ce qu'il faut surveiller.
 */
export function CardInfo({ card, compact = false, quiz = false }: Props) {
  const [shown, setShown] = useState<Set<SectionId>>(new Set())
  const family = FAMILIES[card.family]
  const palette = cardPalette(card)
  const reveal = (id: SectionId) => setShown((s) => new Set(s).add(id))
  const isHidden = (id: SectionId) => quiz && !shown.has(id)

  return (
    <section className={cx(styles.info, compact && styles.compact)} style={{ '--h': palette.hue } as CSSProperties} aria-label={`Fiche de ${card.name}`}>
      <header className={styles.head}>
        <span className={styles.family}>{family.label}</span>
        <p className={styles.classe}>{card.classe}</p>
        <div className={styles.chips}>
          {card.routes.map((r) => (
            <span key={r} className={styles.chip} title={ROUTES[r]}>
              {r}
            </span>
          ))}
          {card.brands.length > 0 && <span className={styles.brands}>{card.brands.join(', ')}</span>}
        </div>
      </header>

      <Section n={1} title="Qu'est-ce que c'est" hidden={isHidden('what')} onReveal={() => reveal('what')}>
        <p>{card.what}</p>
      </Section>

      <Section n={2} title="Mode d'action" hidden={isHidden('action')} onReveal={() => reveal('action')}>
        <p>{card.action}</p>
      </Section>

      <Section n={3} title="Effets indésirables" hidden={isHidden('side')} onReveal={() => reveal('side')}>
        <ul className={styles.list}>
          {card.sideEffects.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Section>

      <Section n={4} title="Contre-indications" hidden={isHidden('ci')} onReveal={() => reveal('ci')}>
        <ul className={styles.list}>
          {card.contraindications.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        {card.antidote && (
          <p className={styles.antidote}>
            <span>Antidote</span> {card.antidote}
          </p>
        )}
      </Section>

      <aside className={styles.fun}>
        <span className={styles.funLabel}>
          <b>5</b> {FUN_LABELS[card.fun.kind]}
        </span>
        <p>{card.fun.text}</p>
      </aside>
    </section>
  )
}

function Section({ n, title, hidden, onReveal, children }: { n: number; title: string; hidden: boolean; onReveal: () => void; children: ReactNode }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.title}>
        <b>{n}</b> {title}
      </h3>
      {hidden ? (
        <button type="button" className={styles.hiddenAnswer} onClick={onReveal}>
          Toucher pour vérifier ta réponse
        </button>
      ) : (
        <div className={styles.body}>{children}</div>
      )}
    </div>
  )
}
