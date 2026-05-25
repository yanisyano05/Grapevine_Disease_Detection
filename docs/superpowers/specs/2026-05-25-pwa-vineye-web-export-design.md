# Design — PWA VinEye (export web Expo)

**Date** : 2026-05-25
**Statut** : Validé (en attente relecture)
**Cible** : `VinEye/` (Expo SDK 54 / React Native + react-native-web), déployé en PWA statique sur Vercel

---

## 1. Contexte & objectif

VinEye est une app mobile Expo (détection de maladies de la vigne). On veut une **PWA** réutilisant
un maximum de l'app existante, sans réécriture. L'endpoint serveur `POST /api/mobile/predict`
(livré précédemment dans `vineye-admin`) permet de faire l'inférence côté serveur sur web, là où
le TFLite natif ne tourne pas.

Contrainte produit : **effort minimal** — garder l'app Expo, l'exporter en web.

---

## 2. Décisions cadrées

| # | Décision | Choix |
|---|----------|-------|
| 1 | Approche | **Export web de l'app Expo** (`expo export -p web`). Écarté : projet Next.js PWA dédié (réécriture complète). |
| 2 | Périmètre | **MVP scanner-centré** : Home + Scanner→/predict→Result + Maladies/Guides (+ détails). |
| 3 | Map | **Masquée sur web** (onglet retiré ; `react-native-webview` ne tourne pas sur web). |
| 4 | Auth | **Invité only** sur web (pas de login, pas de shim token actif, pas de `BannedModal`). |
| 5 | Isolation web | **Fichiers `*.web.ts(x)`** (résolution par plateforme de Metro) → natif **inchangé**, zéro régression mobile. |
| 6 | PWA | Manifest installable + **service worker léger** (cache app-shell). Pas d'offline data (connexion supposée présente). |
| 7 | Hébergement | Nouveau projet **Vercel** statique (Root = `VinEye`, build `expo export -p web`, output `dist/`). Domaine suggéré `vineye.yuxdev.fr`. |

---

## 3. Principe d'architecture

L'app Expo reste **identique pour le natif**. Pour le web, on s'appuie sur la **résolution de
fichiers par plateforme de Metro** : un fichier `foo.web.ts` est automatiquement préféré à `foo.ts`
quand la cible est le web, et ignoré sur natif. On ajoute donc **3 overrides web** + un filtre
d'onglet, sans toucher aux fichiers natifs existants.

Bénéfice : les modules natifs incompatibles web (`react-native-fast-tflite`, `react-native-webview`,
`expo-secure-store`) **n'apparaissent jamais dans le bundle web** (le `.web` les remplace), donc le
build web ne casse pas.

---

## 4. Les 3 overrides web + filtre onglet

| Fichier natif (inchangé) | Override web (nouveau) | Rôle |
|---|---|---|
| `src/services/tflite/model.ts` | `src/services/tflite/model.web.ts` | Implémente la **même interface** (`loadModel()`, `runInference(uri)`) mais POST l'image à `/api/mobile/predict` et mappe `{ prediction }` → `Detection`. |
| `src/services/auth/tokenStorage.ts` | `src/services/auth/tokenStorage.web.ts` | Stub `localStorage` (get/set/clear). En invité, le token reste `null` ; évite surtout que `expo-secure-store` soit bundlé sur web. |
| `src/components/map/MapView.tsx` | `src/components/map/MapView.web.tsx` | Stub léger (placeholder), car la Map est masquée sur web. Évite que `react-native-webview` soit bundlé. |

**Filtre onglet** : dans `src/navigation/BottomTabNavigator`, retirer l'onglet **Map** quand
`Platform.OS === "web"` (les 4 autres onglets restent : Home, Guides, Scanner FAB, Library).

---

## 5. Flux scanner sur web

