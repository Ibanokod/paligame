// Illustration des cartes, entièrement dessinée en SVG : aucune image externe. Chaque carte a
// une composition propre, tirée d'une graine stable (son id) : fond dans la teinte de sa
// famille, motif de la famille éparpillé, molécule stylisée, orbites, et au centre la forme
// galénique (gélule, ampoule, patch...). Même carte = même dessin, d'une session à l'autre.

import { useId, type ReactNode } from 'react'
import type { CardData, Form } from '../../data/sets'
import { FAMILIES, type Motif } from '../../lib/families'
import { hashString, seededRng, type Rng } from '../../lib/random'
import { rarityRank } from '../../lib/rarity'

export type Palette = {
  hue: number
  bgInner: string
  bgMid: string
  bgOuter: string
  accent: string
  glyph: string
  light: string
  edge: string
}

/** Teinte de la famille, légèrement décalée par carte (± 8°) pour varier sans perdre le code couleur. */
export function cardPalette(card: Pick<CardData, 'id' | 'family'>): Palette {
  const rng = seededRng(hashString(`${card.id}:hue`))
  const hue = (FAMILIES[card.family].hue + Math.round((rng() - 0.5) * 16) + 360) % 360
  return {
    hue,
    bgInner: `hsl(${hue} 58% 36%)`,
    bgMid: `hsl(${hue} 55% 18%)`,
    bgOuter: `hsl(${hue} 60% 9%)`,
    accent: `hsl(${hue} 85% 76%)`,
    glyph: `hsl(${hue} 72% 60%)`,
    light: `hsl(${hue} 45% 96%)`,
    edge: `hsl(${hue} 50% 20%)`,
  }
}

type Variant = 'window' | 'full'

/** Composition seule, dans un carré de 300 × 300 rogné au format du conteneur. */
export function CardArt({ card, variant }: { card: CardData; variant: Variant }) {
  const uid = useId().replace(/:/g, '')
  const p = cardPalette(card)
  const rng = seededRng(hashString(card.id))
  const full = variant === 'full'
  const rare = rarityRank(card.rarity) >= 3

  const motif = FAMILIES[card.family].motif
  const scatter = scatterMotifs(rng, full ? 14 : 9)
  const molecule = buildMolecule(rng)
  const orbit = { rx: 96 + rng() * 34, ry: 34 + rng() * 22, rot: rng() * 180 }
  const glyphRot = Math.round((rng() - 0.5) * 36)
  const sparkles = rare ? Array.from({ length: full ? 7 : 4 }, () => ({ x: 30 + rng() * 240, y: 30 + rng() * 240, s: 0.6 + rng() * 0.8 })) : []
  const glyphScale = full ? 1.5 : 1.25
  const center = { x: 35 + rng() * 30, y: 32 + rng() * 30 }
  const orb = { x: rng() * 300, y: rng() * 300, r: 70 + rng() * 70, hue: (p.hue + (rng() < 0.5 ? -38 : 38) + 360) % 360 }
  const decor = (['anneaux', 'rayons', 'points'] as const)[Math.floor(rng() * 3)]
  // Seconde forme galénique (si le médicament en a plusieurs), plus petite, posée en retrait.
  const second = card.forms[1]
    ? { form: card.forms[1], x: 150 + (rng() < 0.5 ? -1 : 1) * 72, y: 150 + (rng() < 0.5 ? -1 : 1) * (28 + rng() * 20), rot: Math.round((rng() - 0.5) * 50) }
    : null

  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id={`${uid}-bg`} cx={`${center.x}%`} cy={`${center.y}%`} r="75%">
          <stop offset="0" stopColor={p.bgInner} />
          <stop offset="0.55" stopColor={p.bgMid} />
          <stop offset="1" stopColor={p.bgOuter} />
        </radialGradient>
        <radialGradient id={`${uid}-orb`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={`hsl(${orb.hue} 75% 55%)`} stopOpacity="0.45" />
          <stop offset="1" stopColor={`hsl(${orb.hue} 75% 55%)`} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="300" height="300" fill={`url(#${uid}-bg)`} />
      <circle cx={orb.x} cy={orb.y} r={orb.r} fill={`url(#${uid}-orb)`} />
      <Decor kind={decor} color={p.accent} rare={rare} />

      {scatter.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.rot}) scale(${m.scale}) translate(-50 -50)`} opacity={m.opacity}>
          <MotifGlyph motif={motif} color={p.accent} />
        </g>
      ))}

      <g opacity="0.42" stroke={p.accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {molecule.bonds.map((b, i) => (
          <line key={i} x1={b[0]} y1={b[1]} x2={b[2]} y2={b[3]} />
        ))}
        {molecule.inner.map((c, i) => (
          <circle key={i} cx={c[0]} cy={c[1]} r={c[2]} />
        ))}
        {molecule.atoms.map((a, i) => (
          <circle key={i} cx={a[0]} cy={a[1]} r="5" fill={p.bgMid} />
        ))}
      </g>

      <ellipse cx="150" cy="150" rx={orbit.rx} ry={orbit.ry} transform={`rotate(${orbit.rot} 150 150)`} fill="none" stroke={p.accent} strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="2 7" />

      {second && (
        <g transform={`translate(${second.x} ${second.y}) rotate(${second.rot}) scale(${full ? 0.62 : 0.52}) translate(-50 -50)`} opacity="0.92">
          <FormGlyph form={second.form} light={p.light} accent={p.glyph} edge={p.edge} />
        </g>
      )}

      <circle cx="150" cy="150" r={full ? 105 : 92} fill={`url(#${uid}-halo)`} />
      <ellipse cx="150" cy={150 + 52 * glyphScale} rx={38 * glyphScale} ry={7 * glyphScale} fill="#000" opacity="0.25" />

      <g transform={`translate(150 150) rotate(${glyphRot}) scale(${glyphScale}) translate(-50 -50)`}>
        <FormGlyph form={card.forms[0]} light={p.light} accent={p.glyph} edge={p.edge} />
      </g>

      {sparkles.map((s, i) => (
        <path
          key={i}
          transform={`translate(${s.x} ${s.y}) scale(${s.s})`}
          d="M0-9C1-3 3-1 9 0 3 1 1 3 0 9-1 3-3 1-9 0-3-1-1-3 0-9Z"
          fill="#ffe7a3"
          opacity="0.85"
        />
      ))}
    </svg>
  )
}

