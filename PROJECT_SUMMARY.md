# VinEye - Project Summary

> Plateforme de detection de maladies de la vigne par IA
> Derniere mise a jour : 2026-04-09

---

## Vue d'ensemble

VinEye est une plateforme complete de detection de maladies de la vigne composee de :

- **Application mobile** (VinEye) : React Native / Expo, scan camera avec inference IA embarquee
- **Dashboard admin** (vineye-admin) : Next.js, gestion du contenu et suivi des utilisateurs
- **Pipeline ML** : CNN TensorFlow entraine sur 9 027 images de feuilles de vigne

Public cible : amateurs de vin, viticulteurs, jardiniers.

---

## Stack technique

| Couche | Mobile (VinEye) | Admin (vineye-admin) | ML |
|--------|----------------|---------------------|-----|
| Framework | React Native 0.81 + Expo SDK 54 | Next.js 16.2 | TensorFlow / Keras |
| Langage | TypeScript strict | TypeScript strict | Python 3 |
| Styling | NativeWind (Tailwind 3.4) + StyleSheet | Tailwind 4 + shadcn/ui | — |
| Navigation | React Navigation v7 | App Router | — |
| Images | expo-image | next/image | — |
| Gradients | expo-linear-gradient | — | — |
| Animations | react-native-reanimated 4.1 | — | — |
| Gestures | react-native-gesture-handler 2.28 | — | — |
| Edge-to-edge | expo-navigation-bar + expo-status-bar | — | — |
| Icones | lucide-react-native | lucide-react | — |
| Cache | AsyncStorage + cacheManager (TTL) | — | — |
| Reseau | expo-network (connectivite) | — | — |
| Toast | sonner-native | Sonner | — |
| Base de donnees | AsyncStorage (local) | PostgreSQL via Prisma 7.6 | — |
| Auth | — (local only) | Better Auth (JWT + sessions) | — |
| Forms | — | Zod validation | — |
| IA | Mock JS (intégration TFLite native échouée — build CMake Windows) | — | CNN MobileNetV2, 256×256 |

---

## Avancement global

### Application mobile — 95% complete

| Feature | Status | Detail |
|---------|--------|--------|
| Navigation (14 ecrans) | Done | Bottom tabs + FAB scanner + stack screens + 4 ecrans detail |
| HomeScreen | Done | Header, search, CTA, carousel maladies, alertes, guides |
| Scanner (camera) | Done | Capture photo, overlay detection, confidence meter |
| Resultats scan | Done | Affichage cepage, confiance, tags, grille infos |
| MyPlants (ex-Library) | Done | Liste scans groupes par date (today/yesterday/week/month/older), swipe-to-action (favori+suppr), recherche, pull-to-refresh, empty state CTA |
| ScanDetailScreen | Done | Hero immersif 380px, carte resultat + barre confiance animee, carte cepage conditionnelle, meta card (date+XP), location card (stub), share/delete actions |
| Profil utilisateur | Done | Avatar, stats Bento 2x2, XP, niveau |
| Parametres | Done | Theme, langue, notifications, referral |
| Guides maladies | Done | Connecte a l'API backend, SmallDiseaseCard en grille sur l'ecran Guides, icones Lucide par maladie, dot severite, degrade bordure |
| Guides pratiques | Done | 3 guides avec contenu structure, GuideListItem iOS-style avec icones par categorie, stagger animations |
| Pages de detail | Done | DiseaseDetailScreen, GuideDetailScreen — hero immersif, edge-to-edge, animation d'entree |
| Edge-to-edge | Done | Contenu defile derriere status bar, navigation bar transparente (Android), useSafeAreaInsets |
| Transitions navigation | Done | Fade 250ms par defaut, slide_from_bottom pour modal Result, gesture back active |
| API mobile | Done | Service API centralise (apiGet), cache AsyncStorage avec TTL, detection IP automatique Expo |
| Connectivite reseau | Done | Hook useNetworkStatus (expo-network), NetworkContext, detection online/offline temps reel |
| Toast | Done | sonner-native, toasts auto offline/online, variantes success/error/warning/info |
| Sync maladies | Done | useDiseases/useDiseaseDetail : API → cache → fallback local, pull-to-refresh |
| Sync guides | Done | useGuides/useGuideDetail : meme strategie 3 niveaux |
| Cards maladies | Done | SmallDiseaseCard reutilisable, icones Lucide (Droplets, Snowflake, Skull...), dot severite anime, degrade bordure |
| List items guides | Done | GuideListItem iOS-style, icones par categorie (Leaf, Calendar, Grape), stagger animations |
| Skeleton loading | Done | Composants shimmer pour cards maladies, list items guides, carousel |
| Gamification | Done | 7 niveaux, 7 badges, XP, streaks, decouvertes |
| i18n (FR + EN) | Done | Toutes les cles traduites (maladies enrichies + guides sections + tips) |
| Notifications | Partiel | UI uniquement, pas de push notifs |
| Carte/Map | Partiel | Placeholder, geoloc non implementee |
| Inference IA reelle | Bloque | Code mobile pret + libs installees, mais build CMake echoue sur Windows (path-too-long sur node_modules/react-native-fast-tflite). Voir Points critiques. |

