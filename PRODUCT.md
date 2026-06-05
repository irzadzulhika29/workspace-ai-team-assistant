# AI Team Assistant - Product Documentation

## 1. Ringkasan Produk

AI Team Assistant adalah aplikasi workspace berbasis web untuk membantu knowledge worker, project lead, dan tim operasional mengelola pekerjaan harian melalui satu command center. Produk ini menggabungkan dashboard ringkasan aktivitas, AI Workspace Assistant berbasis multi-agent, manajemen dokumen, email assistant, kalender, project tracking (powered by Jira), serta integrasi akun.

Secara teknis aplikasi dibangun sebagai monorepo JavaScript dengan React SPA di `fe/`, Express backend di `be/`, PostgreSQL via Prisma untuk autentikasi dan integrasi, Supabase REST untuk data workspace, serta n8n sebagai AI orchestration layer. n8n menjadi lapisan agent workflow yang menghubungkan LLM, Google API, Jira API, Supabase, Pinecone, OCR, document rendering, dan webhook frontend.

Nilai utama produk:

- Menyatukan aktivitas kerja lintas email, kalender, project tracking, dan dokumen dalam satu workspace.
- Memberikan AI Daily Briefing untuk membantu pengguna memahami prioritas harian.
- Menyediakan AI Workspace Assistant sebagai single entry-point percakapan untuk delegasi tugas lintas domain ke sistem multi-agent.
- Mengubah dokumen dan file kerja menjadi knowledge base yang dapat ditanya kembali melalui Document Q&A.
- Membantu membuat, merevisi, dan mengirim draft email dengan konteks dari inbox.

## 2. Taksonomi Penamaan

Penamaan fitur disusun dalam tiga lapis yang saling melengkapi:

- **Lapis 1 — Workspace Modules**: nama domain-based untuk modul utama, dipakai di sidebar dan bab fitur (contoh: Email Workspace, Calendar Workspace).
- **Lapis 2 — AI Capabilities**: nama capability noun untuk sub-fitur AI di tiap workspace (contoh: AI Daily Briefing, Smart Reply Draft, Document Q&A).
- **Lapis 3 — Agent System**: nama internal agent yang menjalankan tugas di lapisan orkestrasi, dipakai di bab arsitektur (contoh: Supervisor Agent, Communication Agent).

Lapis 1 dan 2 merupakan terminologi user-facing. Lapis 3 merupakan detail implementasi.

## 3. Target Pengguna

### Project Lead / Manager

Pengguna ini membutuhkan gambaran cepat tentang agenda, email penting, dan progres project. Mereka memakai Command Center Dashboard untuk melihat ringkasan prioritas, Calendar Workspace untuk agenda terdekat, Project Tracking Workspace untuk status task, dan AI Workspace Assistant untuk meminta follow-up atau draft komunikasi lintas domain.

### Knowledge Worker

Pengguna ini bekerja dengan dokumen, email, meeting, dan laporan. Mereka menggunakan Document Workspace untuk menyimpan dokumen input/output, bertanya melalui Document Q&A, serta meminta AI Workspace Assistant membuat laporan atau presentasi dari konteks kerja melalui fitur Document Generation.

### Tim Operasional

Pengguna ini mengelola jadwal, tiket, dan komunikasi rutin. Mereka memanfaatkan AI Workspace Assistant untuk membuat event Calendar, issue Jira, dan ringkasan lewat percakapan, serta mengakses Settings & Integrations untuk memastikan koneksi Google dan Jira berjalan dengan baik.

## 4. Arsitektur Produk

```text
Browser React SPA
  -> Express Backend
     -> Auth session, Google OAuth, Gmail/Calendar proxy, Jira proxy
     -> Supabase service role proxy for documents, drafts, briefings, token usage
     -> PostgreSQL via Prisma for users, sessions, Google tokens, Jira tokens

Browser React SPA
  -> n8n Webhooks
     -> Supervisor Agent dan specialist agents (Communication, Scheduler, Task, Knowledge, Document)
     -> Briefing Agent Cluster untuk AI Daily Briefing
     -> Document ingestion dan vector indexing
     -> Email drafting/sending/revision
     -> Calendar/Project Tracking/Email summaries

n8n
  -> Google APIs, Jira APIs, Supabase, Pinecone, LLM providers, OCR/rendering services
```