/** Décor de fond tiré au sort : anneaux concentriques, rayons, ou trame de points. Doré pour les rares. */
function Decor({ kind, color, rare }: { kind: 'anneaux' | 'rayons' | 'points'; color: string; rare: boolean }) {
  const tone = rare ? '#f2c14e' : color
  if (kind === 'anneaux') {
    return (
      <g fill="none" stroke={tone} strokeOpacity={rare ? 0.22 : 0.12} strokeWidth="1.5">
        {[60, 90, 120, 150, 180].map((r) => (
          <circle key={r} cx="150" cy="150" r={r} />
        ))}
      </g>
    )
  }
  if (kind === 'rayons') {
    return (
      <g stroke={tone} strokeOpacity={rare ? 0.2 : 0.1} strokeWidth="2">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * Math.PI) / 12
          return <line key={i} x1={150 + Math.cos(a) * 70} y1={150 + Math.sin(a) * 70} x2={150 + Math.cos(a) * 230} y2={150 + Math.sin(a) * 230} />
        })}
      </g>
    )
  }
  return (
    <g fill={tone} fillOpacity={rare ? 0.24 : 0.13}>
      {Array.from({ length: 100 }, (_, i) => (
        <circle key={i} cx={15 + (i % 10) * 30} cy={15 + Math.floor(i / 10) * 30} r="1.8" />
      ))}
    </g>
  )
}

/** Motifs posés sur une grille 4 × 4 (une case sur deux environ) pour éviter les paquets. */
function scatterMotifs(rng: Rng, count: number) {
  const cells: { x: number; y: number; scale: number; rot: number; opacity: number }[] = []
  const slots = Array.from({ length: 16 }, (_, i) => i)
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[slots[i], slots[j]] = [slots[j], slots[i]]
  }
  for (const slot of slots.slice(0, count)) {
    const cx = (slot % 4) * 75 + 37.5
    const cy = Math.floor(slot / 4) * 75 + 37.5
    cells.push({
      x: cx + (rng() - 0.5) * 40,
      y: cy + (rng() - 0.5) * 40,
      scale: 0.22 + rng() * 0.3,
      rot: Math.round(rng() * 360),
      opacity: 0.1 + rng() * 0.14,
    })
  }
  return cells
}

type Molecule = { bonds: number[][]; inner: number[][]; atoms: number[][] }

