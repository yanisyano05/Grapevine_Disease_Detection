# VinEye

Application mobile React Native (Expo) de detection de maladies de la vigne.
Cible des amateurs de vin/jardinage. Scan par camera, identification de maladies, bibliotheque de cepages, gamification.

---

## Stack

| Couche | Technologies |
|--------|-------------|
| Framework | React Native + Expo SDK 54 (bare workflow) |
| Navigation | React Navigation v7 (NativeStack + BottomTabs) |
| Langage | TypeScript strict |
| Styling | **NativeWind v4** (Tailwind) prioritaire, StyleSheet pour ombres/gradients |
| Icones | **lucide-react-native** (bottom bar) + **Ionicons** (reste de l'app) |
| Animations | React Native Reanimated v4 |
| IA | `react-native-fast-tflite` (inférence on-device) avec fallback mock JS si module absent — voir `services/tflite/model.ts` |
| Persistance | AsyncStorage (offline-first) + SecureStore pour le token de session |
| Auth | Local-first (AsyncStorage) + sync best-effort vers `vineye-admin` via Bearer token (better-auth) |
| Backend sync | Push de scans best-effort vers `/api/mobile/scans` ; `BannedModal` non-dismissible si l'admin bannit |
| i18n | i18next + react-i18next (FR + EN) |
| Camera | expo-camera |
| Haptics | expo-haptics |
| Package manager | **pnpm** |

---

## Architecture

```
VinEye/
├── App.tsx
├── src/
│   ├── components/
│   │   ├── ui/                  # Text, Button, Card, Badge, ProgressCircle
│   │   ├── home/                # SearchHeader, SearchSection, HomeCta, FrequentDiseases,
│   │   │                        #   SeasonAlert, PracticalGuides, statssection, gamificationstat
│   │   │   └── components/      # homeheader (SectionHeader)
│   │   ├── scanner/             # DetectionFrame, CameraOverlay, ConfidenceMeter
│   │   ├── gamification/        # XPBar, BadgeCard, ProgressRing, LevelIndicator
│   │   └── history/             # ScanCard, ScanList
│   ├── data/                    # diseases.ts (7 maladies), guides.ts (3 guides)
│   ├── hooks/                   # useDetection, useGameProgress, useHistory
│   ├── i18n/                    # fr.json, en.json, index.ts
│   ├── navigation/              # RootNavigator, BottomTabNavigator, linking.ts
│   ├── screens/                 # 11 ecrans (voir Navigation)
│   ├── services/                # tflite/model.ts, storage.ts, haptics.ts
│   ├── theme/                   # colors.ts, typography.ts, spacing.ts
│   ├── types/                   # detection.ts, gamification.ts, navigation.ts
│   └── utils/                   # cepages.ts, achievements.ts
```

---

## Navigation

```
RootNavigator (NativeStack)
├── Splash          → SplashScreen (auto → Main apres 2.8s)
├── Main            → BottomTabNavigator
│   ├── Home        → HomeScreen
│   ├── Guides      → GuidesScreen (tabs: Maladies / Guides Pratiques)
│   ├── Scanner     → ScannerScreen (FAB central vert sureleve)
│   ├── Library     → LibraryScreen (grille plantes scannees)
│   └── Map         → MapScreen (placeholder)
├── Result (modal)  → ResultScreen (slide_from_bottom)
├── Notifications   → NotificationsScreen (slide_from_right)
├── Profile         → ProfileScreen (slide_from_right)
├── Settings        → SettingsScreen (slide_from_right)
├── Guides          → GuidesScreen (aussi accessible via stack)
└── Library         → LibraryScreen (aussi accessible via stack)
```

**Bottom Tab Bar** : Home | Guides | Scanner (FAB) | Library | Map
- Icones : lucide-react-native (House, BookOpen, ScanLine, Leaf, Map)
- FAB Scanner : cercle vert primary[800], 56px, sureleve -28px
- Haptic feedback sur chaque onglet

---

## Ecrans

| Ecran | Fichier | Description |
|-------|---------|-------------|
| Home | `screens/HomeScreen.tsx` | Header VinEye + search + CTA scan + maladies carousel + alerte saison + guides |
| Guides | `screens/GuidesScreen.tsx` | Segmented control (Maladies/Guides) + listes de cartes |
| Scanner | `screens/ScannerScreen.tsx` | Camera + detection IA |
| Library | `screens/LibraryScreen.tsx` | Grille 2 colonnes plantes scannees + favoris |
| Map | `screens/MapScreen.tsx` | Placeholder — a implementer |
| Result | `screens/ResultScreen.tsx` | Resultat scan + cepage + XP |
| Notifications | `screens/NotificationsScreen.tsx` | 3 types (alerte/conseil/systeme) + mock data |
| Profile | `screens/ProfileScreen.tsx` | Hero header vert + avatar + info card + stats Bento |
| Settings | `screens/SettingsScreen.tsx` | Menus groupes + referral card orange + reset |
| History | `screens/HistoryScreen.tsx` | Legacy — remplace par Notifications |
| Splash | `screens/SplashScreen.tsx` | Animation de demarrage |

---

## Composants Home

| Composant | Fichier | Role |
|-----------|---------|------|
| SearchHeader | `components/home/SearchHeader.tsx` | Branding VinEye + greeting + boutons notifs/profil |
| SearchSection | `components/home/SearchSection.tsx` | Barre de recherche rounded-full avec filtre |
| HomeCta | `components/home/HomeCta.tsx` | Banner scan avec animation pulse + CTA |
| FrequentDiseases | `components/home/FrequentDiseases.tsx` | Carousel horizontal maladies (160px cards) |
| SeasonAlert | `components/home/SeasonAlert.tsx` | Carte alerte saisonniere (fond vert lime) |
| PracticalGuides | `components/home/PracticalGuides.tsx` | Liste verticale guides avec chevron |
| SectionHeader | `components/home/components/homeheader.tsx` | Titre section + bouton "Voir tout" |

---

## Donnees (Mock)

| Fichier | Contenu |
|---------|---------|
| `data/diseases.ts` | 7 maladies : mildiou, oidium, black rot, esca, botrytis, flavescence doree, chlorose |
| `data/guides.ts` | 3 guides : feuille saine, calendrier traitement, cepages bordelais |

---

## Design System

- **Fond** : `#F8F9FB` (gris bleuté)
- **Cards** : `#FFFFFF`, borderRadius 24-32, border 1px `#F0F0F0`
- **Ombres** : shadowOpacity 0.04, shadowRadius 8-10 (iOS), elevation 2-3 (Android)
- **Typographie** : Regular (400) par defaut, Medium (500) titres menus, Bold (700) noms utilisateur uniquement
- **Couleurs texte** : `#1A1A1A` (titres), `#8E8E93` (sous-titres/labels)
- **Style** : Bento Box minimaliste, espaces, zen

---

## Conventions

- **Styling** : NativeWind (className) prioritaire, StyleSheet pour ombres/gradients/arrondis specifiques
- Package manager : **pnpm**
- Path alias : `@/*` → `src/*`
- `useEffect` depuis `react` (jamais depuis reanimated)
- Navigation : React Navigation v7, **jamais Expo Router**
- Max 300 lignes par fichier
- i18n : tous les textes via `t()`, cles dans fr.json et en.json

---

## Commandes

```bash
pnpm start          # Metro bundler
pnpm web            # Version web
pnpm android        # Build Android
pnpm ios            # Build iOS
```

---

## Changelog

### 2026-04-02 — Refonte navigation + nouveaux ecrans

#### Added
- Bottom tab bar classique avec FAB central (Home | Guides | Scanner FAB | Library | Map)
- Icones lucide-react-native pour la bottom bar
- SearchHeader : branding VinEye + greeting + boutons notifs/profil
- SearchSection : barre de recherche rounded-full avec filtre
- HomeCta : banner scan anime avec pulse reanimated
- FrequentDiseases : carousel horizontal 7 maladies (cards Bento 160px)
- SeasonAlert : carte alerte saisonniere
- PracticalGuides : liste verticale 3 guides
- NotificationsScreen : 3 types (alerte/conseil/systeme), 6 mock, mark all read, empty state
- ProfileScreen : hero header vert + avatar overlap + info card + stats Bento 2x2
- SettingsScreen : menus groupes + referral card orange + language toggle + reset
- GuidesScreen : segmented control (Maladies/Guides) + listes de cartes avec badges severite
- LibraryScreen : grille 2 colonnes plantes + toggle favoris coeur
- MapScreen : placeholder
- data/diseases.ts : 7 maladies de la vigne typees
- data/guides.ts : 3 guides pratiques types
- Traductions completes FR/EN pour tous les nouveaux ecrans

#### Changed
- Navigation restructuree : History/Profile retires du tab bar → accessibles via header
- HomeScreen simplifie : header + search + CTA + 3 sections contenu
- react-dom aligne sur react 19.1.0

#### Removed
- Ancien floating pill tab bar (LayoutAnimation buggue)
- StatisticsSection du HomeScreen (deplace vers ProfileScreen)

---

**Version** : 2.2.0
**Derniere mise a jour** : 2026-05-01

---

### 2026-05-01 — TFLite réintégré, sync backend, offline UX, build EAS

#### Added
- **Real on-device TFLite inference** via `react-native-fast-tflite` + `react-native-nitro-modules`. Fallback `mockDetection` si module absent (Expo Go).
- **Backend sync auth** : `services/api/auth.ts` (`syncUser`, `fetchMe`, `signOutServer`) avec Bearer token stocké en SecureStore. Hydratation optimistic + fetchMe en background.
- **Ban handling** : `BannedModal` non-dismissible déclenché par event 401/403 du `apiPost`, persisté localement pour rester visible cross-restart.
- **Push de scans best-effort** : `services/api/scans.ts.pushScan()` après chaque save local. Skip si guest (pas de token). Mapping confidence `/100`, image local-only V1.
- **OfflineNoticeModal** sur Home (1×/session offline) + offline-aware `useDiseaseDetail`/`useGuideDetail` (skip API si pas de réseau).
- **Result not_vine** : layout dédié centré "Aucune vigne détectée", status tag `not_vine` partout (StatusTag, ScanListItem, MapView, MapBottomSheet).
- **Scanner** : flip front/back camera, analyzing skeleton overlay min 600ms, gallery placeholder button, preload TFLite au mount.
- **Refresh on focus** : RecentScans + ProfileScreen rechargent depuis AsyncStorage à chaque focus de tab.
- **Settings hero** : avatar emoji + name + stats row (scans/cépages/streak).

#### Changed
- **`MODEL_INPUT_SIZE = 224`** (corrigé depuis 256 — le `.tflite` exporté a la shape `[1,224,224,3]`, le 256 du commentaire historique était faux).
- **`runSync` reçoit `Float32Array.buffer`** (ArrayBuffer) au lieu du TypedArray view — la lib v3 (Nitro) rejette les TypedArray directs.
- **`withCmakeFix` étendu** à `subprojects { plugins.withId('com.android.library') }` pour propager les flags aux sous-projets natifs (fast-tflite, nitro, screens, expo-modules-core).
- **`withCmakeFix` désactivé hors Windows** (`process.platform !== 'win32'`) — le fix est strictement Windows MAX_PATH, sur Linux/macOS/EAS il créait un échec en référençant `C:\Users\Client\...\ninja.exe` inexistant.
- **`apiPost` n'émet plus `unauthorized` event** sur 401 anonyme (sans Bearer envoyé) — sinon les guests étaient déconnectés à chaque tentative de push de scan.
- **LargeDiseaseCard** : remplacé `entering={FadeInDown}` par anim manuelle (useSharedValue + useEffect) — Reanimated v4 droppait silencieusement la 1re anim après skeleton → data swap.

#### Status
- ✅ **Android validé** end-to-end (Samsung S23 + Android local builds + EAS)
- ⚠️ **iOS jamais testé** (code cross-platform mais aucun `expo run:ios` ou EAS iOS build)

---

## ML / inference on-device

> ✅ **2026-05-01** : `react-native-fast-tflite` + `react-native-nitro-modules` **réintégrés et build natif Android validé** (15m 17s, 0 erreur, ~40 ms d'inférence sur Samsung S23). Le `withCmakeFix` plugin propage les flags CMake aux sous-projets natifs via `subprojects { plugins.withId('com.android.library') { ... } }` et se désactive automatiquement hors Windows (EAS Build Linux). Voir `plugins/withCmakeFix.js`.

Le modèle MobileNetV2 — exporté en TFLite avec shape **`[1, 224, 224, 3]` float32**
(les 256 mentionnés dans `docs/paper.md` sont la résolution du dataset Kaggle,
mais l'export final attend bien 224 — la shape par défaut MobileNetV2) — est
embarqué dans `src/assets/models/grapevine_v1.tflite` et exécuté on-device via
`react-native-fast-tflite`. Si le module natif est absent (Expo Go par ex.),
fallback automatique sur un mock JS pondéré pour ne pas casser l'UX.

### Pipeline

```
ScannerScreen.handleCapture()
  └─ cameraRef.takePictureAsync({ quality: 0.85 })
     └─ useDetection.analyze(uri)         # rAF yield + min 600 ms skeleton
        └─ services/tflite/model.ts → runInference(uri)
           ├─ services/ml/preprocessing.ts → preprocessImage(uri, dtype)
           │   ├─ expo-image-manipulator: resize 224×224 + JPEG base64
           │   └─ jpeg-js.decode → Float32Array (ou Uint8/Int8 si quantized)
           └─ tflite.loadTensorflowModel(grapevine_v1.tflite)
              .runSync([input.buffer])    # ArrayBuffer, pas TypedArray !
              └─ dequantize + softmax + argmax → Detection
        └─ pushScan(record) best-effort vers /api/mobile/scans (si token)
```

Mesures réelles (Samsung S23) :
- Preprocess : ~700 ms (jpeg-js JS pur — point d'amélioration naturel)
- Inference : ~40 ms
- Total user-perçu : ~750 ms (incluant le minimum 600 ms du skeleton)

### Mapping des 4 classes ML

| Classe ML | Slug Prisma | Ecran cible |
|-----------|-------------|-------------|
| `healthy` | (aucun) | ResultScreen avec message "Vigne saine" |
| `black_rot` | `black-rot` | DiseaseDetail |
| `esca` | `esca` | DiseaseDetail |
| `leaf_blight` | `leaf-blight` | DiseaseDetail |

Source : `src/services/ml/classes.ts` (`CLASS_TO_SLUG`).

### Seuils de confidence

| Confidence | Result |
|------------|--------|
| >= 70% | `vine` (affiche la classe + CTA DiseaseDetail) |
| 40 - 70% | `uncertain` (suggere de reprendre la photo) |
| < 40% | `not_vine` |

### Fichiers cles

| Fichier | Role |
|---------|------|
| `src/assets/models/grapevine_v1.tflite` | Modele MobileNetV2 (9.4 MB, embarque) |
| `src/services/ml/classes.ts` | Mapping classes ML → slugs Prisma + i18n keys |
| `src/services/ml/preprocessing.ts` | Resize + decode JPEG + normalisation /255 |
| `src/services/tflite/model.ts` | `loadModel()` + `runInference(uri)` (fallback mock si module absent) |
| `src/hooks/useDetection.ts` | Hook React qui wrap `runInference` |
| `src/screens/ScannerScreen.tsx` | Capture camera + appel inference |
| `src/screens/ResultScreen.tsx` | Affichage classe + probabilites + CTA DiseaseDetail |
| `metro.config.js` | Ajout `tflite` aux assetExts |
| `vineye-admin/prisma/seed.ts` | Seed des slugs `black-rot`, `esca`, `leaf-blight` |

### Prebuild requis

`react-native-fast-tflite` est un module natif. Avant de builder/tester sur device :

```bash
cd VinEye
pnpm dlx expo prebuild --clean
pnpm dlx expo run:android  # ou run:ios
```

En Expo Go (sans prebuild) : le `runInference` detecte que le module n'est pas
disponible et bascule automatiquement sur un **mock random pondere** (voir
`mockDetection` dans `services/tflite/model.ts`). L'UI reste fonctionnelle pour
le dev sans device natif.

### Roadmap

- ✅ ~~Persister chaque scan via `POST /api/mobile/scans`~~ — fait, voir `services/api/scans.ts`
- Telemetry des classes les plus fréquentes (pour priorisation re-entraînement)
- Re-export du `.tflite` avec preprocess natif intégré (élimine les ~700 ms de jpeg-js JS)
- Pull des scans serveur dans MyPlants pour multi-device sync (V2)
- Upload des images de scan vers Cloudinary/Supabase Storage (V2 — actuellement V1 = metadata only)

---

## Build natif Android — fixes appliqués

- ✅ **CMake/Ninja path too long sur `:app`** — résolu via plugin `plugins/withCmakeFix.js` qui injecte les flags response files + ninja path + `CMAKE_OBJECT_PATH_MAX=1024` dans `android/app/build.gradle.defaultConfig.externalNativeBuild`
- ✅ **CMake/Ninja path too long sur les sous-projets natifs** (`react-native-fast-tflite`, `react-native-nitro-modules`, etc.) — résolu en étendant `withCmakeFix` pour modifier aussi `android/build.gradle` racine via `withProjectBuildGradle`. Le bloc injecté itère sur `subprojects` avec `plugins.withId('com.android.library')` qui n'agit que sur les modules Android (les gradle-plugins déjà évalués sont ignorés, évitant `Cannot run Project.afterEvaluate(Closure) when the project is already evaluated`).
- ✅ **EAS Build (Linux) ne casse plus** — le plugin se désactive automatiquement quand `process.platform !== 'win32'`. Sur Linux/macOS, ninja est dans `$PATH` standard et il n'y a pas de problème de path-too-long ; le hardcoded ninja Windows path n'a alors plus aucune raison d'être injecté.

### Setup dev Windows recommandé

- **Chemin court** : placer le projet dans `C:\dev\vineye\` plutôt que `C:\Users\Client\projet_web\...\VinEye\` — réduit ~50 chars sur tous les chemins de build CMake
- **`LongPathsEnabled` registre** : `HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled = 1` (déjà actif sur ce poste)
- **Git long paths** : `git config --system core.longpaths true` (en PowerShell admin)

### EAS Build (cloud)

```powershell
cd VinEye    # IMPÉRATIF: depuis VinEye/, pas depuis le monorepo root
npx eas-cli@latest build --platform android --profile preview
```

Sans le `cd VinEye`, EAS attrape le slug du `package.json` racine (`grapevine_disease_detection`) qui ne matche pas le projet Expo lié (`vineye`) et refuse le build.

---

## Backend sync (`/api/mobile/*`)

Le mobile peut tourner 100% offline mais quand il est connecté, il appelle le backend `vineye-admin` (Next.js) :

| Route | Verbe | Auth | Usage |
|---|---|---|---|
| `/auth/sync` | POST | none | login/signup passwordless via deviceId hash |
| `/auth/me` | GET | Bearer | check banned + role (background fetch au boot) |
| `/auth/sign-out` | POST | Bearer | best-effort revoke session |
| `/scans` | POST | Bearer | push metadata d'un scan (sans image V1) |
| `/diseases`, `/guides` | GET | none | content cacheable, déjà en place avant aujourd'hui |

Voir `src/services/api/{client,auth,scans}.ts` côté mobile et `vineye-admin/app/api/mobile/*` côté backend pour le détail.

Le `BannedModal` se déclenche via le pub/sub `src/services/api/authEvents.ts` quand n'importe quelle requête authentifiée renvoie `403 { banned: true, bannedReason: "..." }`.
