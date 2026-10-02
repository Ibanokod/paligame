# Paligame

Traqueur d'eau qui fait gagner des cartes mémo de médicaments de soins palliatifs. Même
moteur qu'Ura : un verre noté, une jauge qui monte, une carte tous les 0,5 L, un booster de
cinq cartes à 1,5 L, puis des cartes rares garanties au-delà. Les 74 cartes remplissent un
Pharmacodex, jamais de doublon.

Chaque carte présente un médicament utilisé en soins palliatifs (contexte hospitalier
français) en cinq points courts : ce que c'est, le mode d'action, les effets indésirables,
les contre-indications, et une anecdote ou un moyen mnémotechnique pour le retenir. La
rareté d'une carte reflète la fréquence d'utilisation du médicament en service.

Projet personnel, sans compte ni serveur : **toutes les données restent dans le navigateur
de l'appareil** (export et import JSON depuis les réglages). Les cartes sont dessinées par
l'appli elle-même : aucune image externe, fonctionne hors ligne.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5174
npm test           # tests Vitest
npm run build      # build statique dans dist/
```

Démo de tous les styles de carte : `http://localhost:5174/#apercu`.

## Avertissement

Les fiches sont un support de révision ludique, relu avec soin mais sans valeur de
référence : elles ne remplacent ni les cours, ni le RCP du médicament, ni une prescription.