/** Formule « squelette » imaginaire : 1 à 3 cycles accolés, quelques chaînes, quelques hétéroatomes. */
function buildMolecule(rng: Rng): Molecule {
  const R = 22
  const bonds: number[][] = []
  const inner: number[][] = []
  const atoms: number[][] = []
  const rings = 1 + Math.floor(rng() * 3)
  const directions = [0, 60, 120, 180, 240, 300]
  let cx = 60 + rng() * 180
  let cy = 60 + rng() * 180
  const centers: [number, number][] = []
  for (let r = 0; r < rings; r++) {
    centers.push([cx, cy])
    const vertices = hexVertices(cx, cy, R)
    for (let k = 0; k < 6; k++) bonds.push([...vertices[k], ...vertices[(k + 1) % 6]])
    if (rng() < 0.5) inner.push([cx, cy, R * 0.55])
    const dir = (directions[Math.floor(rng() * 6)] * Math.PI) / 180
    cx += Math.cos(dir) * R * Math.sqrt(3)
    cy += Math.sin(dir) * R * Math.sqrt(3)
  }
  const chains = 2 + Math.floor(rng() * 3)
  for (let c = 0; c < chains; c++) {
    const [rx, ry] = centers[Math.floor(rng() * centers.length)]
    const k = Math.floor(rng() * 6)
    const [vx, vy] = hexVertices(rx, ry, R)[k]
    let angle = Math.atan2(vy - ry, vx - rx)
    let x = vx
    let y = vy
    const links = 1 + Math.floor(rng() * 3)
    for (let l = 0; l < links; l++) {
      const nx = x + Math.cos(angle) * R
      const ny = y + Math.sin(angle) * R
      bonds.push([x, y, nx, ny])
      x = nx
      y = ny
      angle += ((l % 2 === 0 ? 1 : -1) * Math.PI) / 3
    }
    if (rng() < 0.6) atoms.push([x, y])
  }
  return { bonds, inner, atoms }
}

function hexVertices(cx: number, cy: number, r: number): [number, number][] {
  return Array.from({ length: 6 }, (_, k) => {
    const a = ((30 + 60 * k) * Math.PI) / 180
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number]
  })
}

/** Motif de famille dans un carré de 100 × 100, d'une seule couleur. */
export function MotifGlyph({ motif, color }: { motif: Motif; color: string }) {
  const stroke = { fill: 'none', stroke: color, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (motif) {
    case 'pavot':
      // Fleur de pavot (l'opium vient de sa capsule) : quatre pétales ronds, cœur sombre étoilé.
      return (
        <g fill={color}>
          <circle cx="50" cy="28" r="20" />
          <circle cx="72" cy="50" r="20" />
          <circle cx="50" cy="72" r="20" />
          <circle cx="28" cy="50" r="20" />
          <circle cx="50" cy="50" r="11" fill="#000" fillOpacity="0.35" />
          <path d="M50 42V58M42 50H58M44 44L56 56M56 44L44 56" stroke="#000" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )
    case 'ondes':
      return (
        <g {...stroke}>
          <path d="M18 78a32 32 0 0 1 64 0" />
          <path d="M30 78a20 20 0 0 1 40 0" />
          <circle cx="50" cy="78" r="5" fill={color} stroke="none" />
          <path d="M8 78a42 42 0 0 1 84 0" strokeOpacity="0.6" />
        </g>
      )
    case 'lune':
      return (
        <g fill={color}>
          <path d="M60 12a38 38 0 1 0 28 62A32 32 0 1 1 60 12Z" />
          <path d="M78 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />
        </g>
      )
    case 'spirale':
      return <path d="M50 50a5 5 0 0 1 10 0a10 10 0 0 1-20 0a15 15 0 0 1 30 0a20 20 0 0 1-40 0a25 25 0 0 1 50 0a30 30 0 0 1-60 0" {...stroke} strokeWidth={5} />
    case 'bulles':
      return (
        <g {...stroke} strokeWidth={5}>
          <circle cx="40" cy="58" r="22" />
          <circle cx="72" cy="30" r="12" />
          <circle cx="76" cy="72" r="7" />
          <path d="M30 50a12 12 0 0 1 10-8" />
        </g>
      )
    case 'soleil':
      return (
        <g>
          <circle cx="50" cy="50" r="18" fill={color} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4
            return <line key={i} x1={50 + Math.cos(a) * 28} y1={50 + Math.sin(a) * 28} x2={50 + Math.cos(a) * 42} y2={50 + Math.sin(a) * 42} {...stroke} />
          })}
        </g>
      )
    case 'feuille':
      return (
        <g>
          <path d="M16 84C16 42 46 16 86 14C84 54 58 84 16 84Z" fill={color} />
          <path d="M22 78L66 34" {...stroke} stroke="#000" strokeOpacity="0.25" strokeWidth={4} />
        </g>
      )
    case 'pansement':
      // Pansement adhésif : bande arrondie, compresse au centre, petits trous d'aération.
      return (
        <g transform="rotate(-35 50 50)">
          <rect x="6" y="34" width="88" height="32" rx="16" fill={color} />
          <rect x="36" y="38" width="28" height="24" rx="4" fill="#000" fillOpacity="0.22" />
          {[16, 24, 76, 84].map((x) => (
            <g key={x}>
              <circle cx={x} cy="44" r="2" fill="#000" fillOpacity="0.25" />
              <circle cx={x} cy="56" r="2" fill="#000" fillOpacity="0.25" />
            </g>
          ))}
        </g>
      )
    case 'pouls':
      return <path d="M4 56H28L36 32L46 76L58 22L66 56H96" {...stroke} />
  }
}

