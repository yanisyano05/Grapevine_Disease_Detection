# Endpoint d'inférence ML `/api/mobile/predict` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exposer un endpoint serveur `POST /api/mobile/predict` dans `vineye-admin` qui reçoit une image (base64), exécute le modèle MobileNetV2 en ONNX et renvoie la classification, pour alimenter la future PWA.

**Architecture:** Le modèle Keras est converti une fois en ONNX (`tf2onnx`). Une route Next.js (runtime Node) décode l'image, la prétraite avec `sharp` (224×224, `/255`, NHWC), l'infère via `onnxruntime-node` (session singleton), applique les seuils de confidence et renvoie `{ prediction }`. Endpoint public protégé par rate-limit IP (Upstash), identité best-effort si Bearer présent, sans persistance.

**Tech Stack:** Next.js 16, TypeScript strict, `onnxruntime-node`, `sharp`, `@upstash/ratelimit` + `@upstash/redis`, `zod/v4`, `vitest`. Conversion : Python + TensorFlow + `tf2onnx`.

**Spec de référence:** `docs/superpowers/specs/2026-05-25-ml-inference-endpoint-design.md`

---

## File Structure

**Conversion (Python, monorepo `venv/`):**
- `venv/src/export_onnx.py` — Crée : convertit `model.keras` → `model.onnx` + test de parité.

**Backend `vineye-admin/`:**
- `lib/ml/grapevine_v1.onnx` — Crée : modèle ONNX embarqué (~10-14 MB), copié par le script Python. Hors `/public`.
- `lib/ml/classes.ts` — Crée : `ML_CLASSES`, `CLASS_TO_SLUG`, seuils, `classify(probabilities)` (logique pure des seuils).
- `lib/ml/preprocess.ts` — Crée : `dataUriToBuffer()`, `preprocessImage()` (sharp → Float32Array NHWC).
- `lib/ml/inference.ts` — Crée : session ONNX singleton + `runModel()` + `predict()` (orchestration).
- `lib/ratelimit.ts` — Crée : limiter Upstash + `checkRateLimit(ip)` (no-op si non configuré).
- `lib/auth-optional.ts` — Crée : `resolveOptionalUserId(request)` (best-effort, ne bloque jamais).
- `lib/validations.ts` — Modifie : ajout `mobilePredictSchema`.
- `app/api/mobile/predict/route.ts` — Crée : handler `POST` + `OPTIONS`.
- `next.config.ts` — Modifie : `serverExternalPackages` + `outputFileTracingIncludes`.
- `vitest.config.ts` — Crée : config vitest (env node).
- `package.json` — Modifie : deps + script `test`.
- Tests : `lib/ml/classes.test.ts`, `lib/ml/preprocess.test.ts`, `lib/ml/inference.test.ts`, `app/api/mobile/predict/route.test.ts`.

> **Toutes les commandes `pnpm`/`git` backend s'exécutent depuis `vineye-admin/`.** Les commandes Python depuis `venv/src/`.

---

## Task 0: Setup dépendances + vitest

**Files:**
- Modify: `vineye-admin/package.json`
- Create: `vineye-admin/vitest.config.ts`

- [ ] **Step 1: Installer les dépendances runtime**

Depuis `vineye-admin/` :
```bash
pnpm add onnxruntime-node sharp @upstash/ratelimit @upstash/redis
```

- [ ] **Step 2: Installer vitest (dev)**

```bash
pnpm add -D vitest
```

- [ ] **Step 3: Ajouter le script de test**

Dans `vineye-admin/package.json`, ajouter à `"scripts"` :
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Créer la config vitest**

Create `vineye-admin/vitest.config.ts` :
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["{lib,app}/**/*.test.ts"],
    testTimeout: 30_000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 5: Vérifier que vitest démarre (aucun test encore)**

