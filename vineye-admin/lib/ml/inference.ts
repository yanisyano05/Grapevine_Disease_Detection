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

/** Softmax numériquement stable : logits → probabilités sommant à 1. */
export function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

/**
 * Exécute le modèle sur un tenseur NHWC normalisé → LOGITS bruts (4 valeurs).
 * ⚠️ Le modèle sort des logits, PAS des probabilités — softmax appliqué dans predict().
 */
export async function runModel(input: Float32Array): Promise<number[]> {
  const session = await getSession();
  const tensor = new ort.Tensor("float32", input, [1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
  const feeds: Record<string, ort.Tensor> = { [session.inputNames[0]]: tensor };
  const output = await session.run(feeds);
  const result = output[session.outputNames[0]];
  return Array.from(result.data as Float32Array);
}

/** Pipeline complet : data-URI → preprocessing → inférence → softmax → classification. */
export async function predict(dataUri: string): Promise<Prediction> {
  const buffer = dataUriToBuffer(dataUri);
  const input = await preprocessImage(buffer);
  const logits = await runModel(input);
  if (logits.length !== ML_CLASSES.length) {
    throw new Error(`Model returned ${logits.length} outputs`);
  }
  const probabilities = softmax(logits);
  return classify(probabilities);
}
