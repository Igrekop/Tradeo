<h3 align="center">Tradeo</h3>

<p align="center">
  Tradeo est un bot Discord permettant de visualiser les quantités et prix de skins CS2 sur plusieurs marketplaces, avec intégration graphique et images.
  <br />
</p>

[![Licence: Private Use Only](https://img.shields.io/badge/License-Private%20Use%20Only-lightgrey.svg)](#)

<!-- CAPTURES D'ÉCRAN -->
## Captures d'écran
<img width="1098" height="370" alt="image" src="https://github.com/user-attachments/assets/d08da6e8-f072-4224-b82a-d90bdcf27e4b" />
<img width="1086" height="357" alt="image" src="https://github.com/user-attachments/assets/94fc9608-4555-4c86-82ff-27925643df80" />
<img width="1099" height="632" alt="image" src="https://github.com/user-attachments/assets/2a1046f0-fbf0-4843-96be-4fa045543344" />



<!-- Ajoutez vos captures d'écran ici -->
<!-- Exemple : ![Capture d'écran du projet](./images/screenshot.png) -->

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table des matières</summary>
  <ol>
    <li>
      <a href="#à-propos-du-projet">À propos du projet</a>
      <ul>
        <li><a href="#construit-avec">Construit avec</a></li>
      </ul>
    </li>
    <li>
      <a href="#pour-commencer">Pour commencer</a>
      <ul>
        <li><a href="#prérequis">Prérequis</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#utilisation">Utilisation</a></li>
    <li><a href="#feuille-de-route">Feuille de route</a></li>
    <li><a href="#licence">Licence</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## À propos du projet

Tradeo est un bot Discord développé pour aider les joueurs à suivre les quantités et prix des skins CS2 sur différentes marketplaces. Il permet également d'afficher des graphiques et des images de skins directement dans Discord.

### Construit avec

* [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
* [![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
* [![QuickChart](https://img.shields.io/badge/QuickChart-FF9900?style=for-the-badge)](https://quickchart.io/)

<!-- GETTING STARTED -->
## Pour commencer

Pour exécuter Tradeo sur ton serveur Discord, suis ces étapes.

### Prérequis

* Node.js >= 18.x
* Un bot Discord avec token
* Accès aux APIs des marketplaces

### Installation

1. Clone le dépôt
   ```sh
   git clone https://github.com/Igrekop/Tradeo.git
   ```

2. Installe les dépendances
   ```sh
   npm install
   ```

3. Configure le fichier `.env` avec ton token Discord et tes clés API
   ```env
   DISCORD_TOKEN=YOUR_DISCORD_TOKEN
   API_KEY=YOUR_API_KEY
   ```

4. Lance le bot
   ```sh
   node index.js
   ```

<!-- USAGE -->
## Utilisation

Commandes principales :

* `$amount "nom du skin"` — Affiche la quantité du skin sur plusieurs marketplaces avec graphique

* `$price "nom du skin"` — Affiche le prix actuel sur Buff, ainsi qu'une comparaison avec d'autres marketplaces

* `$trade` — Permet de gérer et simuler des échanges de skins

* `$help` — Affiche la liste de toutes les commandes disponibles
  
<!-- ROADMAP -->
## Feuille de route

- [x] Commande `$amount` avec graphique
- [x] Commande `$price` avec comparatif marketplaces
- [x] Commande `$trade` avec multiples items
- [ ] Interface web pour visualiser graphiques et statistiques
- [ ] Notifications Discord pour fluctuations de prix
- [ ] Support multi-langues
- [ ] Commande pour possible prédiction de la tendance des prix


<!-- LICENSE -->
## Licence

Distribué sous licence Private Use Only. Toute utilisation commerciale ou redistribution est interdite sans accord préalable. Veuillez vous référer au fichier LICENSE pour plus de détails.

<!-- CONTACT -->
## Contact

Email - [yvann.du.soub@gmail.com](mailto:yvann.du.soub@gmail.com)

Project Link: [https://github.com/Igrekop/Tradeo](https://github.com/Igrekop/Tradeo)
