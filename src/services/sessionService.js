import axios from "axios";
import { urls } from "./api";

// ─── Chat Session API ─────────────────────────────────────────────────────────
// CRUD operasi untuk tabel `chat_sessions` dan `chat_messages`.

export const sessionApi = {
  /**
   * Membuat sesi chat baru di tabel `chat_sessions`.
   * @param {string} judulChat
   * @param {string} chatType - Tipe chat: 'rag_chat' atau 'general_chat'
   * @returns {Promise<Object|null>} objek sesi { id, judul, chat_type, created_at }
   */
  buatSesiBaru: async (judulChat = "Obrolan Baru", chatType = "general_chat") => {
    try {
      const res = await axios.post(`${urls.getBackendUrl()}/api/sessions`, {
        judul: judulChat,
        chat_type: chatType,
      });
      return res.data;
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
      const params = chatType ? { chat_type: chatType } : {};
      const res = await axios.get(`${urls.getBackendUrl()}/api/sessions`, { params });
      return res.data;
    } catch (error) {
      console.error("Gagal mengambil daftar sesi:", error);
      return [];
    }
  },

  /**
   * Mengambil riwayat chat dari sesi tertentu dan mengkonversi ke format yang diharapkan.
   * Juga inject URL dokumen untuk pesan yang memiliki trigger PDF.
   * @param {string} sessionId - UUID sesi
   * @returns {Promise<Array>} array pesan yang sudah diformat
   */
  ambilRiwayatChat: async (sessionId) => {
    try {
      const res = await axios.get(`${urls.getBackendUrl()}/api/sessions/${sessionId}/history`);
      const { history: rows, dokumen } = res.data;

      let docIndex = 0;
      const messages = [];

      // Konversi dari struktur chat_messages (input/output) ke format yang diharapkan
      for (const row of rows) {
        // Tambahkan pesan user (input)
        if (row.input && row.input.trim()) {
          messages.push({
            id: `${row.id}-input`,
            message: {
              content: row.input,
              type: 'HumanMessage',
            },
            created_at: row.created_at,
          });
        }

        // Tambahkan pesan AI (output)
        if (row.output && row.output.trim()) {
          let content = row.output;

          // Cek apakah ini trigger PDF dan inject URL jika ada
          const isPdfTrigger =
            content.includes("Unduh Dokumen (PDF)") ||
            content.includes("Unduh Presentasi (PDF)") ||
            content.includes("Unduh Laporan (PDF)");

          if (isPdfTrigger && dokumen?.[docIndex]) {
            const url = dokumen[docIndex].file_url;
            const namaFile = dokumen[docIndex].nama_file;
            docIndex++;

            content = `Laporan Anda sudah siap! Silakan unduh dokumen PDF-nya melalui tautan aman berikut ini:\n\n📄 ${namaFile}\n🔗 ${url}`;
          }

          messages.push({
            id: `${row.id}-output`,
            message: {
              content,
              type: 'AIMessage',
            },
            created_at: row.created_at,
          });
        }
      }

      return messages;
    } catch (error) {
      console.error("Gagal mengambil riwayat chat:", error);
      return [];
    }
  },

  /**
   * Menghapus sesi chat beserta seluruh pesannya.
   * Pertama hapus isi pesan di `chat_messages`, lalu hapus sesi di `chat_sessions`.
   * @param {string} sessionId - UUID sesi
   * @returns {Promise<boolean>} true jika berhasil
   */
  hapusSesiChat: async (sessionId) => {
    try {
      await axios.delete(`${urls.getBackendUrl()}/api/sessions/${sessionId}`);
      console.log(`Riwayat chat untuk sesi ${sessionId} berhasil dihapus.`);
      return true;
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus:", error);
      return false;
    }
  },
};
