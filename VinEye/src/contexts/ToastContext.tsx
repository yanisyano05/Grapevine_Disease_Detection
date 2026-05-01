import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { useNetwork } from "@/contexts/NetworkContext";

// Auto-show offline/online toasts based on network status
export function NetworkToastWatcher({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isConnected } = useNetwork();
  const prevConnected = useRef(true);

  useEffect(() => {
    if (!isConnected && prevConnected.current) {
      toast.error(t("network.offlineToastTitle"), {
        description: t("network.offlineToastDescription"),
        duration: Infinity,
        id: "offline",
      });
    } else if (isConnected && !prevConnected.current) {
      toast.dismiss("offline");
      toast.success(t("network.onlineToastTitle"), { duration: 2500 });
    }
    prevConnected.current = isConnected;
  }, [isConnected, t]);

  return <>{children}</>;
}
