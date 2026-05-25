# PWA VinEye (export web Expo) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer l'app Expo VinEye en PWA installable (MVP scanner) via `expo export -p web`, en branchant le scanner sur l'endpoint serveur `/api/mobile/predict`, sans toucher au comportement natif.

**Architecture:** On s'appuie sur la résolution de fichiers par plateforme de Metro (`*.web.ts(x)`) pour fournir des variants web isolés (inférence distante, stub carte) ; le natif reste inchangé. On masque l'onglet Map sur web et on ajoute un packaging PWA (manifest + service worker).

**Tech Stack:** Expo SDK 54, React Native + react-native-web, React Navigation v7, expo-camera (getUserMedia sur web), expo-image-manipulator, l'API client existant (`apiPost`).

**Spec :** `docs/superpowers/specs/2026-05-25-pwa-vineye-web-export-design.md`

---

## Notes d'exécution importantes

- **Toutes les commandes s'exécutent depuis `VinEye/`** (pas la racine monorepo). Package manager : **pnpm**.
- **Pas de test runner dans VinEye** (aucun jest/vitest). Vérification = **typecheck** (`pnpm exec tsc --noEmit`) + **build web** (`npx expo export -p web`) + **test manuel navigateur**. La seule logique pure (`predictionToDetection`) est isolée et revue à la lecture. (Mettre en place un runner contredirait l'objectif d'effort minimal.)
- **Non-régression mobile** : les fichiers `.web.*` ne sont chargés que sur web → le natif n'est pas affecté. Ne jamais modifier les fichiers natifs `model.ts` / `MapView.tsx`.

## File Structure

| Fichier | Action | Responsabilité |
|---|---|---|
| `VinEye/src/services/tflite/model.web.ts` | Créer | Inférence web via `/api/mobile/predict` (même interface que `model.ts`) |
| `VinEye/src/components/map/MapView.web.tsx` | Créer | Stub carte (mêmes exports que `MapView.tsx`) — évite de bundler `react-native-webview` sur web |
| `VinEye/src/navigation/BottomTabNavigator.tsx` | Modifier | Masquer l'onglet Map quand `Platform.OS === "web"` |
| `VinEye/src/pwa/registerPWA.ts` | Créer | No-op natif |
| `VinEye/src/pwa/registerPWA.web.ts` | Créer | Injecte `<link rel="manifest">` + enregistre le service worker |
| `VinEye/App.tsx` | Modifier | Appelle `registerPWA()` au montage |
| `VinEye/public/manifest.json` | Créer | Manifest PWA |
| `VinEye/public/sw.js` | Créer | Service worker minimal (app-shell) |
| `VinEye/public/pwa-icon.png` | Créer | Icône PWA (copie de `src/assets/images/icon.png`) |
| `VinEye/PWA.md` | Créer | Doc build + déploiement Vercel |
| `CHANGELOG.md` (racine) | Modifier | Entrée `[Unreleased]` |

---

## Task 1: `model.web.ts` — inférence web via `/predict`

**Files:**
- Create: `VinEye/src/services/tflite/model.web.ts`

> Doit exposer EXACTEMENT la même interface que `model.ts` : `loadModel(): Promise<boolean>` et `runInference(imageUri?: string): Promise<Detection>` (importés par `useDetection.ts` et le préchargement du Scanner). Le serveur renvoie déjà `status/class/slug/confidence/probabilities` — pas de seuils à réappliquer côté client.

- [ ] **Step 1: Créer le fichier**

