# Entraîneurs

Socle de départ du projet, repris d'AmiliaBaseball sans son domaine (Amilia, conflits, audit) : comptes et rôles, authentification Firebase, envoi de courriels par SMTP.

| Dossier | Rôle |
|---|---|
| `backend/` | API Node.js 22 (ESM) / Express / Sequelize / PostgreSQL |
| `frontend/` | Application Angular 21 (composants autonomes, signals) |

## Mise en route

### 1. Firebase (une fois)

Le projet a besoin de son propre projet Firebase, avec la connexion **Courriel/Mot de passe** activée dans Authentication.

- Backend : déposer le JSON du service account dans `backend/firebaseConfig/` et mettre son nom dans `FIREBASE_CREDENTIAL_FILE`.
- Frontend : coller la configuration web dans `frontend/src/environments/environment.development.ts` et `environment.ts`.

Sans Firebase, le backend démarre quand même (`/api/health` répond) et la page de connexion affiche un avertissement.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # puis remplir DB_USER, DB_PW, FIREBASE_CREDENTIAL_FILE
createdb entraineurs        # ou créer la base autrement
npm run migrate
npm run dev                 # http://localhost:5030/api/health
```

### 3. Frontend

```bash
cd frontend
npm install
npm start                   # http://localhost:4200, API sur http://localhost:5030/api
```

### 4. Premier administrateur

Créer un compte dans la console Firebase (Authentication → Ajouter un utilisateur), se connecter une fois dans l'application (le compte reçoit le rôle `user`, sans accès : page « Compte en attente d'approbation »), puis :

```bash
cd backend
npm run set-admin -- courriel@exemple.com
```

Les comptes suivants se créent dans Paramètres › Utilisateurs.

## Commandes du backend

| Commande | Effet |
|---|---|
| `npm run dev` / `npm start` | Serveur avec ou sans rechargement |
| `npm run migrate` / `migrate:undo` | Applique ou annule la dernière migration |
| `npm run migration:create -- nom` | Nouvelle migration (la renommer en `.cjs`) |
| `npm run set-admin` | Liste les utilisateurs ; avec un courriel, le promeut administrateur |
| `npm test` | Tests unitaires ; tests d'intégration aussi si `TEST_DB_NAME` est défini (base dont le nom finit par `_test`) |
| `npm run lint` | ESLint |

## Ce que contient le socle

### Comptes et rôles

| Rôle | Accès |
|---|---|
| `admin` | Tout, dont Paramètres (utilisateurs, courriel) |
| `manager` | L'application, sans Paramètres |
| `user` | Aucun : rôle d'un compte qui vient de se connecter pour la première fois |

Les rôles sont définis dans `backend/src/components/user/user.constants.js` et, en miroir, dans `frontend/src/app/core/models/user.model.ts`. À adapter au domaine (ex. ajouter un rôle entraîneur) aux deux endroits.

| Route | Accès | Effet |
|---|---|---|
| `GET /api/health` | public | État du serveur et de la base |
| `GET /api/user/me` | connecté | Profil ; crée la ligne `Users` à la première connexion |
| `GET /api/user` | admin | Liste, filtre `?role=` |
| `POST /api/user` | admin | Crée le compte Firebase et la ligne `Users`, courriel de bienvenue facultatif |
| `PUT /api/user/:id/role` | admin | Change le rôle (pas le sien, pas le dernier admin) |
| `PUT /api/user/:id/password` | admin | Remplace le mot de passe, avis par courriel facultatif |
| `GET /api/mail/status` | admin | État du mailer, sans aucun secret |
| `POST /api/mail/test` | admin | Courriel de test, 5 par minute |

### Courriels

Tout envoi passe par un seul point d'entrée :

```js
import { getEmailProvider } from "../../notifications/providerFactory.js";

await getEmailProvider().send({ to, subject, html, text, replyTo, attachments });
```

- `SMTP_HOST` vide : rien ne part, chaque courriel est journalisé (`[DRY-RUN EMAIL]`).
- `SMTP_*` remplis : envoi réel par nodemailer. `SMTP_SECURE=true` seulement pour le port 465.
- `EMAIL_DRY_RUN=true` : journalisation seulement, même avec SMTP configuré. À garder en développement dès que la base contient de vraies adresses.

Paramètres › Courriel montre l'état et envoie un courriel de test. Un nouveau gabarit se crée dans `backend/src/notifications/` sur le modèle de `TestEmailBuilder.js` : il retourne `{ subject, html, text }`, utilise `wrapEmailHtml` et échappe toute valeur saisie avec `escapeHtml`.

## Ajouter une fonctionnalité

Backend : un dossier `src/components/<nom>/` avec `<nom>.model.js` (chargé automatiquement), `<nom>.service.js`, `<nom>.controller.js` (qui exporte `{ routes: [...] }`), une ligne dans `src/routes/Routes.js` et une migration. Une route est protégée par défaut (`authRequired: true`) ; le rôle se vérifie avec `requireRole(...)`.

Frontend : un modèle dans `core/models/`, un service dans `core/services/` (promesses, via `ApiService`), une page dans `pages/admin/<nom>/`, une route dans `app.routes.ts` et une entrée dans `NAV_ITEMS` (`admin-shell.ts`).

## À faire avant la production

- Remplacer l'identité provisoire : monogramme dans `frontend/src/app/shared/brand/brand.ts`, couleurs dans `frontend/src/styles.scss` (`--color-primary`, `--color-accent`) et `BRAND_COLOR` dans `backend/src/notifications/emailFormat.js`.
- Régler `PUBLIC_BASE_URL` (liens des courriels), `apiUrl` dans `environment.ts`, et `DB_SSL=true` pour un Postgres géré.
- Restreindre CORS à l'adresse du frontend (`backend/src/server/express/expressServer.js` accepte toutes les origines).
