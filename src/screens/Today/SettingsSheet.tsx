import { Download, LayoutGrid, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Card } from '../../components/Card/Card'
import { RarityBadge } from '../../components/RarityBadge/RarityBadge'
import { Sheet } from '../../components/Sheet/Sheet'
import { getSet } from '../../data/sets'
import { cx } from '../../lib/cx'
import { formatLitersShort, todayKey } from '../../lib/day'
import { exportJson, parseImport } from '../../state/persistence'
import { CARD_STYLES, type CardStyle } from '../../state/types'
import { selectBackdropCard } from '../../state/selectors'
import { useActions, useAppState } from '../../state/store'
import styles from './SettingsSheet.module.css'

type Props = { open: boolean; onClose: () => void }

const STYLE_LABELS: Record<CardStyle, { name: string; hint: string }> = {
  classique: { name: 'Classique', hint: 'Carte de jeu : illustration et l’essentiel' },
  memo: { name: 'Mémo', hint: 'Fiche de révision : les 5 points sur la carte' },
  galerie: { name: 'Galerie', hint: 'Illustration pleine carte, texte dans la fiche' },
}

/** Réglages réduits au strict nécessaire : style des cartes, fond, exporter, importer, réinitialiser. */
export function SettingsSheet({ open, onClose }: Props) {
  const state = useAppState()
  const actions = useActions()
  const set = getSet(state.settings.setId)
  const backdrop = selectBackdropCard(state, set)
  // Carte d'exemple du comparateur : le fond d'écran s'il existe, sinon la première carte.
  const sample = backdrop ?? set.cards[0]
  const fixedBackdrop = state.settings.backdropCardId !== null
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const onExport = () => {
    const blob = new Blob([exportJson(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paligame-export-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Export téléchargé.')
  }

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const imported = parseImport(await file.text())
    if (!imported) {
      setMessage("Ce fichier n'est pas un export Paligame.")
      return
    }
    if (window.confirm('Remplacer toutes les données actuelles par celles de ce fichier ?')) {
      actions.importState(imported)
      setMessage('Import terminé.')
    }
  }

  const close = () => {
    setConfirmReset(false)
    setMessage(null)
    onClose()
  }

  return (
    <Sheet open={open} onClose={close} title="Réglages">
      <dl className={styles.facts}>
        <div>
          <dt>Extension</dt>
          <dd>
            {set.name} · {set.cards.length} cartes
          </dd>
        </div>
        <div>
          <dt>Objectif</dt>
          <dd>{formatLitersShort(state.settings.goalMl)} par jour</dd>
        </div>
        <div>
          <dt>Verre</dt>
          <dd>{formatLitersShort(state.settings.quickAddMl)}</dd>
        </div>
        <div>
          <dt>Prises enregistrées</dt>
          <dd>{state.entries.length}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd className="tabular">{__APP_VERSION__}</dd>
        </div>
      </dl>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>Style des cartes</h3>
        <ul className={styles.styles} role="group" aria-label="Style des cartes">
          {CARD_STYLES.map((style) => (
            <li key={style}>
              <button
                type="button"
                className={cx(styles.styleOption, state.settings.cardStyle === style && styles.styleActive)}
                aria-pressed={state.settings.cardStyle === style}
                onClick={() => actions.setCardStyle(style)}
              >
                {sample && <Card card={sample} faceUp cardStyle={style} />}
                <span className={styles.styleName}>{STYLE_LABELS[style].name}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.hint}>{STYLE_LABELS[state.settings.cardStyle].hint}</p>
        <a className="btn btn-secondary btn-block" href="#apercu" onClick={close}>
          <LayoutGrid size={18} aria-hidden="true" /> Voir les 74 cartes dans les trois styles
        </a>
      </section>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>Fond d'écran de l'accueil</h3>
        <div className={styles.segmented} role="group" aria-label="Carte affichée en fond">
          <button
            type="button"
            className={cx(styles.segment, !fixedBackdrop && styles.segmentActive)}
            aria-pressed={!fixedBackdrop}
            onClick={() => actions.setBackdrop(null)}
          >
            Dernière carte gagnée
          </button>
          <button
            type="button"
            className={cx(styles.segment, fixedBackdrop && styles.segmentActive)}
            aria-pressed={fixedBackdrop}
            disabled={!backdrop}
            onClick={() => backdrop && actions.setBackdrop(backdrop.id)}
          >
            Carte fixe
          </button>
        </div>
        {backdrop ? (
          <div className={styles.backdropRow}>
            <div className={styles.backdropThumb}>
              <Card card={backdrop} faceUp quality="low" />
            </div>
            <div className={styles.backdropText}>
              <strong>{backdrop.name}</strong>
              <RarityBadge rarity={backdrop.rarity} withLabel />
              <span className={styles.hint}>
                {fixedBackdrop
                  ? 'Cette carte reste en fond. Pour en changer : ouvre une carte, puis « Mettre en fond d’écran ».'
                  : 'Le fond suit ta dernière carte gagnée.'}
              </span>
            </div>
          </div>
        ) : (
          <p className={styles.hint}>Le fond apparaîtra avec ta première carte.</p>
        )}
      </section>

      <div className={styles.actions}>
        <button type="button" className="btn btn-secondary btn-block" onClick={onExport}>
          <Download size={18} aria-hidden="true" /> Exporter mes données (JSON)
        </button>
        <button type="button" className="btn btn-secondary btn-block" onClick={() => fileRef.current?.click()}>
          <Upload size={18} aria-hidden="true" /> Importer un export
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="visually-hidden" onChange={onImport} />
      </div>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.danger}>
        {confirmReset ? (
          <>
            <p>Tout effacer : prises, récompenses et collection. Irréversible.</p>
            <div className={styles.dangerRow}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  actions.reset()
                  close()
                }}
              >
                Oui, tout effacer
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                Annuler
              </button>
            </div>
          </>
        ) : (
          <button type="button" className={styles.resetLink} onClick={() => setConfirmReset(true)}>
            Réinitialiser l'application
          </button>
        )}
      </div>

      <p className={styles.note}>
        Les données restent dans ce navigateur. Pense à exporter avant de changer d'appareil. Fiches de révision : à vérifier avec tes cours et le Vidal, elles ne remplacent pas une prescription.
      </p>
    </Sheet>
  )
}