Frontend route utama didefinisikan di `fe/src/App.jsx`. Backend API utama dimount dari `be/server/index.js` ke `/api/auth`, `/api`, `/api/google`, `/api/integrations`, `/api/dashboard`, dan `/api/email`. Konfigurasi URL n8n ada di `fe/src/services/api.js` dengan default base URL `https://workflow.jagr.id` dan mode `publish` atau `test`.

## 5. Modul dan Fitur

AI Team Assistant terdiri dari enam modul utama yang masing-masing mewakili satu domain pekerjaan. Setiap modul didukung kemampuan AI yang dijalankan oleh agent spesialis di lapisan orkestrasi n8n. Login & Auth bersifat foundational, sementara Settings & Supporting Infrastructure berada di luar enam modul utama.

### 5.1 Landing, Login, dan Auth

Route:

- `/` menampilkan Landing Page jika belum login, atau Command Center Dashboard jika sudah login.
- `/login` menyediakan login/register berbasis email-password dan Google OAuth.
- Protected route menjaga halaman workspace agar hanya bisa diakses pengguna terautentikasi.

Fitur:

- Login Google melalui backend Passport.
- Email/password auth via Supabase session exchange.
- Sinkronisasi user workspace ke Prisma `users`.
- Endpoint status user, profile update, logout, Google disconnect, dan password setup.
- Session Express disimpan di PostgreSQL jika `DATABASE_URL` tersedia.

Data penting:

- `User` di Prisma menyimpan profil, Google ID, email, job title, avatar, dan `n8nCredentialId`.
- `GoogleToken` menyimpan access token, refresh token, dan expiry per user.

### 5.2 Command Center Dashboard

Route:

- `/`

File utama:

- `fe/src/pages/Dashboard.jsx`
- `fe/src/components/dashboard/BriefingCard.jsx`
- `fe/src/services/briefingService.js`
- `be/server/routes/dashboard.js`
- `n8n/workflow/Dashboard Summary.json`

Sub-fitur AI:

- **AI Daily Briefing** untuk domain Email, Calendar, dan Project Tracking.
- Snapshot prioritas dengan headline, summary points, source metrics, status, dan timestamp.
- Refresh briefing melalui webhook n8n `briefings`.
- Fallback runtime summary dari data Project Tracking, Calendar, dan Email.
- **Quick Action Shortcuts** dari briefing, seperti membuka Calendar/Project Tracking Workspace atau mengirim prompt ke AI Workspace Assistant untuk membuat agenda follow-up atau draft email.
- Briefing cache di local storage agar dashboard tetap berisi saat refresh data gagal.

Backend contract:

- `GET /api/dashboard/briefings` mengambil snapshot terbaru per domain dari Supabase table `dashboard_summary_snapshots`.
- `GET /api/dashboard/briefings/:domain` mengambil snapshot domain tertentu.
- `GET /api/dashboard/briefing-targets` digunakan n8n dengan header `x-n8n-api-key`.
- `GET /api/dashboard/briefing-data/jira` digunakan n8n untuk mengambil Jira data server-side.
- `POST /api/dashboard/briefings/upsert` digunakan n8n untuk menyimpan hasil briefing.

Workflow n8n:

- `Dashboard Summary.json` menerima webhook `briefings`.
- Workflow mengambil upcoming Calendar, Jira issues, unread email, dan detail email.
- Briefing Agent Cluster (`Calendar Briefing Agent`, `Jira Briefing Agent`, `Email Briefing Agent`) membuat ringkasan per domain.
- Hasil diparse, digabung, dikirim balik ke frontend, dan di-upsert ke Supabase.

### 5.3 AI Workspace Assistant

Route:

- `/chat/supervisor`

File utama:

- `fe/src/pages/SupervisorChat.jsx`
- `fe/src/components/chat/*`
- `fe/src/store/chatStore.js`
- `fe/src/services/chatService.js`
- `fe/src/services/sessionService.js`
- `n8n/workflow/Agents Orchestrator.json`

Sub-fitur AI:

