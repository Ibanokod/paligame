# PRODUCT.md : Paligame

Cadrage produit. Source de vérité des règles fonctionnelles. Tout ce qui n'est pas écrit ici
reste identique à Ura (`~\Claude\Perso\Ura\PRODUCT.md`) : écrans de base, journée, prises,
révélation, export.

## Besoin

Une étudiante infirmière de 3e année, en stage de soins palliatifs, veut réviser les
médicaments de façon ludique. On garde tout le jeu d'Ura (boire fait gagner des cartes) et
on remplace les Pokémon par des **cartes mémo de médicaments**. Chaque carte donne, en
court : 1. ce que c'est (DCI, classe, indication), 2. le mode d'action, 3. les effets
indésirables, 4. les contre-indications, 5. une anecdote, un moyen mnémotechnique ou un
trait d'humour bienveillant (ajout d'Iban).

## Décisions

| Sujet | Décision |
|---|---|
| Logique de jeu | Celle d'Ura : 0,5 L et 1 L = 1 carte, 1,5 L = booster, au-delà 1 carte tous les 0,5 L garantie rare ; un seul booster par jour ; jamais de doublon ; repli de rareté |
| Booster | **3 cartes** (2 courantes + 1 carte « surprise »), décision du 02/10/2026 : 5 cartes nouvelles par jour à 1,5 L, assez pour progresser, peu pour bien les retenir ; la collection dure plus longtemps |
| Cartes | 214 médicaments en 5 extensions, base maison (`src/data/cards/<extension>/*.json`), rédigée selon `content/SPEC.md` |
| Extensions | Soins palliatifs (74), Cardiologie et coagulation (41), Anti-infectieux (36), Urgences et réanimation (39), Diabète et endocrinologie (24). On en choisit une dans le Pharmacodex : les cartes gagnées viennent de celle-là. Une DCI n'apparaît que dans une extension |
| Familles | 31 familles (l'équivalent des types Pokémon), chacune sa couleur et son motif |
| Rareté | Fréquence d'utilisation à l'hôpital dans le contexte de l'extension : Courant ◊, Fréquent ◊◊, Occasionnel ◊◊◊, Rare ☆, Très rare ☆☆, Exceptionnel ♛ |
| Visuels | Aucune image générée ni téléchargée : chaque carte est dessinée en SVG (fond à la couleur de sa famille, motif, formes galéniques, molécule stylisée), composition tirée d'une graine stable. Paquet à la couleur de son extension |
| Style de carte | **Classique** (carte de jeu), choisi par Iban le 02/10/2026 ; Mémo et Galerie retirés (récupérables dans l'historique git) |
| Surprise | Rareté tirée au hasard dès la première carte, paquet rare (2 %), **version brillante** (6 % par carte tirée) |
| Révision | **Réponses cachées par défaut** (réglable) : sur la carte, vigilance, CI et antidote sont masqués ; dans la fiche, chaque rubrique se dévoile d'un tap, ou « Tout dévoiler » |
| Quiz | 4e onglet : séries de 10 questions à choix multiples générées depuis les fiches des cartes gagnées (voir plus bas) |
| Collection | « Pharmacodex » : choix de l'extension, filtres par famille, par rareté, possédées / manquantes, badge « maîtrisée » |
| Publication | GitHub Pages (`Ibanokod/paligame`), même modèle qu'Ura : code public, données dans le navigateur, page `noindex` |

## Quiz

- Questions fabriquées à partir des fiches, sans contenu à écrire en plus : effet
  indésirable qui figure sur la fiche, contre-indication, classe, médicament correspondant
  à une description ou à un mode d'action, antidote, famille.
- Bonne réponse tirée de la fiche de la carte ; fausses réponses tirées des fiches d'autres
  familles, filtrées : jamais une ligne qui partage un mot-clé avec la fiche de la carte,
  jamais une ligne trop générale (nausées, allergie...) ni une consigne pratique (dilution,
  double contrôle...). Tests dans `src/lib/quiz.test.ts`.
- Sur les cartes gagnées de l'extension en cours, ou toutes ; 4 cartes minimum.
- Les cartes jamais vues et ratées reviennent plus souvent ; 3 bonnes réponses d'affilée =
  carte **maîtrisée** (badge vert dans le Pharmacodex, mention dans la fiche).
- Après chaque réponse : correction immédiate, « Voir la fiche » (réponses visibles).
  En fin de série : score, cartes à revoir, meilleur score gardé.

## Tables de tirage (en %, `src/data/rates.ts`)

| Emplacement | Courant | Fréquent | Occasionnel | Rare | Très rare | Exceptionnel |
|---|---|---|---|---|---|---|
| Cartes 1 et 2 du booster | 100 | | | | | |
| Carte seule à 0,5 L et 1 L | | 60 | 28 | 9 | 2,5 | 0,5 |
| 3e carte du booster (« surprise ») | | 35 | 35 | 20 | 7 | 3 |
| Au-delà de 1,5 L, et paquet rare | | | | 70 | 22 | 8 |

Paquet rare : 2 % des boosters (3 cartes rares). Version brillante : 6 % par carte tirée.

Rythme : à 1,5 L par jour, 5 cartes par jour ; une extension de 40 cartes se complète en
huit jours environ, celle des soins palliatifs en deux semaines. Extension complète :
l'accueil invite à en choisir une autre.

## Données (localStorage `paligame.v1`)

Même modèle qu'Ura, avec ces ajouts :
- `settings.hideAnswers` (mode révision, `true` par défaut), `settings.setId` (extension en
  cours, `PAL1` par défaut) ;
- `reward.setId` (extension tirée), `reward.foilIds` (cartes brillantes) ;
- `collection[id].foil` ;
- `quiz : { stats: { [cardId]: { ok, ko, streak, at } }, best, sessions }`.

Une ancienne sauvegarde est complétée au chargement (réglages et quiz par défaut). Ids des
cartes : `<EXTENSION>-<numéro>` (`PAL1-001`, `CARDIO-012`...), dans l'ordre des familles :
ajouter une carte au milieu d'une extension décale les numéros suivants (à éviter quand la
collection réelle existe : ajouter en fin d'extension).

## Points de doute à faire relire par l'étudiante

Les faits pharmacologiques ont été relus, rien de faux repéré. Restent surtout des noms
commerciaux et des pratiques locales :
- **Noms commerciaux peut-être plus commercialisés** : Hypnovel, Palexia LP, Relistor,
  Célestène injectable, Transipeg, Esidrex, Médiatensyl, Claforan, Orbénine, Extencilline,
  Doxypalu, Tolexine, Fluimucil injectable, DigiFab, Baqsimi, Flucortac, Lenitral, Isocard.
- **Usages hors AMM courants**, signalés dans les fiches : voie SC (halopéridol,
  métoclopramide, lévomépromazine, Solumédrol, kétamine, sufentanil, furosémide), néfopam
  per os, lorazépam sublingual, olanzapine, métronidazole gel, atropine collyre en
  sublingual, CCP sous anti-Xa oral.
- **À confirmer sur le RCP** : codéine et insuffisance respiratoire, hydroxyzine (glaucome,
  prostate), lactulose et MICI, terlipressine et choc septique, gluconate de calcium sous
  digoxine, colistine et myasthénie, contre-indications des quinolones et du cotrimoxazole.
- **Antidotes discutables** au sens strict : glucagon pour les bêtabloquants, atropine
  pour la néostigmine.

## Hors périmètre (prochaines idées)

- Quiz chronométré (« 60 secondes »), statistiques de révision par famille.
- Doublons après une extension complète, pour continuer à jouer.
- Nouvelles extensions (gériatrie, psychiatrie, pédiatrie, oncologie...).
