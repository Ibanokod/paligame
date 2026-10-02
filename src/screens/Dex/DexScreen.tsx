import { BadgeCheck, ChevronDown } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Card } from '../../components/Card/Card'
import { CardViewer } from '../../components/CardViewer/CardViewer'
import { RarityBadge } from '../../components/RarityBadge/RarityBadge'
import { getSet, listSets } from '../../data/sets'
import { cx } from '../../lib/cx'
import { FAMILIES, type FamilyId } from '../../lib/families'
import { isMastered } from '../../lib/quiz'
import { type Rarity } from '../../lib/rarity'
import { selectDexStats } from '../../state/selectors'
import { useActions, useAppState } from '../../state/store'
import styles from './DexScreen.module.css'

type Status = 'all' | 'owned' | 'missing'

const STATUS_LABELS: Record<Status, string> = { all: 'Toutes', owned: 'Possédées', missing: 'Manquantes' }

/** Le Pharmacodex : la collection, classée par famille, filtrable pour réviser une famille à la fois. */
export function DexScreen() {
  const state = useAppState()
  const actions = useActions()
  const set = getSet(state.settings.setId)
  const sets = listSets()
  const stats = selectDexStats(state, set)
  const [status, setStatus] = useState<Status>('all')
  const [rarity, setRarity] = useState<Rarity | null>(null)
  const [family, setFamily] = useState<FamilyId | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [showSets, setShowSets] = useState(false)

  const cards = set.cards.filter((card) => {
    const owned = card.id in state.collection
    if (status === 'owned' && !owned) return false
    if (status === 'missing' && owned) return false
    if (rarity && card.rarity !== rarity) return false
    if (family && card.family !== family) return false
    return true
  })

  const percent = stats.total === 0 ? 0 : (stats.owned / stats.total) * 100

  const chooseSet = (setId: string) => {
    setShowSets(false)
    if (setId === set.id) return
    actions.setSet(setId)
    setFamily(null)
    setRarity(null)
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pharmacodex</h1>
        <button
          type="button"
          className={cx(styles.setBtn, styles.setActive, styles.setCurrent)}
          style={{ '--h': set.hue } as CSSProperties}
          aria-expanded={showSets}
          onClick={() => setShowSets((v) => !v)}
        >
          <span className={styles.setDot} aria-hidden="true" />
          <span className={styles.setLabel}>{set.name}</span>
          <span className={styles.setSwitch}>
            {showSets ? 'Fermer' : 'Changer'}
            <ChevronDown size={16} aria-hidden="true" className={cx(styles.chevron, showSets && styles.chevronOpen)} />
          </span>
        </button>
        {showSets && (
        <ul className={styles.sets} aria-label="Extension">
          {sets.map((s) => {
            const st = selectDexStats(state, s)
            const active = s.id === set.id
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={cx(styles.setBtn, active && styles.setActive)}
                  style={{ '--h': s.hue } as CSSProperties}
                  aria-pressed={active}
                  onClick={() => chooseSet(s.id)}
                >
                  <span className={styles.setDot} aria-hidden="true" />
                  <span className={styles.setLabel}>{s.name}</span>
                  <span className={cx(styles.setCount, 'tabular')}>
                    {st.owned}/{st.total}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        )}
        {showSets && <p className={styles.setName}>Les prochaines cartes gagnées viendront de l'extension choisie.</p>}
        <div className={styles.progress}>
          <div className={styles.progressBar} role="progressbar" aria-valuemin={0} aria-valuemax={stats.total} aria-valuenow={stats.owned}>
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
          <span className={cx(styles.progressText, 'tabular')}>
            {stats.owned} / {stats.total}
          </span>
        </div>
      </header>

      {/* Les filtres passent à la ligne : jamais de défilement horizontal (il élargit la page sur mobile). */}
      <ul className={styles.rarities} aria-label="Filtrer par famille">
        {stats.byFamily.map((f) => (
          <li key={f.family}>
            <button
              type="button"
              className={cx(styles.chip, family === f.family && styles.chipActive)}
              style={{ '--h': FAMILIES[f.family].hue } as CSSProperties}
              aria-pressed={family === f.family}
              onClick={() => setFamily(family === f.family ? null : f.family)}
            >
              <span className={styles.familyDot} aria-hidden="true" />
              <span>{FAMILIES[f.family].short}</span>
              <span className="tabular">
                {f.owned}/{f.total}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <ul className={styles.rarities} aria-label="Filtrer par rareté">
        {stats.byRarity.map((r) => (
          <li key={r.rarity}>
            <button
              type="button"
              className={cx(styles.chip, rarity === r.rarity && styles.chipActive)}
              aria-pressed={rarity === r.rarity}
              onClick={() => setRarity(rarity === r.rarity ? null : r.rarity)}
            >
              <RarityBadge rarity={r.rarity} />
              <span className="tabular">
                {r.owned}/{r.total}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.segmented} role="group" aria-label="Filtrer par possession">
        {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
          <button key={s} type="button" className={cx(styles.segment, status === s && styles.segmentActive)} aria-pressed={status === s} onClick={() => setStatus(s)}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {cards.length === 0 ? (
        <p className={styles.empty}>Aucune carte ne correspond à ce filtre.</p>
      ) : (
        <ul className={styles.grid}>
          {cards.map((card, i) => {
            const owned = card.id in state.collection
            return (
              <li key={card.id} className={styles.cell}>
                {owned ? (
                  <Card card={card} faceUp onClick={() => setViewerIndex(i)} />
                ) : (
                  <button
                    type="button"
                    className={cx(styles.slot, styles.slotMissing)}
                    style={{ '--h': FAMILIES[card.family].hue } as CSSProperties}
                    onClick={() => setViewerIndex(i)}
                    aria-label={`Carte ${card.localId}, ${FAMILIES[card.family].short}, ${card.rarity}, pas encore obtenue`}
                  >
                    <span className={cx(styles.slotNumber, 'tabular')}>{card.localId}</span>
                    <RarityBadge rarity={card.rarity} className={styles.slotRarity} />
                  </button>
                )}
                {owned && isMastered(state.quiz.stats[card.id]) && (
                  <span className={styles.mastered} title="Maîtrisée au quiz">
                    <BadgeCheck size={16} aria-label="Maîtrisée au quiz" />
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <CardViewer cards={cards} index={viewerIndex} onChange={setViewerIndex} onClose={() => setViewerIndex(null)} />
    </div>
  )
}
