📋 Jira Integration Plan
Overview
Setiap user bisa connect Jira mereka sendiri dengan memasukkan credentials Atlassian. Credentials disimpan terenkripsi di database per user.

🗄️ BE — Database (Prisma Schema)
Tambah model baru di schema.prisma:
prismamodel JiraIntegration {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subdomain     String   // contoh: namaproject.atlassian.net
  email         String   // email Atlassian user
  apiTokenEnc   String   // API token terenkripsi
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

🔒 BE — Enkripsi Token
Pakai library crypto bawaan Node.js. Buat utility file utils/encryption.js:
javascriptconst crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY; // 32 char string, simpan di .env

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(encryptedText) {
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
}

module.exports = { encrypt, decrypt };
Tambah di .env:
ENCRYPTION_KEY=your_32_character_secret_key_here

🛣️ BE — API Endpoints
1. Simpan/Update Jira credentials
POST /api/integrations/jira
Authorization: Bearer {user_token}

Body:
{
  "subdomain": "namaproject.atlassian.net",
  "email": "user@email.com",
  "apiToken": "ATATT3xFf..."
}
Flow:

Validasi input
Test koneksi ke Jira dulu sebelum simpan
Encrypt apiToken
Upsert ke tabel JiraIntegration
Return status


2. Get status koneksi
GET /api/integrations/jira
Authorization: Bearer {user_token}

Response:
{
  "connected": true,
  "subdomain": "namaproject.atlassian.net",
  "email": "user@email.com",
  "connectedAt": "2026-04-09T..."
}
⚠️ Jangan return apiToken meskipun sudah terenkripsi.

3. Test koneksi (dipakai saat save)
javascript// internal function, bukan endpoint publik
async function testJiraConnection(subdomain, email, apiToken) {
  const response = await fetch(`https://${subdomain}/rest/api/3/myself`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
      'Accept': 'application/json'
    }
  });
  return response.ok;
}

4. Disconnect Jira
DELETE /api/integrations/jira
Authorization: Bearer {user_token}

5. Proxy endpoint ke Jira (untuk FE)
FE tidak boleh hit Jira langsung — semua lewat backend:
POST /api/integrations/jira/proxy
Authorization: Bearer {user_token}

Body:
{
  "method": "GET" | "POST" | "PUT",
  "path": "/rest/api/3/issue",
  "data": { ... }
}
Backend yang decrypt token dan forward ke Jira API.

🎨 FE — Halaman Integrations
Buat halaman baru /settings/integrations dengan komponen:
State (Zustand store)
javascript// store/integrationStore.js
const useIntegrationStore = create((set) => ({
  jira: {
    connected: false,
    subdomain: '',
    email: '',
    loading: false,
    error: null
  },
  fetchJiraStatus: async () => { ... },
  connectJira: async (credentials) => { ... },
  disconnectJira: async () => { ... }
}));

UI Component — Jira Integration Card
┌─────────────────────────────────────┐
│  🔷 Jira                            │
│  Connect your Jira workspace        │
│                                     │
│  Subdomain                          │
│  [namaproject.atlassian.net      ]  │
│                                     │
│  Email Atlassian                    │
│  [user@email.com                 ]  │
│                                     │
│  API Token                 [?]      │
│  [••••••••••••••••••••••••       ]  │
│                                     │
│  [  Connect Jira  ]                 │
└─────────────────────────────────────┘
Kalau sudah connected:
┌─────────────────────────────────────┐
│  🔷 Jira                  ✅ Active │
│  namaproject.atlassian.net          │
│  user@email.com                     │
│  Connected 9 Apr 2026               │
│                                     │
│  [ Disconnect ]                     │
└─────────────────────────────────────┘

Tooltip/Guide untuk API Token
Tambahkan tooltip di icon ? sebelah label API Token:
Cara mendapatkan API Token:
1. Buka id.atlassian.com
2. Security → API Tokens
3. Create API Token
4. Copy dan paste di sini

🔗 Integrasi ke AI Chat (n8n)
Karena Anda pakai n8n sebagai AI backbone, credentials Jira juga perlu dikirim ke webhook n8n agar Task Agent bisa pakai:
javascript// Saat kirim pesan ke n8n webhook
{
  "message": "buat tiket untuk fitur login",
  "session_id": "...",
  "google_access_token": "...",
  "jira_credentials": {        // tambah ini
    "subdomain": "...",
    "email": "...",
    "api_token": "..."         // decrypt dulu di backend sebelum kirim
  }
}

✅ Checklist Eksekusi
BE:

- [x] Tambah model JiraIntegration di Prisma
- [x] Buat migration SQL `prisma/migrations/20260409113000_add_jira_integration/migration.sql`
- [x] Buat utils/encryption.js
- [ ] Tambah ENCRYPTION_KEY di `.env` (manual per environment)
- [x] Buat endpoint POST /api/integrations/jira
- [x] Buat endpoint GET /api/integrations/jira
- [x] Buat endpoint DELETE /api/integrations/jira
- [x] Buat endpoint proxy POST /api/integrations/jira/proxy
- [x] Implementasi testJiraConnection() sebelum save

FE:

- [x] Buat Zustand store integrationStore
- [x] Buat halaman /settings/integrations
- [x] Buat komponen JiraIntegrationCard
- [x] Tambah tooltip panduan API Token
- [x] Handle loading & error state
- [x] Tambah jira_credentials ke payload webhook n8n
