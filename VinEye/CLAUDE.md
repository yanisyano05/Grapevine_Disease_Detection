# VinEye

Application mobile React Native (Expo) de détection de cépages par IA.
Analyse la vigne en temps réel via la caméra, identifie le cépage, et gamifie la progression.

---

## Stack

| Couche | Technologies |
|--------|-------------|
| Framework | React Native + Expo SDK 54 (bare workflow) |
| Navigation | React Navigation v7 (NativeStack + BottomTabs) — **PAS Expo Router** |
| Langage | TypeScript strict |
| UI | Composants custom (pas de shadcn — RN only) |
| Animations | React Native Reanimated v4 (`useEffect` vient de `react`, **pas** de reanimated) |
| IA | TFLite mock (weighted random : 70% vine / 20% uncertain / 10% not_vine) |
| Persistance | AsyncStorage (`@react-native-async-storage/async-storage`) |
| i18n | i18next + react-i18next (FR + EN) |
| Caméra | expo-camera |
| Haptics | expo-haptics |
| SVG | react-native-svg |
| Lottie | lottie-react-native |
| Package manager | **pnpm** |

---

## Architecture

```
VinEye/
├── App.tsx                      # Entry point (i18n init + RootNavigator)
├── src/
│   ├── assets/
│   │   ├── images/              # logo.svg, icon.png, splash.png
│   │   └── lottie/              # confetti.json, scan-success.json, vine-leaf.json, level-up.json
│   ├── components/
│   │   ├── ui/                  # Button, Card, Badge, ProgressCircle, AnimatedCounter
│   │   ├── scanner/             # DetectionFrame, CameraOverlay, ConfidenceMeter
│   │   ├── gamification/        # XPBar, BadgeCard, LevelIndicator, StreakCounter
│   │   └── history/             # ScanCard, ScanList
│   ├── hooks/                   # useDetection, useGameProgress, useHistory
│   ├── i18n/                    # fr.json, en.json, index.ts
│   ├── navigation/              # RootNavigator, BottomTabNavigator, linking.ts
│   ├── screens/                 # SplashScreen, HomeScreen, ScannerScreen, ResultScreen, HistoryScreen, ProfileScreen
│   ├── services/
│   │   ├── tflite/model.ts      # Mock TFLite inference
│   │   ├── storage.ts           # AsyncStorage wrapper typé
│   │   └── haptics.ts           # hapticSuccess/Warning/Error/Light/Medium/Heavy
│   ├── theme/                   # colors.ts, typography.ts, spacing.ts, index.ts
│   ├── types/                   # detection.ts, gamification.ts, navigation.ts
│   └── utils/
│       ├── cepages.ts           # 15 cépages (origine, couleur, caractéristiques, régions)
│       └── achievements.ts      # XP_REWARDS, LEVELS, BADGE_DEFINITIONS, checkNewBadges, getLevelForXP
```

---

## Navigation

```
RootNavigator (Stack)
├── Splash          → SplashScreen (auto-navigate vers Main après 2.8s)
├── Main            → BottomTabNavigator
│   ├── Home        → HomeScreen
│   ├── Scanner     → ScannerScreen (bouton FAB central)
│   ├── History     → HistoryScreen
│   └── Profile     → ProfileScreen
└── Result (modal)  → ResultScreen (slide_from_bottom)
```

---

## Design Tokens (colors.ts)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary[700]` | `#2D6A4F` | Tab active, CTA principal |
| `primary[800]` | `#1B4332` | Scanner FAB |
| `primary[900]` | `#0A2318` | Ombres |
| `accent[500]` | `#7C3AED` | Badges, accents violet raisin |
| `surface` | `#FFFFFF` | Fond tab bar, cards |
| `background` | `#F8FBF9` | Fond écrans |
| `neutral[300]` | `#D1D5DB` | Bordures |
| `neutral[400]` | `#9CA3AF` | Tab inactive |

---

## Gamification

- **7 niveaux** : Bourgeon → Apprenti Vigneron → Vigneron → Expert Viticole → Sommelier → Grand Cru → Maître de Chai
- **XP** : +10 (vigne détectée), +5 (incertain), +15 (streak bonus)
- **7 badges** : premier_scan, amateur, expert, streaker_3, streaker_7, collectionneur, marathonien
- **Streak** : scan quotidien consécutif

---

## Fonctionnalités clés

| Feature | Fichier principal | Statut |
|---------|-------------------|--------|
| Splash animée | `screens/SplashScreen.tsx` | ✅ |
| Scanner caméra | `screens/ScannerScreen.tsx` | ✅ |
| Résultat + cépage | `screens/ResultScreen.tsx` | ✅ |
| Historique + search | `screens/HistoryScreen.tsx` | ✅ |
| Profil + badges | `screens/ProfileScreen.tsx` | ✅ |
| Gamification XP | `hooks/useGameProgress.ts` | ✅ |
| Persistance | `services/storage.ts` | ✅ |
| Bilingue FR/EN | `i18n/` | ✅ |

---

## Conventions

- Package manager : **pnpm**
- Path alias : `@/*` → `src/*`
- `useEffect` toujours depuis `react` (jamais depuis `react-native-reanimated`)
- Navigation : React Navigation v7 uniquement, **jamais Expo Router** (`src/app/` est interdit — renommé en `src/screens/`)
- Max 300 lignes par fichier

---

## Commandes

```bash
pnpm start          # Lance Metro bundler
pnpm android        # Build Android
pnpm ios            # Build iOS
```
