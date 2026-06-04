import axios from "axios";
import { urls } from "./api";

// ─── Chat Session API ─────────────────────────────────────────────────────────
// CRUD operasi untuk tabel `chat_sessions` dan `chat_messages`.

const parseStoredAiOutput = (rawOutput) => {
  if (!rawOutput || typeof rawOutput !== 'string') {
    return { content: rawOutput ?? '', actionResults: {} }
  }

  const trimmed = rawOutput.trim()

  if (!/^[{[]/.test(trimmed)) {
    return { content: rawOutput, actionResults: {} }
  }

  try {
    const parsed = JSON.parse(trimmed)

    if (Array.isArray(parsed) && typeof parsed[0]?.output === 'string') {
      return parseStoredAiOutput(parsed[0].output)
    }

    if (parsed.action === 'clarify' && typeof parsed.message === 'string') {
      return { content: parsed.message, actionResults: {} }
    }

    let content =
      parsed.display_message ??
      parsed.myField ??
      parsed.output ??
      rawOutput

    if (typeof content === 'string' && /^[{[]/.test(content.trim())) {
      try {
        const nested = JSON.parse(content.trim())
        if (Array.isArray(nested) && typeof nested[0]?.output === 'string') {
          content = nested[0].output
        }
        if (nested.action === 'clarify' && typeof nested.message === 'string') {
          content = nested.message
        }
      } catch {
        // Keep original content if it is not a JSON control payload.
      }
    }

    return {
      content,
      actionResults: parsed.action_results ?? parsed.actionResults ?? {},
    }
  } catch {
    return { content: rawOutput, actionResults: {} }
  }
}

const parseLegacyInstructionInput = (rawInput) => {
  const normalized = rawInput.replace(/\r/g, '')
  const match = normalized.match(/^instruction:\s*\n?([\s\S]*?)(?:\n+document_text:\s*\n?([\s\S]*))?$/i)

  if (!match) {
    return null
  }

  const content = (match[1] || '').trim()
  return {
    content,
    forwardedEmail: null,
    promptCard: null,
    documentAttachment: null,
  }
}

const parseDashboardEmailRecommendationInput = (rawInput) => {
  const normalized = rawInput.replace(/\r/g, '')

  if (!/Konteks email lengkap:/i.test(normalized)) {
    return null
  }

  if (!/draft balasan email|draft email balasan|balasan email/i.test(normalized)) {
    return null
  }

  const from =
    normalized.match(/^Pengirim:\s*(.+)$/m)?.[1]?.trim() ||
    normalized.match(/^From:\s*(.+)$/m)?.[1]?.trim() ||
    ''
  const subject = normalized.match(/^Subject:\s*(.+)$/m)?.[1]?.trim() || ''
  const date = normalized.match(/^Tanggal:\s*(.+)$/m)?.[1]?.trim() || ''
  const snippet =
    normalized.match(/^Snippet:\s*([\s\S]*?)(?=\n(?:Body ringkas|Konteks email lengkap|From|Subject):|\s*$)/mi)?.[1]?.trim() ||
    normalized.match(/^Body ringkas:\s*([\s\S]*?)(?=\n(?:Konteks email lengkap|From|Subject):|\s*$)/mi)?.[1]?.trim() ||
    ''

  if (!from && !subject && !snippet) {
    return null
  }

  return {
    content: 'Buatkan draft balasan email yang profesional dan sesuai konteks.',
    forwardedEmail: null,
    promptCard: {
      type: 'email_recommendation',
      badge: 'Email Recommendation',
      title: subject || '(tanpa subjek)',
      from: from || '-',
      date,
      summary: snippet,
    },
    documentAttachment: null,
  }
}

const parseStoredUserInput = (rawInput) => {
  if (!rawInput || typeof rawInput !== 'string') {
    return { content: rawInput ?? '', forwardedEmail: null, promptCard: null, documentAttachment: null }
  }

  const trimmed = rawInput.trim()

  if (/^[{[]/.test(trimmed)) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
          content: parsed.content ?? '',
          forwardedEmail: null,
          promptCard: parsed.prompt_card ?? parsed.promptCard ?? null,
          documentAttachment: parsed.document_attachment ?? parsed.documentAttachment ?? null,
        }
      }
    } catch {
      // Fall through to legacy/plain-text parsing.
    }
  }

  const dashboardEmailRecommendation = parseDashboardEmailRecommendationInput(rawInput)
  if (dashboardEmailRecommendation) {
    return dashboardEmailRecommendation
  }

  const legacyInstruction = parseLegacyInstructionInput(rawInput)
  if (legacyInstruction) {
    return legacyInstruction
  }

  if (trimmed.startsWith('Buatkan draft email balasan berdasarkan email berikut:')) {
    const from = trimmed.match(/^Email dari:\s*(.+)$/m)?.[1]?.trim()
    const to = trimmed.match(/^Kepada:\s*(.+)$/m)?.[1]?.trim()
    const subject = trimmed.match(/^Subject:\s*(.+)$/m)?.[1]?.trim()
    const date = trimmed.match(/^Tanggal:\s*(.+)$/m)?.[1]?.trim()

    return {
      content: 'Buatkan draft email balasan yang profesional dan sesuai konteks.',
      forwardedEmail: {
        from,
        to,
        subject: subject || '(tanpa subjek)',
        date,
      },
      promptCard: null,
      documentAttachment: null,
    }
  }

  if (!trimmed.startsWith('Kirim email ini sekarang:')) {
    return { content: rawInput, forwardedEmail: null, promptCard: null, documentAttachment: null }
  }

  const to = trimmed.match(/^To:\s*(.+)$/m)?.[1]?.trim()
  const subject = trimmed.match(/^Subject:\s*(.+)$/m)?.[1]?.trim()

  if (!to && !subject) {
    return { content: 'Kirim email sekarang', forwardedEmail: null, promptCard: null, documentAttachment: null }
  }

  return {
    content: [
      'Kirim email sekarang',
      to ? `To: ${to}` : null,
      subject ? `Subject: ${subject}` : null,
    ].filter(Boolean).join('\n'),
    forwardedEmail: null,
    promptCard: null,
    documentAttachment: null,
  }
}

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
      }, {
        withCredentials: true,
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
      const res = await axios.get(`${urls.getBackendUrl()}/api/sessions`, {
        params,
        withCredentials: true,
      });
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
      const res = await axios.get(`${urls.getBackendUrl()}/api/sessions/${sessionId}/history`, {
        withCredentials: true,
      });
      const { history: rows, dokumen } = res.data;

      let docIndex = 0;
      const messages = [];

      // Konversi dari struktur chat_messages (input/output) ke format yang diharapkan
      for (const row of rows) {
        // Tambahkan pesan user (input)
        if (row.input && row.input.trim()) {
          const parsedInput = parseStoredUserInput(row.input);
          messages.push({
            id: `${row.id}-input`,
            message: {
              content: parsedInput.content,
              type: 'HumanMessage',
              forwardedEmail: parsedInput.forwardedEmail,
              promptCard: parsedInput.promptCard,
              documentAttachment: parsedInput.documentAttachment,
            },
            created_at: row.created_at,
          });
        }

        // Tambahkan pesan AI (output)
        if (row.output && row.output.trim()) {
          const parsedOutput = parseStoredAiOutput(row.output);
          let content = parsedOutput.content;

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
              actionResults: parsedOutput.actionResults,
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
      await axios.delete(`${urls.getBackendUrl()}/api/sessions/${sessionId}`, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus:", error);
      return false;
    }
  },

  /**
   * Menghapus pesan-pesan tertentu dari sebuah sesi chat (bulk delete).
   * @param {string} sessionId - UUID sesi
   * @param {string[]} messageIds - Array UUID pesan yang akan dihapus
   * @returns {Promise<boolean>} true jika berhasil
   */
  hapusPesan: async (sessionId, messageIds) => {
    try {
      await axios.delete(`${urls.getBackendUrl()}/api/sessions/${sessionId}/messages`, {
        data: { messageIds },
        withCredentials: true,
      });
      return true;
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus pesan:", error);
      return false;
    }
  },
};
