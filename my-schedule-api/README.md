# My Schedule API 📅

Une API serverless déployée sur Vercel pour récupérer et formater automatiquement votre emploi du temps depuis un calendrier Outlook (.ics).

## 🚀 Fonctionnalités

- ✅ Récupération automatique du calendrier ICS
- ✅ Filtrage des événements du jour
- ✅ Formatage intelligent avec des emojis
- ✅ Compatible avec les Raccourcis iOS
- ✅ Entièrement gratuit
- ✅ Déploiement simple sur Vercel

## 📁 Structure du projet

```
my-schedule-api/
├── api/
│   └── schedule.js     # Fonction principale de l'API
├── package.json        # Dépendances et configuration
├── vercel.json        # Configuration Vercel
└── README.md          # Ce fichier
```

## 🛠️ Installation locale (optionnelle)

Si vous voulez tester localement :

```bash
npm install
npx vercel dev
```

## 🚀 Déploiement sur Vercel

1. **Créer un compte Vercel** : [vercel.com](https://vercel.com)

2. **Pousser vers GitHub** :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Schedule API"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/my-schedule-api.git
   git push -u origin main
   ```

3. **Déployer** :
   - Connectez-vous à Vercel
   - Cliquez sur "New Project"
   - Importez votre dépôt GitHub
   - Cliquez sur "Deploy"

4. **Récupérer l'URL** : Vercel vous donne une URL comme `https://my-schedule-api-xxx.vercel.app`

## 📱 Configuration du Raccourci iOS

### Étapes détaillées :

1. **Ouvrir l'app Raccourcis** sur votre iPhone
2. **Créer un nouveau raccourci** (bouton +)
3. **Nommer le raccourci** : "Mon Emploi du Temps"

### Actions à ajouter (dans l'ordre) :

| #  | Action | Configuration |
|----|--------|---------------|
| 1  | **URL** | Votre URL Vercel : `https://VOTRE-PROJET.vercel.app/api/schedule` |
| 2  | **Récupérer le contenu de l'URL** | Méthode : GET |
| 3  | **Obtenir la valeur du dictionnaire** | Clé : `schedule` |
| 4  | **Afficher la notification** | Titre : "📅 Emploi du temps" |

### Options avancées :

- **Widget** : Ajoutez le raccourci à votre écran d'accueil
- **Automatisation** : Configurez une exécution automatique (ex: 8h du matin)
- **Siri** : Configurez une phrase pour déclencher le raccourci

## 🎨 Personnalisation

### Modifier les emojis :

Éditez le fichier `api/schedule.js`, section `EMOJI_MAP` :

```javascript
const EMOJI_MAP = {
    'projet': '💻',
    'soutenance': '📢',
    'réunion': '👥',
    // Ajoutez vos propres associations
    'votre_mot_clé': '🎯'
};
```

### Changer l'URL du calendrier :

Modifiez la constante `ICS_URL` dans `api/schedule.js` avec votre URL de calendrier Outlook.

## 🐛 Dépannage

### L'API ne fonctionne pas :
- Vérifiez que l'URL ICS est accessible
- Consultez les logs Vercel dans le dashboard

### Le raccourci iOS ne fonctionne pas :
- Vérifiez l'URL de votre API Vercel
- Assurez-vous que la clé `schedule` est correcte dans "Obtenir la valeur du dictionnaire"

### Pas d'événements affichés :
- Vérifiez le timezone (Europe/Paris par défaut)
- Confirmez que des événements existent pour aujourd'hui

## 📧 Support

En cas de problème, vérifiez :
1. Les logs de déploiement Vercel
2. La validité de votre URL ICS
3. La configuration du raccourci iOS

## 📄 Licence

MIT - Utilisez librement pour vos projets personnels et professionnels !