```ts
// Variant WEB de model.ts : pas de TFLite natif sur navigateur. L'inférence
// est déléguée à l'endpoint serveur POST /api/mobile/predict. Même interface
// publique que model.ts (loadModel, runInference) pour que useDetection et le
// Scanner fonctionnent sans changement.
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import type { Detection, ClassProbability, DiseaseClass } from '@/types/detection';
import { ML_CLASSES } from '@/services/ml/classes';
import { apiPost } from '@/services/api/client';

const MODEL_INPUT_SIZE = 224;

interface ServerPrediction {
  status: 'vine' | 'uncertain' | 'not_vine';
  class: DiseaseClass;
  slug: string | null;
  confidence: number; // 0..1
  probabilities: Record<DiseaseClass, number>;
}

// Aucun modèle local à charger sur web : l'inférence est distante.
export async function loadModel(): Promise<boolean> {
  return true;
}

/** Mappe la réponse serveur vers le type Detection (convention projet : confidence 0-100). */
export function predictionToDetection(
  p: ServerPrediction,
  imageUri: string | undefined,
  timestamp: number,
): Detection {
  const allProbabilities: ClassProbability[] = ML_CLASSES.map((cls) => ({
    class: cls,
    probability: p.probabilities?.[cls] ?? 0,
  }));
  return {
    result: p.status,
    confidence: Math.round((p.confidence ?? 0) * 100),
    diseaseClass: p.class,
    diseaseSlug: p.slug ?? undefined,
    allProbabilities,
    timestamp,
    imageUri,
  };
}

export async function runInference(imageUri?: string): Promise<Detection> {
  const timestamp = Date.now();

  if (!imageUri) {
    return predictionToDetection(
      {
        status: 'not_vine',
        class: 'healthy',
        slug: null,
        confidence: 0,
        probabilities: { healthy: 0, black_rot: 0, esca: 0, leaf_blight: 0 },
      },
      undefined,
      timestamp,
    );
  }

  // Redimensionne à 224² + base64 (expo-image-manipulator fonctionne sur web).
  const resized = await manipulateAsync(
    imageUri,
    [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
    { format: SaveFormat.JPEG, base64: true, compress: 0.85 },
  );
  if (!resized.base64) {
    throw new Error('Image manipulation did not return base64');
  }
  const dataUri = `data:image/jpeg;base64,${resized.base64}`;

  const res = await apiPost<{ prediction: ServerPrediction }>(
    '/predict',
    { image: dataUri },
    { raw: true },
  );
  if (!res.success) {
    throw new Error(res.error.message || 'Inference request failed');
  }

  return predictionToDetection(res.data.prediction, imageUri, timestamp);
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run (depuis `VinEye/`): `pnpm exec tsc --noEmit`
Expected: aucune erreur liée à `model.web.ts`. (Confirme que les imports `@/types/detection`, `@/services/ml/classes`, `@/services/api/client` et la signature `apiPost(endpoint, body, { raw })` matchent.)

- [ ] **Step 3: Commit**

```bash
git add src/services/tflite/model.web.ts
git commit -m "feat(pwa): web inference via /api/mobile/predict (model.web.ts)"
```

---

## Task 2: `MapView.web.tsx` — stub carte

**Files:**
- Create: `VinEye/src/components/map/MapView.web.tsx`

> Doit ré-exporter les mêmes noms que `MapView.tsx` (`VineyardMapView`, `MapRegion`, `UserLocation`, `VineyardMapHandle`) pour que `MapScreen.tsx` compile sur web sans importer `react-native-webview`.

- [ ] **Step 1: Créer le fichier**

```tsx
// Variant WEB de MapView.tsx : react-native-webview ne tourne pas sur web et
// la Map est masquée (cf. BottomTabNavigator). Ce stub fournit la même API
// publique pour que MapScreen compile, et affiche un placeholder.
import { forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';

import type { ScanRecord } from '@/types/detection';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface VineyardMapHandle {
  animateToRegion: (region: MapRegion, durationMs?: number) => void;
  highlightGeoJSON: (geojson: object | null) => void;
  setUserLocation: (location: UserLocation | null) => void;
}

interface VineyardMapViewProps {
  scans: ScanRecord[];
  initialRegion: MapRegion;
  onScanPress?: (scan: ScanRecord) => void;
}

export const VineyardMapView = forwardRef<VineyardMapHandle, VineyardMapViewProps>(
  function VineyardMapView(_props, ref) {
    useImperativeHandle(
      ref,
      () => ({
        animateToRegion() {},
        highlightGeoJSON() {},
        setUserLocation() {},
      }),
      [],
    );

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F5F5',
        }}
      >
        <Text style={{ color: '#8E8E93' }}>Carte indisponible sur le web</Text>
      </View>
    );
  },
);
```

- [ ] **Step 2: Vérifier le typecheck**

Run (depuis `VinEye/`): `pnpm exec tsc --noEmit`
Expected: aucune erreur. Les noms exportés correspondent à `MapView.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/map/MapView.web.tsx
git commit -m "feat(pwa): web stub for MapView (avoid bundling webview)"
```

---

## Task 3: Masquer l'onglet Map sur web

**Files:**
- Modify: `VinEye/src/navigation/BottomTabNavigator.tsx`

- [ ] **Step 1: Conditionner l'onglet Map**

Dans `BottomTabNavigator.tsx`, remplacer le bloc :
```tsx
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarLabel: t("common.map") }}
      />
