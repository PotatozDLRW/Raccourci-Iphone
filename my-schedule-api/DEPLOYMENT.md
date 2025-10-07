# 🚀 Guide de Déploiement Complet

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ Un compte GitHub (gratuit)
- ✅ Un compte Vercel (gratuit)
- ✅ Git installé sur votre ordinateur
- ✅ Un iPhone avec l'app "Raccourcis" installée

## 🔧 Étape 1 : Préparation du code

Votre projet est maintenant prêt ! Vérifiez que vous avez bien ces fichiers :

```
my-schedule-api/
├── api/
│   └── schedule.js     ✅
├── package.json        ✅
├── vercel.json        ✅
├── README.md          ✅
├── .gitignore         ✅
└── DEPLOYMENT.md      ✅ (ce fichier)
```

## 🐙 Étape 2 : Créer un dépôt GitHub

### 2.1 Créer le dépôt sur GitHub.com

1. Allez sur [github.com](https://github.com)
2. Connectez-vous à votre compte
3. Cliquez sur **"New repository"** (bouton vert)
4. Nom du dépôt : `my-schedule-api`
5. Description : `API Vercel pour emploi du temps automatisé`
6. Laissez en **Public** (ou Private si vous préférez)
7. **NE PAS** cocher "Add a README file" (on en a déjà un)
8. Cliquez sur **"Create repository"**

### 2.2 Pousser le code vers GitHub

Ouvrez PowerShell dans le dossier de votre projet et exécutez :

```powershell
# Se placer dans le bon dossier
cd "C:\Users\hipix\Desktop\Raccourci Iphone\my-schedule-api"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "🎉 Initial commit - Schedule API pour iPhone"

# Définir la branche principale
git branch -M main

# Ajouter l'origine distante (remplacez USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/USERNAME/my-schedule-api.git

# Pousser vers GitHub
git push -u origin main
```

⚠️ **Important** : Remplacez `USERNAME` par votre vrai nom d'utilisateur GitHub !

## ☁️ Étape 3 : Déployer sur Vercel

### 3.1 Connexion à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"** ou **"Login"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à vos dépôts GitHub

### 3.2 Créer le projet

1. Sur votre dashboard Vercel, cliquez sur **"New Project"**
2. Trouvez votre dépôt `my-schedule-api` dans la liste
3. Cliquez sur **"Import"** à côté du dépôt
4. Configuration du projet :
   - **Project Name** : `my-schedule-api` (ou un nom personnalisé)
   - **Framework Preset** : Laissez sur "Other"
   - **Root Directory** : Laissez par défaut (`.`)
   - **Build Command** : Laissez vide
   - **Output Directory** : Laissez vide
5. Cliquez sur **"Deploy"**

### 3.3 Attendre le déploiement

Le déploiement prend généralement 1-2 minutes. Vous verrez :
- ⏳ Building...
- ✅ Deployment completed!

### 3.4 Récupérer l'URL de votre API

Une fois le déploiement terminé :
1. Copiez l'URL de votre projet (ex: `https://my-schedule-api-abc123.vercel.app`)
2. Votre API sera accessible à : `https://my-schedule-api-abc123.vercel.app/api/schedule`

## 📱 Étape 4 : Configuration du Raccourci iOS

### 4.1 Créer le raccourci

1. **Ouvrez l'app "Raccourcis"** sur votre iPhone
2. Appuyez sur **"+"** (en haut à droite)
3. Appuyez sur **"Ajouter une action"**

### 4.2 Configuration étape par étape

#### Action 1 : URL
- Recherchez et ajoutez **"URL"**
- Dans le champ URL, collez : `https://VOTRE-PROJET.vercel.app/api/schedule`
- ⚠️ Remplacez `VOTRE-PROJET` par votre vraie URL Vercel !

#### Action 2 : Récupérer le contenu de l'URL
- Recherchez et ajoutez **"Récupérer le contenu de l'URL"**
- URL : Sélectionnez la **variable "URL"** de l'action précédente
- Méthode : Laissez sur **"GET"**

#### Action 3 : Obtenir la valeur du dictionnaire
- Recherchez et ajoutez **"Obtenir la valeur du dictionnaire"**
- Dictionnaire : Sélectionnez **"Contenu de l'URL"**
- Clé : Tapez exactement **`schedule`** (sans guillemets)

#### Action 4 : Afficher la notification
- Recherchez et ajoutez **"Afficher la notification"**
- Titre : `📅 Emploi du temps`
- Corps : Sélectionnez la **variable de l'action précédente**

### 4.3 Finaliser le raccourci

1. Appuyez sur **"Suivant"** (en haut à droite)
2. Nom du raccourci : `Mon Emploi du Temps` (ou ce que vous voulez)
3. Icône : Choisissez une icône (ex: 📅 calendrier)
4. Appuyez sur **"OK"**

## 🧪 Étape 5 : Test

### 5.1 Test de l'API

Avant de tester le raccourci, vérifiez que votre API fonctionne :
1. Ouvrez Safari sur votre iPhone
2. Allez à votre URL : `https://VOTRE-PROJET.vercel.app/api/schedule`
3. Vous devriez voir du JSON avec votre emploi du temps

### 5.2 Test du raccourci

1. Dans l'app Raccourcis, appuyez sur votre raccourci
2. Vous devriez recevoir une notification avec votre emploi du temps formaté !

## 🎯 Étapes bonus

### Ajouter à l'écran d'accueil
1. Dans Raccourcis, appuyez sur les **"..."** de votre raccourci
2. Appuyez sur l'icône de partage
3. Choisissez **"Ajouter à l'écran d'accueil"**

### Configuration automatique
1. Dans Raccourcis, allez dans l'onglet **"Automatisation"**
2. Appuyez sur **"+"**
3. Choisissez **"Heure du jour"**
4. Configurez pour 8h00 du matin par exemple
5. Ajoutez votre raccourci comme action

### Commande Siri
1. Dans les réglages de votre raccourci
2. Section **"Phrase Siri"**
3. Enregistrez une phrase comme "Mon planning" ou "Emploi du temps"

## 🐛 Dépannage

### L'API ne fonctionne pas
- Vérifiez les logs sur vercel.com → votre projet → Functions
- Testez l'URL ICS dans un navigateur
- Vérifiez que l'URL Vercel est correcte

### Le raccourci ne fonctionne pas
- Vérifiez l'URL dans l'action "URL"
- Assurez-vous que la clé est exactement `schedule`
- Testez d'abord l'API dans Safari

### Pas d'événements
- Vérifiez qu'il y a des événements aujourd'hui dans votre calendrier
- Le timezone est configuré sur Europe/Paris

## ✅ Félicitations !

Votre système est maintenant opérationnel ! 🎉

Vous avez maintenant :
- ✅ Une API gratuite sur Vercel
- ✅ Un raccourci iPhone automatisé
- ✅ Un emploi du temps formaté avec des emojis
- ✅ Un système entièrement gratuit et autonome

Profitez bien de votre assistant personnel ! 📱✨