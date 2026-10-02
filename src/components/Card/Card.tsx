import type { CSSProperties } from 'react'
import type { CardData } from '../../data/sets'
import { cx } from '../../lib/cx'
import { FAMILIES } from '../../lib/families'
import { rarityFamily, raritySymbol } from '../../lib/rarity'
import { useAppState } from '../../state/store'
import { CardArt, cardPalette } from './CardArt'
import styles from './Card.module.css'

type Props = {
  card: CardData
  faceUp: boolean
  /** Halo de la couleur de la rareté (révélation, détail). */
  glow?: boolean
  /** Mode révision : les réponses imprimées sur la carte (vigilance, CI, antidote) sont cachées. */
  masked?: boolean
  /** Finition brillante imposée ; sinon celle de la collection. */
  foil?: boolean
  /** Conservé pour la compatibilité des écrans (les cartes sont dessinées, rien à charger). */
  quality?: 'low' | 'high'
  eager?: boolean
  onClick?: () => void
  className?: string
}

const GLOW: Record<ReturnType<typeof rarityFamily>, string> = {
  diamond: styles.glowDiamond,
  star: styles.glowStar,
  crown: styles.glowCrown,
}

const RARITY_CLASS: Record<ReturnType<typeof rarityFamily>, string> = {
  diamond: styles.rDiamond,
  star: styles.rStar,
  crown: styles.rCrown,
}

/** Une carte à deux faces : dos maison, recto dessiné en SVG et CSS, retournement 3D. */
export function Card({ card, faceUp, glow = false, masked = false, foil, onClick, className }: Props) {
  const state = useAppState()
  const isFoil = foil ?? state.collection[card.id]?.foil === true
  const family = rarityFamily(card.rarity)
  const sweep = glow && faceUp && (family !== 'diamond' || isFoil)

  const inner = (
    <div className={cx(styles.inner, faceUp && styles.faceUp)}>
      <div className={cx(styles.face, styles.front, RARITY_CLASS[family], sweep && styles.sweep)} style={paletteVars(card)}>
        <ClassicFace card={card} masked={masked} />
        {isFoil && <span className={styles.foil} aria-hidden="true" />}
      </div>
      <div className={cx(styles.face, styles.back)} aria-hidden="true">
        <CardBack />
      </div>
    </div>
  )

  const classes = cx(styles.card, glow && faceUp && GLOW[family], className)
  const label = faceUp ? `${card.name}${isFoil ? ', version brillante' : ''}` : 'Retourner la carte'

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-label={label}>
        {inner}
      </button>
    )
  }
  return <div className={classes}>{inner}</div>
}

/** Longueur du nom : les DCI longues (« Butylbromure de scopolamine ») passent en plus petit, sur deux lignes. */
function nameLength(card: CardData): 'm' | 'l' | undefined {
  if (card.dci.length > 19) return 'l'
  if (card.dci.length > 13) return 'm'
  return undefined
}

/** Variables de couleur de la carte, tirées de sa famille (voir CardArt). */
function paletteVars(card: CardData): CSSProperties {
  const p = cardPalette(card)
  return { '--h': p.hue } as CSSProperties
}

/**
 * La carte de jeu (style « Classique », retenu le 02/10/2026). Cadre à la couleur de la
 * famille, nom et rareté, fenêtre d'illustration, puis l'essentiel en trois lignes et
 * l'anecdote en bas. En mode révision, les trois lignes de réponse sont cachées.
 */
function ClassicFace({ card, masked }: { card: CardData; masked: boolean }) {
  const answer = (text: string) => (masked ? <span className={styles.cMask} aria-label="Réponse cachée">?</span> : text)
  return (
    <div className={styles.classic}>
      <div className={styles.cHead}>
        <span className={styles.cName} data-len={nameLength(card)}>
          {card.dci}
        </span>
        <span className={styles.cRarity}>{raritySymbol(card.rarity)}</span>
      </div>
      <div className={styles.cClass}>{card.classe}</div>
      <div className={styles.cWindow}>
        <CardArt card={card} variant="window" />
      </div>
      <div className={styles.cStrip}>
        <span>{FAMILIES[card.family].short}</span>
        <span>{card.routes.slice(0, 4).join(' · ')}</span>
      </div>
      <div className={styles.cBody}>
        <p className={styles.cTagline}>{card.tagline}</p>
        <dl className={styles.cStats}>
          <div>
            <dt>Vigilance</dt>
            <dd>{answer(card.sideEffects[0])}</dd>
          </div>
          <div>
            <dt>CI</dt>
            <dd>{answer(card.contraindications[0])}</dd>
          </div>
          {card.antidote && (
            <div>
              <dt>Antidote</dt>
              <dd>{answer(card.antidote)}</dd>
            </div>
          )}
        </dl>
      </div>
      <p className={styles.cFun}>{card.fun.text}</p>
      <div className={styles.cFoot}>
        <span className="tabular">n° {card.localId}</span>
        <span>Paligame</span>
      </div>
    </div>
  )
}