### Dashboard admin — 95% complete

| Feature | Status | Detail |
|---------|--------|--------|
| Authentification | Done | Login email/password, sessions 7j, middleware |
| Dashboard stats | Done | Compteurs, scans recents, top maladies (Recharts) |
| CRUD Maladies enrichi | Done | Formulaire 7 sections : infos, symptomes, timeline visuelle, details techniques (accordeon), images par URL, apparence, publication |
| CRUD Guides enrichi | Done | Formulaire 5 sections : infos, contenu ancien (deprecie), editeur sections structurees (reorder, delete, tip, image), apparence, publication |
| Gestion alertes | Done | Alertes saisonnieres, region, dates, toggle actif |
| Gestion utilisateurs | Done | Liste paginee, stats, ban/unban, roles |
| API REST admin | Done | Endpoints complets pour diseases, guides, alerts, scans, users |
| API mobile publique | Done | 4 endpoints GET sans auth (/api/mobile/diseases, guides + detail par slug), CORS, pagination, cache headers |
| Schema DB enrichi | Done | Disease : +timeline, +conditions[], +actions[], +impactedParts[], +DiseaseImage[]. Guide : +readTime, +coverImage, +GuideSection[] |

### Pipeline ML — 60% complete

| Feature | Status | Detail |
|---------|--------|--------|
| Architecture CNN | Done | 4 blocs conv + classification, 3.8M params |
| Dataset | Done | 9 027 images, 4 classes (Black Rot, ESCA, Healthy, Leaf Blight) |
| Entrainement | Done | 100 epochs, Adam lr=0.001, augmentation |
| Precision modele | A ameliorer | ~30% (surapprentissage probable vers ESCA) |
| Export TFLite | Done | grapevine_v1.tflite (9 MB) embarque dans assets mobile |
| Integration mobile | Bloque | Code mobile pret + libs installees, mais build CMake natif echoue (Windows path-too-long sur le sous-projet react-native-fast-tflite) |

---

## Points critiques

### 1. Inference IA — Modele branche, qualite a ameliorer

**Status** : modele branche et fonctionnel via `react-native-fast-tflite`. MAIS le
modele actuel a ~25% de validation accuracy (overfitting massif diagnostique).
Les predictions sont donc souvent erronees en conditions reelles.

**Stack mobile** :
- `react-native-fast-tflite ^3.0.1` + `react-native-nitro-modules ^0.35.6`
- Modele : `VinEye/src/assets/models/grapevine_v1.tflite` (9 MB, MobileNetV2 256x256, 4 classes)
- Plugin Expo `withCmakeFix` pour les flags CMake (response files + ninja path)
  qui evitent le bug "path too long" sur Windows lors du build C++ Nitro
- Fallback gracieux : si chargement modele echoue, le service tombe sur
  `mockDetection()` (random pondere) + log error console

