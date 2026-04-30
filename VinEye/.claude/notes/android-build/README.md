# Build Android — Fixes & configuration

> Notes des corrections appliquées pour faire passer le build natif Android.
> Stack : Expo SDK 54 (bare workflow) + `react-native-fast-tflite` (module natif C++).

---

## Fix #1 — Erreur CMake / Ninja "path too long" (2026-04-30)

### Symptômes
- Build natif `:react-native-fast-tflite:externalNativeBuildDebug` échoue
- Erreurs CMake : chemins trop longs, ninja ne peut pas régénérer `build.ninja`
- Limite Windows 260 chars sur les chemins de fichiers + limite 8191 chars sur la ligne de commande `CreateProcess`

### Solution appliquée

#### 1. `VinEye/android/app/build.gradle` — bloc `externalNativeBuild`

Ajouté dans `android.defaultConfig` :

```gradle
externalNativeBuild {
    cmake {
        arguments "-DCMAKE_MAKE_PROGRAM=C:\\Users\\Client\\AppData\\Local\\Android\\Sdk\\cmake\\4.1.2\\bin\\ninja.exe",
                  "-DCMAKE_OBJECT_PATH_MAX=1024",
                  "-DCMAKE_CXX_USE_RESPONSE_FILE_FOR_OBJECTS=1",
                  "-DCMAKE_CXX_USE_RESPONSE_FILE_FOR_LIBRARIES=1",
                  "-DCMAKE_CXX_RESPONSE_FILE_LINK_FLAG=@",
                  "-DCMAKE_NINJA_FORCE_RESPONSE_FILE=1"
    }
}
```

**À quoi servent ces flags** :
| Flag | Rôle |
|------|------|
| `CMAKE_MAKE_PROGRAM` | Pointe vers ninja 1.12.1 (bundle Android cmake 4.1.2) au lieu du ninja 1.10.2 obsolète de cmake 3.22.1 |
| `CMAKE_OBJECT_PATH_MAX=1024` | Augmente la limite des chemins d'objets pour les builds C++ profondément imbriqués |
| `CMAKE_CXX_USE_RESPONSE_FILE_FOR_OBJECTS=1` | Passe la liste d'objets via `@fichier.rsp` au lieu d'arguments inline |
| `CMAKE_CXX_USE_RESPONSE_FILE_FOR_LIBRARIES=1` | Idem pour les libs au link |
| `CMAKE_CXX_RESPONSE_FILE_LINK_FLAG=@` | Préfixe attendu par le linker Clang/MSVC pour les response files |
| `CMAKE_NINJA_FORCE_RESPONSE_FILE=1` | Force ninja à utiliser des response files même quand il pense pouvoir éviter |

**Pourquoi les response files sont critiques** : sur Windows, `CreateProcess` plafonne à 8191 chars. Quand on link `react-native-fast-tflite` avec ses dizaines de modules + headers + libs (TF Lite, Nitro Modules, RN core), la ligne de commande dépasse la limite. Les response files contournent ça en écrivant les arguments dans un fichier `.rsp` passé via `@chemin.rsp`.

#### 2. Registre Windows — `LongPathsEnabled`

Vérifié : `HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled = 1`
(Déjà à 1 sur ce poste, pas de modification nécessaire.)

#### 3. Ninja récent

Ninja 1.12.1 disponible dans `C:\Users\Client\AppData\Local\Android\Sdk\cmake\4.1.2\bin\ninja.exe`.
Pas besoin de télécharger — on pointe `CMAKE_MAKE_PROGRAM` directement dessus.

### Statut
✅ **Résolu** — l'erreur de path/ninja ne se produit plus.

---

## Fix #2 — `react-native-nitro-modules` headers manquants (2026-04-30, en cours)

### Symptômes
```
CMake Error in CMakeLists.txt:
  Imported target "react-native-nitro-modules::NitroModules" includes
  non-existent path
    "C:/Users/Client/projet_web/Grapevine_Disease_Detection/VinEye/node_modules/react-native-nitro-modules/android/build/headers/nitromodules"
  in its INTERFACE_INCLUDE_DIRECTORIES.
```

### Cause
`react-native-fast-tflite` dépend de `react-native-nitro-modules`. Les headers de Nitro sont générés au build de son sous-projet Gradle, mais le clean a effacé `android/build/headers/` avant que fast-tflite ne tente de configurer son CMake.

### Pistes de résolution
1. **Builder dans le bon ordre** — `./gradlew :react-native-nitro-modules:assembleDebug` avant `:react-native-fast-tflite:externalNativeBuildDebug`
2. **Régénérer les headers** — supprimer `node_modules/react-native-nitro-modules/android/build/` et relancer un build complet (Gradle régénère)
3. **Reinstaller les modules** — `pnpm install --force` puis `pnpm dlx expo prebuild --clean`
4. **Vérifier la version** — incompatibilité possible entre `react-native-fast-tflite` et `react-native-nitro-modules` (vérifier les peerDependencies)

### Statut
🟡 **En cours** — fix CMake/ninja passé, ce nouveau problème est sur la chaîne de dépendances Gradle.

---

## Commandes utiles

```bash
# Clean complet
cd VinEye/android
./gradlew clean

# Build natif uniquement (debug)
./gradlew :app:externalNativeBuildDebug --info

# Run sur device/émulateur
cd VinEye
pnpm dlx expo run:android

# Régénérer le projet natif depuis zéro
pnpm dlx expo prebuild --clean
```

---

## Versions cmake disponibles localement

| Version | Ninja bundlé | Chemin |
|---------|-------------|--------|
| 3.22.1 | 1.10.2 | `~AppData\Local\Android\Sdk\cmake\3.22.1\bin\` |
| 3.31.6 | — | `~AppData\Local\Android\Sdk\cmake\3.31.6\bin\` |
| 4.1.2 | **1.12.1** | `~AppData\Local\Android\Sdk\cmake\4.1.2\bin\` (utilisé) |
