# Spécification du contenu des cartes Paligame

Paligame est un jeu de cartes à collectionner pour une **étudiante infirmière de 3e année**
(milieu hospitalier français), d'abord en stage de soins palliatifs. Chaque carte est un
**mémo** sur un médicament. Elle sert à réviser de façon ludique : chaque champ est
**court**, précis, conforme à ce qu'on enseigne en IFSI et à la pratique hospitalière
française (recommandations HAS, ANSM, sociétés savantes). On ne s'étale pas : c'est une
carte de rappel, pas un Vidal.

## Extensions

Les cartes sont groupées en extensions, une par dossier de `src/data/cards/` :
`PAL1` (Soins palliatifs), `CARDIO` (Cardiologie et coagulation), `INFECT`
(Anti-infectieux), `URGENCE` (Urgences et réanimation), `ENDO` (Diabète et endocrinologie).
Une DCI n'apparaît que dans une seule extension. Les indications (`what`) et les réflexes
infirmiers se placent dans le contexte de l'extension (service de cardiologie, urgences,
réanimation...). La rareté reflète la fréquence d'utilisation à l'hôpital dans ce
contexte : `Courant` = vu tous les jours en stage, `Exceptionnel` = presque jamais.

## Format de sortie

Un fichier JSON par famille, encodé en UTF-8, contenant **un tableau** d'objets dans l'ordre
de la liste fournie. Guillemets droits, apostrophe droite `'`. JSON strictement valide
(vérifier avec `node -e "JSON.parse(require('fs').readFileSync('<fichier>','utf8'))"`).

```json
{
  "dci": "Morphine",
  "family": "opioide",
  "rarity": "Courant",
  "classe": "Antalgique opioïde fort (palier 3)",
  "brands": ["Skenan LP", "Actiskenan", "Oramorph"],
  "forms": ["gelule", "solution", "injectable"],
  "routes": ["PO", "SC", "IV"],
  "tagline": "L'opioïde fort de référence : douleur et dyspnée",
  "what": "Antalgique opioïde fort, référence des douleurs intenses et de la dyspnée en fin de vie. Formes LP pour le traitement de fond, LI pour les interdoses.",
  "action": "Agoniste des récepteurs opioïdes mu : freine la transmission du message douloureux dans la moelle et le cerveau, et diminue la sensation de manque d'air.",
  "sideEffects": [
    "Constipation quasi constante : laxatif d'emblée",
    "Somnolence, confusion",
    "Nausées, vomissements en début de traitement",
    "Rétention urinaire, prurit",
    "Dépression respiratoire si surdosage"
  ],
  "contraindications": [
    "Insuffisance respiratoire décompensée (hors dyspnée de fin de vie)",
    "Insuffisance hépatocellulaire sévère",
    "Association aux agonistes-antagonistes (buprénorphine, nalbuphine)",
    "Prudence : insuffisance rénale (accumulation des métabolites)"
  ],
  "antidote": "Naloxone",
  "fun": {
    "kind": "culture",
    "text": "Son nom vient de Morphée, dieu grec des rêves : le pharmacien allemand Sertürner l'a isolée de l'opium au début du XIXe siècle et baptisée ainsi pour son effet endormant."
  }
}
```

## Règles par champ

| Champ | Règle |
|---|---|
| `dci` | Dénomination commune internationale, en français, avec majuscule initiale. Préciser la forme si la carte la distingue : « Fentanyl transdermique ». |
| `family` | Imposé par la liste fournie (ne pas changer). |
| `rarity` | Imposé par la liste fournie (ne pas changer). |
| `classe` | Classe pharmacologique ou thérapeutique, 50 caractères max. |
| `brands` | 1 à 3 noms commerciaux **commercialisés en France** (exemples parlants pour le stage). Si incertain, n'en mettre qu'un sûr, ou `[]` pour un générique pur. |
| `forms` | 1 à 3 valeurs parmi : `comprime`, `gelule`, `solution`, `injectable`, `patch`, `spray`, `gaz`, `suppositoire`, `creme`, `collyre`, `sachet`, `bain-de-bouche`, `stylo` (stylo injecteur, insulines...), `poche` (poche de perfusion, solutés). La première sert à l'illustration : mettre la forme la plus typique à l'hôpital. |
| `routes` | Voies d'administration usuelles parmi : `PO`, `SL`, `SC`, `IV`, `IM`, `TD` (transdermique), `IN` (intranasale), `TM` (transmuqueuse buccale), `IR` (intrarectale), `Inhalée`, `Locale`. |
| `tagline` | Ce que c'est en une ligne, **60 caractères max** (affiché sur la carte). |
| `what` | « Qu'est-ce que c'est » : classe + indications principales (dans le contexte de l'extension). 1 à 2 phrases, **220 caractères max**. |
| `action` | Mode d'action, compréhensible par une étudiante IDE. 1 à 2 phrases, **220 caractères max**. Pas de lettres grecques : écrire « mu », « kappa ». |
| `sideEffects` | 3 à 5 effets indésirables, **du plus fréquent ou plus important au moins important**, 60 caractères max chacun. Ajouter un réflexe infirmier quand c'est le point clé (ex. « laxatif d'emblée »). |
| `contraindications` | 2 à 4 contre-indications (absolues d'abord), 70 caractères max chacune. On peut finir par une « Prudence : ... » si c'est classique. |
| `antidote` | Antidote spécifique s'il existe (Naloxone, Flumazénil...), sinon `null`. |
| `fun.kind` | `anecdote` (fait historique vrai), `culture` (étymologie, art, histoire), `mnemo` (moyen mnémotechnique pour retenir un point clé de la carte), `humour` (jeu de mots léger). Viser au moins un tiers de `mnemo` dans le fichier. |
| `fun.text` | 220 caractères max. **Vrai et vérifiable** pour une anecdote ou un fait culturel ; si tu n'es pas sûr d'un fait, fais plutôt un mnémo. L'humour reste bienveillant : jamais sur la mort, les patients ou la fin de vie, on rit du médicament, pas de la situation. |

## Exigences de qualité

- **Exactitude avant tout** : c'est du matériel de révision pour une future infirmière. Pas
  de posologie chiffrée (doses, débits), pas de conseil de prescription.
- Contexte **français** : noms commerciaux, pratiques et vocabulaire des services français
  (IDE, PSE, PCA, interdoses, LP / LI, INR, TCA, anti-Xa, glycémie capillaire, protocoles de
  service ; pour les soins palliatifs : USP, EMSP, sédation proportionnée, loi
  Claeys-Leonetti si pertinent).
- Médicaments à haut risque (anticoagulants, insulines, potassium, amines, curares...) :
  le réflexe de sécurité infirmier attendu figure dans les effets indésirables ou les
  contre-indications (double contrôle, dilution obligatoire, surveillance biologique).
- Ton : clair, direct, pédagogique. Phrases courtes. Pas d'emoji.
- Relire chaque carte une fois écrite : exactitude pharmacologique, longueurs maximales
  respectées, JSON valide.