Run: `pnpm test`
Expected: vitest s'exécute et affiche "No test files found" (exit 0 ou message équivalent). Pas d'erreur de config.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "chore(ml): add onnxruntime/sharp/upstash deps + vitest setup"
```

---

## Task 1: Conversion du modèle Keras → ONNX (Python)

**Files:**
- Create: `venv/src/export_onnx.py`
- Create: `vineye-admin/lib/ml/grapevine_v1.onnx` (output du script)

- [ ] **Step 1: Installer tf2onnx dans le venv**

Depuis `venv/` (activer le venv d'abord si besoin) :
```bash
pip install tf2onnx onnx onnxruntime
```
> Si TensorFlow n'est plus installé (site-packages non versionné) : `pip install tensorflow` (version compatible avec celle d'entraînement). En cas d'échec d'import du `.keras`, vérifier la version de Keras.

- [ ] **Step 2: Écrire le script de conversion + parité**

Create `venv/src/export_onnx.py` :
```python
"""Convertit model.keras -> model.onnx et vérifie la parité des sorties.

Usage : python export_onnx.py
Sortie : ../models/<latest>/model.onnx + copie vers vineye-admin/lib/ml/grapevine_v1.onnx
"""
import os
import shutil
import numpy as np
import tensorflow as tf
import tf2onnx
import onnxruntime as ort

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(HERE, "..", "models", "2026-03-23_11-55-09")
KERAS_PATH = os.path.join(MODEL_DIR, "model.keras")
ONNX_PATH = os.path.join(MODEL_DIR, "model.onnx")
BACKEND_DEST = os.path.join(
    HERE, "..", "..", "vineye-admin", "lib", "ml", "grapevine_v1.onnx"
)
IMG_SIZE = 224
OPSET = 13

def main():
    model = tf.keras.models.load_model(KERAS_PATH)
    model.build([None, IMG_SIZE, IMG_SIZE, 3])

    spec = (tf.TensorSpec((None, IMG_SIZE, IMG_SIZE, 3), tf.float32, name="input"),)
    tf2onnx.convert.from_keras(
        model, input_signature=spec, opset=OPSET, output_path=ONNX_PATH
    )
    print(f"ONNX écrit : {ONNX_PATH}")

    # Parité : 3 entrées aléatoires, écart absolu max < 1e-4
    sess = ort.InferenceSession(ONNX_PATH, providers=["CPUExecutionProvider"])
    onnx_in = sess.get_inputs()[0].name
    max_diff = 0.0
    for _ in range(3):
        x = np.random.rand(1, IMG_SIZE, IMG_SIZE, 3).astype(np.float32)
        keras_out = model.predict(x, verbose=0)
        onnx_out = sess.run(None, {onnx_in: x})[0]
        max_diff = max(max_diff, float(np.abs(keras_out - onnx_out).max()))
    print(f"Écart max Keras/ONNX : {max_diff:.2e}")
    assert max_diff < 1e-4, f"Parité échouée : {max_diff}"

    os.makedirs(os.path.dirname(BACKEND_DEST), exist_ok=True)
    shutil.copyfile(ONNX_PATH, BACKEND_DEST)
    print(f"Copié vers : {BACKEND_DEST}")

if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Exécuter la conversion**

Depuis `venv/src/` :
```bash
python export_onnx.py
```
Expected: affiche "ONNX écrit", "Écart max Keras/ONNX : X.XXe-0X" (< 1e-4), "Copié vers ...". Le fichier `vineye-admin/lib/ml/grapevine_v1.onnx` existe.

- [ ] **Step 4: Vérifier la taille du fichier produit**

Run: `ls -lh ../../vineye-admin/lib/ml/grapevine_v1.onnx`
Expected: fichier présent, ~9-15 MB.

- [ ] **Step 5: Commit (script + modèle)**

Depuis la racine du monorepo :
```bash
git add venv/src/export_onnx.py vineye-admin/lib/ml/grapevine_v1.onnx
git commit -m "feat(ml): export model.keras to ONNX + embed in vineye-admin"
```
> Si `venv/` est gitignored, ne committer que le `.onnx` et garder le script via `git add -f venv/src/export_onnx.py`.

---

## Task 2: `classes.ts` + fonction `classify()`

**Files:**
- Create: `vineye-admin/lib/ml/classes.ts`
- Test: `vineye-admin/lib/ml/classes.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

Create `vineye-admin/lib/ml/classes.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { classify, ML_CLASSES } from "./classes";