```
par :
```tsx
      {Platform.OS !== "web" && (
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{ tabBarLabel: t("common.map") }}
        />
      )}
```
(`Platform` est déjà importé en haut du fichier : `import { ..., Platform } from "react-native";`.)

- [ ] **Step 2: Vérifier le typecheck**

Run (depuis `VinEye/`): `pnpm exec tsc --noEmit`
Expected: aucune erreur. (React Navigation accepte un enfant `false`.)

- [ ] **Step 3: Commit**

```bash
git add src/navigation/BottomTabNavigator.tsx
git commit -m "feat(pwa): hide Map tab on web"
```

---

## Task 4: Packaging PWA (manifest + service worker + enregistrement)

**Files:**
- Create: `VinEye/src/pwa/registerPWA.ts`
- Create: `VinEye/src/pwa/registerPWA.web.ts`
- Create: `VinEye/public/manifest.json`
- Create: `VinEye/public/sw.js`
- Create: `VinEye/public/pwa-icon.png` (copie de `src/assets/images/icon.png`)
- Modify: `VinEye/App.tsx`

- [ ] **Step 1: Créer le no-op natif**

Create `VinEye/src/pwa/registerPWA.ts` :
```ts
// Natif : rien à faire (PWA = web only). Le variant .web fait le vrai travail.
export function registerPWA(): void {}
```

- [ ] **Step 2: Créer le variant web**

Create `VinEye/src/pwa/registerPWA.web.ts` :
```ts
// Web : injecte le lien manifest dans le <head> et enregistre le service worker.
// Appelé une fois au montage de l'app (App.tsx).
export function registerPWA(): void {
  if (typeof document !== 'undefined' && !document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // enregistrement best-effort : ne jamais casser l'app si le SW échoue
      });
    });
  }
}
```

- [ ] **Step 3: Créer le manifest**

Create `VinEye/public/manifest.json` :
```json
{
  "name": "VinEye — Détection maladies de la vigne",
  "short_name": "VinEye",
  "description": "Scannez vos feuilles de vigne et identifiez les maladies.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2D6A4F",
  "icons": [
    {
      "src": "/pwa-icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 4: Créer le service worker minimal**

Create `VinEye/public/sw.js` :
```js
// Service worker minimal : pré-cache l'app-shell pour l'installabilité + un
// chargement rapide. Stratégie cache-first sur les GET same-origin, réseau
// pour le reste (notamment les appels API cross-origin vers vineye-api).
const CACHE = 'vineye-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.json'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return; // laisse passer les requêtes API cross-origin / non-GET
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
```

- [ ] **Step 5: Copier l'icône PWA**

Run (depuis `VinEye/`):
```bash
cp src/assets/images/icon.png public/pwa-icon.png
```
Expected: `public/pwa-icon.png` existe. (icon.png Expo est ≥512px → satisfait l'installabilité.)

- [ ] **Step 6: Brancher `registerPWA()` dans App.tsx**

Dans `VinEye/App.tsx`, ajouter l'import (avec les autres imports `@/...`) :
```tsx
import { registerPWA } from '@/pwa/registerPWA';
```
puis appeler dans le `useEffect` existant :
```tsx
  useEffect(() => {
    registerPWA();
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, []);
```

- [ ] **Step 7: Vérifier le typecheck**

Run (depuis `VinEye/`): `pnpm exec tsc --noEmit`
Expected: aucune erreur (Metro résout `registerPWA.web.ts` sur web, `.ts` sur natif ; les deux exportent `registerPWA(): void`).

- [ ] **Step 8: Commit**

```bash
git add src/pwa/registerPWA.ts src/pwa/registerPWA.web.ts public/manifest.json public/sw.js public/pwa-icon.png App.tsx
git commit -m "feat(pwa): manifest + service worker + registration"
```

---

## Task 5: Build web + correction des incompat react-native-web

**Files:** (corrections au cas par cas selon les erreurs du build)

- [ ] **Step 1: Lancer l'export web**

Run (depuis `VinEye/`): `npx expo export -p web`
Expected: build réussi, dossier `dist/` produit avec `index.html`, le bundle JS, et les fichiers de `public/` (`manifest.json`, `sw.js`, `pwa-icon.png`) copiés à la racine de `dist/`.

- [ ] **Step 2: Diagnostiquer les erreurs de build éventuelles**

Si le build échoue, traiter selon le module fautif :
- **`react-native-fast-tflite` / `react-native-nitro-modules` dans le bundle** → vérifier que `model.web.ts` existe et masque bien `model.ts` (aucun autre fichier ne doit importer `react-native-fast-tflite` directement hors `model.ts`). Grep : `rg "react-native-fast-tflite" src`.
- **`react-native-webview`** → vérifier que `MapView.web.tsx` existe ; grep `rg "react-native-webview" src` ne doit rien donner d'autre que `MapView.tsx`.
- **`lottie-react-native`** (SplashScreen) → si erreur de build/render web, créer un variant web du composant qui l'utilise (ex. `SplashScreen.web.tsx`) affichant une image statique au lieu de l'animation Lottie. (Garder le natif inchangé.)
- Toute autre lib native sans support web → créer un `.web.tsx` stub du composant consommateur.

- [ ] **Step 3: Vérifier le contenu du build**

Run (depuis `VinEye/`):
```bash
ls dist/manifest.json dist/sw.js dist/pwa-icon.png dist/index.html
```
Expected: les 4 fichiers existent.

- [ ] **Step 4: Test manuel en local**

Run (depuis `VinEye/`): `npx expo start --web`
Vérifier dans le navigateur :
- L'app charge, l'onglet **Map est absent**, les 4 autres onglets présents.
- Maladies/Guides : les listes se chargent (appels `/api/mobile/diseases|guides`).
- Scanner : la caméra demande la permission (sur `localhost`, OK sans HTTPS) ; après capture, un appel `POST /api/mobile/predict` part (vérifier l'onglet Réseau) et le ResultScreen s'affiche avec une classe.
> Note : si l'API prod bloque CORS depuis `localhost`, c'est attendu — le middleware met `ACAO: *`, donc ça doit passer. Sinon, tester contre le backend local (`pnpm dev` dans vineye-admin) en mode `__DEV__`.

- [ ] **Step 5: Commit (si des correctifs de compat ont été ajoutés)**

```bash
git add -A
git commit -m "fix(pwa): web compat fixes for expo export"
```
(Si aucun correctif nécessaire, sauter ce commit.)

---

## Task 6: Documentation déploiement + CHANGELOG

**Files:**
- Create: `VinEye/PWA.md`
- Modify: `CHANGELOG.md` (racine)

- [ ] **Step 1: Doc PWA**

Create `VinEye/PWA.md` :
```markdown
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
```

- [ ] **Step 2: CHANGELOG**

Dans `CHANGELOG.md` (racine), sous `## [Unreleased]` → `### Ajouté` :
```markdown
- **PWA VinEye** : export web de l'app Expo (MVP scanner). Inférence via `/api/mobile/predict`, carte masquée sur web, mode invité, manifest + service worker. Déploiement Vercel statique (`VinEye/PWA.md`).
```

- [ ] **Step 3: Commit**

```bash
git add VinEye/PWA.md CHANGELOG.md
git commit -m "docs(pwa): build + Vercel deploy guide + changelog"
```

---

## Self-review effectuée
- **Couverture spec** : inférence web §5→T1, stub carte §4→T2, onglet Map §4→T3, PWA manifest/SW §6→T4, build/compat §10→T5, hébergement §7 + scope→T6. tokenStorage : pas de task (gère déjà le web via AsyncStorage). ✓
- **Interfaces** : `model.web.ts` expose `loadModel`/`runInference` (= `model.ts`) ; `MapView.web.tsx` ré-exporte `VineyardMapView`/`MapRegion`/`UserLocation`/`VineyardMapHandle` ; `registerPWA(): void` dans les 2 variants. ✓
- **Types** : `Detection` (result/confidence 0-100/diseaseClass/diseaseSlug/allProbabilities/timestamp/imageUri), `DiseaseClass`, `ML_CLASSES` cohérents avec `src/types/detection.ts` et `src/services/ml/classes.ts`. ✓
