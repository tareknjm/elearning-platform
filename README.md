# 🎓 E-Learning Platform — Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Latest-FF0055?style=for-the-badge&logo=framer&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-Latest-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

**Interface moderne et animée pour une plateforme E-Learning**

</div>

---

# 📋 Description

Frontend d'une plateforme E-Learning complète développée avec
React + Vite + Tailwind CSS. L'interface propose 3 univers
visuels distincts selon le rôle de l'utilisateur, avec des
animations Framer Motion et des effets 3D modernes.

---

# ✨ Fonctionnalités

## 🎨 Design par rôle

- ✅ **Learner** : Thème sombre violet avec particules animées
- ✅ **Instructor** : Thème sombre émeraude avec sidebar
- ✅ **Admin** : Thème dark pro avec sidebar et scan line
- ✅ **Public** : Landing page avec animations 3D avancées

---

## 🔐 Authentification

- ✅ Login / Inscription
- ✅ JWT stocké dans localStorage
- ✅ Routes protégées par rôle (PrivateRoute)
- ✅ Redirection automatique selon le rôle

---

## 📚 Formations

- ✅ Navigation par catégories (20 catégories)
- ✅ Recherche en temps réel
- ✅ Tri par note moyenne
- ✅ Cartes animées avec hover 3D

---

## 🎥 Lecteur vidéo

- ✅ Lecteur vidéo avec playlist
- ✅ Barre de progression en temps réel
- ✅ Navigation Précédent / Suivant

---

## 📊 Quiz & Certificats

- ✅ Interface quiz interactive
- ✅ Score et résultats animés
- ✅ Téléchargement certificat PDF

---

## ⭐ Notation

- ✅ Composant StarRating interactif
- ✅ Avis et commentaires
- ✅ Note moyenne sur les cartes

---

## 🤖 Chatbot

- ✅ Interface chat moderne avec bulles animées
- ✅ Suggestions rapides cliquables
- ✅ Cartes de recommandations cliquables
- ✅ Thème adapté au rôle

---

## 🔔 Notifications

- ✅ Cloche avec badge de compteur
- ✅ Dropdown avec liste des notifications
- ✅ Marquage lu / non lu

---

## 📈 Analytics Instructor

- ✅ Stats globales avec graphiques
- ✅ Taux de complétion par formation
- ✅ Vues par vidéo avec barres animées

---

# 🛠️ Technologies

| Technologie | Usage |
|---|---|
| React 18 | Framework UI |
| Vite | Build tool |
| Tailwind CSS 3 | Styling |
| Framer Motion | Animations |
| Axios | Requêtes HTTP |
| React Router DOM | Navigation |

---

# 🏗️ Structure

```text
src/
├── components/
│   ├── layouts/
│   │   ├── AdminLayout.jsx      # Sidebar dark indigo
│   │   ├── InstructorLayout.jsx # Sidebar dark émeraude
│   │   └── LearnerLayout.jsx    # Layout violet + particules
│   ├── Navbar.jsx               # Navbar adaptative
│   ├── NotificationBell.jsx     # Cloche notifications
│   └── StarRating.jsx           # Composant étoiles
├── pages/
│   ├── public/                  # Pages accessibles à tous
│   ├── admin/                   # Dashboard admin
│   ├── instructor/              # Espace instructeur
│   └── learner/                 # Espace apprenant
├── services/                    # Appels API (Axios)
├── context/                     # AuthContext global
└── routes/                      # PrivateRoute
```

---

# 🚀 Installation & Lancement

## 📌 Prérequis

- Node.js 18+
- npm ou yarn
- Backend E-Learning en cours d'exécution

---

## 1️⃣ Cloner le projet

```bash
git clone https://github.com/tareknjm/elearning-frontend.git
cd elearning-frontend
```

---

## 2️⃣ Installer les dépendances

```bash
npm install
```

---

## 3️⃣ Lancer en développement

```bash
npm run dev
```

---

## ✅ Application disponible sur

```text
http://localhost:5173
```

---

# 🔗 Connexion au Backend

L'URL du backend est configurée dans `src/services/api.js` :

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});
```

---

# 📱 Responsive Design

- ✅ Compatible Desktop
- ✅ Compatible Tablette
- ✅ Compatible Mobile
- ✅ Sidebar responsive
- ✅ Menus adaptatifs

---

# 🎨 Effets Visuels

- ✨ Glassmorphism
- ✨ Effets néon
- ✨ Animations Framer Motion
- ✨ Hover 3D Cards
- ✨ Particules animées
- ✨ Gradients dynamiques

---

# 📦 Build Production

## Générer le build

```bash
npm run build
```

## Prévisualiser le build

```bash
npm run preview
```

---

# 👨‍💻 Auteur

## **Tarek NJM**

- GitHub : [@tareknjm](https://github.com/tareknjm)

---

# 📄 Licence

Ce projet est développé dans le cadre d'un Projet de Fin d'Études (PFE).

---

<div align="center">

### ⭐ N'hésitez pas à donner une étoile au projet !

</div>