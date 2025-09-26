# 💬 Chat Front – Vue 3 + TypeScript + Vite

Un front-end **Vue 3** pour une application de messagerie avec **gestion d'identité cryptographique** (NaCl/tweetnacl), **Vue Router** et **Pinia**. Le projet inclut un **CSS global** prêt à modifier (`src/global.css`) pour personnaliser rapidement l'UI.

## ✨ Fonctionnalités clés

- 🔐 **Identité locale** (paires de clés signature + DH) et publication de la **clé publique** côté serveur.
- 🔑 **Auth** (login / register) via API REST (`/auth/*`) avec gestion de **Bearer token** et expiration.
- 💬 **Rooms & messages** : création de rooms privées (DM) et envoi de messages.
- 🧭 **Routing protégé** (guard) : accès aux vues uniquement si authentifié.
- 🧱 **State management avec Pinia** pour `auth`, `identity`, `users`, `rooms`, `message`.
- 🎨 **Style rapide** via `src/global.css` (moderne, propre). *Tailwind* est présent en dépendance mais **non configuré** par défaut (voir plus bas).

## 🗂️ Structure du projet

```
├── .vscode/
│   ├── extensions 2.json
│   └── extensions.json
├── public/
│   ├── vite 2.svg
│   └── vite.svg
├── src/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── identity.ts
│   │   ├── messages.ts
│   │   └── users.ts
│   ├── assets/
│   ├── router/
│   │   └── index.ts
│   ├── services/
│   │   ├── crypto.ts
│   │   └── ECC.ts
│   ├── store/
│   │   ├── auth.ts
│   │   ├── identity.ts
│   │   ├── message.ts
│   │   ├── rooms.ts
│   │   └── users.ts
│   ├── utils.ts/
│   │   └── Errors.ts
│   ├── variables/
│   │   └── variables.ts
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Message.vue
│   │   ├── Register.vue
│   │   └── Users.vue
│   ├── App.vue
│   ├── global.css
│   ├── main.ts
│   ├── style.css
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

> *Remarque :* `node_modules/` et `dist/` sont omis ici.

## 🧰 Stack & dépendances

- **Vue**: ^3.5.21 + **Vue Router**: ^4.5.1
- **Pinia**: ^3.0.3
- **Crypto**: tweetnacl (^1.0.3) + tweetnacl-util (^0.15.1)
- **Build**: Vite (^7.1.7) + TypeScript (~5.8.3) + vue-tsc (^3.0.7)

> **CSS** : `src/global.css` est importé dans `src/main.ts` et sera packagé dans `dist/`.  
> **Tailwind** est listé dans `devDependencies` mais **non initialisé** (pas de `tailwind.config.js` / `postcss.config.js`).

## 🔧 Prérequis

- **Node.js** 18+ recommandé
- **npm** (ou `pnpm`/`yarn` si vous préférez – scripts fournis pour `npm`)

## 🚀 Installation & démarrage

```bash
# 1) Installer les dépendances
npm install

