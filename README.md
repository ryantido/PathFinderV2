# Pathfinder Job Seeker

**Pathfinder Job Seeker** est une application web moderne qui permet aux utilisateurs de découvrir leur profil professionnel via un quiz d'orientation, de consulter des offres d'emploi personnalisées, de postuler, de gérer leurs favoris et leur profil, le tout avec une authentification sécurisée JWT.

---

## 🚀 Fonctionnalités principales

- **Inscription / Connexion sécurisée** (JWT, hash bcrypt)
- **Quiz d'orientation professionnelle** (questions dynamiques, scoring, matching métiers)
- **Recommandation d'offres d'emploi** selon le profil
- **Favoris** : ajoutez/supprimez des jobs favoris
- **Postuler à une offre** avec message personnalisé
- **Gestion du profil utilisateur**
- **Déconnexion** (navbar & profil)
- **API REST Express + MySQL/Prisma**
- **Tests automatiques E2E** (script bash)

---

## 🛠️ Stack technique

- **Front** : React + Vite + Zustand + React Query + TailwindCSS
- **Back** : Node.js + Express + Prisma + MySQL
- **Auth** : JWT (stateless)
- **Tests** : Script bash E2E (`e2e-test.sh`)

---

## ⚡ Installation & configuration

### 1. Cloner le repo
```bash
git clone <repo-url>
cd pathfinder-job-seeker
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer la base de données
- Crée une base MySQL (ex : `pathFinder`)
- Copie `.env.example` en `.env` et configure la variable `DATABASE_URL` :
  ```
  DATABASE_URL="mysql://user:password@localhost:3306/pathFinder"
  ```

### 4. Générer la base et injecter les données de test
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Lancer le backend (API Express)
```bash
npx ts-node api/index.ts
```

### 6. Lancer le frontend (Vite)
```bash
npm run dev
```

---

## 🧪 Tests E2E (automatiques)

Un script bash (`e2e-test.sh`) permet de tester toute la chaîne (inscription, login, quiz, postulation, accès protégé) :

```bash
./e2e-test.sh
```
- Le script s'arrête en cas d'erreur et affiche le détail de chaque étape.
- Nécessite `jq` pour la validation JSON (`sudo apt install jq` si besoin).

---

## 🔒 Sécurité & bonnes pratiques
- Authentification JWT (stateless, pas de session côté serveur)
- Hash des mots de passe (bcrypt)
- Middleware de protection des routes sensibles
- Vérification d'accès sur les ressources utilisateur
- CORS activé pour le front

---

## ✨ Fonctionnalités avancées
- Matching intelligent entre quiz et métiers (scoring, tags)
- Candidature à une offre avec message personnalisé
- Gestion des favoris et du profil
- Déconnexion accessible partout

---

## 📁 Structure du projet

```
api/           # Backend Express (API REST)
prisma/        # Schéma, migrations, seed Prisma
src/           # Frontend React (Vite)
e2e-test.sh    # Script de test E2E
```

---

## 📝 Personnalisation
- Ajoutez/modifiez les questions du quiz dans `prisma/seed.ts`
- Ajoutez des jobs, tags, ou enrichissez le matching dans le backend
- Étendez le front pour afficher les candidatures, etc.

---

## 🤝 Contribution
Pull requests et suggestions bienvenues !

---

## 📧 Contact
Pour toute question, ouvrez une issue ou contactez l'auteur du repo.
