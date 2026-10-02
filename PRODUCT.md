# PRODUCT.md : Paligame

Cadrage produit du 02/10/2026 (demande d'Iban, travail en autonomie). Source de vérité des
règles fonctionnelles. Tout ce qui n'est pas écrit ici reste identique à Ura
(`~\Claude\Perso\Ura\PRODUCT.md`) : écrans, journée, prises, révélation, export.

## Besoin

Une étudiante infirmière de 3e année, en stage de soins palliatifs, veut réviser les
médicaments du service de façon ludique. On garde tout le jeu d'Ura (boire fait gagner des
cartes) et on remplace les Pokémon par des **cartes mémo de médicaments**. Chaque carte
donne, en court : 1. ce que c'est (DCI, classe, indication), 2. le mode d'action, 3. les
effets indésirables, 4. les contre-indications, 5. une anecdote, un moyen mnémotechnique ou
un trait d'humour bienveillant (ajout d'Iban).

## Décisions

| Sujet | Décision |
|---|---|
| Logique de jeu | Celle d'Ura, sans changement : 0,5 L et 1 L = 1 carte, 1,5 L = booster de 5 cartes, au-delà 1 carte tous les 0,5 L garantie rare ; un seul booster par jour ; jamais de doublon ; repli de rareté |
| Cartes | 74 médicaments, une base maison (`src/data/cards/*.json`), rédigée selon `content/SPEC.md` |
| Familles | 9 familles (l'équivalent des types Pokémon), chacune sa couleur et son motif : Opioïdes, Antalgiques et co-antalgiques, Anxiolyse et sédation, Neuroleptiques et antiémétiques, Anticholinergiques et antisécrétoires, Corticoïdes, Digestif et transit, Bouche peau et muqueuses, Urgences et antidotes |
| Rareté | Fréquence d'utilisation en soins palliatifs : Courant ◊, Fréquent ◊◊, Occasionnel ◊◊◊, Rare ☆, Très rare ☆☆, Exceptionnel ♛ |
| Visuels | Aucune image générée ni téléchargée : chaque carte est dessinée en SVG (fond à la couleur de sa famille, motif de la famille, forme galénique, molécule stylisée), composition tirée d'une graine stable : chaque carte a son dessin, toujours le même |
| Surprise | Rareté tirée au hasard dès la première carte, paquet rare (2 %), et **version brillante** : chaque carte tirée a 6 % de chances de sortir en finition holographique |
| Styles de carte | Trois propositions à départager, choix dans les réglages : **Classique** (carte de jeu), **Mémo** (fiche de révision), **Galerie** (illustration pleine carte). Comparaison sur `#apercu` |
| Révision | Fiche complète sous la carte (les 5 points + voies + noms commerciaux + antidote) ; **mode révision** qui masque les réponses jusqu'au tap |
| Collection | « Pharmacodex » : filtres par famille, par rareté, possédées / manquantes |
| Publication | Aucune pour l'instant : démo locale (consigne du 02/10/2026) |

## Répartition des 74 cartes

| Rareté | Cartes | Exemples |
|---|---|---|
| Courant ◊ | 15 | Morphine, Oxycodone, Paracétamol, Midazolam, Lorazépam, Halopéridol, Métoclopramide, Butylbromure de scopolamine, Méthylprednisolone, Macrogol, Bicarbonate 1,4 %, Furosémide, Oxygène |
| Fréquent ◊◊ | 20 | Fentanyl transdermique, Tramadol, Néfopam, Prégabaline, Ondansétron, Dexaméthasone, Scopolamine en patch, Emla |
| Occasionnel ◊◊◊ | 21 | Fentanyl transmuqueux, MEOPA, Lévomépromazine, Olanzapine, Naloxégol, Acide tranexamique |
| Rare ☆ | 12 | Hydromorphone, Kétamine, Chlorpromazine, Octréotide, Atropine sublinguale, Naloxone, Acide zolédronique |
| Très rare ☆☆ | 4 | Méthadone, Phénobarbital, Glycopyrronium, Flumazénil |
| Exceptionnel ♛ | 2 | Sufentanil, Propofol |

## Tables de tirage (en %, `src/data/rates.ts`)

| Emplacement | Courant | Fréquent | Occasionnel | Rare | Très rare | Exceptionnel |
|---|---|---|---|---|---|---|
| Cartes 1 à 3 du booster | 100 | | | | | |
| 4e carte, et carte seule à 0,5 L et 1 L | | 60 | 28 | 9 | 2,5 | 0,5 |
| 5e carte | | 35 | 35 | 20 | 7 | 3 |
| Au-delà de 1,5 L, et paquet rare | | | | 70 | 22 | 8 |

Paquet rare : 2 % des boosters (0,05 % dans Ura, relevé car le jeu ne compte que 74
cartes). Version brillante : 6 % par carte tirée. Les chiffres sont des choix de jeu, à
ajuster après usage.

Rythme : à 1,5 L par jour, 7 cartes par jour ; la collection se complète en deux semaines
environ (moins si l'on boit plus). À la fin : écran « Collection complète », la révision
continue dans le Pharmacodex.

## Données (localStorage `paligame.v1`)

Même modèle qu'Ura, avec trois ajouts :
- `settings.cardStyle` : `'classique' | 'memo' | 'galerie'` ;
- `reward.foilIds` : cartes de la récompense sorties en version brillante ;
- `collection[id].foil` : la carte possédée est brillante.

Ids des cartes : `PAL1-001` à `PAL1-074`, dans l'ordre des familles.

## Points de doute à faire relire par l'étudiante

Relevés pendant la rédaction (les faits pharmacologiques ont été relus, rien de faux
repéré ; ces points touchent surtout la pratique locale et les noms commerciaux) :
- Noms commerciaux peut-être plus commercialisés : Hypnovel (midazolam), Palexia LP
  (tapentadol), Relistor (méthylnaltrexone), Célestène injectable, Transipeg ; pas de marque
  citée pour la méthadone, le sufentanil, le flumazénil, la kétamine, l'atropine et le
  glycopyrronium.
- Usages hors AMM courants en USP, signalés dans les fiches : voie SC (halopéridol,
  métoclopramide, lévomépromazine, Solumédrol, kétamine, sufentanil), néfopam per os sur
  un sucre, lorazépam sublingual, olanzapine, métronidazole gel sur plaies malodorantes,
  atropine collyre en sublingual.
- Morphinique et agoniste-antagoniste : classé en contre-indication (le thésaurus ANSM le
  dit plutôt « déconseillé »).
- À confirmer sur le RCP : codéine et insuffisance respiratoire, hydroxyzine (glaucome et
  prostate en « prudence »), lactulose et maladies inflammatoires du côlon.

## Hors périmètre de la démo

- Publication en ligne (GitHub Pages comme Ura) : à décider.
- Nouvelles extensions (« Urgences », « Gériatrie »...) : `setId` est prêt dans les réglages.
- Quiz chronométré, statistiques de révision, doublons après collection complète.
