# DESIGN.md : Paligame

> Source de vérité unique pour toute décision visuelle. Toute session Claude Code lit ce
> fichier avant un travail d'interface et n'invente jamais de charte de son côté.

## Statut

**Style de carte acté le 02/10/2026 : Classique** (choix d'Iban parmi trois propositions ;
Mémo et Galerie sont retirés, récupérables dans l'historique git). La coquille reprend telle
quelle la charte d'Ura (`~\Claude\Perso\Ura\DESIGN.md`, choisie par Iban le 21/09/2026 :
sombre, bleu nuit, eau lumineuse, accents dorés pour les raretés), parce que l'appli reste un
traqueur d'eau. Ce qui change : les cartes ne sont plus des images Pokémon mais des dessins
maison, en 5 extensions. Les valeurs vivent dans `src/styles/tokens.css` ; ce fichier
explique le pourquoi.

## Principes

1. **L'eau est l'action, les cartes sont la récompense** (repris d'Ura). Un seul geste
   principal, le bouton « + 0,15 L » en couleur eau. Les couleurs de famille et de rareté
   n'apparaissent que sur les cartes, leurs filtres et la révélation.
2. **Une famille, une couleur, un motif.** Les 31 familles de médicaments jouent le rôle des
   types Pokémon : on reconnaît un opioïde ou un anticoagulant de loin, ce qui aide à réviser
   par classe. Chaque extension a aussi sa couleur, celle de son paquet.
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

Ce tableau est celui des Soins palliatifs ; les familles des autres extensions (cardio,
anti-infectieux, urgences, endocrino) suivent la même règle, avec des motifs dédiés : goutte
de sang, plaquettes, réseau de fibrine, cœur, cycle bêtalactame, bactérie, virus,
champignon, éclair, bouclier, morceau de sucre, papillon (thyroïde). Liste complète dans
`src/lib/families.ts`. Teintes des paquets : Soins palliatifs 213 (bleu nuit), Cardio 352
(rouge), Anti-infectieux 150 (vert), Urgences 22 (orange), Endocrino 268 (violet).

## Illustration d'une carte (`CardArt`)

Carré de 300 × 300 rogné au format du conteneur. Dans l'ordre : fond en dégradé radial
(centre tiré au sort), tache d'une teinte voisine (± 38°), décor tiré au sort (anneaux,
rayons ou trame de points, doré pour les rares), motif de la famille éparpillé sur une
grille 4 × 4, molécule « squelette » imaginaire (1 à 3 cycles, chaînes, hétéroatomes),
orbite pointillée, halo, ombre, puis au centre la **forme galénique** principale
(comprimé, gélule, solution, ampoule, patch, spray, bouteille de gaz à ogive blanche,
suppositoire, tube de crème, collyre, sachet, verre de bain de bouche, stylo injecteur,
poche de perfusion). Étincelles dorées
pour les rares. Si le médicament a plusieurs formes, la deuxième est dessinée en petit, en retrait
(elle distingue deux cartes de la même famille et de même forme principale). C'est une illustration : les dégradés y sont permis.

## La carte (style Classique)

Ratio 63 / 88 et coins proportionnels comme dans Ura. Le recto est mis en page en unités
de conteneur (`cqw`) : la même carte reste juste de la vignette (80 px) à la révélation
(290 px). Cadre : argent (courant à occasionnel), or (rare, très rare), or et liseré irisé
(exceptionnel). De haut en bas : nom (taille réduite au-delà de 13 puis 19 caractères) et
rareté, classe, fenêtre d'illustration, bandeau famille et voies, phrase-titre,
« Vigilance » (1er effet indésirable), « CI » (1re contre-indication), antidote, anecdote en
italique, numéro.

**Mode révision** (par défaut) : les valeurs de Vigilance, CI et Antidote sont remplacées par
une barre neutre (blanc à 12 %, « ? » au centre). Elles réapparaissent quand toute la fiche
est dévoilée. Les vignettes des grilles ne sont pas masquées (illisibles de toute façon).

## Version brillante