- **Cross-Domain Task Delegation**: satu pintu chat yang dapat memicu tugas di domain email, calendar, project tracking, dan document tanpa pindah halaman.
- **File-Aware Conversation**: mendukung lampiran PDF, CSV, dan gambar untuk dianalisis di dalam percakapan.
- **Document Generation**: menghasilkan report dan presentation dari konteks chat; output tersinkronisasi ke Document Library.
- **Session-Based Chat History**: chat per user dengan daftar riwayat di sidebar, auto-create session `general_chat`.
- Menampilkan bubble AI/user, status agent, action result, source citation, prompt card, dan email draft card.
- Smart Reply Draft dari Email Workspace atau Quick Action Shortcuts dari Command Center Dashboard dapat membuka AI Workspace Assistant dengan state/prompt siap kirim.

Payload utama ke n8n:

- Endpoint: `POST /webhook/chat` atau `/webhook-test/chat`.
- Field umum: `action`, `session_id`, `user_id`, `user_name`, `user_email`, `user_job_title`, `message`, `chat_type`, `timestamp`.
- Optional: `google_access_token`, `jira_credentials`, `jira_subdomain`, `jira_auth_base64`, `file`.

Workflow n8n:

- `Agents Orchestrator.json` memiliki `Main Webhook` path `chat`.
- `Supervisor Agent` berperan sebagai orchestrator yang memilih specialist agent berdasarkan intent.
- Specialist agent yang tersedia:
  - `Communication Agent` untuk email draft/send/revision.
  - `Scheduler Agent` untuk Google Calendar.
  - `Task Agent` untuk Jira.
  - `Knowledge Agent` untuk RAG/Pinecone.
  - `Document Agent` untuk report/presentation/document generation.
- Workflow juga menangani attachment PDF/CSV/gambar melalui extraction, OCR, prompt normalization, dan output routing.
- Chat history memakai `Postgres Chat Memory`; response dan action tertentu dilog ke Supabase.

### 5.4 Email Workspace

Route:

- `/workspace/email`

File utama:

- `fe/src/pages/EmailPage.jsx`
- `fe/src/store/emailStore.js`
- `fe/src/components/email/*`
- `fe/src/services/emailService.js`
- `fe/src/services/emailWebhookService.js`
- `fe/src/services/emailDraftService.js`
- `be/server/routes/google.js`
- `be/server/routes/emailDrafts.js`
- `n8n/workflow/Workspace.json`
- `n8n/workflow/Agents Orchestrator.json`

Fitur inbox:

- List email Gmail.
- Search email.
- Filter label seperti Inbox, Starred, dan Unread.
- Detail email.
- Mark read/unread.
- Star/unstar.

Sub-fitur AI:

- **Inbox Summary**: ringkasan AI atas email penting dan unread di inbox.
- **AI Email Drafting**: membuat draft email baru dari prompt user.
- **Smart Reply Draft**: menghasilkan draft balasan kontekstual berbasis email yang dipilih.
- **AI Draft Revision**: merevisi draft sesuai instruksi user sebelum dikirim.

Fitur draft:

- List draft dari Supabase table `email_drafts`.
- Create, edit, save, delete draft.
- Send draft via n8n/Gmail.
- Konfirmasi sebelum send agar manual edit tetap tersimpan.

Backend/API:

- Gmail proxy: `/api/google/gmail/messages`, `/api/google/gmail/messages/:id`, `/api/google/gmail/messages/:id/modify`, `/api/google/gmail/messages/send`, `/api/google/gmail/labels`.
- Draft API: `/api/email/drafts`, `/api/email/drafts/:id`, `/api/email/drafts/:id/send`, `/api/email/drafts/:id/revise`.

Workflow n8n:

- `Workspace.json` menyediakan webhook `email` untuk drafting/revision dan `email/summary` untuk Inbox Summary.
- `Draft & Send Email` menangani pembuatan atau pengiriman draft.
- `Get Email Format` membaca skill `create_email.md`.
- `Send Email via Gmail API` mengirim email saat action send.
- `Agents Orchestrator.json` juga memiliki `Communication Agent`, `Code - Format Draft Email Response`, `Respond - Draft Email`, dan `Respond - Email Sent`.

### 5.5 Calendar Workspace

Route:

- `/workspace/calendar`

File utama:

- `fe/src/pages/CalendarPage.jsx`
- `fe/src/services/calendarService.js`
- `be/server/routes/api.js`
- `be/server/routes/google.js`
- `n8n/workflow/Workspace.json`
- `n8n/workflow/Agents Orchestrator.json`

