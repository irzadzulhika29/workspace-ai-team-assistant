import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { urls } from "@/services/api";

const getCompanyName = (email) => {
  const domain = String(email || "").split("@")[1] || "";
  if (!domain) return "";

  const [company] = domain.split(".");
  if (!company) return "";

  return company.charAt(0).toUpperCase() + company.slice(1);
};

export function useProfileSettings() {
  const { user, checkAuthStatus } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
  });
  const [initialProfileForm, setInitialProfileForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
  });
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const nextProfile = {
      name: user?.name || "",
      email: user?.email || "",
      company: getCompanyName(user?.email),
      role: user?.jobTitle || "",
    };

    setProfileForm(nextProfile);
    setInitialProfileForm(nextProfile);
  }, [user?.email, user?.jobTitle, user?.name]);

  const handleProfileChange = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setError("");

    try {
      await axios.patch(
        `${urls.getBackendUrl()}/api/auth/profile`,
        {
          name: profileForm.name,
          jobTitle: profileForm.role,
        },
        { withCredentials: true },
      );

      await checkAuthStatus();
      setInitialProfileForm(profileForm);
      setIsProfileEditing(false);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Profil tidak dapat diperbarui saat ini.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileReset = () => {
    setProfileForm(initialProfileForm);
    setIsProfileEditing(false);
    setError("");
  };

  const handleEditToggle = () => {
    setIsProfileEditing((current) => !current);
    setError("");
  };

  return {
    profileForm,
    isProfileEditing,
    profileLoading,
    error,
    onProfileChange: handleProfileChange,
    onProfileSave: handleProfileSave,
    onProfileReset: handleProfileReset,
    onEditToggle: handleEditToggle,
  };
}