**Prochaines actions** :
- Retrainer le modele (data augmentation, regularization, fix data leakage,
  fine-tuning progressif de MobileNetV2)
- Voir `docs/audit_report.md` (a produire) pour le diagnostic complet
- Quand un nouveau .tflite sera pret, juste remplacer le fichier dans
  `assets/models/grapevine_v1.tflite` (interface du service inchangee)
- Eventuellement : quantization int8 post-training pour passer de 9 MB a ~2.5 MB

### 2. Stockage images — PARTIELLEMENT RESOLU

Les DiseaseImage et GuideSection.image existent en DB avec des URLs. Il manque un systeme d'upload reel (S3/Cloudinary). Les images sont ajoutees par URL manuelle dans les formulaires admin.

### 3. Synchronisation mobile <-> serveur — PARTIELLEMENT RESOLU

Les maladies et guides se synchronisent via l'API mobile publique avec cache local et fallback offline. Il reste a implementer : auth mobile, sync des scans, sync des alertes.

### 4. Precision du modele ML

~30% de precision est insuffisant pour un usage reel. Le modele semble surfit vers la classe ESCA.

**Pistes :**
- Augmenter et equilibrer le dataset
- Experimenter d'autres architectures (ResNet, EfficientNet transfer learning)
- Cross-validation + early stopping
- Analyser la matrice de confusion par classe

### 5. Absence de tests

Aucun test unitaire ou d'integration dans aucune partie du projet (mobile, admin, ML).

### 6. Images placeholder

Les images des maladies et cepages utilisent des URLs Unsplash generiques (vignobles, raisins, feuilles). A remplacer par de vraies photos agronomiques specifiques a chaque maladie (stockage local ou distant).

### 7. Formulaires admin enrichis — DONE

Les formulaires CRUD pour maladies et guides reflètent tous les champs du schema enrichi (timeline, conditions, actions, sections structurees, images). Validation Zod côte serveur.

---

## Features detaillees

### Gamification (mobile)

| Element | Detail |
|---------|--------|
| Niveaux | 7 : Bourgeon → Vendangeur → Amateur → Sommelier → Expert → Maitre → Maitre de Chai |
| XP | +10 scan, +25 nouveau cepage, +5 streak, +5 confiance >90% |
| Badges | 7 : Premier Scan, Connaisseur, En Feu, Oeil Affute, Explorateur, Perfectionniste, Maitre |
| Streaks | Scans quotidiens consecutifs |

### Base de maladies (7)

| Maladie | Type | Severite |
|---------|------|----------|
| Mildiou | Fongique | Haute |
| Oidium | Fongique | Haute |
| Black Rot | Fongique | Haute |
| ESCA | Fongique | Moyenne |
| Botrytis | Fongique | Moyenne |
| Flavescence Doree | Bacterien | Haute |
| Chlorose | Abiotique | Basse |

### Base de cepages (~15)

Varietes francaises avec : nom FR/EN, couleur, regions, caracteristiques. Utilises pour l'affichage post-scan (mock actuel attribue un cepage aleatoire quand result=vine).

### Schema base de donnees (admin)

```
User (better-auth + role, xp, level, banned)
  ├── Session
  ├── Account
  └── Scan* ──→ Disease?

Disease (slug, name FR/EN, type, severity, symptoms, treatment, published)

Guide (slug, title FR/EN, content, category, order, published)

SeasonAlert (title FR/EN, type, region, active, dateRange)
```

### API REST (admin)

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | `/api/diseases` | Liste / creation |
| GET/PUT/DELETE | `/api/diseases/[id]` | Detail / edition / suppression |
| GET/POST | `/api/guides` | Liste / creation |
| GET/PUT/DELETE | `/api/guides/[id]` | Detail / edition / suppression |
| GET/POST | `/api/alerts` | Liste / creation |
| GET/PUT/DELETE | `/api/alerts/[id]` | Detail / edition / suppression |
| GET/POST | `/api/scans` | Liste / creation |
| GET/PUT/DELETE | `/api/scans/[id]` | Detail / edition / suppression |
| GET | `/api/users` | Liste utilisateurs |
| GET | `/api/users/[id]` | Detail utilisateur |

