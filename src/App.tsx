import { useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import { RevealOverlay } from './components/Reveal/RevealOverlay'
import { TabBar, type Tab } from './components/TabBar/TabBar'
import { DexScreen } from './screens/Dex/DexScreen'
import { HistoryScreen } from './screens/History/HistoryScreen'
import { PreviewScreen } from './screens/Preview/PreviewScreen'
import { TodayScreen } from './screens/Today/TodayScreen'
import { StoreProvider } from './state/store'

/**
 * Coquille « appli » : une colonne de la hauteur de l'écran, le contenu défile dans <main>,
 * la barre du bas reste toujours visible (elle n'est pas dans le flux qui défile).
 */
export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const mainRef = useRef<HTMLElement>(null)
  // Page de démo « #apercu » (toutes les cartes dans les trois styles), hors des onglets.
  const [preview, setPreview] = useState(() => window.location.hash === '#apercu')

  useEffect(() => {
    const onHash = () => setPreview(window.location.hash === '#apercu')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Chaque onglet s'ouvre en haut de page.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [tab, preview])

  const leavePreview = () => {
    history.replaceState(null, '', window.location.pathname + window.location.search)
    setPreview(false)
  }

  return (
    <StoreProvider>
      <div className={styles.app}>
        <main ref={mainRef} className={styles.main}>
          {preview ? (
            <PreviewScreen onBack={leavePreview} />
          ) : (
            <>
              {tab === 'today' && <TodayScreen />}
              {tab === 'dex' && <DexScreen />}
              {tab === 'history' && <HistoryScreen />}
            </>
          )}
        </main>
        <TabBar
          active={tab}
          onChange={(t) => {
            if (preview) leavePreview()
            setTab(t)
          }}
        />
        <RevealOverlay />
      </div>
    </StoreProvider>
  )
}
