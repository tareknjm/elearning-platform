# 🎓 E-Learning Platform — Backend

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Security-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-Build-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)

**REST API complète pour une plateforme E-Learning moderne**

</div>

---

# 📋 Description

Plateforme E-Learning complète développée avec Spring Boot.  
Elle permet la gestion des formations en ligne avec un système
de rôles (**Admin, Instructor, Learner**), l'upload de vidéos,
des quiz interactifs, un chatbot de recommandation et
la génération de certificats PDF.

---

# ✨ Fonctionnalités

## 👤 Authentification & Sécurité

- ✅ Inscription / Connexion avec JWT
- ✅ 3 rôles : ADMIN, INSTRUCTOR, LEARNER
- ✅ Spring Security avec protection des routes
- ✅ Hashage des mots de passe (BCrypt)
- ✅ Candidature instructeur avec validation admin

---

## 📚 Gestion des formations

- ✅ CRUD formations par l'instructeur
- ✅ Validation admin (PENDING → APPROVED/REJECTED)
- ✅ 20 catégories prédéfinies
- ✅ Recherche et filtrage par catégorie
- ✅ Tri par note moyenne

---

## 🎥 Vidéos

- ✅ Upload de vidéos (stockage local)
- ✅ Lecture et gestion de l'ordre des vidéos
- ✅ Suivi de progression par vidéo

---

## 📊 Quiz & Certificats

- ✅ Création de quiz QCM par l'instructeur
- ✅ Correction automatique (seuil 70%)
- ✅ Génération de certificat PDF (iText)

---

## ⭐ Notation & Avis

- ✅ Système de notation 1-5 étoiles
- ✅ Commentaires des apprenants
- ✅ Tri des formations par note

---

## 🤖 Chatbot

- ✅ Recommandation de formations par mots-clés
- ✅ Historique des conversations

---

## 🔔 Notifications

- ✅ Notifications en temps réel
- ✅ Alertes pour l'instructeur et l'admin

---

## 📈 Analytics

- ✅ Dashboard analytique pour l'instructeur
- ✅ Taux de complétion
- ✅ Vues par vidéo

---

# 🛠️ Technologies

| Technologie | Version | Usage |
|---|---|---|
| Java | 17 | Langage principal |
| Spring Boot | 3.x | Framework backend |
| Spring Security | 6.x | Authentification |
| Spring Data JPA | 3.x | ORM |
| MySQL | 8.0 | Base de données |
| JWT (jjwt) | 0.11.5 | Tokens d'authentification |
| iText PDF | 5.5.13 | Génération certificats |
| Lombok | Latest | Réduction boilerplate |
| Maven | 3.x | Gestion des dépendances |

---

# 🏗️ Architecture

```text
src/main/java/com/elearning/backend/
├── controller/          # Endpoints REST
├── service/             # Logique métier
├── repository/          # Accès base de données
├── model/               # Entités JPA
├── dto/                 # Objets de transfert
├── security/            # JWT + Spring Security
├── config/              # Configuration CORS, etc.
└── chatbot/             # Service chatbot
```

---

# 🗄️ Modèle de données

```text
User ──────── Course ──────── Video
│              │               │
│           Category      VideoProgress
│              │
└── Enrollment └── Quiz ── QuizQuestion ── QuizOption
│                    │
└── Rating       QuizResult
│
└── Notification
│
└── ChatMessage
│
└── InstructorApplication
```

---

# 🚀 Installation & Lancement

## 📌 Prérequis

- Java 17+
- MySQL 8.0+
- Maven 3.x

---

## 1️⃣ Cloner le projet

```bash
git clone https://github.com/tareknjm/elearning-backend.git
cd elearning-backend
```

---

## 2️⃣ Configurer la base de données

```bash
mysql -u root -p
```

```sql
CREATE DATABASE elearning_db;
```

---

## 3️⃣ Configurer `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/elearning_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

app.jwt.secret=your_secret_key_here
app.jwt.expiration=86400000
```

---

## 4️⃣ Lancer l'application

```bash
mvn spring-boot:run
```

---

## ✅ API disponible sur

```text
http://localhost:8080
```

---

# 📡 Endpoints principaux

## 🔐 Auth

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/applications/instructor` | Candidature instructeur |

---

## 📚 Formations

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | Liste formations approuvées |
| GET | `/api/courses/{id}` | Détail formation |
| POST | `/api/instructor/courses` | Créer formation |
| PUT | `/api/admin/courses/{id}/approve` | Approuver formation |

---

## 🎥 Vidéos & Quiz

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/instructor/videos/upload` | Upload vidéo |
| POST | `/api/instructor/quiz` | Créer quiz |
| POST | `/api/learner/quiz/{id}/submit` | Soumettre quiz |
| GET | `/api/learner/courses/{id}/certificate` | Télécharger certificat |

---

# 🔒 Sécurité

- JWT Authentication
- Spring Security Filters
- BCrypt Password Encoder
- Validation des rôles et permissions
- Protection des endpoints sensibles

---

# 📦 Build du projet

## Générer le fichier JAR

```bash
mvn clean package
```

## Exécuter le JAR

```bash
java -jar target/elearning-backend.jar
```

---

# 📸 Fonctionnalités futures

- 🔹 Paiement en ligne
- 🔹 Streaming vidéo cloud
- 🔹 Chat temps réel WebSocket
- 🔹 IA avancée pour recommandations
- 🔹 Application mobile Flutter

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