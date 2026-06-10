import axios from "axios";
import { urls, getSessionId } from "./api";
import { integrationApi } from "./integrationService";

const post = async (getUrl, payload) => {
  const res = await axios.post(getUrl(), payload, {
    timeout: 120_000,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

const getBackendUrl = () => import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const buildJiraWebhookContext = (jiraCredentials) => {
  if (!jiraCredentials) return {};

  const jiraAuthBase64 = jiraCredentials.email && jiraCredentials.api_token
    ? btoa(`${jiraCredentials.email}:${jiraCredentials.api_token}`)
    : null;

  return {
    jira_credentials: jiraCredentials,
    ...(jiraCredentials.subdomain && { jira_subdomain: jiraCredentials.subdomain }),
    ...(jiraAuthBase64 && { jira_auth_base64: jiraAuthBase64 }),
  };
};

const appendJiraWebhookContext = (formData, jiraCredentials) => {
  const jiraContext = buildJiraWebhookContext(jiraCredentials);

  if (jiraContext.jira_credentials) {
    formData.append("jira_credentials", JSON.stringify(jiraContext.jira_credentials));
  }
  if (jiraContext.jira_subdomain) {
    formData.append("jira_subdomain", jiraContext.jira_subdomain);
  }
  if (jiraContext.jira_auth_base64) {
    formData.append("jira_auth_base64", jiraContext.jira_auth_base64);
  }
};

const fetchGoogleToken = async () => {
  try {
    const res = await axios.get(`${getBackendUrl()}/api/google/token`, {
      withCredentials: true,
      timeout: 8_000,
    });
    return res.data.access_token ?? null;
  } catch {
    return null;
  }
};

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

const getUserScopedContext = async () => {
  const [currentUser, googleAccessToken, jiraCredentials] = await Promise.all([
    fetchCurrentUser(),
    fetchGoogleToken(),
    integrationApi.ambilJiraCredentialsUntukN8n(),
  ]);

  if (!currentUser?.id) {
    throw new Error('Silakan login terlebih dahulu agar sesi chat tersimpan di akun Anda.');
  }

  return {
    userId: currentUser.id,
    userName: currentUser.name || "",
    userEmail: currentUser.email || "",
    userJobTitle: currentUser.jobTitle || "",
    googleAccessToken,
    jiraCredentials,
  };
};

export const chatApi = {
  sendToSupervisor: async (message, action = "chat", sessionId = null, file = null, selectedDoc = null) => {
    const { userId, userName, userEmail, userJobTitle, googleAccessToken, jiraCredentials } = await getUserScopedContext();

    if (file) {
      const formData = new FormData();
      formData.append("action", action);
      formData.append("session_id", sessionId || getSessionId());
      formData.append("user_id", userId);
      formData.append("userId", userId);
      formData.append("user_name", userName);
      formData.append("user_email", userEmail);
      formData.append("user_job_title", userJobTitle);
      formData.append("message", message || "");
      formData.append("chat_type", "general_chat");
      formData.append("timestamp", new Date().toISOString());
      formData.append("file", file);
      if (selectedDoc?.id) formData.append("document_id", selectedDoc.id);
      if (selectedDoc?.name) formData.append("document_name", selectedDoc.name);
      if (googleAccessToken) formData.append("google_access_token", googleAccessToken);
      appendJiraWebhookContext(formData, jiraCredentials);

      const res = await axios.post(urls.getSupervisor(), formData, {
        timeout: 120_000,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } else {
      return post(urls.getSupervisor, {
        action,
        session_id: sessionId || getSessionId(),
        user_id: userId,
        userId,
        user_name: userName,
        user_email: userEmail,
        user_job_title: userJobTitle,
        message,
        document_id: selectedDoc?.id || null,
        document_name: selectedDoc?.name || null,
        context_filter: null,
        chat_type: "general_chat",
        timestamp: new Date().toISOString(),
        ...(googleAccessToken && { google_access_token: googleAccessToken }),
        ...buildJiraWebhookContext(jiraCredentials),
      });
    }
  },

  sendEmail: async (emailDraft, sessionId = null) => {
    const { userId, userName, userEmail, userJobTitle, googleAccessToken } = await getUserScopedContext();
    
    if (!googleAccessToken) {
      throw new Error('Google access token tidak tersedia. Silakan login dengan Google terlebih dahulu.');
    }

    const bodyHtml = emailDraft.body_html || emailDraft.message || emailDraft.body_text || '';
    const message = `KIRIMKAN SEKARANG email lengkap dibawah ini ke alamat: ${emailDraft.to}

---
SUBJECT: ${emailDraft.subject}

${bodyHtml}
---`;

    return post(urls.getSupervisor, {
      action: "send_email",
      session_id: sessionId || getSessionId(),
      user_id: userId,
      userId,
      user_name: userName,
      user_email: userEmail,
      user_job_title: userJobTitle,
      message,
      chat_type: "general_chat",
      timestamp: new Date().toISOString(),
      google_access_token: googleAccessToken,
    });
  },

  regenerateEmail: async (emailDraft, improvementText, sessionId = null) => {
    const { userId, userName, userEmail, userJobTitle, googleAccessToken, jiraCredentials } = await getUserScopedContext();

    const currentBodyHtml = emailDraft.body_html || emailDraft.message || '';
    const currentBodyText = emailDraft.body_text || '';
    const message = `DRAFT SAJA. Revisi draft email yang SUDAH ADA berikut ini sesuai instruksi pengguna.

INSTRUKSI REVISI PENGGUNA:
${improvementText}

ATURAN REVISI WAJIB:
- Gunakan draft saat ini sebagai basis revisi. Jangan menulis ulang dari nol jika tidak diminta.
- Pertahankan alamat tujuan yang sama kecuali pengguna eksplisit meminta mengganti penerima.
- Pertahankan subject yang sama kecuali pengguna eksplisit meminta mengganti subject.
- Pertahankan fakta, detail transaksi, angka, tanggal, dan konteks yang sudah ada kecuali pengguna eksplisit meminta perubahan.
- Jika pengguna hanya meminta tambahan kecil, lakukan perubahan minimal pada draft yang ada.
- Kembalikan JSON action "draft" saja, jangan kirim email.
- Body email wajib tetap HTML rapi.
- Gunakan sender_profile dari context workflow untuk tanda tangan. Jangan gunakan placeholder seperti [Nama Pengirim] atau [Jabatan Pengirim].

DRAFT EMAIL SAAT INI:
To: ${emailDraft.to || ''}
Subject: ${emailDraft.subject || ''}

BODY_HTML:
${currentBodyHtml}

BODY_TEXT:
${currentBodyText}

Tolong hasilkan draft email revisi final berdasarkan draft di atas.`;

    return post(urls.getSupervisor, {
      action: "chat",
      session_id: sessionId || getSessionId(),
      user_id: userId,
      userId,
      user_name: userName,
      user_email: userEmail,
      user_job_title: userJobTitle,
      message,
      chat_type: "general_chat",
      timestamp: new Date().toISOString(),
      ...(googleAccessToken && { google_access_token: googleAccessToken }),
      ...buildJiraWebhookContext(jiraCredentials),
    });
  },

  sendMessage: async (message, documentContext = {}, sessionId = null) => {
    const { userId, userName, userEmail, userJobTitle, googleAccessToken, jiraCredentials } = await getUserScopedContext();

    return post(urls.getSupervisor, {
      action: "chat",
      session_id: sessionId || getSessionId(),
      user_id: userId,
      userId,
      user_name: userName,
      user_email: userEmail,
      user_job_title: userJobTitle,
      message,
      document_id: documentContext.document_id || null,
      document_name: documentContext.document_name || null,
      document_url: documentContext.document_url || null,
      chat_type: documentContext.document_id ? "document_qa" : "general_chat",
      timestamp: new Date().toISOString(),
      ...(googleAccessToken && { google_access_token: googleAccessToken }),
      ...buildJiraWebhookContext(jiraCredentials),
    });
  },

  sendToDocumentChat: async (message, documentContext = {}, sessionId = null) => {
    const { userId, userName, userEmail, userJobTitle, googleAccessToken, jiraCredentials } = await getUserScopedContext();

    return post(urls.getChatDocument, {
      action: "chat",
      session_id: sessionId || getSessionId(),
      user_id: userId,
      userId,
      user_name: userName,
      user_email: userEmail,
      user_job_title: userJobTitle,
      message,
      document_id: documentContext.document_id || null,
      document_name: documentContext.document_name || null,
      document_url: documentContext.document_url || null,
      chat_type: "document_qa",
      timestamp: new Date().toISOString(),
      ...(googleAccessToken && { google_access_token: googleAccessToken }),
      ...buildJiraWebhookContext(jiraCredentials),
    });
  },
};
