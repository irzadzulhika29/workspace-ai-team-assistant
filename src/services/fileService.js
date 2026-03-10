import axios from "axios";
import { SUPABASE_URL, supabaseHeaders } from "./supabase";
import { urls, getSessionId } from "./api";

// ─── File / Document API ──────────────────────────────────────────────────────
export const fileApi = {
  /**
   * Upload a document for indexing via n8n webhook.
   * @param {File} file
   * @param {string} folder - "input" | "output"
   * @param {string} fileName
   * @returns {Promise<any>}
   */
  uploadDocument: async (file, folder = "input", fileName = "") => {
    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file);
    formData.append("file_name", (fileName || file?.name || "").trim());
    formData.append("kategori", folder);
    formData.append("folder", folder);
    formData.append("session_id", getSessionId());
    const res = await axios.post(urls.getUpload(), formData, {
      timeout: 120_000,
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  /**
   * Fetch all documents from the Supabase `dokumen` table.
   * @returns {Promise<Array>} array of document records
   */
  fetchDokumen: async () => {
    const url = `${SUPABASE_URL}/rest/v1/dokumen?select=*&order=created_at.desc`;
    const res = await fetch(url, {
      method: "GET",
      headers: supabaseHeaders,
    });

    if (!res.ok) {
      throw new Error("Gagal menarik data dari Supabase");
    }

    return res.json();
  },
};
