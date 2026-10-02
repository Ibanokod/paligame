// Captures d'écran fiables avec Edge headless piloté par CDP (le navigateur intégré de Claude
// rend mal les SVG et les animations). Usage : npm run dev, puis
//   node scripts/capture.mjs <dossier de sortie> [adresse, par défaut http://localhost:5174/]
// Le scénario ci-dessous remplit une partie de la collection (localStorage), puis capture
// l'accueil, les réglages, le Pharmacodex et ses extensions, une fiche en mode révision, le
// quiz (question, correction, résultat) et l'ouverture d'un booster de l'extension Cardio.
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

// Collection de démonstration : 30 cartes palliatives (deux brillantes) et 12 de cardio,
// quelques résultats de quiz, 1,2 L bu aujourd'hui.
await evaluate(`(() => {
  const now = new Date(); const day = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  const pad = (n) => String(n).padStart(3, '0');
  const ids = [1,2,3,4,7,10,12,13,15,16,20,23,24,25,30,34,35,36,38,41,45,46,50,51,55,57,60,63,67,70].map(n => 'PAL1-' + pad(n));
  const cardio = [1,2,3,5,9,13,14,18,22,26,30,36].map(n => 'CARDIO-' + pad(n));
  const collection = {};
  ids.forEach((id, i) => collection[id] = { at: new Date(now - (40 - i) * 3600e3).toISOString(), ...(i === 5 || i === 21 ? { foil: true } : {}) });
  cardio.forEach((id, i) => collection[id] = { at: new Date(now - (12 - i) * 3600e3).toISOString() });
  const stats = {}; ids.slice(0, 6).forEach((id) => stats[id] = { ok: 3, ko: 0, streak: 3, at: now.toISOString() });
  const t = (h) => { const d = new Date(now); d.setHours(h, 10, 0, 0); return d.toISOString() };
  const s = { version: 1, settings: { goalMl: 1500, quickAddMl: 150, setId: 'PAL1', backdropCardId: null, hideAnswers: true },
    entries: [{ id: 'e1', at: t(8), ml: 300 }, { id: 'e2', at: t(10), ml: 450 }, { id: 'e3', at: t(12), ml: 450 }],
    rewards: [{ id: 'r1', at: t(10), day, kind: 'card', thresholdMl: 500, cardIds: [ids[28]], revealed: 1, seen: true }, { id: 'r2', at: t(12), day, kind: 'card', thresholdMl: 1000, cardIds: [ids[29]], revealed: 1, seen: true }],
    collection, quiz: { stats, best: 7, sessions: 3 } };
  localStorage.setItem('paligame.v1', JSON.stringify(s)); return 'seeded' })()`)

await go()
await shot('10-accueil.png')
await evaluate(`document.querySelector('[aria-label="Réglages"]').click()`)
await sleep(800)
await shot('11-reglages.png')
await evaluate(`document.querySelector('[role=dialog] [aria-label="Fermer"]').click()`)
await sleep(400)

await click('Pharmacodex')
await sleep(800)
await shot('20-pharmacodex.png')
await evaluate(`document.querySelector('main ul[class*=grid] li button').click()`)
await sleep(1200)
await shot('21-fiche-revision.png')
await evaluate(`document.querySelector('[role=dialog] div[class*=body]').scrollTo({ top: 640 })`)
await sleep(400)
await shot('22-fiche-revision-bas.png')
await click('Tout dévoiler', `document.querySelector('[role=dialog]')`)
await sleep(500)
await evaluate(`document.querySelector('[role=dialog] div[class*=body]').scrollTo({ top: 0 })`)
await sleep(400)
await shot('23-fiche-devoilee.png')
await evaluate(`document.querySelector('[role=dialog] [aria-label="Fermer"]').click()`)
await sleep(400)
await click('Soins palliatifs')
await sleep(300)
await shot('25-pharmacodex-extensions.png')
await click('Cardiologie')
await sleep(800)
await shot('24-pharmacodex-cardio.png')

await click('Quiz')
await sleep(800)
await shot('30-quiz-accueil.png')
await click('Toutes mes cartes')
await click('Lancer une série')
await sleep(600)
await shot('31-quiz-question.png')
// Réponse fausse exprès, pour voir la correction.
await evaluate(`(() => { const opts = [...document.querySelectorAll('main ol li button')]; opts[opts.length - 1].click(); return opts.length })()`)
await sleep(500)
await shot('32-quiz-correction.png')
// On termine la série en répondant au hasard.
await evaluate(`(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)); for (let i = 0; i < 12; i++) { const next = [...document.querySelectorAll('main button')].find(b => /Question suivante|Voir le résultat/.test(b.textContent)); if (next) { next.click(); await sleep(150) } const opts = [...document.querySelectorAll('main ol li button:not(:disabled)')]; if (opts.length) { opts[0].click(); await sleep(150) } } return 'ok' })()`)
await sleep(300)
await click('Voir le résultat')
await sleep(600)
await shot('33-quiz-resultat.png')

// Booster de l'extension Cardio : on la choisit, puis on atteint 1,5 L.
await evaluate(`(() => { const s = JSON.parse(localStorage.getItem('paligame.v1')); s.settings.setId = 'CARDIO'; s.entries.push({ id: 'e4', at: new Date().toISOString(), ml: 300 }); localStorage.setItem('paligame.v1', JSON.stringify(s)); return 'ok' })()`)
await go()
await sleep(800)
await shot('40-booster-paquet.png')
await click('Ouvrir le booster', `document.querySelector('[role=dialog]')`)
await sleep(2200)
await evaluate(`(async () => { const top = document.querySelector('[role=dialog] [role=button][tabindex="0"]'); const fire = (type) => top.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: 200, clientY: 400, pointerId: 1, pointerType: 'touch', isPrimary: true })); fire('pointerdown'); fire('pointerup'); await new Promise(r => setTimeout(r, 1400)); return 'flipped' })()`)
await shot('41-booster-carte-revision.png')
await click('Tout révéler', `document.querySelector('[role=dialog]')`)
await sleep(900)
await shot('42-booster-bilan.png')

ws.close()
proc.kill()
console.log('fini')
