# DESIGN.md : Paligame

> Source de vérité unique pour toute décision visuelle. Toute session Claude Code lit ce
> fichier avant un travail d'interface et n'invente jamais de charte de son côté.

## Statut

**Proposition du 02/10/2026, à valider par Iban.** La coquille reprend telle quelle la
charte d'Ura (`~\Claude\Perso\Ura\DESIGN.md`, choisie par Iban le 21/09/2026 : sombre, bleu
nuit, eau lumineuse, accents dorés pour les raretés), parce que l'appli reste un traqueur
d'eau. Ce qui change : les cartes ne sont plus des images Pokémon mais des dessins maison,
et **trois styles de carte** sont proposés pour être départagés (réglages, ou page
`#apercu`). Les valeurs vivent dans `src/styles/tokens.css` ; ce fichier explique le pourquoi.

## Principes

1. **L'eau est l'action, les cartes sont la récompense** (repris d'Ura). Un seul geste
   principal, le bouton « + 0,15 L » en couleur eau. Les couleurs de famille et de rareté
   n'apparaissent que sur les cartes, leurs filtres et la révélation.
2. **Une famille, une couleur, un motif.** Les 9 familles de médicaments jouent le rôle des
   types Pokémon : on reconnaît un opioïde ou un corticoïde de loin, ce qui aide à réviser
   par classe.
3. **Chaque carte a son dessin.** Pas d'image générée ni téléchargée : une composition SVG
   tirée d'une graine stable (l'id de la carte), donc variée d'une carte à l'autre mais
   toujours identique pour la même carte.
4. **Une carte reste un mémo.** Textes courts, hiérarchie nette ; tout le détail est dans
   la fiche sous la carte.
5. Repris d'Ura : lisible d'une main, toute carte visible s'ouvre d'un tap, on lit de haut
   en bas, jamais de défilement horizontal.

## Palette de la coquille

Identique à Ura : `--bg #0B1220`, `--surface #141C2E`, `--surface-2 #1C2740`, `--text
#E9EEF7`, `--text-muted #9AA7BD`, `--water #3EC1F3`, `--water-deep #1B7FD1`, `--success
#4ADE80`, `--danger #F87171`.

Raretés (cartes, badges, révélation) : `--rarity-diamond #C9D6E8` (◊ à ◊◊◊, argent),
`--rarity-star #F2C14E` (☆ et ☆☆, or), `--rarity-crown #FFD166` (♛, or intense + liseré
irisé). La famille « chromatique » d'Ura est remplacée par la **version brillante**, qui
peut toucher toute carte.

## Familles (teinte HSL, `src/lib/families.ts`)

Chaque carte décline sa teinte (± 8° tirés par carte) en fond (`hsl(h 58% 36%)` au centre
vers `hsl(h 60% 9%)`), accent (`hsl(h 85% 76%)`) et forme (`hsl(h 72% 60%)`).

| Famille | Teinte | Motif |
|---|---|---|
| Opioïdes | 350 (rouge pavot) | fleur de pavot |
| Antalgiques et co-antalgiques | 280 (violet) | ondes apaisées |
| Anxiolyse et sédation | 242 (indigo nuit) | lune et étoile |
| Neuroleptiques et antiémétiques | 172 (sarcelle) | spirale |
| Anticholinergiques et antisécrétoires | 205 (bleu brume) | bulles |
| Corticoïdes | 46 (or solaire) | soleil |
| Digestif et transit | 108 (vert) | feuille |
| Bouche, peau et muqueuses | 322 (rose) | pansement |
| Urgences et antidotes | 20 (orange) | tracé de pouls |

## Illustration d'une carte (`CardArt`)

Carré de 300 × 300 rogné au format du conteneur. Dans l'ordre : fond en dégradé radial
(centre tiré au sort), tache d'une teinte voisine (± 38°), décor tiré au sort (anneaux,
rayons ou trame de points, doré pour les rares), motif de la famille éparpillé sur une
grille 4 × 4, molécule « squelette » imaginaire (1 à 3 cycles, chaînes, hétéroatomes),
orbite pointillée, halo, ombre, puis au centre la **forme galénique** principale
(comprimé, gélule, solution, ampoule, patch, spray, bouteille de gaz à ogive blanche,
suppositoire, tube de crème, collyre, sachet, verre de bain de bouche). Étincelles dorées
pour les rares. C'est une illustration : les dégradés y sont permis.

