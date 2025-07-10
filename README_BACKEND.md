# Wild Wolf Guild Backend

Une application backend Flask complète pour la gestion d'une guilde Black Desert Online avec intégration Discord.

## 🚀 Fonctionnalités

### 🔐 Authentification
- **OAuth2 Discord** - Connexion sécurisée via Discord
- **Vérification d'appartenance** - Vérification automatique de l'appartenance au serveur Discord
- **JWT Tokens** - Authentification basée sur des tokens sécurisés
- **Gestion des rôles** - Système hiérarchique de rôles de guilde

### 👥 Gestion des Membres
- **Profils détaillés** - Informations complètes sur les personnages BDO
- **Upload d'images** - Images de profil via Cloudinary
- **Validation des comptes** - Système de validation par les administrateurs
- **Statistiques des membres** - Suivi de l'activité et des statuts

### 📅 Système d'Événements
- **Création d'événements** - Interface complète pour organiser des événements
- **Gestion des participants** - Inscription et suivi des participants
- **Notifications Discord** - Rappels automatiques via webhooks
- **Types d'événements** - PvP, PvE, Raids, Réunions, etc.

### 📚 Wiki Collaboratif
- **Articles structurés** - Système complet de gestion de contenu
- **Versioning** - Historique et révisions des articles
- **Catégorisation** - Organisation par catégories et tags
- **Recherche avancée** - Recherche dans le contenu du wiki

### 💬 Forum de Guilde
- **Catégories personnalisées** - Organisation par sujets
- **Système de réponses** - Discussions threadées
- **Modération** - Outils de modération intégrés
- **Permissions basées sur les rôles** - Contrôle d'accès granulaire

### 📨 Messagerie Privée
- **Messages en temps réel** - Communication instantanée via WebSockets
- **Notifications** - Alertes pour nouveaux messages
- **Historique** - Conservation des conversations

### 🛠️ Utilitaires BDO
- **Timers de boss** - Suivi automatique des spawns de boss
- **Liens utiles** - Collection de ressources BDO organisées
- **Calculateurs** - Outils de calcul pour l'équipement

### ⚡ Temps Réel
- **WebSockets** - Communication en temps réel
- **Notifications push** - Alertes instantanées
- **Statuts de présence** - Suivi de l'activité des membres

### 🔧 Administration
- **Panneau d'administration** - Interface complète de gestion
- **Logs d'activité** - Suivi détaillé des actions
- **Statistiques** - Analytics et métriques de la guilde
- **Gestion des utilisateurs** - CRUD complet pour les membres

## 🏗️ Architecture Technique

### Backend (Python/Flask)
```
app.py              # Application principale Flask
config.py           # Configuration de l'application
models.py           # Modèles de base de données SQLAlchemy
utils.py            # Fonctions utilitaires
manage.py           # CLI pour gestion et migrations

auth/               # Blueprint d'authentification
├── routes.py       # Routes OAuth2 Discord

admin/              # Blueprint d'administration
├── routes.py       # Routes admin et gestion

bot/                # Bot Discord
├── discord_bot.py  # Bot Discord intégré

migrations/         # Migrations de base de données
tests/              # Tests automatisés
```

### Base de Données (MySQL)
```
users               # Utilisateurs et profils
guild_events        # Événements de guilde
event_participants  # Participants aux événements
wiki_articles       # Articles du wiki
wiki_revisions      # Versioning du wiki
forum_categories    # Catégories du forum
forum_posts         # Posts du forum
forum_replies       # Réponses aux posts
messages            # Messagerie privée
activity_logs       # Logs d'activité
guild_roles         # Rôles de guilde
bdo_boss_timers     # Timers de boss BDO
useful_links        # Liens utiles
```

## 🚀 Installation

### Prérequis
- Python 3.9+
- MySQL/PostgreSQL
- Redis (optionnel, pour le cache)
- Compte Cloudinary
- Application Discord

### 1. Installation des dépendances
```bash
pip install -r requirements.txt
```

### 2. Configuration de l'environnement
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

### 3. Configuration de la base de données
```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE wild_wolf_guild;

# Initialiser les tables
python manage.py init-db

# Optionnel: Seed avec des données de test
python manage.py seed-data
```

### 4. Configuration Discord

