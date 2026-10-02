# Paligame

Traqueur d'eau qui fait gagner des cartes mémo de médicaments, pour réviser en s'amusant.
Même moteur qu'Ura : un verre noté, une jauge qui monte, une carte tous les 0,5 L, un booster
de trois cartes à 1,5 L, puis des cartes rares garanties au-delà. Jamais de doublon.

Chaque carte présente un médicament utilisé à l'hôpital (contexte français) en cinq points
courts : ce que c'est, le mode d'action, les effets indésirables, les contre-indications, et
une anecdote ou un moyen mnémotechnique. La rareté reflète la fréquence d'utilisation en
service. 214 cartes en cinq extensions : soins palliatifs, cardiologie et coagulation,
anti-infectieux, urgences et réanimation, diabète et endocrinologie.

Pour réviser : les réponses sont cachées par défaut et se dévoilent d'un tap, et un quiz
pose des séries de dix questions tirées des fiches des cartes gagnées. Les cartes ratées
reviennent plus souvent ; trois bonnes réponses d'affilée et la carte est maîtrisée.

Projet personnel, sans compte ni serveur : **toutes les données restent dans le navigateur
de l'appareil** (export et import JSON depuis les réglages). Les cartes sont dessinées par
l'appli elle-même : aucune image externe, fonctionne hors ligne. Appli web installable
(PWA).

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5174
npm test           # tests Vitest
npm run build      # build statique dans dist/
```

## Avertissement

Les fiches sont un support de révision ludique, relu avec soin mais sans valeur de
référence : elles ne remplacent ni les cours, ni le RCP du médicament, ni une prescription.
