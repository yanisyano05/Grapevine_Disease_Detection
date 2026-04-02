import { useState, useCallback } from 'react';
import { runInference } from '@/services/tflite/model';
import type { Detection } from '@/types/detection';

// TODO: Remplacer par le vrai hook TFLite avec react-native-fast-tflite
export function useDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastDetection, setLastDetection] = useState<Detection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (imageUri?: string): Promise<Detection | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const detection = await runInference(imageUri);
      setLastDetection(detection);
      return detection;
    } catch (err) {
      setError('Erreur lors de l\'analyse. Veuillez réessayer.');
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
