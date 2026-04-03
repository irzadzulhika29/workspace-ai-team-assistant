import axios from "axios";
import { urls } from "./api";

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
   * Mengambil riwayat chat dari sesi tertentu dan menyaring jejak internal AI.
   * Juga inject URL dokumen untuk pesan yang memiliki trigger PDF.
   * @param {string} sessionId - UUID sesi
   * @returns {Promise<Array>} array pesan yang sudah bersih
   */
  ambilRiwayatChat: async (sessionId) => {
    try {
      const res = await axios.get(`${urls.getBackendUrl()}/api/sessions/${sessionId}/history`);
      const { history: rows, dokumen } = res.data;

      let docIndex = 0;

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

        // 2. Buang jika ini adalah jejak aksi AI internal (Calling ...)
        if (type.includes("ai") && /calling/i.test(content)) return false;

        // 3. Buang jika ini adalah data mentah JSON output
        if (content.trim().startsWith('[{"output"')) return false;

        // 4. Buang jika pesannya kosong
        if (!content.trim()) return false;

        // Jika lolos semua filter di atas, simpan pesan ini
        return true;
      }).map((row) => {
        const msg = row.message;
        const content = msg.kwargs?.content || msg.data?.content || msg.content || "";
        const type = (msg.id?.[msg.id.length - 1] || msg.type || "").toLowerCase();

        // Untuk pesan Human, buang bagian instruction: dan document_text: beserta isinya
        if (type.includes("human")) {
          const cleaned = content
            .replace(/^instruction:\s*/i, "")   // buang prefix "instruction:" di awal
            .replace(/\n?document_text:\s*[\s\S]*/i, "")  // buang bagian document_text ke bawah
            .trim();
          const newMsg = { ...msg };
          if (msg.kwargs?.content !== undefined) newMsg.kwargs = { ...msg.kwargs, content: cleaned };
          else if (msg.data?.content !== undefined) newMsg.data = { ...msg.data, content: cleaned };
          else newMsg.content = cleaned;
          return { ...row, message: newMsg };
        }

        // Untuk pesan AI, cek apakah ini trigger PDF dan inject URL jika ada
        if (type.includes("ai")) {
          const isPdfTrigger =
            content.includes("Unduh Dokumen (PDF)") ||
            content.includes("Unduh Presentasi (PDF)") ||
            content.includes("Unduh Laporan (PDF)");

          if (isPdfTrigger && dokumen?.[docIndex]) {
            const url = dokumen[docIndex].file_url;
            const namaFile = dokumen[docIndex].nama_file;
            docIndex++;

            const newMsg = { ...msg };
            const newContent = `Laporan Anda sudah siap! Silakan unduh dokumen PDF-nya melalui tautan aman berikut ini:\n\n📄 ${namaFile}\n🔗 ${url}`;

            if (msg.kwargs?.content !== undefined) {
              newMsg.kwargs = { ...msg.kwargs, content: newContent };
            } else if (msg.data?.content !== undefined) {
              newMsg.data = { ...msg.data, content: newContent };
            } else {
              newMsg.content = newContent;
            }

            return { ...row, message: newMsg };
          }
        }

        return row;
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
      await axios.delete(`${urls.getBackendUrl()}/api/sessions/${sessionId}`);
      console.log(`Riwayat chat untuk sesi ${sessionId} berhasil dihapus.`);
      return true;
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus:", error);
      return false;
    }
  },
};