```
ScannerScreen (expo-camera → getUserMedia, HTTPS requis)
  └─ cameraRef.takePictureAsync() → uri
     └─ useDetection.analyze(uri) → runInference(uri)   [résolu vers model.web.ts sur web]
        └─ expo-image-manipulator: resize 224×224 + JPEG base64
           └─ POST {API_CONFIG.baseUrl}/predict  { image: "data:image/jpeg;base64,..." }
              (CORS déjà ouvert : le middleware met `Access-Control-Allow-Origin: *` sur /api/mobile/*)
           └─ réponse { prediction: { status, class, slug, confidence, probabilities } }
              └─ map → Detection (result=status, confidence×100, diseaseClass=class,
                       diseaseSlug=slug, allProbabilities depuis probabilities)
              └─ ResultScreen (inchangé)
```

`API_CONFIG.baseUrl` vaut déjà `https://vineye-api.yuxdev.fr/api/mobile` en prod (`!__DEV__`).
Le `Detection` mappé respecte la convention projet (confidence 0–100) attendue par `ResultScreen`.

Home + Guides/Maladies + DiseaseDetail consomment déjà `/api/mobile/diseases|guides` en public →
fonctionnent tels quels sur web.

---

## 6. Packaging PWA

- `VinEye/public/manifest.json` : `name`, `short_name`, icônes (depuis `src/assets/images/`),
  `display: "standalone"`, `theme_color`, `background_color`, `start_url: "/"`.
- **Service worker léger** : cache de l'app-shell (HTML + JS/CSS statiques) pour l'installabilité et
  un chargement rapide. Pas de cache des réponses API.
- Lien du manifest + enregistrement du SW injectés dans le HTML d'export (`app.json` web favicon est
  déjà présent ; ajouter manifest/SW).

---

## 7. Hébergement & déploiement

Nouveau projet **Vercel** :
- Root Directory : `VinEye`
- Build Command : `npx expo export -p web`
- Output Directory : `dist`
- Install : `pnpm install`
- Domaine : `vineye.yuxdev.fr` (CNAME Vercel ; SSL auto). L'API reste `vineye-api.yuxdev.fr`.

Aucune variable d'env requise (la PWA est statique et appelle l'API publique).

---

## 8. Périmètre (scope)

**Inclus (v1)** : Home, Scanner→/predict→Result, Maladies/Guides + détails, manifest + SW, déploiement Vercel.

**Hors-scope (YAGNI v1)** :
- Map (masquée sur web).
- Auth / login / profil / gamification avancés.
- Offline data, persistance des scans (`/scans` non appelé en invité).
- Multi-device sync, notifications.

---

## 9. Fichiers (création / modification)

| Fichier | Action |
|---|---|
| `VinEye/src/services/tflite/model.web.ts` | Créer (inférence via `/predict`) |
| `VinEye/src/services/auth/tokenStorage.web.ts` | Créer (stub localStorage) |
| `VinEye/src/components/map/MapView.web.tsx` | Créer (stub) |
| `VinEye/src/navigation/BottomTabNavigator.*` | Modifier (masquer onglet Map sur web) |
| `VinEye/public/manifest.json` | Créer |
| service worker + injection HTML | Créer / configurer |
| `VinEye/app.json` (web) | Vérifier/compléter (favicon, name) |

---

## 10. Risques à vérifier en implémentation

1. **Caméra web** : `getUserMedia` exige HTTPS (OK en prod Vercel ; `localhost` toléré en dev).
   Gérer le refus de permission (message clair).
2. **Lottie** (`lottie-react-native` dans SplashScreen) : support web partiel → stub image statique
   sur web (`*.web`) si le build/render casse.
3. **react-native-web compat** : `@gorhom/bottom-sheet`, `reanimated v4`, `react-native-svg`,
   `react-native-gesture-handler` — à valider au premier `expo export -p web`. Corriger au cas par cas.
4. **Build web Metro** : confirmer que les `.web` masquent bien les libs natives (pas de
   `react-native-fast-tflite` / `webview` / `secure-store` dans le bundle web).

---

## 11. Tests

- **Build** : `expo export -p web` réussi, sans import de module natif incompatible.
- **Manuel** : caméra → capture → `/predict` → ResultScreen avec la bonne classe ; navigation
  Maladies/Guides + détails ; onglet Map absent sur web.
- **PWA** : Lighthouse — installable, manifest valide, SW enregistré.
- **Non-régression mobile** : l'app native build/tourne toujours (les `.web` ne l'affectent pas).
