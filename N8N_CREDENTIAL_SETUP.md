# Setup Google Credentials di n8n untuk AI Agent Tools

Setelah login dengan Google OAuth di aplikasi, kamu perlu setup credential di n8n agar bisa menggunakan Google Sheets, Calendar, Drive, dll sebagai tools di AI Agent.

## Langkah Setup (One-time, Manual di n8n UI)

### 1. Buka n8n Credentials
- Login ke n8n: `https://n8n.karyatech.web.id`
- Klik menu **Credentials** di sidebar kiri
- Klik tombol **Add Credential**

### 2. Setup Google Sheets OAuth2
1. Search "Google Sheets"
2. Pilih **Google Sheets OAuth2 API**
3. Klik **Connect my account**
4. Login dengan **akun Google yang sama** yang kamu pakai di aplikasi
5. Allow semua permissions
6. Credential akan tersimpan otomatis

### 3. Setup Google Calendar OAuth2 (Optional)
1. Klik **Add Credential** lagi
2. Search "Google Calendar"
3. Pilih **Google Calendar OAuth2 API**
4. Klik **Connect my account**
5. Login dengan akun Google yang sama
6. Allow permissions

### 4. Setup Google Drive OAuth2 (Optional)
1. Klik **Add Credential** lagi
2. Search "Google Drive"
3. Pilih **Google Drive OAuth2 API**
4. Klik **Connect my account**
5. Login dengan akun Google yang sama
6. Allow permissions

### 5. Setup Google Docs OAuth2 (Optional)
1. Klik **Add Credential** lagi
2. Search "Google Docs"
3. Pilih **Google Docs OAuth2 API**
4. Klik **Connect my account**
5. Login dengan akun Google yang sama
6. Allow permissions

## Menggunakan di AI Agent Workflow

Setelah credential setup, kamu bisa menggunakan Google tools di AI Agent:

### Contoh Workflow dengan AI Agent + Google Sheets Tool

```json
{
  "nodes": [
    {
      "name": "Chat Trigger",
      "type": "@n8n/n8n-nodes-langchain.chatTrigger"
    },
    {
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "agent": "conversationalAgent",
        "promptType": "define",
        "text": "You are a helpful assistant that can read and write to Google Sheets."
      }
    },
    {
      "name": "OpenAI Chat Model",
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi"
    },
    {
      "name": "Google Sheets Tool",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "authentication": "oAuth2",
        "resource": "sheet",
        "operation": "append"
      },
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "YOUR_CREDENTIAL_ID",
          "name": "Google Sheets - your-email@gmail.com"
        }
      }
    }
  ]
}
```

## Tips

1. **Gunakan Email yang Sama**: Pastikan email Google yang digunakan di aplikasi dan n8n adalah sama
2. **Credential Name**: n8n akan otomatis memberi nama credential dengan format "Google Sheets - email@gmail.com"
3. **Reuse Credentials**: Satu credential bisa digunakan di banyak workflow
4. **Token Refresh**: n8n akan otomatis refresh token OAuth2 jika expired

## Kenapa Harus Manual?

n8n API tidak support membuat OAuth2 credential secara programmatic karena:
- Security: OAuth2 flow harus dilakukan oleh user langsung
- n8n perlu menyimpan token dengan enkripsi khusus mereka
- Credential schema di n8n sangat kompleks dan berbeda per versi

## Alternative: Gunakan HTTP Request Node

Jika tidak mau setup credential manual, kamu bisa gunakan HTTP Request node untuk call API backend kita (seperti yang sudah kita buat di `server/routes/google.js`). Tapi ini tidak bisa digunakan sebagai "tool" di AI Agent.
