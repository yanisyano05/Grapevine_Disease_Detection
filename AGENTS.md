# Repository Guidelines

Monorepo with two components: a **Python/TensorFlow CNN** for grapevine disease detection and a **React Native (Expo) mobile app** (VinEye) that runs the model on-device via TFLite.

## Project Structure & Module Organization

```
venv/src/          # Python ML pipeline (training, evaluation, attribution)
venv/models/       # Trained model artifacts (.keras, .tflite)
docs/images/       # Dataset & results visualizations
VinEye/            # Expo React Native mobile app
  src/screens/     # 6 screens: Splash, Home, Scanner, Result, History, Profile
  src/components/  # UI grouped by feature (gamification/, scanner/, history/, ui/)
  src/services/    # TFLite inference, AsyncStorage, haptics
  src/hooks/       # useDetection, useGameProgress, useHistory
  src/navigation/  # React Navigation v7 (BottomTabs + NativeStack)
  src/i18n/        # FR + EN translations (i18next)
  src/theme/       # Design tokens (primary #2D6A4F, accent #7C3AED)
```

The ML model currently uses a mock TFLite detector in the mobile app (weighted random: 70% vine / 20% uncertain / 10% not_vine). The CNN trains on 9027 images (256x256) across 4 classes: Black Rot, ESCA, Healthy, Leaf Blight.

## Build, Test, and Development Commands

### VinEye (Mobile)

```bash
cd VinEye
pnpm install            # Install dependencies (pnpm only, never npm/yarn)
pnpm start              # Start Expo dev server
pnpm android            # Run on Android
pnpm ios                # Run on iOS
pnpm web                # Run on web
```

### Python ML Pipeline

```bash
cd venv/src
python data_split.py       # Split raw data into train/val/test (80/10/10)
python data_explore.py     # EDA: class distribution, sample visualization
python model_train.py      # Train CNN, exports .keras + .tflite to venv/models/
python evaluate_model.py   # Accuracy/loss curves, confusion matrix, top-k predictions
python gradient.py         # Integrated gradients attribution masks
```

Scripts must be run from `venv/src/` — paths are derived relative to that directory.

## Coding Style & Naming Conventions

**TypeScript (VinEye):**
- Strict mode enabled, path alias `@/*` maps to `src/*`
- Max 300 lines per file
- NativeWind (TailwindCSS) for styling — no inline styles
- `useEffect` must be imported from `react`, never from `react-native-reanimated`
- React Navigation v7 only (Expo Router is forbidden)
- RN-native UI components only (no web-based component libraries)

**Python:** TensorFlow/Keras Sequential API, scripts use `from module import *` pattern.

No linter or formatter configs are enforced.

## Commit Guidelines

Commit messages are informal, descriptive, lowercase. No conventional commits format is enforced. Examples from history: `add VinEye frontend app + fix hardcoded paths + gitignore`, `update`, `maj`.
