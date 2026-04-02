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
| IA | TFLite mock (weighted random) |
| Persistance | AsyncStorage |
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

**Version** : 2.0.0
**Derniere mise a jour** : 2026-04-02
