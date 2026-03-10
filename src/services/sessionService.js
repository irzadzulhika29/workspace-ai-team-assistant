import { SUPABASE_URL, supabaseHeaders } from "./supabase";

// ─── Chat Session API ─────────────────────────────────────────────────────────
// CRUD operasi untuk tabel `chat_sessions` dan `n8n_chat_histories`.

export const sessionApi = {
  /**
   * Membuat sesi chat baru di tabel `chat_sessions`.
   * @param {string} judulChat
   * @returns {Promise<Object|null>} objek sesi { id, judul, created_at }
   */
  buatSesiBaru: async (judulChat = "Obrolan Baru") => {
    try {
      const newSessionId = crypto.randomUUID();
      const payload = {
        id: newSessionId,
        judul: judulChat
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions`, {
        method: "POST",
        headers: {
          ...supabaseHeaders,
          Prefer: "return=representation"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`HTTP Error! Status: ${res.status}`);
      }

      const rows = await res.json();
      return rows[0] || payload;
    } catch (error) {
      console.error("Gagal membuat sesi baru:", error);
      return null;
    }
  },

  /**
   * Mengambil semua sesi chat, diurutkan terbaru di atas.
   * @returns {Promise<Array>} array sesi
   */
  ambilSemuaSesi: async () => {
    try {
      const url = `${SUPABASE_URL}/rest/v1/chat_sessions?select=id,judul,created_at&order=created_at.desc`;
      const res = await fetch(url, {
        method: "GET",
        headers: supabaseHeaders,
      });

      if (!res.ok) {
        throw new Error(`HTTP Error! Status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Gagal mengambil daftar sesi:", error);
      return [];
    }
  },

  /**
   * Mengambil riwayat chat dari sesi tertentu.
   * @param {string} sessionId - UUID sesi
   * @returns {Promise<Array>} array pesan
   */
  ambilRiwayatChat: async (sessionId) => {
    try {
      const url = `${SUPABASE_URL}/rest/v1/n8n_chat_histories?session_id=eq.${sessionId}&order=id.asc`;
      const res = await fetch(url, {
        method: "GET",
        headers: supabaseHeaders,
      });

      if (!res.ok) {
        throw new Error(`HTTP Error! Status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Gagal mengambil riwayat chat:", error);
      return [];
    }
  },

  /**
   * Menghapus sesi chat beserta seluruh pesannya.
   * Pertama hapus isi pesan di `n8n_chat_histories`, lalu hapus sesi di `chat_sessions`.
   * @param {string} sessionId - UUID sesi
   * @returns {Promise<boolean>} true jika berhasil
   */
  hapusSesiChat: async (sessionId) => {
    try {
      // Hapus isi pesan di tabel n8n_chat_histories
      const urlPesan = `${SUPABASE_URL}/rest/v1/n8n_chat_histories?session_id=eq.${sessionId}`;
      const responsPesan = await fetch(urlPesan, {
        method: "DELETE",
        headers: supabaseHeaders,
      });

      if (!responsPesan.ok) {
        throw new Error(`Gagal menghapus pesan. Status: ${responsPesan.status}`);
      }

      // Hapus sesi di tabel chat_sessions
      const urlSesi = `${SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${sessionId}`;
      const responsSesi = await fetch(urlSesi, {
        method: "DELETE",
        headers: supabaseHeaders,
      });

      if (!responsSesi.ok) {
        throw new Error(`Gagal menghapus sesi. Status: ${responsSesi.status}`);
      }

      console.log(`Riwayat chat untuk sesi ${sessionId} berhasil dihapus.`);

      return true;
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus:", error);
      return false;
    }
  },
};