Fitur:

- Mengambil Google Calendar event 7 hari ke depan.
- Menampilkan agenda list/detail, tanggal, waktu, lokasi, dan deskripsi.
- Membuat event baru dari UI.
- Menghapus event.

Sub-fitur AI:

- **Agenda Briefing**: ringkasan AI atas agenda mendatang dari n8n endpoint `calendar` jika Google token tersedia.
- **AI-Assisted Event Creation**: membuat event (termasuk Google Meet) melalui Quick Action Shortcuts ke AI Workspace Assistant.

Backend/API:

- `GET /api/google/calendar` mengambil event via backend.
- `POST /api/google/calendar` membuat event.
- `DELETE /api/google/calendar/:eventId` menghapus event.

Workflow n8n:

- `Workspace.json` menyediakan webhook `calendar` untuk Agenda Briefing.
- `Agents Orchestrator.json` menyediakan tool `Get Calendar Events`, `Create Event`, `Create Event with Google Meet`, dan `Update Event` untuk Scheduler Agent.

### 5.6 Project Tracking Workspace

> Powered by Jira integration.

Route:

- `/workspace/jira`

File utama:

- `fe/src/pages/JiraPage.jsx`
- `fe/src/services/jiraService.js`
- `fe/src/hooks/useJiraIntegration.js`
- `fe/src/components/settings/JiraSettingsSection.jsx`
- `be/server/routes/integrations.js`
- `n8n/workflow/Workspace.json`
- `n8n/workflow/Agents Orchestrator.json`

Fitur:

- Menampilkan issue Jira yang diperbarui dalam 90 hari terakhir.
- Mengelompokkan dan menghitung status/progress issue.
- Menampilkan issue detail, assignee, priority, project, issue type, created/updated/due date.
- Membuat issue Jira melalui UI dengan project dan issue type.
- Error handling untuk Jira belum terhubung, session expired, atau credential perlu reconnect.

Sub-fitur AI:

- **Issue Insights**: ringkasan AI atas status dan progres issue dari n8n endpoint `jira-summary`.
- **AI-Assisted Issue Creation**: membuat issue Jira baru melalui AI Workspace Assistant.

Backend/API:

- `GET /api/integrations/jira` mengambil status koneksi.
- `POST /api/integrations/jira` menyimpan integrasi setelah tes koneksi.
- `DELETE /api/integrations/jira` memutus integrasi.
- `GET /api/integrations/jira/n8n-credentials` mengembalikan credential terdekripsi untuk konteks n8n.
- `POST /api/integrations/jira/proxy` menjadi proxy aman ke path Jira `/rest/api/3/*`.

Security:

- Jira API token disimpan terenkripsi di Prisma table `jira_integrations`.
- Backend hanya mengizinkan method tertentu dan path dengan prefix `/rest/api/3/`.

Workflow n8n:

- `Workspace.json` menyediakan webhook `jira-summary`.
- `Agents Orchestrator.json` menyediakan tool `Get many issues in Jira Software` untuk Task Agent.

### 5.7 Document Workspace

Route:

- `/workspace/files`

File utama:

- `fe/src/pages/FileWorkspace.jsx`
- `fe/src/hooks/useFileWorkspace.js`
- `fe/src/hooks/useDocuments.js`
- `fe/src/components/files/*`
- `fe/src/components/documents/DocumentChat.jsx`
- `fe/src/services/fileService.js`
- `be/server/routes/api.js`
- `n8n/workflow/Ingest Documents.json`
- `n8n/workflow/Workspace.json`

Fitur:

- **Document Library**: repository untuk dokumen yang di-upload sekaligus output Document Generation dari AI Workspace Assistant.
- Menampilkan dokumen user dari backend `/api/dokumen`.
- Memisahkan dokumen ke uploaded/generated atau kategori input/output sesuai metadata.
- Upload PDF/DOCX dengan nama dokumen yang bisa diedit sebelum submit.
- Preview dokumen via modal.
- Delete dokumen dari table `dokumen`.
- Selected Document Panel untuk detail dokumen.

Sub-fitur AI:

- **Document Q&A**: tanya-jawab kontekstual terhadap dokumen tertentu menggunakan Retrieval-Augmented Generation berbasis Pinecone.

