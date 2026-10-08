# firebaseConfig

Déposez ici le fichier JSON du service account Firebase (Console Firebase → Paramètres du projet → Comptes de service → Générer une nouvelle clé privée).

Puis référencez son nom exact dans `backend/.env` :

```
FIREBASE_CREDENTIAL_FILE=votre-fichier-firebase-adminsdk.json
```

Ce fichier est une clé privée : tout le contenu de ce dossier est ignoré par git (voir `.gitignore` à la racine), sauf ce README.
