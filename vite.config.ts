import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, type Plugin } from 'vitest/config'

// Chemin de base : « / » en local ; à poser par variable si l'appli est un jour hébergée dans un sous-dossier.
const base = process.env.BASE_PATH ?? '/'

// Version affichée dans les réglages : permet de vérifier qu'une mise à jour est arrivée.
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

// Politique de sécurité du contenu (production seulement : le serveur de dev injecte des
// scripts en ligne). Tout vient de l'appli elle-même : les cartes sont dessinées en SVG,
// aucune image externe, aucune connexion sortante, aucun cadre, aucun formulaire.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ')

const cspMeta: Plugin = {
  name: 'paligame-csp-meta',
  apply: 'build',
  transformIndexHtml() {
    return [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' }]
  },
}

export default defineConfig({
  base,
  // Port distinct d'Ura (5173) : les deux projets peuvent tourner en même temps.
  server: { port: 5174 },
  preview: { port: 4174 },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    // Aucune ressource inlinée en data: (polices, images) : la CSP reste stricte.
    assetsInlineLimit: 0,
  },
  plugins: [
    react(),
    cspMeta,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Paligame',
        short_name: 'Paligame',
        description: "Traqueur d'eau qui fait gagner des cartes mémo de médicaments de soins palliatifs",
        lang: 'fr',
        theme_color: '#0b1220',
        background_color: '#0b1220',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Toute l'appli (cartes comprises, elles sont dessinées) est précachée : elle marche hors ligne.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
