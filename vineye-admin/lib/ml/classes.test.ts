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