#### Application Discord
1. Aller sur https://discord.com/developers/applications
2. Créer une nouvelle application
3. Noter le Client ID et Client Secret
4. Configurer l'OAuth2 redirect URI: `http://localhost:3000/auth/discord/callback`

#### Bot Discord
1. Dans l'onglet "Bot", créer un bot
2. Noter le token du bot
3. Inviter le bot sur votre serveur avec les permissions appropriées

### 5. Configuration Cloudinary
1. Créer un compte sur https://cloudinary.com
2. Noter le Cloud Name, API Key et API Secret
3. Ajouter ces informations dans votre .env

## 🏃‍♂️ Démarrage

### Serveur de développement
```bash
python run_dev.py
```

### CLI Management
```bash
# Créer un super admin
python manage.py create-admin

# Voir toutes les commandes disponibles
python manage.py --help
```

### Bot Discord
```bash
python bot/discord_bot.py
```

## 📡 API Endpoints

### Authentification
```
POST /api/auth/discord/login     # Initier la connexion Discord
GET  /api/auth/discord/callback  # Callback OAuth2
GET  /api/auth/me               # Informations utilisateur actuel
POST /api/auth/logout           # Déconnexion
POST /api/auth/validate-token   # Validation de token
POST /api/auth/refresh          # Rafraîchissement de token
```

### Membres
```
GET  /api/members               # Liste des membres
GET  /api/members/<id>         # Détails d'un membre
PUT  /api/members/<id>         # Mise à jour d'un membre
```

### Événements
```
GET  /api/events               # Liste des événements
POST /api/events               # Créer un événement
PUT  /api/events/<id>         # Modifier un événement
DELETE /api/events/<id>       # Supprimer un événement
POST /api/events/<id>/join    # Rejoindre un événement
```

### Administration
```
GET  /api/admin/users          # Gestion des utilisateurs
PUT  /api/admin/users/<id>/validate  # Valider un utilisateur
PUT  /api/admin/users/<id>/role      # Changer le rôle
POST /api/admin/users/<id>/upload-avatar  # Upload avatar
GET  /api/admin/activity-logs  # Logs d'activité
GET  /api/admin/statistics     # Statistiques de la guilde
```

## 🔧 Configuration Avancée

### Variables d'Environnement
Voir `.env.example` pour toutes les variables disponibles.

### Cache Redis
```bash
# Installation Redis (Ubuntu)
sudo apt-get install redis-server

# Configuration dans .env
REDIS_URL=redis://localhost:6379/0
```

### Production
```bash
# Utiliser gunicorn pour la production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🤖 Bot Discord

Le bot Discord intégré fournit:

### Commandes Utilisateur
- `!register` - Lien vers l'enregistrement web
- `!profile [@user]` - Afficher le profil
- `!events` - Événements à venir
- `!bosses` - Timers de boss BDO

### Commandes Administrateur
- `!validate @user` - Valider un membre
- `!stats` - Statistiques de la guilde

### Fonctionnalités Automatiques
- Messages de bienvenue
- Notifications d'événements
- Synchronisation des statuts
- Logs d'activité

## 🛡️ Sécurité

### Authentification
- JWT avec expiration
- Vérification de l'appartenance Discord
- Tokens de rafraîchissement sécurisés

### Autorisations
- Système de rôles hiérarchique
- Permissions granulaires
- Validation côté serveur

### Protection des Données
- Validation des entrées
- Échappement HTML
- Rate limiting (recommandé)

## 📊 Monitoring

### Logs
- Logs d'application détaillés
- Logs d'activité utilisateur
- Logs d'erreurs structurés

### Métriques
- Statistiques de la guilde
- Analytics d'utilisation
- Monitoring des performances

## 🧪 Tests

```bash
# Lancer les tests
python manage.py test

# Tests avec couverture
pytest tests/ --cov=app

# Linting
python manage.py lint
```

## 🚀 Déploiement

### Docker (Recommandé)
```dockerfile
# Voir Dockerfile pour la configuration complète
docker build -t wild-wolf-guild-backend .
docker run -p 5000:5000 wild-wolf-guild-backend
```

### Serveur Traditionnel
```bash
# Production avec gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Avec supervisor pour le processus
supervisorctl start wild-wolf-guild
```

## 📝 Contribuer

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Support

Pour toute question ou problème:
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation

---

**Wild Wolf Guild Backend** - Une solution complète pour la gestion de guilde BDO moderne 🐺