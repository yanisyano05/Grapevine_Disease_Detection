import { useState, useCallback } from 'react';
import { runInference } from '@/services/tflite/model';
import type { Detection } from '@/types/detection';

export function useDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastDetection, setLastDetection] = useState<Detection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (imageUri?: string): Promise<Detection | null> => {
    setIsAnalyzing(true);
    setError(null);

    // Yield au scheduler pour que React commit le render `isAnalyzing=true`
    // (le skeleton overlay) AVANT que runSync() ne bloque le JS thread ~500-1500ms.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );

    const startedAt = Date.now();
    try {
      const detection = await runInference(imageUri);
      // UX : maintenir le skeleton visible au moins 600ms pour éviter un flash
      // perçu comme un bug ("rien ne se passe") quand l'inférence est très rapide.
      const elapsed = Date.now() - startedAt;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }
      setLastDetection(detection);
      return detection;
    } catch (err) {
      setError("Erreur lors de l'analyse. Veuillez reessayer.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLastDetection(null);
    setError(null);
  }, []);

  return { analyze, isAnalyzing, lastDetection, error, reset };
}