# 2) Démarrer en dev (http://localhost:5173)
npm run dev
```

### Build production

```bash
npm run build
# Aperçu local du build
npm run preview
```

## 🔐 Configuration API (backend)

L’URL du backend est définie dans :
```
src/variables/variables.ts
```
Par défaut :
```ts
export const url = "http://10.152.131.56:80/"; // ou "http://localhost:8000/"
```
👉 **Pensez à l’adapter** (domaine/IP/port).

> **Astuce (amélioration possible)** : passer sur un `.env` Vite, ex. `VITE_API_BASE_URL`, et utiliser `import.meta.env.VITE_API_BASE_URL`.

## 🧭 Routage & vues

- `/login` – Connexion
- `/register` – Inscription
- `/` – **Home** (protégée)
- `/users` – Liste des utilisateurs (et clés publiques)
- `/messages` – Rooms + messages

Le guard redirige vers `/login` si `auth.isAuthenticated` est faux (`src/router/index.ts`).

## 🗝️ Identité & chiffrement (overview)

- Génération d’identité locale dans `src/services/crypto.ts` :  
  - **Signature**: paire `signPub` / `signPriv`  
  - **Échange (DH)**: paire `dhPub` / `dhPriv`
- Stockage local de l’identité (LocalStorage) via `useIdentityStore` (voir erreurs gérées dans `src/utils.ts/Errors.ts`).
- Publication de la **clé publique** vers le backend via `PUT /users/me/public_key` (`src/api/identity.ts`).
- Envoi de message : préparation d’un **payload chiffré** destiné au destinataire (`sendMessage(...)`), puis POST sur `rooms/{room}/messages` (`src/api/messages.ts`).

## 📡 API consommée (exemples)

- `POST /auth/login` – login → récupère `access_token`
- `POST /auth/register` – inscription
- `GET /users` – liste des utilisateurs + clés publiques
- `PUT /users/me/public_key` – enregistre votre clé publique
- `POST /rooms/open-dm/{userId}` – crée une room privée (DM)
- `GET /rooms/my-rooms` – liste vos rooms
- `POST /rooms/{room}/messages` – envoi d’un message

> Les appels sont faits en **`fetch`** avec header `Authorization: Bearer <token>` (voir `src/api/*`).

## 🎨 Personnalisation du style

Le fichier **`src/global.css`** centralise les styles (palette, boutons, cards, layout, etc.).  
Modifiez-le pour changer rapidement l’apparence. Il est importé dans `src/main.ts` et inclus dans `dist/` au build.

### (Optionnel) Activer TailwindCSS
Tailwind est installé mais **pas configuré**. Pour utiliser les classes utilitaires (comme `bg-blue-600` vues dans les templates), ajoutez :

```bash
npx tailwindcss init -p
```

`tailwind.config.js` :
```js
/** @type {{import('tailwindcss').Config}} */
export default {{
  content: ["./index.html","./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {{ extend: {{}} }},
  plugins: [],
}}
```

`src/global.css` en tête :
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

> Sans config Tailwind, les classes utilitaires présentes dans certains templates n’auront **aucun effet**.

## 🧪 Scripts disponibles

```json
{
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview"
}
```

## 🖥️ Déploiement avec Nginx (SPA)

1) Build :
```bash
npm run build
# le dossier dist/ est produit
```

2) Copier le build sur le serveur :
```bash
scp -r dist/* user@server:/var/www/chat_front/
```

3) Config Nginx (port 81 sans domaine, fallback SPA) :
```nginx
server {{
    listen 81;
    server_name _;

    root /var/www/chat_front;
    index index.html;

    access_log /var/log/nginx/chat_front_access.log;
    error_log  /var/log/nginx/chat_front_error.log;

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 256;
}}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
curl http://127.0.0.1:81   # doit retourner le HTML
```

### Logs utiles
```bash
# accès
sudo tail -f /var/log/nginx/chat_front_access.log
# erreurs
sudo tail -f /var/log/nginx/chat_front_error.log
```

## 🧩 Architecture (modules)

- `src/store/` – Pinia stores : `auth`, `identity`, `users`, `rooms`, `message`  
- `src/api/` – Fonctions d’accès HTTP
- `src/services/crypto.ts` – Génération de clés & payloads chiffrés (tweetnacl)
- `src/views/` – Pages (`Login`, `Register`, `Home`, `Users`, `Message`)
- `src/router/` – Routes + guard
- `src/global.css` – Styles globaux (packagé dans `dist/`)

## 🛡️ Sécurité & bonnes pratiques

- Ne **committez pas** d’`access_token` ni d’identité (`localStorage`) dans un dépôt public.
- Activez HTTPS (Let's Encrypt) côté Nginx dès que possible.
- **CORS** : assurez-vous que le backend autorise votre domaine (origin) si différent.
- **Secrets** : si vous passez à un `.env`, n’exposez que des `VITE_*` (build-time côté front).

## 🧰 Dépannage (FAQ)

**La page blanche en prod ?**  
- Vérifiez le `root` dans Nginx pointe bien vers `dist/` copié.
- Inspectez la console navigateur (404 sur `/assets/*` = mauvais `root` ou permissions).

**Routes en 404 côté Nginx ?**  
- Ajoutez `try_files $uri $uri/ /index.html;` (SPA fallback).

**Les classes `bg-blue-600` etc. n’ont aucun effet ?**  
- Tailwind n’est pas configuré. Suivez la section “Activer TailwindCSS”.

**401/403 sur l’API ?**  
- Le token a expiré / n’est pas passé. Vérifiez les headers et `auth.isAuthenticated`.

## 📄 Licence

MIT

---

> _README généré automatiquement à partir de la structure actuelle du projet pour correspondre au plus près à votre code._