Upload flow:

1. User memilih file di `UploadZone`.
2. Frontend mengirim multipart ke n8n endpoint `upload-document`.
3. Payload berisi `action=upload`, `file`, `file_name`, `kategori`, `folder`, `session_id`, dan `user_id`.
4. Workflow `Ingest Documents.json` menyimpan metadata ke Supabase, melakukan text extraction/classification, split dokumen, embedding, dan indexing ke Pinecone.

Document Q&A flow:

1. User memilih dokumen dan bertanya melalui `DocumentChat`.
2. Frontend mengirim ke endpoint `chat-document`.
3. `Workspace.json` menjalankan `Prepare Document Query`, Pinecone `retrieve vector data`, dan `AI Agent`.
4. Response dikembalikan ke panel chat dokumen.

### 5.8 Supporting Infrastructure

Bagian ini berisi fitur penunjang yang tidak masuk dalam enam modul utama, namun diperlukan agar produk dapat berjalan.

#### Settings dan Integrations

Route:

- `/settings`
- `/integrations` redirect ke `/settings`
- `/settings/integrations` redirect ke `/settings`

File utama:

- `fe/src/pages/SettingsPage.jsx`
- `fe/src/components/settings/*`
- `fe/src/hooks/useGoogleIntegration.js`
- `fe/src/hooks/useJiraIntegration.js`
- `fe/src/hooks/useProfileSettings.js`
- `fe/src/hooks/useWebhookSettings.js`
- `be/server/routes/auth.js`
- `be/server/routes/integrations.js`

Fitur:

- Profile settings.
- Account/password setup.
- Google connection status dan disconnect.
- Jira integration setup/test/disconnect.
- Webhook environment/mode setting untuk n8n publish/test.
- Integrations list dengan status koneksi.

Catatan implementasi:

- URL base n8n berasal dari `VITE_N8N_URL`.
- Mode n8n disimpan di local storage key `n8n_mode`.
- `ensureProdEnvironmentOnStartup` menghapus konfigurasi environment lama yang sudah tidak dipakai.

#### Auth Diagnostics

Route:

- `/debug/auth`

Fitur:

- Membantu memeriksa status autentikasi dan koneksi Google.
- Berguna untuk admin/dev saat OAuth, session cookie, atau token Google tidak sinkron.

## 6. Agent Workflow Inventory

Bagian ini mendokumentasikan workflow n8n yang menjalankan kemampuan AI di lapisan orkestrasi. Semua nama agent di sini bersifat internal (Lapis 3 dari taksonomi penamaan).

### 6.1 Agents Orchestrator

File:

- `n8n/workflow/Agents Orchestrator.json`

Webhook:

- `POST /webhook/chat`

Peran:

- Workflow utama untuk multi-agent chat di AI Workspace Assistant.
- Supervisor Agent menerima pesan user dan memilih specialist agent yang sesuai.
- Mendukung chat biasa, file attachment, RAG, email, calendar, project tracking, document generation, dan logging response.

Agent dan tool:

- `Supervisor Agent`: orchestrator yang memilih specialist agent berdasarkan intent percakapan.
- `Communication Agent`: membuat draft email, format HTML email, dan memicu pengiriman jika diminta.
- `Scheduler Agent`: membaca/membuat/memperbarui event Google Calendar, termasuk Google Meet.
- `Task Agent`: membaca dan membuat issue Jira.
- `Knowledge Agent`: mengambil konteks dari Pinecone untuk pertanyaan berbasis dokumen.
- `Document Agent`: menghasilkan dokumen report dan presentation berbasis konteks chat.

Output path penting:

- `Respond - Chat Output` untuk jawaban chat biasa.
- `Respond - Draft Email` untuk draft email.
- `Respond - Email Sent` untuk hasil pengiriman email.
- `Respond - Report PDF Ready` untuk report PDF dari Document Generation.
- `Respond - Presentation PDF Ready` untuk presentation PDF dari Document Generation.

### 6.2 Dashboard Summary

File:

- `n8n/workflow/Dashboard Summary.json`

Webhook:

- `POST /webhook/briefings`

Peran:

- Menghasilkan AI Daily Briefing lintas domain.
- Mengambil data Calendar, Jira, dan Email.
- Memanggil chain LLM per domain.
- Menyimpan snapshot ke Supabase dan mengembalikan payload final ke frontend.

