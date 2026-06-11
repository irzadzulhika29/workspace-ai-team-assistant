# AI Team Assistant

AI Team Assistant adalah workspace produktivitas berbasis web yang menyatukan dashboard briefing, asisten AI multi-agent, dokumen, Gmail, Google Calendar, Jira, dan pemantauan penggunaan token dalam satu aplikasi.

![AI Team Assistant](./fe/public/dashboard.png)

## Fitur Utama

- **Command Center Dashboard**: AI Daily Briefing untuk email, kalender, dan progres Jira.
- **AI Workspace Assistant**: percakapan multi-agent untuk tugas lintas email, kalender, Jira, knowledge base, dan pembuatan dokumen.
- **Document Workspace**: upload, preview, hapus, dan tanya jawab dokumen berbasis RAG.
- **Email Workspace**: inbox Gmail, ringkasan email, draft AI, revisi draft, dan pengiriman email.
- **Calendar Workspace**: agenda tujuh hari, pembuatan event, penghapusan event, dan ringkasan agenda.
- **Project Tracking Workspace**: daftar dan detail issue Jira, ringkasan progres, serta pembuatan issue.
- **Settings & Integrations**: profil, akun Google, Jira, password, serta mode webhook n8n.
- **Token Monitor**: observability penggunaan token LLM per pengguna dan workflow.

Dokumentasi produk yang lebih rinci tersedia di [PRODUCT.md](./PRODUCT.md).

## Arsitektur

```text
Browser (React SPA)
  |-- Express API
  |     |-- Passport + Express Session
  |     |-- Google OAuth, Gmail, Calendar, dan Drive
  |     |-- Jira proxy
  |     |-- Prisma -> PostgreSQL
  |     `-- Supabase REST
  |
  `-- n8n Webhooks
        |-- Supervisor dan specialist agents
        |-- Google API dan Jira
        |-- Supabase Storage/REST
        |-- Pinecone vector store
        `-- LLM providers
```

Teknologi utama:

| Lapisan | Teknologi |
|---|---|
| Frontend | React 18, Vite 5, React Router, Zustand, Tailwind CSS |
| Backend | Node.js, Express, Passport, Express Session |
| Database relasional | PostgreSQL, Prisma |
| Data workspace | Supabase REST, Auth, dan Storage |
| AI orchestration | n8n |
| Retrieval | Pinecone |
| Integrasi | Google OAuth/API dan Jira REST API |
| Deployment | Docker, Docker Compose, Caddy |

## Struktur Repository

```text
.
|-- fe/                      # React SPA
|   |-- public/              # Gambar dan aset statis
|   `-- src/
|       |-- components/      # Komponen UI dan fitur
|       |-- context/         # Auth dan sidebar context
|       |-- hooks/           # Feature hooks
|       |-- pages/           # Halaman aplikasi
|       |-- services/        # Backend, Supabase, dan webhook clients
|       `-- store/           # Zustand stores
|-- be/
|   |-- prisma/              # Schema dan migration PostgreSQL
|   `-- server/
|       |-- config/          # Environment dan Passport
|       |-- middleware/      # Auth dan error handling
|       |-- routes/          # Express API routes
|       |-- services/        # Google, Supabase, dan n8n services
|       `-- index.js         # Backend entrypoint
|-- n8n/workflow/            # Workflow JSON dan agent skill prompts
|-- deploy/                  # Caddy dan script deployment VPS
|-- docker-compose.yml       # Production stack
|-- Dockerfile               # Multi-stage production image
|-- PRODUCT.md               # Dokumentasi produk dan pemetaan fitur
`-- package.json             # npm workspace orchestrator
```

Repository menggunakan npm workspaces untuk `fe/` dan `be/`. Seluruh source code aplikasi menggunakan JavaScript/JSX dengan ESM.

## Prasyarat

- Node.js 20 atau lebih baru
- npm
- PostgreSQL
- Project Supabase
- Instance n8n
- Google Cloud OAuth credentials
- Akun Jira Cloud untuk fitur project tracking
- Pinecone dan credential provider LLM untuk workflow yang menggunakan RAG/AI

