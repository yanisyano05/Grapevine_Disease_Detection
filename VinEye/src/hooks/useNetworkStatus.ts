import { useState, useEffect, useCallback } from "react";
import * as Network from "expo-network";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
}

const POLL_INTERVAL = 5000;

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    connectionType: "unknown",
  });

  const checkNetwork = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        connectionType: state.type ?? "unknown",
      });
    } catch {
      setStatus({
        isConnected: false,
        isInternetReachable: false,
        connectionType: "unknown",
      });
    }
  }, []);

  useEffect(() => {
    checkNetwork();
    const interval = setInterval(checkNetwork, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkNetwork]);

  return status;
}
