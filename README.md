# ⚡ MetaConvert

**La plateforme ultime de conversion et d'édition de fichiers, boostée par le Cloud.**

![MetaConvert Banner](public/logo.png)

MetaConvert est une suite d'outils web tout-en-un conçue pour simplifier la gestion de vos assets numériques. Convertissez, éditez, sécurisez et partagez vos fichiers sans limite, le tout dans une interface moderne et fluide.

---

## 🚀 Fonctionnalités Clés

### 🎨 Traitement d'Image
- **Conversion Universelle** : Support de +20 formats (PNG, WEBP, AVIF, HEIC, PSD, RAW...).
- **Édition Visuelle** : Recadrage, rotation et redimensionnement directement dans le navigateur.
- **Upscaling** : Agrandissement intelligent (2x, 4x) sans perte de qualité.
- **Nettoyage** : Suppression des métadonnées (EXIF/GPS) pour la confidentialité.

### 📄 PDF Weaver & Outils
- **PDF Weaver** : Éditeur visuel en glisser-déposer pour fusionner, diviser et réorganiser vos pages PDF.
- **Conversion** : PDF vers Images (PNG, JPG, WebP) ou Texte.
- **Optimisation** : Compression et sécurisation.

### 🎥 Vidéo & Audio
- **Spectrogramme** : Transformez vos audios en vidéos avec ondes sonores animées.
- **Web Downloader** : Téléchargez vidéos et audios depuis YouTube, TikTok, Vimeo (MP4/MP3).
- **Conversion & Extraction** : Changez de format ou extrayez la piste son d'une vidéo.
- **GIF Maker** : Créez des GIFs fluides à partir de vos vidéos.

### ☁️ Cloud & Partage (MetaVault)
- **Stockage Personnel** : Historique complet de vos conversions avec prévisualisation.
- **MetaVault** : Créez des archives ZIP chiffrées (AES-256) pour vos données sensibles.
- **Liens de Dépôt** : Créez des liens publics sécurisés pour recevoir des fichiers de vos contacts.
- **Partage Éphémère** : Générez des liens de téléchargement temporaires avec QR Code intégré.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router)
- **Langage** : TypeScript
- **Style** : [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **Base de Données** : PostgreSQL (via [Neon](https://neon.tech/)) + [Drizzle ORM](https://orm.drizzle.team/)
- **Auth** : [Better Auth](https://www.better-auth.com/)
- **Traitement** : 
  - `ffmpeg` (Vidéo/Audio)
  - `sharp` (Image)
  - `pdf-lib` & `pdfjs-dist` (PDF)
  - `puppeteer` (Capture Web)
  - `yt-dlp` (Téléchargement Web)

---

## 📦 Installation Locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Lockxii/MetaConvert.git
   cd MetaConvert
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   Créez un fichier `.env.local` à la racine :
   ```env
   DATABASE_URL="votre_url_postgres_neon"
   BETTER_AUTH_SECRET="votre_secret_genere"
   # Optionnel en dev
   # BETTER_AUTH_URL="http://localhost:3000" 
   ```

4. **Lancer la base de données**
   ```bash
   npm run db:push
   ```

5. **Démarrer le serveur**
   ```bash
   npm run dev
   ```

---

## 🚀 Déploiement (Vercel)

Ce projet est optimisé pour un déploiement sur [Vercel](https://vercel.com/).

1. Connectez votre repo GitHub à Vercel.
2. Ajoutez les variables d'environnement (`DATABASE_URL`, `BETTER_AUTH_SECRET`).
3. **Important** : Ne définissez PAS `BETTER_AUTH_URL` ou `NEXT_PUBLIC_APP_URL` sur Vercel, l'application détecte automatiquement son domaine.
4. Déployez !

---

## 🛡️ Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

*Développé avec ❤️ par Arthur.*