---

## Design System (mobile)

| Token | Valeur |
|-------|--------|
| Fond app | `#F8F9FB` |
| Cards | `#FFFFFF`, radius 24-32, border `#F0F0F0` |
| Primary (vert vigne) | `#2D6A4F` (800), `#1B4332` (900) |
| Accent (violet raisin) | `#8E24AA` (700), `#6A0572` (800) |
| Texte principal | `#1A1A1A` |
| Texte secondaire | `#8E8E93` |
| Style | Bento Box minimaliste, espaces genereux |

---

## Arborescence du projet

```
Grapevine_Disease_Detection/
├── VinEye/                       # App mobile React Native + Expo
│   ├── App.tsx                   # Point d'entree
│   ├── src/
│   │   ├── screens/              # 14 ecrans (+ DiseaseDetail, GuideDetail, ScanDetail, MyPlants)
│   │   ├── components/           # UI (ui/, home/, scanner/, gamification/, history/, guides/, my-plants/, disease/)
│   │   ├── config/               # api.ts (base URL dynamique Expo)
│   │   ├── contexts/             # NetworkContext, ToastContext
│   │   ├── services/             # tflite, storage, haptics
│   │   ├── services/api/         # client.ts, diseases.ts, guides.ts, mappers.ts
│   │   ├── services/cache/       # cacheManager.ts (AsyncStorage TTL)
│   │   ├── hooks/                # useDetection, useGameProgress, useHistory, useScanDetail, useDiseases, useGuides, useNetworkStatus
│   │   ├── navigation/           # RootNavigator, BottomTabNavigator
│   │   ├── i18n/                 # fr.json, en.json
│   │   ├── theme/                # colors, typography, spacing
│   │   ├── data/                 # diseases.ts, guides.ts
│   │   ├── types/                # detection, gamification, navigation
│   │   └── utils/                # cepages, achievements, dateGrouping, diseaseIcons, guideIcons
│   ├── app.json                  # Config Expo
│   └── package.json
│
├── vineye-admin/                 # Dashboard admin Next.js
│   ├── app/
│   │   ├── (admin)/              # Routes protegees (dashboard, diseases, guides, alerts, users)
│   │   ├── (auth)/login/         # Page de connexion
│   │   └── api/                  # Routes API REST
│   ├── components/               # UI admin (shadcn/ui)
│   ├── components/admin/         # disease-form.tsx, guide-form.tsx (formulaires enrichis)
│   ├── app/api/mobile/           # Endpoints publics pour l'app mobile
│   │   ├── diseases/             # route.ts, [slug]/route.ts
│   │   └── guides/               # route.ts, [slug]/route.ts
│   ├── lib/                      # auth.ts, prisma.ts, utils.ts, validations.ts
│   ├── prisma/schema.prisma      # Schema DB enrichi (Disease, Guide, DiseaseImage, GuideSection)
│   └── package.json
│
├── docs/images/                  # Documentation dataset
├── venv/                         # Environnement Python (training ML)
└── PROJECT_SUMMARY.md            # Ce fichier
```

---

## Prochaines etapes prioritaires

1. **Ameliorer le modele ML** — Passer de ~30% a >80% de precision (transfer learning, dataset equilibre)
2. **Integrer TFLite dans l'app** — Remplacer le mock par le vrai modele
3. **Stockage images** — S3 ou Cloudinary pour les photos (remplacer les URLs manuelles)
4. **Auth mobile + sync scans** — Connecter les scans a l'API (auth mobile, queue offline)
5. **Sync alertes** — Connecter les alertes saisonnieres au backend
6. **Push notifications** — Firebase Cloud Messaging
7. **Tests** — Ajouter des tests unitaires et d'integration
8. **Carte des maladies** — Implementer la feature Map avec donnees geoloc reelles
