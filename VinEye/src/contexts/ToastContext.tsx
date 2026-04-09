import { useEffect, useRef } from "react";
import { toast } from "sonner-native";
import { useNetwork } from "@/contexts/NetworkContext";

// Auto-show offline/online toasts based on network status
export function NetworkToastWatcher({ children }: { children: React.ReactNode }) {
  const { isConnected } = useNetwork();
  const prevConnected = useRef(true);

  useEffect(() => {
    if (!isConnected && prevConnected.current) {
      toast.error("Mode hors-ligne", {
        description: "Les donnees en cache seront utilisees",
        duration: Infinity,
        id: "offline",
      });
    } else if (isConnected && !prevConnected.current) {
      toast.dismiss("offline");
      toast.success("Connexion retablie", { duration: 2500 });
    }
    prevConnected.current = isConnected;
  }, [isConnected]);

  return <>{children}</>;
}
