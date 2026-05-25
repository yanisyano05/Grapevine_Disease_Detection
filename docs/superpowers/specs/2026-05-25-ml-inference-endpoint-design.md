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

Le modèle est converti une fois en ONNX **depuis le `.tflite`** (artefact inference-only validé sur mobile) — voir §3 et §5.1 pour la raison.

---

## 2. Décisions cadrées (brainstorming)

| # | Décision | Choix |
|---|----------|-------|
| 1 | Périmètre | **PWA uniquement.** Le mobile garde son inférence on-device inchangée (aucune régression). |
| 2 | Auth | **Public** (invités autorisés, comme le mobile) + **rate-limit IP strict** ; `userId` rattaché best-effort si un Bearer token est présent. |
| 3 | Format image | **Base64 dans du JSON** (`{ image: "data:image/jpeg;base64,..." }`), cohérent avec `apiPost`. |
| 4 | Calcul du statut | **Serveur calcule tout** : applique les seuils, renvoie `{ status, class, slug, confidence, probabilities }`. PWA « bête ». |
| 5 | Persistance | `/predict` **stateless** (inférence seule). La PWA appelle `/api/mobile/scans` séparément si elle veut sauvegarder. |
| 6 | Runtime inférence | **`onnxruntime-node`** (ONNX converti **depuis le `.tflite`**, cf. §5.1). Écarté : TF.js client (offline non requis), VPS Python (2e service inutile pour l'instant). |
| 7 | Rate limiting | **`@upstash/ratelimit` + Upstash Redis** (store partagé, fiable sur Vercel serverless — l'in-memory ne tient pas entre instances Lambda). |

---

## 3. Spécification du modèle (source de vérité — VÉRIFIÉE empiriquement le 2026-05-25)

> ⚠️ `venv/src/models.py` ne reflète **pas** le modèle réellement entraîné. La spec ci-dessous
> vient du chargement du vrai `model.keras` + `model.tflite` (diagnostic de la session).

Architecture réelle : **CNN custom** (un `Sequential` d'augmentation en tête, puis empilement `Conv2D`/`BatchNormalization`/`MaxPooling2D`/`Dropout` → `GlobalAveragePooling2D` → 3× `Dense`). **Pas MobileNetV2.** Pour l'endpoint, le modèle est une **boîte noire** : image → 4 logits.

- **Sortie = LOGITS** (dernière couche `Dense` activation `linear`). **PAS de softmax dans le modèle.**
  → le **softmax est appliqué côté serveur** avant les seuils (comme sur mobile : `softmax()` dans `VinEye/src/services/ml/preprocessing.ts`).
- **Input** : `[1, 224, 224, 3]`, float32, layout **NHWC**.
- **Normalisation** : **`/255` → [0, 1]** — aligné sur le preprocessing mobile validé (`preprocessing.ts` : resize 224² + `/255`). Le modèle a aussi un `Rescaling(1/255)` interne, mais on **reproduit exactement le chemin mobile validé** : l'ONNX issu du `.tflite` est identique au `.tflite` à ~1.5e-4 près.
- **Resize** : 224×224 sans préservation du ratio (`fit:"fill"`), comme le mobile.
- **Ordre des classes** (autoritatif, `VinEye/src/services/ml/classes.ts`) :
  `['black_rot', 'esca', 'healthy', 'leaf_blight']` → index 0/1/2/3 de la sortie.
- **Mapping slug** : `healthy → null`, `black_rot → black-rot`, `esca → esca`, `leaf_blight → leaf-blight`.
- **Seuils de confidence** (appliqués sur les probas APRÈS softmax) : `≥ 0.70` → `vine` · `0.40–0.70` → `uncertain` · `< 0.40` → `not_vine`.

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
           ├─ inference (onnxruntime-node): session singleton → 4 logits
           ├─ softmax(logits) → 4 probas
           └─ argmax + seuils → { prediction }            → 200
```

---

## 5. Composants & fichiers

### 5.1 Conversion du modèle (Python, exécutée une fois) — ✅ FAITE (2026-05-25)

> **Pourquoi depuis le `.tflite` et non le `.keras`** : `model.keras` commence par un `Sequential`
> d'augmentation (RandomFlip/Rotation/Zoom) dont les ops random (`StatelessRandomUniformV2`,
> `ImageProjectiveTransformV3`) **ne sont pas convertibles en ONNX** → onnxruntime refuse de charger
> l'ONNX issu du keras. Le `.tflite` est inference-only et donne un ONNX **valide**.

`venv/src/export_onnx.py` :
1. `tf2onnx.convert --tflite models/2026-03-23_11-55-09/model.tflite --opset 13 → model.onnx`.
2. **Test de parité** : ONNX vs TFLite sur 3 entrées aléatoires (écart max < 1e-3 ; mesuré ~1.5e-4).
3. Copie le `.onnx` validé vers `vineye-admin/lib/ml/grapevine_v1.onnx` (4.9 MB).

Env de conversion : venv Python 3.11 dédié `.venv-ml/` (Windows) avec `tensorflow tf2onnx onnx onnxruntime`.
> Statut : déjà exécuté dans la session — le `.onnx` est présent dans le backend. Cette task se résume à vérifier sa présence.

### 5.2 Backend `vineye-admin`

| Fichier | Rôle |
|---------|------|
| `lib/ml/grapevine_v1.onnx` | Modèle converti (4.9 MB). **Hors `/public`** (privé). Committé. |
| `lib/ml/classes.ts` | Miroir de `classes.ts` mobile : `ML_CLASSES`, `CLASS_TO_SLUG`, seuils. Source de vérité backend. |
| `lib/ml/preprocess.ts` | sharp : base64 → decode → `resize(224,224,{fit:"fill"})` → RGB → `Float32Array` `/255` → NHWC. |
| `lib/ml/inference.ts` | `onnxruntime-node` : session singleton (module-scope), `runModel(input) → number[4]` **logits**, puis **`softmax()`** → probas → `classify()` (argmax + seuils) → objet `prediction`. Nom d'entrée/sortie lus dynamiquement (`session.inputNames[0]` / `outputNames[0]`). |
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

- **Python (conversion)** : parité ONNX ↔ TFLite sur entrées aléatoires (écart < 1e-3). ✅ fait.
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
4. **Conversion ONNX** : ✅ résolue — keras→ONNX cassé (ops random), `.tflite`→ONNX valide et vérifié (parité ~1.5e-4).
5. **Sortie = logits** : ne pas oublier le `softmax()` côté serveur avant les seuils (sinon `confidence` aberrante).
6. **Cold start** : acceptable pour un scan ponctuel ; si gênant plus tard → bascule VPS persistant.