type GlyphProps = { form: Form; light: string; accent: string; edge: string }

/** Forme galénique dans un carré de 100 × 100 : le « portrait » du médicament. */
export function FormGlyph({ form, light, accent, edge }: GlyphProps) {
  const line = { stroke: edge, strokeWidth: 2.5, strokeLinejoin: 'round' as const }
  const shine = { fill: 'none', stroke: '#ffffff', strokeOpacity: 0.7, strokeWidth: 3.5, strokeLinecap: 'round' as const }
  let body: ReactNode
  switch (form) {
    case 'comprime':
      body = (
        <>
          <circle cx="50" cy="50" r="34" fill={light} {...line} />
          <circle cx="50" cy="50" r="26" fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="2" />
          <path d="M24 50H76" stroke={edge} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 36a24 24 0 0 1 16-11" {...shine} />
        </>
      )
      break
    case 'gelule':
      body = (
        <g transform="rotate(35 50 50)">
          <path d="M35 50V29a15 15 0 0 1 30 0V50Z" fill={accent} {...line} />
          <path d="M35 50V71a15 15 0 0 0 30 0V50Z" fill={light} {...line} />
          <path d="M41 26V44" {...shine} />
          <path d="M41 56V70" {...shine} strokeOpacity={0.5} />
        </g>
      )
      break
    case 'solution':
      body = (
        <>
          <rect x="41" y="8" width="18" height="15" rx="6" fill={accent} {...line} />
          <rect x="44" y="22" width="12" height="10" fill={light} {...line} />
          <path d="M30 40a8 8 0 0 1 8-8h24a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8Z" fill={light} {...line} />
          <path d="M31.3 58H68.7V80a7 7 0 0 1-7 7H38.3a7 7 0 0 1-7-7Z" fill={accent} fillOpacity="0.85" />
          <path d="M37 40V52" {...shine} />
        </>
      )
      break
    case 'injectable':
      body = (
        <g transform="rotate(-12 50 50)">
          <ellipse cx="50" cy="18" rx="7" ry="10" fill={light} {...line} />
          <rect x="47" y="27" width="6" height="9" fill={light} {...line} />
          <rect x="44.5" y="29" width="11" height="3.5" rx="1.5" fill={accent} />
          <path d="M47 36C47 40 36 42 36 50V82a8 8 0 0 0 8 8h12a8 8 0 0 0 8-8V50C64 42 53 40 53 36Z" fill={light} {...line} />
          <path d="M37.3 60H62.7V82a7 7 0 0 1-7 7H44.3a7 7 0 0 1-7-7Z" fill={accent} fillOpacity="0.85" />
          <path d="M42 52V82" {...shine} strokeOpacity={0.55} />
        </g>
      )
      break
    case 'patch':
      body = (
        <g transform="rotate(-10 50 50)">
          <rect x="15" y="15" width="70" height="70" rx="14" fill={light} {...line} />
          <rect x="21" y="21" width="58" height="58" rx="10" fill="none" stroke={edge} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 4" />
          <rect x="29" y="29" width="42" height="42" rx="8" fill={accent} fillOpacity="0.6" />
          <circle cx="50" cy="50" r="8" fill="#ffffff" fillOpacity="0.75" />
        </g>
      )
      break
    case 'spray':
      body = (
        <>
          <rect x="45" y="6" width="10" height="20" rx="5" fill={light} {...line} />
          <rect x="36" y="24" width="28" height="9" rx="3" fill={accent} {...line} />
          <rect x="33" y="33" width="34" height="56" rx="10" fill={light} {...line} />
          <rect x="34.3" y="52" width="31.4" height="16" fill={accent} fillOpacity="0.6" />
          <circle cx="62" cy="9" r="2.2" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="69" cy="5" r="1.6" fill="#ffffff" fillOpacity="0.7" />
          <circle cx="70" cy="13" r="1.4" fill="#ffffff" fillOpacity="0.6" />
          <path d="M39 38V48" {...shine} />
        </>
      )
      break
    case 'gaz':
      // Bouteille de gaz médical, ogive blanche comme dans les services français.
      body = (
        <>
          <rect x="46" y="5" width="8" height="10" rx="2" fill={edge} />
          <rect x="40" y="13" width="20" height="5" rx="2" fill={edge} />
          <path d="M34 34a16 16 0 0 1 32 0V86a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6Z" fill={accent} {...line} />
          <path d="M34 34a16 16 0 0 1 32 0v6H34Z" fill={light} {...line} />
          <rect x="40" y="52" width="20" height="26" rx="3" fill="#ffffff" fillOpacity="0.75" />
          <path d="M39 46V84" {...shine} strokeOpacity={0.45} />
        </>
      )
      break
    case 'suppositoire':
      body = (
        <g transform="rotate(30 50 50)">
          <path d="M50 10c10 10 16 26 16 44v28a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6V54c0-18 6-34 16-44Z" fill={light} {...line} />
          <path d="M34.5 66H65.5V82a5 5 0 0 1-5 5H39.5a5 5 0 0 1-5-5Z" fill={accent} fillOpacity="0.6" />
          <path d="M42 30q-3 10-3 22" {...shine} />
        </g>
      )
      break
    case 'creme':
      body = (
        <g transform="rotate(-25 50 50)">
          <rect x="42" y="8" width="16" height="14" rx="3" fill={accent} {...line} />
          <path d="M40 22h20l8 58H32Z" fill={light} {...line} />
          <rect x="30" y="80" width="40" height="9" rx="1.5" fill={light} {...line} />
          <path d="M33 84.5h34" stroke={edge} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="2 3" />
          <path d="M39 40h22l2.5 22h-27Z" fill={accent} fillOpacity="0.55" />
          <path d="M43 28l-2 14" {...shine} />
        </g>
      )
      break
    case 'collyre':
      body = (
        <>
          <path d="M50 6l6 16H44Z" fill={light} {...line} />
          <rect x="40" y="22" width="20" height="12" rx="3" fill={accent} {...line} />
          <rect x="34" y="34" width="32" height="52" rx="10" fill={light} {...line} />
          <path d="M35.3 60H64.7V76a9 9 0 0 1-9 9H44.3a9 9 0 0 1-9-9Z" fill={accent} fillOpacity="0.75" />
          <path d="M76 42c3.5 4.5 5.5 7.5 5.5 10a5.5 5.5 0 0 1-11 0c0-2.5 2-5.5 5.5-10Z" fill={accent} {...line} strokeWidth={1.5} />
          <path d="M40 40V54" {...shine} />
        </>
      )
      break
    case 'sachet': {
      const top: string[] = []
      const bottom: string[] = []
      for (let i = 0; i <= 16; i++) top.push(`${18 + i * 4} ${i % 2 === 0 ? 18 : 13}`)
      for (let i = 16; i >= 0; i--) bottom.push(`${18 + i * 4} ${i % 2 === 0 ? 82 : 87}`)
      body = (
        <g transform="rotate(8 50 50)">
          <path d={`M${top.join(' L')} L${bottom.join(' L')} Z`} fill={light} {...line} />
          <rect x="18" y="40" width="64" height="20" fill={accent} fillOpacity="0.6" />
          <path d="M18 26H82M18 74H82" stroke={edge} strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="6" fill="#ffffff" fillOpacity="0.8" />
        </g>
      )
      break
    }
    case 'bain-de-bouche':
      body = (
        <>
          <path d="M26 18h48l-6 66a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6Z" fill={light} fillOpacity="0.92" {...line} />
          <path d="M28.8 46q10.6-6 21.2 0t21.2 0L68 84a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6Z" fill={accent} fillOpacity="0.8" />
          <circle cx="44" cy="66" r="3" fill="#ffffff" fillOpacity="0.7" />
          <circle cx="56" cy="74" r="2" fill="#ffffff" fillOpacity="0.6" />
          <circle cx="52" cy="58" r="1.6" fill="#ffffff" fillOpacity="0.6" />
          <path d="M33 26l3 40" {...shine} strokeOpacity={0.55} />
        </>
      )
      break
  }
  return <g>{body}</g>
}
