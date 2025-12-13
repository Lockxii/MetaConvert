# MetaConvert 🚀

![MetaConvert Banner](https://via.placeholder.com/1200x400.png?text=MetaConvert+Platform) 
*(Note: Replace with actual banner if available)*

**La plateforme tout-en-un pour convertir, compresser et optimiser vos fichiers numériques.**

MetaConvert est une application web moderne construite avec **Next.js**, **Tailwind CSS**, et **Node.js**, conçue pour offrir des outils puissants de traitement de fichiers (PDF, Images, Vidéo, Audio) avec une expérience utilisateur fluide et sécurisée.

---

## ✨ Fonctionnalités Principales

### 📄 Outils PDF
- **Fusionner** : Combinez plusieurs PDF en un seul fichier.
- **Diviser** : Extrayez des pages spécifiques d'un document.
- **Convertir** : Transformez vos PDF en Word (.txt) ou en Images (.png/.zip).
- **Compresser** : Réduisez la taille de vos documents.

### 🖼️ Outils Image
- **Conversion** : Supporte plus de 20 formats (PNG, JPG, WEBP, AVIF, TIFF, HEIC, etc.).
- **Compression** : Optimisez le poids de vos images sans perte de qualité visible.
- **Upscaling IA** : Améliorez la résolution de vos images (2x, 4x).
- **Rognage & Redimensionnement** : Ajustez vos visuels en quelques clics.

### 🎥 Outils Vidéo
- **Conversion** : Changez de format (MP4, AVI, MKV, WEBM, MOV).
- **Extraction Audio** : Récupérez la piste sonore (MP3) de vos vidéos.
- **Compression** : Réduisez la taille pour un partage facile.

### 🎵 Outils Audio
- **Conversion** : Convertissez entre MP3, WAV, AAC, OGG, FLAC.
- **Compression** : Optimisez vos fichiers audio.

### 🛠️ Dashboard & Utilisateur
- **Espace Personnel** : Suivi des conversions récentes.
- **Thème Sombre/Clair** : Interface adaptative selon vos préférences.
- **Authentification** : Gestion de compte sécurisée via Email/Mot de passe.

---

## 🛠️ Stack Technique

- **Frontend** : Next.js 14 (App Router), React, TypeScript.
- **Styling** : Tailwind CSS, Shadcn/UI (Radix UI), Lucide Icons, Framer Motion.
- **Backend** : Next.js API Routes (Serverless functions).
- **Processing** :
  - `sharp` (Images)
  - `ffmpeg-static` & `fluent-ffmpeg` (Vidéo/Audio)
  - `pdf-lib`, `pdf-parse`, `pdf-img-convert` (PDF)
- **Database** : PostgreSQL (NeonDB) avec Drizzle ORM.
- **Auth** : Better-Auth.
- **Deployment** : Vercel (Recommandé).

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Une base de données PostgreSQL (ex: NeonDB)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/metaconvert.git
cd metaconvert
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
Créez un fichier `.env.local` à la racine du projet et ajoutez les variables suivantes :

```env
# Base de données (NeonDB ou autre Postgres)
DATABASE_URL="postgres://user:password@host/dbname?sslmode=require"

# Authentification (Better Auth)
BETTER_AUTH_SECRET="votre_secret_super_securise"
BETTER_AUTH_URL="http://localhost:3000"

# (Optionnel) Configuration de stockage ou autres services
```

### 4. Initialiser la base de données
```bash
npm run db:generate
npm run db:migrate
```

### 5. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📂 Structure du Projet

```
src/
├── app/                 # Pages et Routes API (App Router)
│   ├── (app)/           # Routes protégées (Dashboard)
│   ├── (auth)/          # Routes d'authentification (Login/Signup)
│   ├── (marketing)/     # Pages publiques (Landing, Pricing...)
│   └── api/             # Endpoints API (Traitement fichiers, etc.)
├── components/          # Composants UI réutilisables
│   ├── ui/              # Composants Shadcn/UI (Button, Input...)
│   ├── layout/          # Sidebar, Navbar, Footer
│   └── dashboard/       # Composants spécifiques au dashboard
├── db/                  # Schéma de base de données (Drizzle)
├── lib/                 # Utilitaires et configuration (Auth, Utils)
└── hooks/               # Custom React Hooks
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues !
1.  Forkez le projet.
2.  Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`).
3.  Commitez vos changements (`git commit -m 'Add some AmazingFeature'`).
4.  Poussez vers la branche (`git push origin feature/AmazingFeature`).
5.  Ouvrez une Pull Request.

---

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

## 📞 Contact

Lien du projet : [https://github.com/votre-username/metaconvert](https://github.com/votre-username/metaconvert)