Briefing Agent Cluster:

- `Calendar Briefing Agent`
- `Jira Briefing Agent`
- `Email Briefing Agent`

### 6.3 Ingest Documents

File:

- `n8n/workflow/Ingest Documents.json`

Webhook:

- `POST /webhook/upload-document`

Peran:

- Menerima upload dokumen dari Document Workspace.
- Menyimpan metadata dokumen.
- Mengekstrak teks untuk klasifikasi.
- Mengklasifikasikan document type.
- Membagi dokumen menjadi chunk.
- Membuat embedding dan menyimpan vector ke Pinecone.

Node penting:

- `Upload Document`
- `Prepare Document Metadata`
- `Extract text for document classification`
- `Classify Document Type`
- `Character Text Splitter`
- `Embeddings OpenAI`
- `Pinecone Vector Store`

### 6.4 Workspace Workflow

File:

- `n8n/workflow/Workspace.json`

Webhook:

- `POST /webhook/email`
- `POST /webhook/email/summary`
- `POST /webhook/chat-document`
- `POST /webhook/calendar`
- `POST /webhook/jira-summary`

Peran:

- Workflow pendukung untuk fitur workspace yang berjalan terpisah dari AI Workspace Assistant.
- Menangani drafting email, revisi draft, kirim email, Inbox Summary, Document Q&A, Agenda Briefing, dan Issue Insights.

Agent/chain:

- `Draft & Send Email`
- `AI Agent` untuk Document Q&A.
- `Basic LLM Chain` untuk Agenda Briefing.
- `Email Summary Agent` untuk Inbox Summary.
- `Jira Summary Agent` untuk Issue Insights.

## 7. Pemetaan Fitur ke Agent System

Tabel berikut memetakan fitur user-facing (Lapis 1 dan 2) ke agent yang menjalankannya di lapisan orkestrasi (Lapis 3).

| Fitur (User-Facing) | Modul | Agent Pelaksana |
|---|---|---|
| AI Daily Briefing | Command Center Dashboard | Briefing Agent Cluster |
| Cross-Domain Task Delegation | AI Workspace Assistant | Supervisor Agent (orchestrator) |
| Document Generation | AI Workspace Assistant | Document Agent |
| AI Email Drafting | Email Workspace | Communication Agent |
| Smart Reply Draft | Email Workspace | Communication Agent |
| AI Draft Revision | Email Workspace | Communication Agent |
| Inbox Summary | Email Workspace | Communication Agent / Email Summary Agent |
| Agenda Briefing | Calendar Workspace | Scheduler Agent / Basic LLM Chain |
| AI-Assisted Event Creation | Calendar Workspace | Scheduler Agent |
| Issue Insights | Project Tracking Workspace | Task Agent / Jira Summary Agent |
| AI-Assisted Issue Creation | Project Tracking Workspace | Task Agent |
| Document Q&A | Document Workspace | Knowledge Agent |

## 8. Data Model dan Storage

### PostgreSQL via Prisma

Model utama:

- `User`: profil user workspace dan relasi integrasi.
- `GoogleToken`: token Google OAuth per user.
- `JiraIntegration`: kredensial Jira terenkripsi per user.
- `chat_sessions`: sesi chat user.
- `dokumen`: metadata dokumen user.
- `n8n_chat_histories`: memory/history chat untuk n8n.

### Supabase REST

Digunakan untuk data operasional yang diakses backend/n8n:

- `dashboard_summary_snapshots` untuk AI Daily Briefing.
- `email_drafts` untuk draft email.
- `execution_token_usage` atau table sejenis untuk token usage (lihat catatan eksperimental di Section 10).
- `dokumen` dan `chat_sessions` juga diakses melalui pola Supabase/Prisma tergantung endpoint.

### Pinecone

Digunakan sebagai vector store untuk dokumen hasil ingestion. Metadata penting yang dikirim workflow mencakup `document_id`, `user_id`, `session_id`, `nama_file`, `kategori`, `file_url`, dan `document_type`.

## 9. Prioritas Fitur

### P0 - Core Workspace

- Login/auth dan session user.
- Command Center Dashboard dengan AI Daily Briefing.
- AI Workspace Assistant (multi-agent chat).
- Calendar Workspace (event management).
- Email Workspace (inbox & drafts).
- Project Tracking Workspace.
- Document Workspace (Document Library).