## Trois styles de carte (à départager)

Ratio 63 / 88 et coins proportionnels comme dans Ura. Le recto est mis en page en unités
de conteneur (`cqw`) : la même carte reste juste de la vignette (80 px) à la révélation
(290 px). Cadre : argent (courant à occasionnel), or (rare, très rare), or et liseré irisé
(exceptionnel).

| Style | Idée | Sur la carte | Pour qui |
|---|---|---|---|
| **Classique** | La carte de jeu | Nom et rareté, classe, fenêtre d'illustration, bandeau famille et voies, phrase-titre, « Vigilance » (1er effet indésirable), « CI » (1re contre-indication), antidote, anecdote en italique, numéro | Le plus proche d'Ura : collectionner d'abord, réviser ensuite |
| **Mémo** | La fiche de révision | Papier clair, bandeau de famille, nom, classe et petite forme galénique, les questions numérotées 1 à 4 (c'est quoi, action, effets indésirables, contre-indications) puis l'encart 5 « pour retenir » | Le plus utile pour réviser : la carte est déjà la réponse |
| **Galerie** | L'illustration pleine carte | Dessin en pleine carte, rareté et numéro en haut, famille, nom et classe sur un fondu en bas ; tout le texte est dans la fiche | Le plus « collection », le plus surprenant à l'ouverture |

## Version brillante

Reflet holographique fixe (bandes irisées fines en mode `screen`, opacité 0,6, plus deux
reflets blancs en diagonale) posé sur le recto, quel que soit le style. Mention « Version
brillante » à la révélation et dans la fiche. Balayage lumineux unique à la révélation,
comme pour les rares. Aucune animation permanente.

## Dos de carte et paquet

Même vocabulaire qu'Ura (nuit, vagues, cadre double bleu eau et or, couronne de points,
reflet), avec au centre une **gélule inclinée** : moitié haute remplie d'eau avec une vague,
moitié basse dorée. Textes : « PALIGAME », « PHARMACOPÉE PALLIATIVE ». Le paquet garde la
déchirure d'Ura ; la pastille centrale porte la même gélule, et le texte « 5 CARTES ·
1,5 L ». Favicon et icônes : la gélule eau et or sur fond `--bg`.

## Fiche de carte (`CardInfo`)

Panneau `--surface` sous la carte : pastille de famille (teinte de la famille à 16 %),
classe en 16 px graisse 800, voies en pastilles bordées, noms commerciaux en
`--text-muted`. Puis les rubriques numérotées 1 à 4 (pastille ronde de 20 px dans la teinte
de la famille), listes à puces colorées, antidote en pastille verte, et l'encart 5 sur
fond teinté. Mode révision : chaque rubrique est remplacée par un bouton pointillé
« Toucher pour vérifier ta réponse ».

## Pharmacodex

Filtres de famille (pastille de couleur + nom court + compte), de rareté, et possession,
qui passent à la ligne. Grille de 4. Emplacement manquant teinté par sa **famille** (et non
plus par sa rareté comme dans Ura), numéro dans la teinte, symbole de rareté dessous.

## Accueil

Fond : l'illustration (style Galerie) de la dernière carte gagnée ou de la carte épinglée,
floutée à 2 px, opacité 0,8, fondu vers `--bg` en bas.

## Repris d'Ura sans changement

Typographie Manrope auto-hébergée, échelle 12 à 56 px, grille de 4 px, rayons, ombres,
boutons, jauge, barre du bas, fenêtres centrées, courbes et durées de mouvement, pile du
booster, déchirure, `prefers-reduced-motion`, accessibilité (contraste ≥ 4,5:1, cibles de
44 px, focus `--water`).

## Interdits

Ceux d'Ura : gradients « sparkle » décoratifs hors illustration, bento, blobs, emoji,
ressources externes, assets de jeux existants, ombres colorées hors révélation, animations
permanentes, défilement horizontal. En plus : aucune croix rouge sur fond blanc (emblème
protégé), aucun logo de laboratoire.
