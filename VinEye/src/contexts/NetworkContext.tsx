import { createContext, useContext, useEffect, useRef } from "react";
import { useNetworkStatus, type NetworkStatus } from "@/hooks/useNetworkStatus";

interface NetworkContextValue extends NetworkStatus {
  wasOffline: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isInternetReachable: null,
  connectionType: "unknown",
  wasOffline: false,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const status = useNetworkStatus();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!status.isConnected) {
      wasOfflineRef.current = true;
    }
  }, [status.isConnected]);

  return (
    <NetworkContext.Provider
      value={{ ...status, wasOffline: wasOfflineRef.current }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  return useContext(NetworkContext);
}