## Setup Lokal

### 1. Install dependency

```bash
npm install
```

### 2. Buat file environment

Buat `.env` di root repository. Vite dan backend sama-sama membaca file ini.

```env
# Runtime
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
VITE_FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:3001

# Session dan database
DATABASE_URL=postgresql://postgres:password@localhost:5432/team_assistant
SESSION_SECRET=ganti-dengan-random-secret-yang-kuat
SESSION_COOKIE_NAME=team_assistant.sid
SESSION_COOKIE_SAMESITE=lax
SESSION_COOKIE_SECURE=false
ENCRYPTION_KEY=ganti-dengan-encryption-key-yang-kuat

# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=dokumen_sop
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# n8n
N8N_API_URL=https://your-n8n.example.com/api/v1
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_BASE_URL=https://your-n8n.example.com
VITE_N8N_URL=https://your-n8n.example.com
VITE_N8N_MODE=publish
```

Catatan:

- Jangan commit `.env` atau secret baru ke repository.
- `VITE_N8N_MODE` menerima `publish` atau `test`.
- Mode `publish` menggunakan path `/webhook/*`, sedangkan `test` menggunakan `/webhook-test/*`.
- `ENCRYPTION_KEY` digunakan untuk mengenkripsi Jira API token.
- Untuk production lintas origin, sesuaikan `SESSION_COOKIE_SAMESITE` dan `SESSION_COOKIE_SECURE` dengan konfigurasi HTTPS.

### 3. Siapkan PostgreSQL

```bash
npm run prisma:generate
npm run prisma:migrate
```

Prisma mengelola data user, Google token, Jira integration, chat session, dokumen, dan history n8n. Express session akan membuat tabel `user_sessions` jika `DATABASE_URL` tersedia.

### 4. Siapkan Supabase

Backend dan workflow saat ini menggunakan beberapa tabel Supabase yang harus tersedia pada project tujuan:

- `chat_sessions`
- `chat_messages`
- `dokumen`
- `email_drafts`
- `dashboard_summary_snapshots`
- `execution_token_usage`
- `n8n_memories`
- `n8n_chat_histories`

Pastikan bucket yang ditentukan oleh `SUPABASE_STORAGE_BUCKET` tersedia dan kebijakan aksesnya sesuai dengan kebutuhan aplikasi serta workflow n8n.

### 5. Import workflow n8n

Import dan konfigurasi workflow berikut pada instance n8n:

| File | Webhook | Fungsi |
|---|---|---|
| `Agents Orchestrator.json` | `chat` | Supervisor chat dan specialist agents |
| `Dashboard Summary.json` | `briefings` | AI Daily Briefing |
| `Ingest Documents.json` | `upload-document` | Upload, ekstraksi, embedding, dan indexing |
| `Workspace.json` | `email`, `email/summary`, `chat-document`, `calendar`, `jira-summary` | Fitur AI per workspace |

Setelah import, hubungkan credential Google, Supabase, Pinecone, dan provider LLM yang digunakan setiap node. Perubahan pada file JSON lokal tidak otomatis mengubah workflow yang sudah berjalan di n8n.

### 6. Jalankan aplikasi

```bash
npm run dev
```

