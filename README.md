# Grapevine Disease Detection — VinEye

> Mobile app + admin panel for grapevine disease detection, powered by an
> on-device TFLite MobileNetV2 classifier (4 classes — black rot, esca,
> healthy, leaf blight).

This monorepo bundles three things in one place:

| Path | What it is |
|---|---|
| **`VinEye/`** | The mobile app — React Native + Expo SDK 54, on-device TFLite inference, offline-first AsyncStorage cache, optional sync to the admin backend. |
| **`vineye-admin/`** | The admin panel & mobile API — Next.js 16 App Router, better-auth, Prisma + PostgreSQL. Manages users, scans, diseases, guides, and seasonal alerts. Exposes `/api/mobile/*` (CORS-public) for the app. |
| **`docs/`, root notebook** | The original ML research — dataset analysis, MobileNetV2 training, model benchmarks, academic paper. Source of `VinEye/src/assets/models/grapevine_v1.tflite`. |

The mobile app works **fully offline** with the bundled TFLite model + local
data. When online and signed in, it pushes scans to `vineye-admin` so a
human can audit usage and ban bad actors from a web dashboard.

---

## Quick start

### Prerequisites

- Node 20+ via nvm
- pnpm (`npm i -g pnpm`)
- PostgreSQL 18+
- Android Studio (for `expo run:android`) — or a physical device with USB debugging
- Python 3.12+ if you want to retrain the model

### 1. Backend (`vineye-admin`)

```bash
cd vineye-admin
pnpm install

# Configure DB
cp .env.example .env
# Edit .env: set DATABASE_URL + BETTER_AUTH_SECRET (32+ chars)

# Init schema
pnpm exec prisma migrate dev
pnpm db:seed   # creates admin@vineye.app / admin123456 + 4 mock diseases + guides

# Run
pnpm dev       # http://localhost:3000
```

Default seed credentials (dev only — change before any deploy):

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@vineye.app` | `admin123456` |
| USER  | `jean@vineye.app`  | `user123456`  |

### 2. Mobile (`VinEye`)

```bash
cd VinEye
pnpm install

# Generate native projects (one-time, or after any plugin change)
pnpm dlx expo prebuild --clean

# Run on Android device/emulator
pnpm dlx expo run:android
```

Metro auto-detects your dev machine's LAN IP and points the mobile app to
`http://<ip>:3000/api/mobile`. Make sure `vineye-admin` is running.

### 3. ML retraining (optional)

The `.tflite` ships with the app. To retrain:

```bash
python -m venv venv
. venv/Scripts/activate    # or venv/bin/activate on macOS/Linux
pip install -r requirements.txt
jupyter notebook            # open the training notebook
```

---

## Architecture overview

```
┌────────────────────┐       Bearer + JSON       ┌──────────────────────┐
│   VinEye (RN)      │ ───────────────────────▶  │  vineye-admin (Next) │
│ Expo SDK 54        │                           │  App Router 16       │
│ TFLite on-device   │ ◀─── HTTPS public CORS ─── │  better-auth         │
│ AsyncStorage cache │                           │  Prisma + PostgreSQL │
└────────────────────┘                           └──────────────────────┘
        │                                                     │
        │                                                     │
        ▼                                                     ▼
   AsyncStorage                                          PostgreSQL
   (offline-first)                                       (admin truth)
```

### Mobile API surface (`/api/mobile/*`)

All routes are CORS-public, JSON, and use a derived deterministic password
(SHA-256 of `email + deviceId + pepper`) so the mobile UX stays password-less
while the backend account remains a real `better-auth` user.

| Route | Verb | Auth | What |
|---|---|---|---|
| `/auth/sync` | POST | none | Sign-in or sign-up by `{name, email, deviceId}` → `{token, user}` |
| `/auth/me` | GET | Bearer | Returns the current user incl. `banned`, `bannedReason` |
| `/auth/sign-out` | POST | Bearer | Best-effort session revocation |
| `/scans` | POST | Bearer | Persist a scan (metadata only — image stays on device in V1) |
| `/scans` | GET | Bearer | List own scans (50 most recent) |
| `/diseases`, `/guides` | GET | none | Cacheable content fetched by the app on first launch |

