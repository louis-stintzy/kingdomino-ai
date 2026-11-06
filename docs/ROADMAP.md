# Kingdomino AI — Roadmap

> Document vivant du projet. Dernière mise à jour : 2026-11-06.
>
> **Source de vérité :** les lots indiqués comme terminés correspondent aux PR fusionnées dans `main`. Les lots à venir sont des intentions, susceptibles de changer. L'activité de réflexion et de planification peut exister sans commit.

## Vision

Créer une adaptation web 2D de Kingdomino, avec moteur de règles réutilisable, plusieurs modes de jeu (humain / humain, humain / IA, conseiller pour une partie physique, IA / IA), simulation reproductible et expérimentation progressive d'algorithmes d'IA.

## Périmètre initial et conventions

- **V1 :** deux joueurs, deux pions par joueur, royaumes de 7 × 7 cases.
- **Catalogue :** 60 dominos issus du jeu de base et de l'extension Age of Giants, sans mécanique des géants dans un premier temps. L'inventaire a été migré, mais n'a pas encore été intégralement vérifié contre une référence indépendante.
- **Premier draft :** mélange des quatre pions, conformément à la variante que nous avons choisie ; les dominos présentés sont classés par ordre croissant.
- **Manches :** choix des dominos, puis pose suivant l'ordre déterminé par la sélection précédente. Prévoir la dernière manche sans nouvelle sélection.
- **Bonus futurs :** deux cartes de défi tirées au hasard, dont Local Business, Four Corners, Harmony, Middle Kingdom et Lost Corner. Le catalogue complet et les règles détaillées seront spécifiés avant leur implémentation.
- **Évolutivité :** tailles 5 × 5, davantage de joueurs et variantes d'IA à envisager ultérieurement.

## Architecture retenue

- Monorepo npm workspaces, TypeScript.
- `packages/game-core` : domaine et règles, fonctions pures, indépendant du navigateur.
- `packages/game-data` : définitions des dominos et, plus tard, des variantes et bonus ; dépend de `game-core`, pas l'inverse.
- `apps/web` : React + Vite, rendu 2D en HTML/CSS/SVG pour commencer ; pas de moteur 2D ni de Zustand requis à ce stade.
- Vitest pour les tests ; états de partie reproductibles via une seed lorsque le moteur de partie sera introduit.
- Backend, persistance et éventuel entraînement neuronal : différés jusqu'à justification fonctionnelle.

## Lots et avancement

| Lot | État | Livrable principal | Référence |
| --- | --- | --- | --- |
| 0 — Bootstrap | ✅ Terminé | Monorepo npm, React/Vite, scripts, ESLint | PR [#1](https://github.com/louis-stintzy/kingdomino-ai/pull/1) |
| 1A — Modèles et catalogue | ✅ Terminé | Terrains, dominos, 60 définitions et tests | PR [#2](https://github.com/louis-stintzy/kingdomino-ai/pull/2) |
| 1B — Modèle du royaume | ✅ Terminé | Château à (0,0), cases relatives, bornes et tests | PR [#3](https://github.com/louis-stintzy/kingdomino-ai/pull/3) |
| 2 — Placement des dominos | ✅ Terminé | Validation, orientations, connexions, énumération des placements légaux, tests | PR [#4](https://github.com/louis-stintzy/kingdomino-ai/pull/4) |
| 3 — Plateau web interactif | ✅ Terminé | Bac à sable React : catalogue réel, placement/rotation, aperçus, coups légaux, viewport 13×13, lecture seule, 41 tests validés lors de la PR | PR [#6](https://github.com/louis-stintzy/kingdomino-ai/pull/6) |
| 4 — Moteur de partie | ⏭ Prochain | État de partie pour deux joueurs / quatre pions, pioche reproductible, deux rangées de draft, transitions, défausse et fin de partie (sans intégration React dans ce lot) |
| 5 — Scores et partie jouable | Prévu | Régions connectées, couronnes, score final, interface humain vs humain |
| 6 — Bonus et variantes | Prévu | Modèle des cartes bonus, tirage de deux cartes, évaluation configurable |
| 7 — Simulateur et IA de référence | Prévu | Parties sans UI, RandomBot, tests de robustesse et reproductibilité |
| 8 — IA heuristique et mode conseil | Prévu | Évaluation des coups, humain vs IA, suggestions pour partie physique |
| 9 — IA avancées et tournois | Prévu | MCTS, niveaux de difficulté, IA vs IA, statistiques et benchmarks |
| 10 — Expérimentation d'apprentissage | Exploratoire | Évolution d'heuristiques, puis étude RL/réseaux neuronaux si pertinent |
| 11 — Backend et fonctionnalités en ligne | Optionnel | Sauvegardes, comptes, statistiques persistées, éventuellement multijoueur réseau |

Les numéros et l'ordre des lots futurs peuvent changer selon les besoins et les mesures réelles. Un lot « terminé » ne signifie pas que toutes les fonctionnalités dépendantes ont été livrées.

## Prochaine action concrète

**Lot 4 — Moteur de partie** : démarrer `feat/game-flow` depuis `main` ; concevoir dans `game-core` des transitions pures pour deux joueurs, deux pions par joueur et royaumes 7×7. Utiliser les définitions de dominos passées en paramètres depuis `game-data`, sans introduire une dépendance inverse. Prévoir un mélange reproductible (seed), le tirage de cinq dominos, le retrait du troisième après tri, la sélection initiale selon un ordre mélangé des quatre pions, puis les poses dans l'ordre des sélections précédentes avec choix dans la rangée suivante. La dernière manche se termine sans nouvelle sélection. Autoriser la défausse uniquement en l'absence de placement légal. Garder le moteur indépendant du frontend.

**Critères de validation :** invariants de distribution et de draft, transitions immuables et déterministes, tests du déroulement complet (y compris dernier tour et défausse), typecheck, build et lint réussis, revue de PR. L'intégration de la partie à l'interface et l'affichage simultané des deux royaumes viendront dans un sous-lot ultérieur, après stabilisation du moteur.

## Points à préciser plus tard

- Vérification exhaustive du catalogue des dominos et des règles de tirage retenues.
- Modèle de partie (`GameState`, actions, RNG seedé, historique/replay et information visible par chaque joueur).
- Catalogue précis des cartes bonus, conditions d'activation et défausses pour Harmony.
- Ergonomie du plateau : clic pour la V1, éventuellement drag-and-drop ensuite ; illustrations et symboles des terrains à retravailler.
- Vue deux royaumes et deux colonnes de quatre dominos (tour actuel et suivant) ; sur mobile, affichage adapté au mode conseil IA.
- Château et pions avec repères de couleur des joueurs, lorsque le modèle des joueurs sera présent.
- Choix de structures optimisées pour les simulations IA **après** mesures.
- Cadre d'utilisation des visuels et des noms du jeu si diffusion publique.

## Convention de mise à jour

À chaque PR fusionnée : actualiser la ligne du lot, sa référence GitHub, la prochaine action et, si nécessaire, les décisions qui changent le périmètre. Ne pas marquer une intention comme implémentée. La roadmap représente le **plan validé** ; le code, les tests et les PR restent la preuve de ce qui fonctionne effectivement. Un futur `PROJECT_STATUS.md` pourra distinguer également la date de dernière séance de travail de celle du dernier commit.
