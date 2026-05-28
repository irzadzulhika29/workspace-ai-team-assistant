import { useMemo, useState } from "react";
import { urls } from "@/services/api";

export function useWebhookSettings() {
  const [webhookMode, setWebhookMode] = useState(() => urls.getMode());

  const webhookUrl = useMemo(() => {
    const baseUrl = urls.getN8nBaseUrl();
    const path = webhookMode === "test" ? "webhook-test" : "webhook";
    return `${baseUrl}/${path}`;
  }, [webhookMode]);

  const handleWebhookEnvironmentChange = (mode) => {
    urls.setMode(mode);
    setWebhookMode(mode);
  };

  return {
    webhookMode,
    webhookUrl,
    error: "",
    onWebhookEnvironmentChange: handleWebhookEnvironmentChange,
  };
}
