// NOTE: Pour que le mobile accede au backend en dev, lancer Next.js avec :
//   pnpm dev -H 0.0.0.0
// Cela rend le serveur accessible sur le reseau local (pas uniquement localhost).

import Constants from "expo-constants";
import { Platform } from "react-native";

function getBaseUrl(): string {
  if (!__DEV__) {
    return "https://vineye-api.yuxdev.fr/api/mobile";
  }

  // Expo expose l'IP du PC dev via hostUri (ex: "192.168.1.42:8081")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manifest2 = (Constants as any).manifest2;
  const debuggerHost: string | undefined =
    Constants.expoConfig?.hostUri ??
    manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:3000/api/mobile`;
  }

  // Fallback par plateforme
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api/mobile";
  }

  return "http://localhost:3000/api/mobile";
}

export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  timeout: 10000,
  cacheTTL: 3600000,
} as const;