### P1 - AI Productivity Layer

- Cross-Domain Task Delegation lintas Communication, Scheduler, Task, Knowledge, dan Document Agent.
- Smart Reply Draft dari Email Workspace dan Quick Action Shortcuts dari Command Center Dashboard.
- AI Daily Briefing untuk Email, Calendar, dan Project Tracking.
- Agenda Briefing, Issue Insights, dan Inbox Summary di workspace masing-masing.
- Document Q&A berbasis Pinecone.
- Document Generation (report dan presentation) via AI Workspace Assistant.

### P2 - Supporting Infrastructure & Admin Tools

- Settings & Integrations (Google, Jira, webhook mode).
- Auth Diagnostics.
- Webhook mode publish/test.
- Integration status cards.
- Error handling untuk reconnect Google/Jira.

## 10. Batasan dan Catatan Produk

- Tidak ada automated test; validasi saat ini bergantung pada ESLint, build frontend, dan manual browser testing.
- Beberapa table Supabase seperti `email_drafts`, `dashboard_summary_snapshots`, dan token usage tidak didefinisikan di Prisma schema, sehingga kontrak kolom perlu dijaga dari sisi Supabase migration/manual setup.
- Workflow n8n memuat node `Report Agent` yang awalnya dirancang sebagai post-processor untuk format output, namun tidak digunakan dalam alur final. Formatting output diserahkan ke masing-masing specialist agent.
- **Token Monitor** (route `/monitoring/tokens`, file `fe/src/pages/TokenMonitorPage.jsx`, `fe/src/services/tokenUsageService.js`, dan backend endpoint `/api/token-usage`) merupakan fitur eksperimental untuk observability workflow AI. Saat ini fitur ini belum aktif sebagai fungsi produksi sehingga tidak dimasukkan ke daftar modul utama.
- Root `AGENTS.md` merujuk sub-folder `AGENTS.md`, tetapi file tersebut tidak ada di checkout saat dokumen ini dibuat.
- Inventaris lama di `docs/WEBSITE_FEATURE_AND_WORKFLOW_INVENTORY.md` menyebut route Knowledge Chat, tetapi route aktual di `fe/src/App.jsx` tidak mendaftarkan `/chat/knowledge`. Kemampuan tanya-jawab berbasis knowledge saat ini hadir sebagai Document Q&A di Document Workspace.
- Workflow n8n berbasis file JSON perlu di-import/deploy ulang ke instance n8n agar perubahan lokal berdampak ke runtime.
- `.env.production` ada di repo sesuai catatan setup; perubahan secret harus dilakukan hati-hati dan tidak dibocorkan ke dokumen produk.

## 11. Definition of Done Produk

Sebuah fitur dianggap siap jika:

- Route dan UI tersedia untuk flow utama.
- Backend endpoint atau webhook n8n yang dipakai sudah jelas.
- Data tersimpan per user dan tidak bocor lintas akun.
- Error state untuk integrasi tidak aktif atau token kedaluwarsa ditampilkan dengan jelas.
- `npm run lint` lulus dengan `--max-warnings 0`.
- `npm run build` frontend berhasil.
- Flow utama diverifikasi manual di browser.

## 12. Referensi Implementasi

- Frontend routes: `fe/src/App.jsx`
- Sidebar/navigation: `fe/src/components/layout/Sidebar.jsx`
- n8n URL config: `fe/src/services/api.js`
- AI Workspace Assistant service: `fe/src/services/chatService.js`
- Document upload service: `fe/src/services/fileService.js`
- Calendar service: `fe/src/services/calendarService.js`
- Email service: `fe/src/services/emailService.js`
- Email draft service: `fe/src/services/emailDraftService.js`
- Jira service: `fe/src/services/jiraService.js`
- Token usage service: `fe/src/services/tokenUsageService.js`
- Backend app mount: `be/server/index.js`
- Dashboard backend: `be/server/routes/dashboard.js`
- Jira backend: `be/server/routes/integrations.js`
- Email draft backend: `be/server/routes/emailDrafts.js`
- Prisma schema: `be/prisma/schema.prisma`
- n8n workflows: `n8n/workflow/*.json`
