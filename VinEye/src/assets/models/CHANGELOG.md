# Embedded model — `grapevine_v1.tflite`

Architecture commune à tous les exports : MobileNetV2, input
`[1, 224, 224, 3]` float32, output `[1, 4]` float32 (4 classes :
`black_rot`, `esca`, `healthy`, `leaf_blight`).

## Historique des swaps

| Active depuis | Source d'export                              | sha256 prefix     | Taille | Notes                                                         |
| --- | --- | --- | --- | --- |
| **2026-05-01** | `venv/models/2026-03-23_11-55-09/model.tflite` | `7d5b797bfdf4d3a8` | 5.1 MB | **En production.** Sensiblement plus précis que l'export initial sur des feuilles réelles. APK plus léger de ~4 MB. |
| 2026-04-30    | export initial                                  | `c724595f61e795f9` | 9.4 MB | Première version embarquée. Sortait des classes peu fiables sur des feuilles réelles. Conservée nulle part — overwritée par le swap.  |

## Autres exports disponibles (rollback potentiel)

- `venv/models/2026-03-15_14-40-09/model.tflite` — `c248355f96bed95b`, 5.1 MB. Premier raffiné, ~8 jours avant celui en prod, pas testé sur device.

## Procédure de swap

```powershell
cp "venv\models\<date>\model.tflite" "VinEye\src\assets\models\grapevine_v1.tflite"
cd VinEye
pnpm dlx expo run:android   # ou EAS rebuild pour la prod
```

Aucune modification de code requise tant que la nouvelle version garde
la même I/O signature (`[1, 224, 224, 3]` → `[1, 4]`). Si le shape change,
mettre à jour `MODEL_INPUT_SIZE` dans `src/services/ml/preprocessing.ts`.
