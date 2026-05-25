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