URL lokal:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`

Workspace juga dapat dijalankan terpisah:

```bash
npm run dev:fe
npm run dev:be
```

## Script

| Command | Fungsi |
|---|---|
| `npm run dev` | Menjalankan frontend dan backend |
| `npm run dev:fe` | Menjalankan Vite di port 5173 |
| `npm run dev:be` | Generate Prisma client lalu menjalankan backend dengan nodemon |
| `npm run build` | Membuat production build frontend |
| `npm run start` | Menjalankan backend production |
| `npm run lint` | Menjalankan ESLint pada kedua workspace |
| `npm run preview` | Preview hasil build Vite |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Menjalankan Prisma migration development |
| `npm run prisma:studio` | Membuka Prisma Studio |

Pre-commit hook Husky menjalankan `lint-staged`, yang menerapkan `eslint --fix --max-warnings 0` pada file JavaScript/JSX yang di-stage.

## Route Frontend

| Route | Halaman |
|---|---|
| `/` | Landing page atau dashboard berdasarkan status login |
| `/login` | Login/register email-password dan Google |
| `/chat/supervisor` | AI Workspace Assistant |
| `/workspace/files` | Document Workspace |
| `/workspace/calendar` | Calendar Workspace |
| `/workspace/jira` | Project Tracking Workspace |
| `/workspace/email` | Email Workspace |
| `/monitoring/tokens` | Token Monitor |
| `/settings` | Profile, account, dan integrations |
| `/debug/auth` | Auth diagnostics |

`/integrations` dan `/settings/integrations` diarahkan ke `/settings`. Semua route workspace dilindungi oleh authenticated session.

## API Backend

Backend memasang route pada prefix berikut:

- `/api/auth`: Google OAuth, Supabase session exchange, password setup, profile, status, dan logout.
- `/api`: dokumen, chat session/history, token usage, serta helper Google.
- `/api/google`: Gmail, Calendar, Drive, dan Sheets proxy.
- `/api/integrations`: status, konfigurasi, dan proxy Jira.
- `/api/dashboard`: briefing snapshots dan endpoint internal n8n.
- `/api/email`: CRUD, revisi, dan pengiriman draft email.

Endpoint internal yang dipanggil n8n dilindungi dengan `N8N_API_KEY`. Endpoint user menggunakan Express session dan pemeriksaan autentikasi.

## Autentikasi dan Data

Aplikasi menggunakan dua lapisan autentikasi:

1. Supabase Auth menangani email/password, OTP, dan verifikasi akun.
2. Backend menukar Supabase access token menjadi Express session agar route API yang sudah ada tetap menggunakan kontrak session yang sama.

Google OAuth ditangani oleh Passport. Access/refresh token Google disimpan per user di PostgreSQL. Jira API token disimpan terenkripsi menggunakan `ENCRYPTION_KEY`.

Request ke workflow membawa identitas user (`user_id` dan `userId`) agar chat, dokumen, briefing, dan token usage tetap terisolasi per akun.

## Deployment Docker

Production menggunakan satu container aplikasi untuk backend dan frontend hasil build, dengan Caddy sebagai reverse proxy dan TLS terminator.

```bash
docker compose up -d --build
```

Alur production:

1. Docker builder menjalankan `npm ci`, Prisma generate, dan Vite build.
2. Express berjalan pada port `3001`.
3. Express menyajikan API dan static SPA dari `fe/dist`.
4. Caddy mengekspos domain melalui port `80` dan `443`.

Konfigurasi production dibaca dari `.env.production`. Pastikan `APP_DOMAIN`, `FRONTEND_URL`, `GOOGLE_CALLBACK_URL`, cookie session, dan seluruh `VITE_*` menggunakan URL public yang benar. Lihat [deploy/README.md](./deploy/README.md) untuk script VPS.

## Verifikasi

Tidak ada automated test suite pada repository ini. Definition of done saat ini:

```bash
npm run lint
npm run build
```

Setelah itu lakukan verifikasi manual:

1. Login melalui email/password dan Google.
2. Buka dashboard dan refresh briefing.
3. Kirim prompt melalui AI Workspace Assistant.
4. Uji upload dan Document Q&A.
5. Uji Gmail, Calendar, dan Jira setelah integration aktif.
6. Pastikan Token Monitor hanya menampilkan data user yang sedang login.

## Catatan Keamanan

- Jangan mengekspos `SUPABASE_SERVICE_ROLE_KEY`, `N8N_API_KEY`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, atau `ENCRYPTION_KEY` ke frontend.
- Hanya variabel dengan prefix `VITE_` yang boleh digunakan pada bundle browser.
- Jangan commit `.env`, credential export, token, atau file konfigurasi berisi secret.
- Batasi Supabase Row Level Security, bucket policy, callback OAuth, dan CORS ke origin yang memang digunakan.
- Review workflow JSON sebelum dibagikan karena export n8n dapat memuat referensi credential, URL project, atau konfigurasi environment.
