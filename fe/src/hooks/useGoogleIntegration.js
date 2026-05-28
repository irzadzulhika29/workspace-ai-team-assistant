import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { urls } from "@/services/api";

export function useGoogleIntegration() {
  const { user, checkAuthStatus } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const googleAccount = user?.hasGoogleToken
    ? {
        name: user?.name || "",
        email: user?.email || "",
        picture: user?.picture || "",
      }
    : null;

  const handleConnectGoogle = () => {
    window.location.href = `${urls.getBackendUrl()}/api/auth/google`;
  };

  const handleDisconnectGoogle = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      await axios.post(
        `${urls.getBackendUrl()}/api/auth/google/disconnect`,
        {},
        { withCredentials: true },
      );
      await checkAuthStatus();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Koneksi Google tidak dapat diputuskan.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    googleAccount,
    isGoogleConnecting: googleLoading,
    error,
    onGoogleConnect: handleConnectGoogle,
    onGoogleDisconnect: handleDisconnectGoogle,
  };
}