Banned accounts get a `403 { banned: true, bannedReason: "…" }` on every
authenticated call; the mobile catches it via a tiny `authEvents` pub/sub
and shows a non-dismissible `BannedModal` with a logout-only CTA.

---

## ML model details

**MobileNetV2** trained on the [Kaggle grape disease dataset](https://kaggle.com/datasets/rm1000/grape-disease-dataset-original)
(9,027 images, 4 classes, 256×256 — but the exported `.tflite` runs at 224×224
which is the MobileNetV2 default).

| Metric | Value |
|---|---|
| Validation accuracy | ~99.9% (with caveats — biased toward ESCA/Healthy) |
| Bundle size | 9.4 MB |
| Inference on Samsung S23 | ~40 ms |
| Preprocessing | ~700 ms (JPEG decode + resize in JS — natural improvement target) |

The model architecture, training notebook, and academic paper live in
`docs/paper.md`. Predictions in production reflect the validation bias —
expect re-training before any commercial deployment. See
`VinEye/src/services/tflite/model.ts` for the on-device pipeline and
`docs/audit_report.md` for the model audit.

---

## Repo layout

```
.
├── VinEye/                  # React Native + Expo app
│   ├── src/
│   │   ├── components/      # Tailwind/NativeWind UI (atomic + features)
│   │   ├── contexts/        # AuthContext, NetworkContext, ToastContext
│   │   ├── hooks/           # useDetection, useHistory, useGameProgress, …
│   │   ├── navigation/      # RootNavigator + BottomTabNavigator
│   │   ├── screens/         # 12 screens (Home, Scanner, Result, …)
│   │   ├── services/
│   │   │   ├── api/         # fetch wrappers, auth/scans/diseases endpoints
│   │   │   ├── auth/        # tokenStorage (SecureStore), authStorage
│   │   │   ├── ml/          # preprocessing.ts (image → Float32Array)
│   │   │   └── tflite/      # model.ts (load + runSync + dequantize)
│   │   ├── i18n/            # FR + EN translation bundles
│   │   └── assets/models/   # grapevine_v1.tflite (9.4 MB, embedded)
│   ├── plugins/withCmakeFix.js   # Windows CMake/Ninja path-too-long fix
│   ├── app.json             # Expo config
│   └── package.json
│
├── vineye-admin/            # Next.js admin panel + mobile API
│   ├── app/
│   │   ├── (admin)/         # /dashboard, /users, /diseases, /guides, /alerts
│   │   ├── (auth)/login/    # better-auth login page
│   │   └── api/
│   │       ├── auth/[...all]/    # better-auth proxy
│   │       ├── users/, scans/, diseases/, …  # admin-only CRUD
│   │       └── mobile/      # public mobile API (CORS, Bearer)
│   ├── components/          # shadcn/ui components
│   ├── lib/                 # auth, auth-guard, prisma, validations
│   ├── prisma/              # schema.prisma + seed.ts
│   └── middleware.ts        # CORS + admin route gate
│
├── docs/                    # ML research, paper, benchmarks
└── README.md                # this file
```

---

## Production / deploy notes

The repo is set up for VPS deployment of `vineye-admin` and Expo bare
workflow native builds for `VinEye`. See `~/.claude/rules/deployment.md` and
`VinEye/CLAUDE.md` for details. TL;DR:

- `vineye-admin`: PM2 + Nginx + Postgres + Certbot. Each project gets its own
  port (3000/3001/3002…). GitHub Actions on push to `master` auto-deploys via
  SSH.
- `VinEye`: build APK locally via `expo run:android --variant release` or
  use EAS Build. The on-device TFLite model is embedded in the bundle (no
  CDN cost, no network dependency for inference).

---

## License & credits

Dataset: [Kaggle / rm1000](https://kaggle.com/datasets/rm1000/grape-disease-dataset-original).
Model architecture inspired by [Ahmed M. Saber's notebook](https://www.kaggle.com/code/ahmedmsaber/grape-leafs-diseases-mobilenetv2-val-acc-99).
References: TensorFlow image classification, TensorFlow Lite converter, integrated gradients tutorial.

🤖 Built with [Claude Code](https://claude.com/claude-code) (Opus 4.7).
