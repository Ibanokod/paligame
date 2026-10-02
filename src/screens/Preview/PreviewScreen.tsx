import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../../components/Card/Card'
import { CardViewer } from '../../components/CardViewer/CardViewer'
import { getSet } from '../../data/sets'
import { cx } from '../../lib/cx'
import { useActions, useAppState } from '../../state/store'
import { CARD_STYLES, type CardStyle } from '../../state/types'
import styles from './PreviewScreen.module.css'

type Mode = CardStyle | 'trois'

const MODE_LABELS: Record<Mode, string> = { classique: 'Classique', memo: 'Mémo', galerie: 'Galerie', trois: 'Les trois' }

/**
 * Page de démonstration (adresse « #apercu ») : toutes les cartes, possédées ou non, dans un
 * style ou dans les trois côte à côte, pour choisir le style sans avoir à tout gagner.
 * Elle ne touche pas à la collection.
 */
export function PreviewScreen({ onBack }: { onBack: () => void }) {
  const state = useAppState()
  const actions = useActions()
  const set = getSet(state.settings.setId)
  const [mode, setMode] = useState<Mode>('trois')
  const [foil, setFoil] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Retour à l'appli">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <div>
          <h1 className={styles.title}>Aperçu des cartes</h1>
          <p className={styles.sub}>Démo : les {set.cards.length} cartes, sans toucher à ta collection</p>
        </div>
      </header>

      <div className={styles.segmented} role="group" aria-label="Style affiché">
        {(['trois', ...CARD_STYLES] as Mode[]).map((m) => (
          <button key={m} type="button" className={cx(styles.segment, mode === m && styles.segmentActive)} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <div className={styles.row}>
        <button type="button" className="btn btn-secondary btn-sm" aria-pressed={foil} onClick={() => setFoil((f) => !f)}>
          {foil ? 'Versions brillantes affichées' : 'Voir en version brillante'}
        </button>
        {mode !== 'trois' && mode !== state.settings.cardStyle && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.setCardStyle(mode)}>
            Choisir ce style
          </button>
        )}
      </div>

      {mode === 'trois' ? (
        <ul className={styles.triples}>
          {set.cards.map((card, i) => (
            <li key={card.id}>
              <p className={styles.cardTitle}>
                <span className="tabular">{card.localId}</span> {card.dci} <span className={styles.rarity}>· {card.rarity}</span>
              </p>
              <div className={styles.triple}>
                {CARD_STYLES.map((style) => (
                  <Card key={style} card={card} faceUp cardStyle={style} foil={foil} onClick={() => setViewerIndex(i)} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.grid}>
          {set.cards.map((card, i) => (
            <li key={card.id}>
              <Card card={card} faceUp cardStyle={mode} foil={foil} onClick={() => setViewerIndex(i)} />
            </li>
          ))}
        </ul>
      )}

      <CardViewer cards={set.cards} index={viewerIndex} onChange={setViewerIndex} onClose={() => setViewerIndex(null)} preview />
    </div>
  )
}