Reflet holographique fixe (bandes irisées fines en mode `screen`, opacité 0,6, plus deux
reflets blancs en diagonale) posé sur le recto, quel que soit le style. Mention « Version
brillante » à la révélation et dans la fiche. Balayage lumineux unique à la révélation,
comme pour les rares. Aucune animation permanente.

## Dos de carte et paquet

Même vocabulaire qu'Ura (nuit, vagues, cadre double bleu eau et or, couronne de points,
reflet), avec au centre une **gélule inclinée** : moitié haute remplie d'eau avec une vague,
moitié basse dorée. Textes : « PALIGAME », « CARTES MÉMO MÉDICAMENTS ». Le paquet garde la
déchirure d'Ura, prend la teinte de son extension (bande et corps en `hsl(teinte ...)`, la
gélule et les vagues restent bleu eau et or), porte le nom de l'extension, « BOOSTER DE
RÉVISION » et « 3 CARTES · 1,5 L ». Favicon et icônes : la gélule eau et or sur fond `--bg`.

## Fiche de carte (`CardInfo`)

Panneau `--surface` sous la carte : pastille de famille (teinte de la famille à 16 %),
classe en 16 px graisse 800, voies en pastilles bordées, noms commerciaux en
`--text-muted`. Puis les rubriques numérotées 1 à 4 (pastille ronde de 20 px dans la teinte
de la famille), listes à puces colorées, antidote en pastille verte, et l'encart 5 sur
fond teinté. Mode révision : chaque rubrique est remplacée par un bouton pointillé
« Toucher pour vérifier ta réponse », et un petit bouton « Tout dévoiler » (pilule bordée,
12 px) en haut à droite. Dans la fenêtre de carte, un bouton secondaire bascule le mode le
temps de la fenêtre ; la correction du quiz ouvre la fiche réponses visibles.

## Pharmacodex

En tête, l'extension en cours sur une ligne (pastille à la teinte du paquet, nom, « Changer »
et chevron) ; un tap déplie la liste des 5 extensions avec leur progression, la ligne active
bordée de sa teinte. Puis filtres de famille (pastille de couleur + nom court + compte), de
rareté, et possession, qui passent à la ligne. Grille de 4. Emplacement manquant teinté par
sa **famille** (et non plus par sa rareté comme dans Ura), numéro dans la teinte, symbole de
rareté dessous. Carte maîtrisée au quiz : pastille ronde `--bg` avec l'icône lucide
`BadgeCheck` en `--success`, en bas à droite.

## Quiz

4e onglet (icône `BookOpenCheck`). Accueil : choix « extension en cours / toutes mes
cartes » (segmenté), trois tuiles (cartes, maîtrisées, meilleur score sur 10), bouton
principal « Lancer une série ». Question : progression en barre `--water` de 6 px, panneau
`--surface` avec la pastille de famille (absente quand elle donnerait la réponse) et le nom,
citation éventuelle en italique bordée de `--water` à gauche. Réponses : boutons pleine
largeur de 52 px minimum, lettre A à D dans une pastille ronde ; après réponse, la bonne en
`--success` (fond à 12 %), la mauvaise choisie en `--danger`. Résultat : score en 56 px,
cartes à revoir en grille de 4.

## Accueil

Fond : l'illustration pleine (variante « full » de `CardArt`) de la dernière carte gagnée ou
de la carte épinglée, floutée à 2 px, opacité 0,8, fondu vers `--bg` en bas. Sous l'indication
de la prochaine récompense, une ligne 12 px : « Extension : <nom> · n / total ».

## Repris d'Ura sans changement

Typographie Manrope auto-hébergée, échelle 12 à 56 px, grille de 4 px, rayons, ombres,
boutons, jauge, barre du bas (4 onglets désormais), fenêtres centrées, courbes et durées de mouvement, pile du
booster, déchirure, `prefers-reduced-motion`, accessibilité (contraste ≥ 4,5:1, cibles de
44 px, focus `--water`).

## Interdits

Ceux d'Ura : gradients « sparkle » décoratifs hors illustration, bento, blobs, emoji,
ressources externes, assets de jeux existants, ombres colorées hors révélation, animations
permanentes, défilement horizontal. En plus : aucune croix rouge sur fond blanc (emblème
protégé), aucun logo de laboratoire.
