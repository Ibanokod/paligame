// Captures d'écran fiables avec Edge headless piloté par CDP (le navigateur intégré de Claude
// rend mal les SVG et les animations). Usage : npm run dev, puis
//   node scripts/capture.mjs <dossier de sortie> [adresse, par défaut http://localhost:5174/]
// Le scénario ci-dessous remplit une partie de la collection (localStorage), puis capture
// l'aperçu des trois styles, l'accueil, l'historique, le Pharmacodex, une fiche et
// l'ouverture d'un booster. Variable STYLE=classique|memo|galerie pour le style des cartes.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const EDGE = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync)
const outDir = process.argv[2] ?? '.'
const base = process.argv[3] ?? 'http://localhost:5174/'
mkdirSync(outDir, { recursive: true })
const port = 9334
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${join(process.env.TEMP, 'paligame-shot-' + Date.now())}`, '--window-size=412,915', 'about:blank'], { stdio: 'ignore' })
await sleep(3000)
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
  }
}
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id
    pending.set(i, res)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) console.log('erreur', r.result.exceptionDetails.exception?.description)
  return r.result?.result?.value
}
const shot = async (name, full = false) => {
  let clip
  if (full) {
    const h = await evaluate(`document.querySelector('main').scrollHeight`)
    await send('Emulation.setDeviceMetricsOverride', { width: 412, height: Math.min(h + 80, 6000), deviceScaleFactor: 2, mobile: true })
    await sleep(600)
  }
  const r = await send('Page.captureScreenshot', { format: 'png', clip })
  writeFileSync(join(outDir, name), Buffer.from(r.result.data, 'base64'))
  if (full) await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2, mobile: true })
  console.log('capture', name)
}
const go = async (hash = '') => {
  await send('Page.navigate', { url: base + hash })
  await sleep(2500)
}
const click = (text, scope = 'document') =>
  evaluate(`(() => { const b = [...${scope}.querySelectorAll('button, a')].find(b => b.textContent.trim().startsWith(${JSON.stringify(text)})); if (!b) return 'absent: ' + ${JSON.stringify(text)}; b.click(); return 'ok' })()`)

await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2, mobile: true })
await send('Page.enable')
await go()

// Collection de démonstration : 30 cartes dont quelques rares et deux brillantes, 1,2 L bu aujourd'hui.
await evaluate(`(() => {
  const now = new Date(); const day = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  const ids = [1,2,3,4,7,10,12,13,15,16,20,23,24,25,30,34,35,36,38,41,45,46,50,51,55,57,60,63,67,70].map(n => 'PAL1-' + String(n).padStart(3,'0'));
  const collection = {}; ids.forEach((id, i) => collection[id] = { at: new Date(now - (30 - i) * 3600e3).toISOString(), ...(i === 5 || i === 21 ? { foil: true } : {}) });
  const t = (h) => { const d = new Date(now); d.setHours(h, 10, 0, 0); return d.toISOString() };
  const s = { version: 1, settings: { goalMl: 1500, quickAddMl: 150, setId: 'PAL1', backdropCardId: null, cardStyle: '${process.env.STYLE ?? 'classique'}' },
    entries: [{ id: 'e1', at: t(8), ml: 300 }, { id: 'e2', at: t(10), ml: 450 }, { id: 'e3', at: t(12), ml: 450 }],
    rewards: [{ id: 'r1', at: t(10), day, kind: 'card', thresholdMl: 500, cardIds: [ids[28]], revealed: 1, seen: true }, { id: 'r2', at: t(12), day, kind: 'card', thresholdMl: 1000, cardIds: [ids[29]], revealed: 1, seen: true }],
    collection };
  localStorage.setItem('paligame.v1', JSON.stringify(s)); return 'seeded' })()`)

await go('#apercu')
await shot('01-apercu-trois.png')
for (const [label, file] of [['Classique', '02-apercu-classique.png'], ['Mémo', '03-apercu-memo.png'], ['Galerie', '04-apercu-galerie.png']]) {
  await click(label)
  await sleep(800)
  await shot(file)
}
await click('Voir en version brillante')
await sleep(600)
await shot('05-apercu-galerie-brillante.png')

await evaluate(`history.replaceState(null, '', location.pathname)`)
await go()
await shot('10-accueil.png')
await click('Historique')
await sleep(800)
await shot('15-historique.png')
await click('Pharmacodex')
await sleep(800)
await shot('11-pharmacodex.png')
await evaluate(`document.querySelector('main ul:last-of-type li button').click()`)
await sleep(1200)
await shot('12-fiche-haut.png')
await evaluate(`document.querySelector('[role=dialog] div[class*=body]').scrollTo({ top: 520 })`)
await sleep(500)
await shot('13-fiche-bas.png')
await click('Mode révision', `document.querySelector('[role=dialog]')`)
await sleep(400)
await shot('14-fiche-revision.png')

// Booster : 1,5 L atteint, le paquet apparaît.
await evaluate(`(() => { const s = JSON.parse(localStorage.getItem('paligame.v1')); s.entries.push({ id: 'e4', at: new Date().toISOString(), ml: 300 }); localStorage.setItem('paligame.v1', JSON.stringify(s)); return 'ok' })()`)
await go()
await sleep(800)
await shot('20-booster-paquet.png')
await click('Ouvrir le booster', `document.querySelector('[role=dialog]')`)
await sleep(2200)
await shot('21-booster-pile.png')
await evaluate(`(async () => { const top = document.querySelector('[role=dialog] [role=button][tabindex="0"]'); const fire = (type) => top.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: 200, clientY: 400, pointerId: 1, pointerType: 'touch', isPrimary: true })); fire('pointerdown'); fire('pointerup'); await new Promise(r => setTimeout(r, 1400)); return 'flipped' })()`)
await shot('22-booster-retournee.png')
await click('Tout révéler', `document.querySelector('[role=dialog]')`)
await sleep(900)
await shot('23-booster-bilan.png')

// Carte exceptionnelle (au-delà de 1,5 L) en version brillante : Propofol, PAL1-033.
await click('Terminer', `document.querySelector('[role=dialog]')`)
await sleep(600)
await evaluate(`(() => { const s = JSON.parse(localStorage.getItem('paligame.v1')); const now = new Date().toISOString(); const day = s.rewards[0].day; delete s.collection['PAL1-033']; s.entries.push({ id: 'e5', at: now, ml: 500 }); s.rewards.push({ id: 'r9', at: now, day, kind: 'rare-card', thresholdMl: 2000, cardIds: ['PAL1-033'], foilIds: ['PAL1-033'], revealed: 0, seen: false }); s.collection['PAL1-033'] = { at: now, foil: true }; localStorage.setItem('paligame.v1', JSON.stringify(s)); return 'ok' })()`)
await go()
await sleep(800)
await shot('30-rare-dos.png')
await evaluate(`(async () => { const top = document.querySelector('[role=dialog] [role=button][tabindex="0"]'); const fire = (type) => top.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: 200, clientY: 400, pointerId: 1, pointerType: 'touch', isPrimary: true })); fire('pointerdown'); fire('pointerup'); await new Promise(r => setTimeout(r, 1600)); return 'flipped' })()`)
await shot('31-rare-revelee.png')

ws.close()
proc.kill()
console.log('fini')