describe("classify", () => {
  it("retourne 'vine' + slug quand la confidence >= 0.70", () => {
    const probs = [0.92, 0.04, 0.02, 0.02]; // black_rot
    const r = classify(probs);
    expect(r.status).toBe("vine");
    expect(r.class).toBe("black_rot");
    expect(r.slug).toBe("black-rot");
    expect(r.confidence).toBeCloseTo(0.92, 5);
    expect(r.probabilities.black_rot).toBeCloseTo(0.92, 5);
  });

  it("retourne 'uncertain' entre 0.40 et 0.70", () => {
    const probs = [0.55, 0.2, 0.15, 0.1]; // black_rot top mais < 0.70
    expect(classify(probs).status).toBe("uncertain");
  });

  it("retourne 'not_vine' quand la confidence < 0.40", () => {
    const probs = [0.3, 0.3, 0.25, 0.15];
    expect(classify(probs).status).toBe("not_vine");
  });

  it("slug null pour healthy", () => {
    const probs = [0.01, 0.01, 0.97, 0.01]; // healthy
    const r = classify(probs);
    expect(r.class).toBe("healthy");
    expect(r.slug).toBeNull();
  });

  it("ML_CLASSES est dans l'ordre de sortie du modèle", () => {
    expect(ML_CLASSES).toEqual(["black_rot", "esca", "healthy", "leaf_blight"]);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `pnpm test classes`
Expected: FAIL — `classify`/`ML_CLASSES` introuvables.

- [ ] **Step 3: Implémenter `classes.ts`**

Create `vineye-admin/lib/ml/classes.ts` :
```ts
export type DiseaseClass = "black_rot" | "esca" | "healthy" | "leaf_blight";
export type PredictionStatus = "vine" | "uncertain" | "not_vine";

// Ordre IMPÉRATIF = ordre des sorties softmax du modèle (index 0..3).
export const ML_CLASSES: DiseaseClass[] = [
  "black_rot",
  "esca",
  "healthy",
  "leaf_blight",
];

export const CLASS_TO_SLUG: Record<DiseaseClass, string | null> = {
  healthy: null,
  black_rot: "black-rot",
  esca: "esca",
  leaf_blight: "leaf-blight",
};

export const CONFIDENCE_THRESHOLD_VINE = 0.7;
export const CONFIDENCE_THRESHOLD_UNCERTAIN = 0.4;

export interface Prediction {
  status: PredictionStatus;
  class: DiseaseClass;
  slug: string | null;
  confidence: number;
  probabilities: Record<DiseaseClass, number>;
}

export function classify(probabilities: number[]): Prediction {
  if (probabilities.length !== ML_CLASSES.length) {
    throw new Error(
      `Expected ${ML_CLASSES.length} probabilities, got ${probabilities.length}`,
    );
  }

  let topIdx = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[topIdx]) topIdx = i;
  }
  const confidence = probabilities[topIdx];
  const topClass = ML_CLASSES[topIdx];

  let status: PredictionStatus;
  if (confidence >= CONFIDENCE_THRESHOLD_VINE) status = "vine";
  else if (confidence >= CONFIDENCE_THRESHOLD_UNCERTAIN) status = "uncertain";
  else status = "not_vine";

  const probabilitiesMap = ML_CLASSES.reduce(
    (acc, cls, i) => {
      acc[cls] = probabilities[i];
      return acc;
    },
    {} as Record<DiseaseClass, number>,
  );

  return {
    status,
    class: topClass,
    slug: CLASS_TO_SLUG[topClass],
    confidence,
    probabilities: probabilitiesMap,
  };
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `pnpm test classes`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/ml/classes.ts lib/ml/classes.test.ts
git commit -m "feat(ml): classes + classify() threshold logic"
```

---

## Task 3: `preprocess.ts` (sharp → Float32Array NHWC)

**Files:**
- Create: `vineye-admin/lib/ml/preprocess.ts`
- Test: `vineye-admin/lib/ml/preprocess.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

Create `vineye-admin/lib/ml/preprocess.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import {
  dataUriToBuffer,
  preprocessImage,
  MODEL_INPUT_SIZE,
} from "./preprocess";

async function redJpegDataUri(): Promise<string> {
  const buf = await sharp({
    create: { width: 50, height: 50, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

describe("dataUriToBuffer", () => {
  it("décode un data-URI base64 en Buffer non vide", async () => {
    const uri = await redJpegDataUri();
    const buf = dataUriToBuffer(uri);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });

  it("lève une erreur sur un data-URI invalide", () => {
    expect(() => dataUriToBuffer("pas-un-data-uri")).toThrow();
  });
});

describe("preprocessImage", () => {
  it("produit un Float32Array NHWC [224*224*3] normalisé dans [0,1]", async () => {
    const uri = await redJpegDataUri();
    const tensor = await preprocessImage(dataUriToBuffer(uri));
    expect(tensor).toBeInstanceOf(Float32Array);
    expect(tensor.length).toBe(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3);
    for (let i = 0; i < tensor.length; i++) {
      expect(tensor[i]).toBeGreaterThanOrEqual(0);
      expect(tensor[i]).toBeLessThanOrEqual(1);
    }
    // Premier pixel rouge : R proche de 1, G/B proches de 0 (tolérance JPEG)
    expect(tensor[0]).toBeGreaterThan(0.8);
    expect(tensor[1]).toBeLessThan(0.2);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `pnpm test preprocess`
Expected: FAIL — module `./preprocess` introuvable.

- [ ] **Step 3: Implémenter `preprocess.ts`**

Create `vineye-admin/lib/ml/preprocess.ts` :
```ts
import sharp from "sharp";

export const MODEL_INPUT_SIZE = 224;

/** Décode un data-URI base64 (`data:image/...;base64,XXXX`) en Buffer. */
export function dataUriToBuffer(dataUri: string): Buffer {
  const match = /^data:image\/[a-zA-Z+]+;base64,(.+)$/.exec(dataUri.trim());
  if (!match) {
    throw new Error("Invalid image data-URI");
  }
  return Buffer.from(match[1], "base64");
}

/**
 * Reproduit le preprocessing d'entraînement :
 * resize 224×224 SANS préserver le ratio (fit:"fill"), RGB, normalisation /255.
 * Sortie : Float32Array layout NHWC (H×W×C interleaved), length 224*224*3.
 */
export async function preprocessImage(buffer: Buffer): Promise<Float32Array> {
  const { data } = await sharp(buffer)
    .removeAlpha()
    .resize(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const length = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3;
  const tensor = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    tensor[i] = data[i] / 255;
  }
  return tensor;
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `pnpm test preprocess`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/ml/preprocess.ts lib/ml/preprocess.test.ts
git commit -m "feat(ml): image preprocessing (sharp, NHWC, /255)"
```

---

## Task 4: `inference.ts` (onnxruntime-node + orchestration)

**Files:**
- Create: `vineye-admin/lib/ml/inference.ts`
- Test: `vineye-admin/lib/ml/inference.test.ts`

> Dépend de Task 1 (le `.onnx` doit exister) et Task 3.

- [ ] **Step 1: Écrire le test qui échoue (smoke test sur image synthétique)**

Create `vineye-admin/lib/ml/inference.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { predict } from "./inference";
import { ML_CLASSES } from "./classes";

async function greenJpegDataUri(): Promise<string> {
  const buf = await sharp({
    create: { width: 224, height: 224, channels: 3, background: { r: 40, g: 120, b: 40 } },
  })
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

describe("predict", () => {
  it("renvoie une prédiction valide (probas sommant à ~1, classe connue)", async () => {
    const uri = await greenJpegDataUri();
    const r = await predict(uri);

    expect(ML_CLASSES).toContain(r.class);
    expect(["vine", "uncertain", "not_vine"]).toContain(r.status);
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(1);

    const sum = Object.values(r.probabilities).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 2);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `pnpm test inference`
Expected: FAIL — module `./inference` introuvable.

- [ ] **Step 3: Implémenter `inference.ts`**

Create `vineye-admin/lib/ml/inference.ts` :
```ts
import path from "node:path";
import * as ort from "onnxruntime-node";
import { classify, ML_CLASSES, type Prediction } from "./classes";
import { dataUriToBuffer, preprocessImage, MODEL_INPUT_SIZE } from "./preprocess";

const MODEL_PATH = path.join(process.cwd(), "lib", "ml", "grapevine_v1.onnx");

let sessionPromise: Promise<ort.InferenceSession> | null = null;

/** Session ONNX chargée une seule fois (réutilisée sur les invocations chaudes). */
function getSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(MODEL_PATH);
  }
  return sessionPromise;
}

/** Exécute le modèle sur un tenseur NHWC déjà normalisé → tableau de probabilités. */
export async function runModel(input: Float32Array): Promise<number[]> {
  const session = await getSession();
  const tensor = new ort.Tensor("float32", input, [1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
  const feeds: Record<string, ort.Tensor> = { [session.inputNames[0]]: tensor };
  const output = await session.run(feeds);
  const result = output[session.outputNames[0]];
  return Array.from(result.data as Float32Array);
}

/** Pipeline complet : data-URI → preprocessing → inférence → classification. */
export async function predict(dataUri: string): Promise<Prediction> {
  const buffer = dataUriToBuffer(dataUri);
  const input = await preprocessImage(buffer);
  const probabilities = await runModel(input);
  if (probabilities.length !== ML_CLASSES.length) {
    throw new Error(`Model returned ${probabilities.length} outputs`);
  }
  return classify(probabilities);
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `pnpm test inference`
Expected: PASS (1 test). Première exécution lente (chargement du modèle).

- [ ] **Step 5: Commit**

```bash
git add lib/ml/inference.ts lib/ml/inference.test.ts
git commit -m "feat(ml): onnxruntime-node inference pipeline (singleton session)"
```

---

## Task 5: `ratelimit.ts` (Upstash, no-op si non configuré)

**Files:**
- Create: `vineye-admin/lib/ratelimit.ts`

> Pas de test unitaire (dépend d'un Redis externe). Le no-op rend l'endpoint testable et le dev local fonctionnel sans Upstash.

- [ ] **Step 1: Implémenter `ratelimit.ts`**

Create `vineye-admin/lib/ratelimit.ts` :
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  retryAfterSec: number;
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// 20 requêtes / minute / IP (inférence coûteuse). Sliding window.
const limiter =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(20, "60 s"),
        prefix: "ratelimit:predict",
      })
    : null;

/**
 * Vérifie le quota IP. Si Upstash n'est pas configuré (env vars absentes),
 * autorise et log un warning — utile en dev/test, à configurer en prod.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!limiter) {
    console.warn("[ratelimit] Upstash non configuré — rate limit désactivé");
    return { success: true, retryAfterSec: 0 };
  }
  const { success, reset } = await limiter.limit(ip);
  const retryAfterSec = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return { success, retryAfterSec };
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: aucune erreur liée à `lib/ratelimit.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/ratelimit.ts
git commit -m "feat(ml): IP rate limiter via Upstash (no-op when unconfigured)"
```

---

## Task 6: `auth-optional.ts` (identité best-effort)

**Files:**
- Create: `vineye-admin/lib/auth-optional.ts`

- [ ] **Step 1: Implémenter le helper**

Create `vineye-admin/lib/auth-optional.ts` :
```ts
import type { NextRequest } from "next/server";
import { auth } from "./auth";

/**
 * Résout l'userId si un Bearer token valide est présent, sinon null.
 * Best-effort : ne bloque JAMAIS la requête (endpoint public). N'appelle
 * better-auth que si un header Authorization est présent (évite tout coût
 * DB sur le chemin anonyme).
 */
export async function resolveOptionalUserId(
  request: NextRequest,
): Promise<string | null> {
  if (!request.headers.get("authorization")) {
    return null;
  }
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: aucune erreur liée à `lib/auth-optional.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/auth-optional.ts
git commit -m "feat(ml): best-effort optional auth helper for public endpoints"
```

---

## Task 7: Schéma de validation `mobilePredictSchema`

**Files:**
- Modify: `vineye-admin/lib/validations.ts`
- Test: `vineye-admin/lib/validations.predict.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

Create `vineye-admin/lib/validations.predict.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { mobilePredictSchema } from "./validations";

describe("mobilePredictSchema", () => {
  it("accepte un data-URI image base64 valide", () => {
    const r = mobilePredictSchema.safeParse({
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    });
    expect(r.success).toBe(true);
  });

  it("rejette un image absent", () => {
    expect(mobilePredictSchema.safeParse({}).success).toBe(false);
  });

  it("rejette une string qui n'est pas un data-URI image", () => {
    expect(
      mobilePredictSchema.safeParse({ image: "hello world" }).success,
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `pnpm test validations.predict`
Expected: FAIL — `mobilePredictSchema` n'existe pas.

- [ ] **Step 3: Ajouter le schéma**

Modify `vineye-admin/lib/validations.ts` — ajouter après `mobileScanCreateSchema` (vers la ligne 106) :
```ts
export const mobilePredictSchema = z.object({
  image: z
    .string()
    .regex(
      /^data:image\/[a-zA-Z+]+;base64,.+$/,
      "Format image attendu : data-URI base64",
    ),
});
```
Et ajouter le type avec les autres exports (vers la ligne 113) :
```ts
export type MobilePredictInput = z.infer<typeof mobilePredictSchema>;
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `pnpm test validations.predict`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/validations.ts lib/validations.predict.test.ts
git commit -m "feat(ml): mobilePredictSchema (data-URI format validation)"
```

---

## Task 8: Route `POST /api/mobile/predict`

**Files:**
- Create: `vineye-admin/app/api/mobile/predict/route.ts`
- Test: `vineye-admin/app/api/mobile/predict/route.test.ts`

> Dépend de Tasks 1-7.

- [ ] **Step 1: Écrire le test qui échoue**

Create `vineye-admin/app/api/mobile/predict/route.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import sharp from "sharp";
import { POST } from "./route";
import { ML_CLASSES } from "@/lib/ml/classes";

async function imageDataUri(): Promise<string> {
  const buf = await sharp({
    create: { width: 224, height: 224, channels: 3, background: { r: 40, g: 120, b: 40 } },
  })
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/mobile/predict", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/mobile/predict", () => {
  it("200 + prediction sur image valide", async () => {
    const res = await POST(makeRequest({ image: await imageDataUri() }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(ML_CLASSES).toContain(json.prediction.class);
    expect(json.prediction).toHaveProperty("status");
    expect(json.prediction).toHaveProperty("confidence");
    expect(Object.keys(json.prediction.probabilities)).toHaveLength(4);
  });

  it("400 sur JSON invalide", async () => {
    const req = new NextRequest("http://localhost/api/mobile/predict", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ pas du json",
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("400 sur image manquante", async () => {
    expect((await POST(makeRequest({}))).status).toBe(400);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `pnpm test predict/route`
Expected: FAIL — module `./route` introuvable.

- [ ] **Step 3: Implémenter la route**

Create `vineye-admin/app/api/mobile/predict/route.ts` :
```ts
import { NextRequest } from "next/server";
import { mobilePredictSchema } from "@/lib/validations";
import { predict } from "@/lib/ml/inference";
import { checkRateLimit } from "@/lib/ratelimit";
import { resolveOptionalUserId } from "@/lib/auth-optional";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB décodé

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-API-Version": "1.0",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Taille décodée approximative d'un payload base64 (corps après la virgule). */
function decodedBase64Size(dataUri: string): number {
  const comma = dataUri.indexOf(",");
  const b64 = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
  return Math.floor((b64.length * 3) / 4);
}

export async function POST(request: NextRequest) {
  // 1. Rate limit IP
  const rate = await checkRateLimit(clientIp(request));
  if (!rate.success) {
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { ...CORS_HEADERS, "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  // 2. Parse JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // 3. Validation format
  const parsed = mobilePredictSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // 4. Garde-fou taille (413)
  if (decodedBase64Size(parsed.data.image) > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: "Image too large" },
      { status: 413, headers: CORS_HEADERS },
    );
  }

  // 5. Identité best-effort (non bloquante, réservée à un usage futur)
  await resolveOptionalUserId(request);

  // 6. Inférence
  try {
    const prediction = await predict(parsed.data.image);
    return Response.json({ prediction }, { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error("[predict] inference failed:", err);
    return Response.json(
      { error: "Inference failed" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `pnpm test predict/route`
Expected: PASS (3 tests).

- [ ] **Step 5: Lancer toute la suite de tests**

Run: `pnpm test`
Expected: tous les fichiers de test passent.

- [ ] **Step 6: Commit**

```bash
git add app/api/mobile/predict/route.ts app/api/mobile/predict/route.test.ts
git commit -m "feat(api/mobile): POST /predict ML inference endpoint"
```

---

## Task 9: Config Next.js (bundling du modèle + binaires natifs)

**Files:**
- Modify: `vineye-admin/next.config.ts`

- [ ] **Step 1: Vérifier la syntaxe Next 16**

Lire la doc locale (cf. `vineye-admin/AGENTS.md` — Next 16 a des breaking changes) :
```bash
ls node_modules/next/dist/docs/ 2>/dev/null
grep -rl "outputFileTracingIncludes\|serverExternalPackages" node_modules/next/dist/docs/ 2>/dev/null | head
```
Confirmer le nom exact des clés (`serverExternalPackages`, `outputFileTracingIncludes`) et leur emplacement (racine de `NextConfig` en Next 15/16, anciennement sous `experimental`).

- [ ] **Step 2: Modifier `next.config.ts`**

Modify `vineye-admin/next.config.ts` — ajouter les deux clés dans l'objet `nextConfig` :
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "10.0.2.2", "192.168.*.*"],
  turbopack: {
    root: ".",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // onnxruntime-node + sharp = binaires natifs : ne pas bundler, les laisser
  // en require() Node côté serveur.
  serverExternalPackages: ["onnxruntime-node", "sharp"],
  // Embarquer le modèle ONNX dans la fonction serverless de la route predict.
  outputFileTracingIncludes: {
    "/api/mobile/predict": ["./lib/ml/grapevine_v1.onnx"],
  },
};

export default nextConfig;
```
> Si Step 1 révèle que les clés sont ailleurs en Next 16, adapter en conséquence (la doc locale fait foi).

- [ ] **Step 3: Vérifier le build**

Run: `pnpm build`
Expected: build réussi, sans erreur sur `onnxruntime-node` / `sharp` / le `.onnx`.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "chore(ml): bundle ONNX model + externalize native packages (Vercel)"
```

---

## Task 10: Documentation & env vars

**Files:**
- Modify: `vineye-admin/CLAUDE.md` ou `vineye-admin/AGENTS.md` (section API mobile)
- Modify: `CHANGELOG.md` (racine, section `[Unreleased]`)

- [ ] **Step 1: Documenter les variables d'environnement Upstash**

Ajouter dans le `.env.example` de `vineye-admin/` (créer s'il n'existe pas) :
```
# Rate limiting de /api/mobile/predict (Upstash Redis — https://upstash.com)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
> Ces variables sont à créer dans le dashboard Vercel (Settings > Environment Variables) pour la prod. Sans elles, le rate limit est désactivé (no-op).

- [ ] **Step 2: Documenter l'endpoint**

Ajouter une ligne dans le tableau des routes mobiles de la doc backend (`vineye-admin/AGENTS.md` ou le CLAUDE.md racine, section « Backend sync ») :
```
| `/mobile/predict` | POST | none (rate-limit IP) | inférence ML serveur, renvoie { prediction } |
```

- [ ] **Step 3: Mettre à jour le CHANGELOG**

Modify `CHANGELOG.md` (racine) — sous `## [Unreleased]` :
```markdown
## [Unreleased]

### Ajouté
- **API `/api/mobile/predict`** : inférence ML serveur (ONNX/onnxruntime-node) pour la future PWA. Reçoit une image base64, renvoie `{ status, class, slug, confidence, probabilities }`. Public + rate-limit IP (Upstash). Mobile inchangé (reste on-device).
- Script `venv/src/export_onnx.py` : conversion `model.keras` → ONNX avec test de parité.
```

- [ ] **Step 4: Commit**

```bash
git add CHANGELOG.md vineye-admin/.env.example vineye-admin/AGENTS.md
git commit -m "docs(ml): document /predict endpoint + Upstash env vars"
```

---

## Vérification finale (manuelle, après déploiement)

- [ ] **Test d'inférence réelle (parité bout-en-bout)** : avec une vraie photo de feuille de vigne malade (ex. depuis `venv/.../data/test/`), redimensionnée à 224×224, encodée base64 :
```bash
# Construire le payload puis :
curl -X POST https://<domaine-vineye-admin>/api/mobile/predict \
  -H "Content-Type: application/json" \
  -d @payload.json
```
Expected: `{ "prediction": { "status": "vine", "class": "...", ... } }` avec une classe cohérente avec l'image (comparer au résultat on-device mobile sur la même image).

---

## Notes d'exécution
- **Ordre des tasks** : 0 → 1 → (2,3 parallélisables) → 4 → (5,6,7 parallélisables) → 8 → 9 → 10.
- Task 1 (conversion Python) et Task 4/8 (qui chargent le `.onnx`) ont une dépendance dure : le `.onnx` doit exister avant.
- DRY / YAGNI / TDD / commits fréquents respectés : chaque task est autonome et committée.
