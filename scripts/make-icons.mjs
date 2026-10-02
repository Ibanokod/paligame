// Génère les icônes PNG de la PWA (public/icons) à partir du même dessin que favicon.svg (gélule eau et or),
// en rendant une page HTML avec Edge en mode headless (déjà présent sur Windows, aucune
// dépendance npm). Usage : node scripts/make-icons.mjs

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find(existsSync)
if (!EDGE) {
  console.error('Edge introuvable : installer Microsoft Edge ou générer les icônes autrement.')
  process.exit(1)
}

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../public/icons')
await mkdir(outDir, { recursive: true })

// pad = marge autour de la gélule (les icônes « maskable » sont rognées en cercle par Android :
// on garde le dessin dans les 80 % centraux).
const ICONS = [
  { name: 'icon-192.png', size: 192, pad: 0.1 },
  { name: 'icon-512.png', size: 512, pad: 0.1 },
  { name: 'maskable-512.png', size: 512, pad: 0.24 },
  { name: 'apple-touch-icon.png', size: 180, pad: 0.1 },
]

function svg(size, pad) {
  const inner = size * (1 - 2 * pad)
  const offset = size * pad
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0b1220"/>
  <g transform="translate(${offset} ${offset}) scale(${inner / 64})">
    <g transform="rotate(-38 32 32)">
      <path d="M21 32V18a11 11 0 0 1 22 0V32Z" fill="#3ec1f3"/>
      <path d="M21 32V46a11 11 0 0 0 22 0V32Z" fill="#f2c14e"/>
      <path d="M21 32H43" stroke="#0b1220" stroke-opacity=".5" stroke-width="2"/>
      <path d="M26 16V28M26 37V46" stroke="#ffffff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>
    </g>
  </g>
</svg>`
}

const work = join(tmpdir(), `paligame-icons-${process.pid}`)
await mkdir(work, { recursive: true })

for (const { name, size, pad } of ICONS) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#0b1220;overflow:hidden}svg{display:block}</style></head><body>${svg(size, pad)}</body></html>`
  const page = join(work, `${name}.html`)
  await writeFile(page, html, 'utf8')
  const out = join(outDir, name)
  // Un profil distinct par icône : avec un profil partagé, le deuxième lancement d'Edge se
  // contente de passer la main au premier et ne produit aucune capture.
  execFileSync(EDGE, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--hide-scrollbars',
    `--user-data-dir=${join(work, `profile-${name}`)}`,
    `--window-size=${size},${size}`,
    `--screenshot=${out}`,
    pathToFileURL(page).href,
  ], { stdio: 'ignore', timeout: 60_000 })
  // Le lanceur Edge rend la main avant que le processus navigateur ait fini d'écrire le
  // fichier : on attend son apparition (jusqu'à 20 s) avant de passer à l'icône suivante.
  const deadline = Date.now() + 20_000
  while (!existsSync(out) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 250))
  if (!existsSync(out)) {
    console.error(`Capture manquante pour ${name}`)
    process.exit(1)
  }
  console.log(`${name} (${size} px)`)
}

// Edge relâche son profil avec un léger retard : on réessaie, et on n'échoue jamais pour ça.
for (let attempt = 0; attempt < 5; attempt++) {
  try {
    await rm(work, { recursive: true, force: true })
    break
  } catch {
    await new Promise((r) => setTimeout(r, 500))
  }
}