/**
 * Dos de carte : illustration originale. Même vocabulaire que celui d'Ura (nuit, vagues,
 * cadre double bleu et or), avec au centre une gélule à moitié remplie d'eau : boire et
 * réviser dans un seul dessin.
 */
export function CardBack() {
  const dots = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2
    return { x: 315 + Math.cos(angle) * 206, y: 420 + Math.sin(angle) * 206 }
  })
  return (
    <svg className={styles.backArt} viewBox="0 0 630 880" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pali-back-bg" cx="50%" cy="46%" r="72%">
          <stop offset="0" stopColor="#1c4d8f" />
          <stop offset="0.55" stopColor="#0f2a57" />
          <stop offset="1" stopColor="#061127" />
        </radialGradient>
        <linearGradient id="pali-back-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pali-back-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3ec1f3" />
          <stop offset="1" stopColor="#1b5fb3" />
        </linearGradient>
        <pattern id="pali-back-waves" width="64" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 16q16-14 32 0t32 0" fill="none" stroke="#3ec1f3" strokeOpacity="0.13" strokeWidth="2" />
        </pattern>
        <clipPath id="pali-back-capsule">
          <path d="M258 420V318a57 57 0 0 1 114 0V420Z" />
        </clipPath>
      </defs>

      <rect width="630" height="880" rx="30" fill="url(#pali-back-bg)" />
      <rect width="630" height="880" rx="30" fill="url(#pali-back-waves)" />

      <rect x="20" y="20" width="590" height="840" rx="22" fill="none" stroke="#3ec1f3" strokeOpacity="0.6" strokeWidth="3" />
      <rect x="34" y="34" width="562" height="812" rx="16" fill="none" stroke="#f2c14e" strokeOpacity="0.4" strokeWidth="1.5" />

      {[
        [58, 58, 1],
        [572, 58, 2],
        [572, 822, 3],
        [58, 822, 4],
      ].map(([x, y, q]) => (
        <g key={q} transform={`translate(${x} ${y}) rotate(${(q - 1) * 90})`}>
          <path d="M0 40 A40 40 0 0 1 40 0" fill="none" stroke="#f2c14e" strokeOpacity="0.55" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#f2c14e" fillOpacity="0.7" />
        </g>
      ))}

      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={i % 6 === 0 ? 4 : 2.2} fill={i % 6 === 0 ? '#f2c14e' : '#3ec1f3'} fillOpacity="0.7" />
      ))}

      <circle cx="315" cy="420" r="188" fill="none" stroke="#3ec1f3" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx="315" cy="420" r="176" fill="none" stroke="#f2c14e" strokeOpacity="0.55" strokeWidth="3" />
      <circle cx="315" cy="420" r="168" fill="#0a2148" />

      {/* Gélule inclinée : moitié haute remplie d'eau (vague), moitié basse dorée */}
      <g transform="rotate(-38 315 420)">
        <path d="M258 420V318a57 57 0 0 1 114 0V420Z" fill="#e9eef7" />
        <g clipPath="url(#pali-back-capsule)">
          <path d="M250 352q16-14 32 0t32 0 32 0 32 0 32 0V430H250Z" fill="url(#pali-back-water)" />
          <path d="M250 368q16-14 32 0t32 0 32 0 32 0 32 0V430H250Z" fill="#e9eef7" fillOpacity="0.12" />
        </g>
        <path d="M258 420V522a57 57 0 0 0 114 0V420Z" fill="#f2c14e" />
        <path d="M258 420H372" stroke="#0b1220" strokeOpacity="0.5" strokeWidth="4" />
        <path d="M258 420V318a57 57 0 0 1 114 0V522a57 57 0 0 1-114 0Z" fill="none" stroke="#0b1220" strokeOpacity="0.55" strokeWidth="5" />
        <path d="M280 330V400M280 444V506" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="9" strokeLinecap="round" />
      </g>

      <text x="315" y="748" textAnchor="middle" fontFamily="'Manrope Variable', system-ui, sans-serif" fontWeight="800" fontSize="44" letterSpacing="10" fill="#e9eef7" fillOpacity="0.9">
        PALIGAME
      </text>
      <text x="315" y="786" textAnchor="middle" fontFamily="'Manrope Variable', system-ui, sans-serif" fontWeight="700" fontSize="16" letterSpacing="6" fill="#3ec1f3" fillOpacity="0.85">
        CARTES MÉMO MÉDICAMENTS
      </text>

      <rect width="630" height="880" rx="30" fill="url(#pali-back-sheen)" />
    </svg>
  )
}
