# Design — Endpoint d'inférence ML `/api/mobile/predict`

**Date** : 2026-05-25
**Statut** : Validé (en attente relecture)
**Cible** : `vineye-admin` (Next.js 16, déployé sur Vercel, région `cdg1`)

---

## 1. Contexte & objectif

VinEye (app mobile Expo) embarque un modèle TFLite exécuté **on-device** (validé sur Android).
Une **PWA** est prévue, mais `react-native-fast-tflite` est natif-only et ne tourne pas sur web.

Décision produit : la PWA suppose une **connexion internet permanente** (pas d'offline).
On déplace donc l'inférence **côté serveur** : un endpoint dans `vineye-admin` reçoit une image,
exécute le modèle et renvoie la classification. La PWA n'a qu'à envoyer l'image et afficher le résultat.

Le modèle source Keras (`model.keras`) est disponible → conversion propre en ONNX.

---

## 2. Décisions cadrées (brainstorming)

| # | Décision | Choix |
|---|----------|-------|
| 1 | Périmètre | **PWA uniquement.** Le mobile garde son inférence on-device inchangée (aucune régression). |
| 2 | Auth | **Public** (invités autorisés, comme le mobile) + **rate-limit IP strict** ; `userId` rattaché best-effort si un Bearer token est présent. |
| 3 | Format image | **Base64 dans du JSON** (`{ image: "data:image/jpeg;base64,..." }`), cohérent avec `apiPost`. |
| 4 | Calcul du statut | **Serveur calcule tout** : applique les seuils, renvoie `{ status, class, slug, confidence, probabilities }`. PWA « bête ». |
| 5 | Persistance | `/predict` **stateless** (inférence seule). La PWA appelle `/api/mobile/scans` séparément si elle veut sauvegarder. |
| 6 | Runtime inférence | **`onnxruntime-node`** (via conversion ONNX). Écarté : TF.js client (offline non requis), VPS Python (2e service inutile pour l'instant). |
| 7 | Rate limiting | **`@upstash/ratelimit` + Upstash Redis** (store partagé, fiable sur Vercel serverless — l'in-memory ne tient pas entre instances Lambda). |

---

## 3. Spécification du modèle (source de vérité)

Architecture (`venv/src/models.py`) :
MobileNetV2 (`include_top=False`, poids imagenet) → `GlobalAveragePooling2D` → `Dense(100, relu)` → `Dense(100, relu)` → `Dense(4, softmax)`.

- **Softmax inclus dans le modèle** → sortie = 4 probabilités directement.
- **Input** : `[1, 224, 224, 3]`, float32, layout **NHWC**.
- **Normalisation** : **`/255` → [0, 1]** (entraînement avec `Rescaling(1./255)`, **PAS** `mobilenet_v2.preprocess_input`).
- **Resize** : sans préservation du ratio (`image_dataset_from_directory` redimensionne en `fill`).
- **Ordre des classes** (autoritatif, `VinEye/src/services/ml/classes.ts`) :
  `['black_rot', 'esca', 'healthy', 'leaf_blight']` → index 0/1/2/3 de la sortie softmax.
- **Mapping slug** : `healthy → null`, `black_rot → black-rot`, `esca → esca`, `leaf_blight → leaf-blight`.
- **Seuils de confidence** : `≥ 0.70` → `vine` · `0.40–0.70` → `uncertain` · `< 0.40` → `not_vine`.

---

## 4. Architecture & flux

```
PWA (navigateur)
  └─ resize image → 224×224 JPEG → base64 (data-URI)
     └─ POST /api/mobile/predict   { image: "data:image/jpeg;base64,..." }
        └─ [route] CORS + OPTIONS
           ├─ rate-limit par IP (Upstash)               → 429 + Retry-After si dépassé
           ├─ auth best-effort (token optionnel → userId)
           ├─ Zod valide le payload                       → 400 si invalide
           ├─ preprocess (sharp): decode → resize 224² fill → RGB Float32 /255 → [1,224,224,3]
           ├─ inference (onnxruntime-node): session singleton → 4 probas softmax
           └─ argmax + seuils → { prediction }            → 200
```

---

## 5. Composants & fichiers

### 5.1 Conversion du modèle (Python, exécutée une fois)

`venv/src/export_onnx.py` :
1. Charge `models/2026-03-23_11-55-09/model.keras`.
2. Exporte en SavedModel (`model.export(...)`).
3. Convertit via `tf2onnx` (opset 13) → `model.onnx`.
4. **Test de parité** : compare sorties ONNX vs Keras sur quelques images échantillons (écart absolu max < 1e-4). Bloque si la conversion dérive.
5. Copie le `.onnx` validé vers `vineye-admin/lib/ml/grapevine_v1.onnx`.

Prérequis : `pip install tf2onnx onnx` dans le venv (TensorFlow déjà présent). Le venv peut nécessiter une réinstallation des deps (site-packages non versionné).

### 5.2 Backend `vineye-admin`

| Fichier | Rôle |
|---------|------|
| `lib/ml/grapevine_v1.onnx` | Modèle converti (~10-14 MB). **Hors `/public`** (privé). Committé. |
| `lib/ml/classes.ts` | Miroir de `classes.ts` mobile : `ML_CLASSES`, `CLASS_TO_SLUG`, seuils. Source de vérité backend. |
| `lib/ml/preprocess.ts` | sharp : base64 → decode → `resize(224,224,{fit:"fill"})` → RGB → `Float32Array` `/255` → NHWC. |
| `lib/ml/inference.ts` | `onnxruntime-node` : session singleton (module-scope), `runInference(input) → number[4]`, puis argmax + seuils → objet `prediction`. |
| `lib/ratelimit.ts` | `@upstash/ratelimit` + client Redis Upstash. Limiter IP pour `/predict`. |
| `lib/validations.ts` | Ajout `mobilePredictSchema` : valide **le format** data-URI base64 (préfixe `data:image/...;base64,` + corps base64 non vide). La **taille** est un garde-fou séparé (→ 413), pas dans Zod. |
| `app/api/mobile/predict/route.ts` | Handler POST + OPTIONS. `runtime = "nodejs"`, `maxDuration = 30`. Pattern CORS de `scans/route.ts`. |
| `next.config.ts` | `serverExternalPackages: ["onnxruntime-node", "sharp"]` + `outputFileTracingIncludes` pour embarquer le `.onnx`. |

### 5.3 Contrat de la route

Requête : `POST /api/mobile/predict`
```json
{ "image": "data:image/jpeg;base64,/9j/4AAQ..." }
```

Réponses :
```
200 { prediction: { status, class, slug, confidence, probabilities } }
400 { error: "Invalid JSON" | "Validation failed", details? }   // JSON / format data-URI / decode invalide
413 { error: "Image too large" }                                 // garde-fou taille (vérifié avant Zod)
429 { error: "Too many requests" }  + header Retry-After          // rate limit dépassé
500 { error: "Inference failed" }                                 // chargement modèle / runtime
```

Exemple `200` :
```json
{
  "prediction": {
    "status": "vine",
    "class": "black_rot",
    "slug": "black-rot",
    "confidence": 0.92,
    "probabilities": { "black_rot": 0.92, "esca": 0.04, "healthy": 0.02, "leaf_blight": 0.02 }
  }
}
```

---

## 6. Gestion d'erreurs & cas limites

| Cas | Comportement |
|-----|--------------|
| JSON malformé | 400 `Invalid JSON` |
| `image` absent / non data-URI / base64 invalide | 400 `Validation failed` |
| Image trop volumineuse (> borne) | 413 `Image too large` |
| Image corrompue / non décodable par sharp | 400 `Validation failed` |
| Rate limit IP dépassé | 429 + `Retry-After` |
| Échec chargement modèle / inférence | 500 `Inference failed` (détail loggé serveur, pas exposé) |
| Cold start | Session singleton chargée au module → seule la 1re invocation froide paie le coût (~1-3 s) |

Aucune stack trace exposée. Logs serveur sans donnée sensible (pas d'image, pas de token).

---

## 7. Sécurité

- Rate-limit IP via Upstash (obligatoire, endpoint public coûteux en CPU).
- Auth best-effort : si Bearer présent et valide → `userId` disponible (pour usage futur / télémétrie), mais jamais bloquant.
- Validation Zod stricte au point d'entrée.
- Modèle hors `/public`.
- CORS : aligné sur les routes mobiles existantes (`Access-Control-Allow-Origin: *`, `X-API-Version`).
- Env vars Upstash (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) — jamais commitées.

---

## 8. Tests

- **Python (conversion)** : parité ONNX ↔ Keras sur images échantillons (écart < 1e-4).
- **Backend unit** :
  - `preprocess.ts` : image connue → stats de tenseur attendues (shape, min/max, longueur).
  - `inference.ts` : image vigne connue → classe attendue + confidence plausible.
  - route : payloads invalides → 400 / 413 ; dépassement → 429.
- **Parité bout-en-bout** : même image → résultat serveur ≈ résultat on-device mobile (même classe, confidence proche).

---

## 9. Hors-scope (YAGNI)

- La PWA elle-même (projet/itération séparé).
- Toute modification du code mobile (reste on-device).
- Persistance du scan dans `/predict` (la PWA appellera `/scans`).
- Stockage/upload des images de scan.
- Ré-entraînement ou nouvel export du modèle.

---

## 10. Risques & points à valider en implémentation

1. **Next.js 16 spécifique** : `outputFileTracingIncludes` et `serverExternalPackages` doivent être validés contre `node_modules/next/dist/docs/` (cf. `vineye-admin/AGENTS.md` — « This is NOT the Next.js you know »).
2. **Binaire natif `onnxruntime-node` sur Vercel** : doit être correctement embarqué dans le bundle de la fonction (linux-x64). Risque de tree-shaking / exclusion → vérifier le packaging.
3. **Embarquer le `.onnx`** dans le file tracing de la fonction (sinon `ENOENT` au runtime).
4. **tf2onnx + MobileNetV2** : conversion réputée fiable, mais le test de parité (5.1.4) est la garde.
5. **Cold start** : acceptable pour un scan ponctuel ; si gênant plus tard → bascule VPS persistant.
