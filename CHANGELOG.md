# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Versionnage Sémantique](https://semver.org/lang/fr/).

## [Unreleased]

## [1.0.0] - 2026-05-01

Première release du projet **Grapevine Disease Detection** — monorepo regroupant
l'application mobile (VinEye), le backend d'administration (vineye-admin) et le
pipeline de machine learning.

### Ajouté

#### Application mobile — VinEye (React Native + Expo SDK 54)
- Détection de maladies de la vigne par caméra avec **inférence on-device TFLite**
  (MobileNetV2, 4 classes : `black_rot`, `esca`, `healthy`, `leaf_blight`), avec
  fallback mock JS si le module natif est absent.
- Navigation bottom-tab avec FAB scanner central (Home · Guides · Scanner · Library · Map).
- Écrans : Home, Guides, Scanner, Result, Library, Map, Notifications, Profile, Settings, Splash.
- Bibliothèque de 7 maladies de la vigne + 3 guides pratiques.
- Gamification : XP, badges, niveaux.
- Carte des scans géolocalisés (WebView + Leaflet), persistance GPS par scan.
- Recherche centralisée, états de chargement (skeletons) et animations d'entrée.
- Internationalisation FR / EN (i18next).
- Authentification local-first (AsyncStorage) + token de session en SecureStore.
- Synchronisation best-effort vers le backend (auth, push de scans) + gestion du
  bannissement (`BannedModal` non-dismissible).
- UX offline-first : notice hors-ligne, hooks de détail offline-aware.

#### Backend d'administration — vineye-admin (Next.js 16 + Prisma 7)
- API mobile : `/auth` (sync, me, sign-out), `/scans`, `/diseases`, `/guides`.
- Panel admin : gestion des utilisateurs (dont ban + `bannedReason`), maladies, guides, alertes.
- Authentification via better-auth (détection de session avec préfixe `__Secure-`).

#### Machine learning
- Pipeline d'entraînement MobileNetV2 (~0.99 d'accuracy) — `venv/src`.
- Export du modèle en TFLite embarqué dans le mobile (shape `[1, 224, 224, 3]`, normalisation `/255`).

### Infrastructure & déploiement
- Build natif **Android validé end-to-end** (EAS + builds locaux) via le plugin
  `withCmakeFix` (contournement Windows MAX_PATH, désactivé hors Windows).
- Configuration EAS : profils `development`, `preview`, `simulator`, `production`.
- Préparation du déploiement `vineye-admin` sur Vercel + Supabase.

### Notes
- **iOS** : code cross-platform mais jamais testé / jamais buildé à cette version.
- **PWA** : non démarrée à cette version.

[Unreleased]: https://github.com/yanisyano05/Grapevine_Disease_Detection/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yanisyano05/Grapevine_Disease_Detection/releases/tag/v1.0.0
