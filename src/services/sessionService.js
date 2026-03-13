import { SUPABASE_URL, supabaseHeaders } from "./supabase";

// ─── Chat Session API ─────────────────────────────────────────────────────────
// CRUD operasi untuk tabel `chat_sessions` dan `n8n_chat_histories`.

export const sessionApi = {
  /**
   * Membuat sesi chat baru di tabel `chat_sessions`.
   * @param {string} judulChat
   * @param {string} chatType - Tipe chat: 'rag_chat' atau 'general_chat'
   * @returns {Promise<Object|null>} objek sesi { id, judul, chat_type, created_at }
   */
  buatSesiBaru: async (judulChat = "Obrolan Baru", chatType = "general_chat") => {
    try {
      const newSessionId = crypto.randomUUID();
      const payload = {
        id: newSessionId,
        judul: judulChat,
        chat_type: chatType,
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
   * @param {string|null} chatType - Filter berdasarkan tipe chat ('rag_chat' / 'general_chat'), atau null untuk semua.
   * @returns {Promise<Array>} array sesi
   */
  ambilSemuaSesi: async (chatType = null) => {
    try {
      const filter = chatType ? `&chat_type=eq.${chatType}` : "";
      const url = `${SUPABASE_URL}/rest/v1/chat_sessions?select=id,judul,chat_type,created_at&order=created_at.desc${filter}`;
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
   * Mengambil riwayat chat dari sesi tertentu dan menyaring jejak internal AI.
   * @param {string} sessionId - UUID sesi
   * @returns {Promise<Array>} array pesan yang sudah bersih
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

      const rows = await res.json();

      // PROSES FILTERING: Membuang log internal dan pesan tool
      const barisBersih = rows.filter((row) => {
        // Ekstrak struktur JSON bawaan n8n/LangChain
        const msg = row.message;
        if (!msg) return false;

        // Cari isi teksnya (struktur JSON n8n bisa berbeda-beda)
        const content = msg.kwargs?.content || msg.data?.content || msg.content || "";
        // Cari tipe pesannya (Human/AI/Tool)
        const type = (msg.id?.[msg.id.length - 1] || msg.type || "").toLowerCase();

        // 1. Buang jika ini adalah pesan dari Tool
        if (type.includes("tool") || type.includes("function")) return false;

        // 2. Buang jika ini adalah jejak aksi AI internal (Calling Agent)
        if (content.includes("Calling RAG_Agent") || content.includes("Calling Planner_Agent")) return false;

        // 3. Buang jika ini adalah data mentah JSON output
        if (content.trim().startsWith('[{"output"')) return false;

        // 4. Buang jika pesannya kosong
        if (!content.trim()) return false;

        // Jika lolos semua filter di atas, simpan pesan ini
        return true;
      });

      return barisBersih;
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
