"""Convertit le modèle embarqué (.tflite) en ONNX pour l'inférence serveur.

Pourquoi depuis le .tflite et non le .keras :
- model.keras commence par un Sequential d'augmentation (RandomFlip/Rotation/Zoom)
  dont les ops random (StatelessRandomUniformV2, ImageProjectiveTransformV3) ne
  sont PAS convertibles en ONNX → l'ONNX produit est invalide (onnxruntime refuse
  de le charger : "No Op registered for StatelessRandomUniformV2").
- Le .tflite est l'artefact inference-only validé sur mobile (Android). tf2onnx le
  convertit en ONNX valide qui reproduit le tflite à ~1e-4 près.

Le modèle sort des LOGITS (dernière couche Dense linéaire) : le softmax est appliqué
côté serveur (cf. vineye-admin/lib/ml/inference.ts), comme sur mobile.

Usage : python export_onnx.py
"""
import os
import shutil
import subprocess
import sys

import numpy as np
import tensorflow as tf
import onnxruntime as ort

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(HERE, "..", "models", "2026-03-23_11-55-09")
TFLITE_PATH = os.path.join(MODEL_DIR, "model.tflite")
ONNX_PATH = os.path.join(MODEL_DIR, "model.onnx")
BACKEND_DEST = os.path.join(
    HERE, "..", "..", "vineye-admin", "lib", "ml", "grapevine_v1.onnx"
)
IMG_SIZE = 224
OPSET = 13


def main():
    # 1. Conversion .tflite -> ONNX via la CLI tf2onnx
    subprocess.run(
        [
            sys.executable, "-m", "tf2onnx.convert",
            "--tflite", TFLITE_PATH,
            "--output", ONNX_PATH,
            "--opset", str(OPSET),
        ],
        check=True,
    )
    print(f"ONNX écrit : {ONNX_PATH}")

    # 2. Parité tflite <-> ONNX : 3 entrées aléatoires, écart max < 1e-3
    interp = tf.lite.Interpreter(model_path=TFLITE_PATH)
    interp.allocate_tensors()
    in_det = interp.get_input_details()[0]
    out_det = interp.get_output_details()[0]

    sess = ort.InferenceSession(ONNX_PATH, providers=["CPUExecutionProvider"])
    onnx_in = sess.get_inputs()[0].name

    max_diff = 0.0
    for seed in range(3):
        rng = np.random.default_rng(seed)
        x = rng.random((1, IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
        interp.set_tensor(in_det["index"], x)
        interp.invoke()
        tflite_out = interp.get_tensor(out_det["index"]).astype(np.float32)
        onnx_out = sess.run(None, {onnx_in: x})[0]
        max_diff = max(max_diff, float(np.abs(tflite_out - onnx_out).max()))
    print(f"Écart max TFLite/ONNX : {max_diff:.2e}")
    assert max_diff < 1e-3, f"Parité échouée : {max_diff}"

    # 3. Copie vers le backend
    os.makedirs(os.path.dirname(BACKEND_DEST), exist_ok=True)
    shutil.copyfile(ONNX_PATH, BACKEND_DEST)
    print(f"Copié vers : {BACKEND_DEST}")


if __name__ == "__main__":
    main()
