import axios from "axios";
import { urls, getSessionId } from "./api";

const getBackendUrl = () => import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const fetchCurrentUser = async () => {
  try {
    const res = await axios.get(`${getBackendUrl()}/api/auth/me`, {
      withCredentials: true,
      timeout: 8_000,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
};
export const fileApi = {
  uploadDocument: async (file, folder = "input", fileName = "") => {
    const currentUser = await fetchCurrentUser();

    if (!currentUser?.id) {
      throw new Error("Silakan login terlebih dahulu agar dokumen tersimpan di akun Anda.");
    }

    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file);
    formData.append("file_name", (fileName || file?.name || "").trim());
    formData.append("kategori", folder);
    formData.append("folder", folder);
    formData.append("session_id", getSessionId());
    formData.append("user_id", currentUser.id);
    const res = await axios.post(urls.getUpload(), formData, {
      timeout: 120_000,
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  fetchDokumen: async () => {
    const res = await axios.get(`${urls.getBackendUrl()}/api/dokumen`, {
      withCredentials: true,
    });
    return res.data;
  },

  deleteDokumen: async (documentId) => {
    const res = await axios.delete(`${urls.getBackendUrl()}/api/dokumen/${documentId}`, {
      withCredentials: true,
    });
    return res.data;
  },

  deleteDokumenBulk: async (documentIds) => {
    const res = await axios.delete(`${urls.getBackendUrl()}/api/dokumen/bulk`, {
      data: { documentIds },
      withCredentials: true,
    });
    return res.data;
  },
};
