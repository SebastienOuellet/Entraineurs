# Entraîneurs

Lire `README.md` d'abord : mise en route, routes, mailer, marche à suivre pour une nouvelle fonctionnalité.

## Conventions

- Français partout : interface, messages d'erreur, commentaires, noms de tests.
- Backend : Node 22, ESM, Express 4, Sequelize 6, PostgreSQL. Colonnes en PascalCase (`Id`, `Email`, `Role`). Un dossier par fonctionnalité dans `backend/src/components/`. Erreurs typées de `src/errors/Errors.js`, jamais de `res.status(...)` dans un service. Config lue par `ConfigService`, toute nouvelle variable passe par `src/config/default.js` et `.env.example`.
- Schéma : par migrations seulement (`backend/migrations/*.cjs`), jamais `sequelize.sync`.
- Frontend : Angular 21, composants autonomes, signals dans les composants, services qui retournent des promesses via `ApiService`. Styles partagés dans `src/styles.scss` avant d'en créer dans un composant.
- Courriels : toujours par `getEmailProvider()`, valeurs saisies échappées avec `escapeHtml`.
- Guillemets doubles et point-virgule (ESLint côté backend).

## Avant de conclure un changement

```bash
cd backend && npm run lint && npm test
cd frontend && npx ng build && npx ng test --watch=false
```

Les tests d'intégration du backend demandent `TEST_DB_NAME` dans `backend/.env` ; sans lui, ils sont sautés sans échec.

## À ne pas faire

- Ne jamais versionner `backend/.env` ni un fichier de `backend/firebaseConfig/` autre que son README.
- Ne pas envoyer de vrais courriels depuis un poste de développement : `EMAIL_DRY_RUN=true`.
