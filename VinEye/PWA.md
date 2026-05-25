# VinEye PWA (export web)

L'app Expo s'exporte en PWA statique. Le natif n'est pas affecté (variants `*.web.*`).

## Build local
```bash
cd VinEye
npx expo export -p web      # → dist/
npx expo start --web        # dev serveur
```

## Déploiement Vercel (projet statique séparé)
- Add New Project → import `yanisyano05/Grapevine_Disease_Detection`
- **Root Directory** : `VinEye`
- **Build Command** : `npx expo export -p web`
- **Output Directory** : `dist`
- **Install Command** : `pnpm install`
- Domaine : `vineye.yuxdev.fr` (CNAME Vercel, SSL auto). L'API reste `vineye-api.yuxdev.fr`.
- Aucune variable d'env (PWA statique, appelle l'API publique `/api/mobile/*`).

## Spécificités web
- Inférence : `model.web.ts` → POST `/api/mobile/predict` (TFLite natif non dispo sur web).
- Carte : masquée (`react-native-webview` non supporté web).
- Auth : invité only sur web (MVP).
- Caméra : `getUserMedia`, nécessite HTTPS (OK en prod).
