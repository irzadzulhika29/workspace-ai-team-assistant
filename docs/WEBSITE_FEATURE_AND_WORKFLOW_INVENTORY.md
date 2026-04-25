# Website Feature and Workflow Inventory

Dokumen ini merangkum screen, fitur, user flow, integrasi, dan orkestrasi n8n pada project `workspace-ai-team-assistant`. Tujuannya sebagai baseline redesign UI dan penyesuaian fitur.

## 1. Ringkasan Produk

`AI Team Assistant` adalah aplikasi full-stack monorepo:

- Frontend: React SPA dengan Vite, Tailwind, Zustand, dan React Router.
- Backend: Express untuk auth/session, Google API proxy, Jira proxy, Supabase REST proxy, dan token usage endpoint.
- AI orchestration: n8n workflow `AI Assistant Team` sebagai pintu utama chat agent, upload dokumen, document generation, email draft/send, calendar scheduling, Jira read, RAG, dan logging token usage.
- Database/storage:
  - PostgreSQL via Prisma untuk user, Google token, dan Jira integration.
  - Supabase REST untuk `chat_sessions`, `chat_messages`, `dokumen`, dan `execution_token_usage`.
  - Pinecone untuk vector store dokumen SOP.

## 2. Navigasi dan Screen

Routing utama ada di `src/App.jsx`, dengan layout global berupa sidebar + mobile header + container konten.

| Route | Screen | Fungsi utama |
| --- | --- | --- |
| `/` | Dashboard | Landing workspace, shortcut fitur, ringkasan Calendar, ringkasan Jira |
| `/chat/supervisor` | Supervisor Chat | Chat umum multi-agent untuk delegasi tugas, file attachment, email draft/send, PDF/PPT output |
| `/chat/knowledge` | Knowledge Chat | Chat RAG khusus SOP/dokumen internal dengan filter konteks |
| `/workspace/files` | Document Workspace | Upload, list, preview dokumen input/output |
| `/workspace/calendar` | Calendar Page | List event Google Calendar user yang login |
| `/workspace/email` | Email Page | Gmail inbox, search/filter, detail email, star/read, Magic Reply |
| `/workspace/jira` | Jira Page | List issue Jira, grouping by status, local cache |
| `/monitoring/tokens` | Token Monitor | Monitoring token usage dan execution time workflow |
| `/integrations` | Integrations Page | Google OAuth status, login/logout, Jira connection |
| `/settings/integrations` | Integrations Page | Alias route integrasi |
| `/debug/auth` | Debug Auth | Debug status Google auth dan token |
| `*` | Dashboard fallback | Unknown route diarahkan ke Dashboard |

Sidebar menampilkan semua menu workspace dan session sub-menu untuk `Supervisor Agent` serta `Knowledge Agent`. Settings modal di sidebar dipakai untuk konfigurasi n8n environment/mode/dev URL.

## 3. Screen Inventory

### 3.1 Dashboard

File: `src/pages/Dashboard.jsx`

Fungsi:

- Menampilkan kartu shortcut ke:
  - Supervisor Agent
  - Knowledge Agent
  - Document Workspace
  - Token Monitor
- Menampilkan 3 event Calendar terdekat dari `calendarApi.fetchCalendarEvents()`.
- Menampilkan ringkasan issue Jira dari `jiraApi.fetchIssues()`:
  - total issue
  - jumlah done/closed/resolved/completed
  - progress percent
  - breakdown status terbanyak
- Menampilkan panduan cepat:
  - ubah webhook n8n via Settings
  - upload SOP ke folder input
  - riwayat chat tersimpan selama session browser

User flow:

1. User membuka `/`.
2. Dashboard fetch Calendar dan Jira.
3. User bisa klik card workspace atau link "Lihat semua"/"Lihat detail".

Design note:

- Dashboard saat ini lebih seperti overview + shortcut.
- Untuk redesign, ini cocok dijadikan "workspace home" dengan KPI ringkas, status integrasi, dan recent activity.

### 3.2 Supervisor Chat

File: `src/pages/SupervisorChat.jsx`

Fungsi:

- Chat dengan n8n `Main Webhook` endpoint `chat`.
- Mendukung attachment file.
- Auto-create session `general_chat` jika belum ada.
- Menampilkan AI bubble, agent status, source, action result card, processing time.
- Mendukung email draft flow:
  - AI membuat `email_draft`
  - `AgentCard` menampilkan draft
  - user bisa kirim email atau regenerate draft
- Mendukung Magic Reply dari Email Page melalui React Router state:
  - Email Detail membangun prompt
  - pindah ke `/chat/supervisor`
  - auto-send prompt ke Supervisor
  - user message menampilkan ringkasan email sumber
- Error state untuk timeout, HTTP error, atau webhook tidak tersambung.

Data dikirim ke n8n via `chatApi.sendToSupervisor()`:

- JSON biasa tanpa file:
  - `action`
  - `session_id`
  - `message`
  - `chat_type: general_chat`
  - `timestamp`
  - optional `google_access_token`
  - optional `jira_credentials`
- Multipart jika ada file:
  - field yang sama
  - `file`

User flow:

1. User pilih/auto-create session dari sidebar.
2. User ketik task atau attach file.
3. Frontend fetch Google token dan Jira credential jika tersedia.
4. Request masuk ke n8n `chat`.
5. n8n Supervisor Agent menentukan apakah jawab langsung atau delegasi ke agent spesialis.
6. Response dinormalisasi di frontend.
7. ChatBubble menampilkan teks, source, action result, email draft, atau link hasil dokumen.

Contoh task yang didukung oleh orchestration:

- "Cek jadwal hari ini"
- "Buat meeting besok jam 10 dengan Google Meet"
- "Lihat issue Jira terbaru"
- "Buat draft email balasan"
- "Buat laporan PDF dari data berikut"
- "Buat slide presentasi PDF"
- "Tanya SOP onboarding"
- "Ringkas data CSV/PDF/gambar yang saya upload"

### 3.3 Knowledge Chat

File: `src/pages/KnowledgeChat.jsx`

Fungsi:

- Chat RAG khusus knowledge/SOP internal.
- Auto-create session `rag_chat` jika belum ada.
- Context filter:
  - Semua Dokumen
  - Folder: Input (SOP)
  - Folder: Output
- Menampilkan source citation dari response n8n.
- Error state untuk timeout/webhook.

Data dikirim via `chatApi.sendToKnowledge()` ke endpoint yang sama (`chat`) dengan:

- `chat_type: rag_chat`
- `context_filter`
- `google_access_token` dan `jira_credentials` jika tersedia

User flow:

1. User pilih Knowledge Agent.
2. User pilih context filter jika perlu.
3. User bertanya soal SOP/kebijakan.
4. n8n menentukan jalur RAG/Knowledge Agent dan query Pinecone.
5. Jawaban ditampilkan dengan source jika tersedia.

Design note:

- Walau FE punya page khusus Knowledge, n8n tetap memakai `Main Webhook` yang sama. Pemisahan intent terutama lewat `chat_type` dan prompt/user flow.

### 3.4 Document Workspace

File: `src/pages/FileWorkspace.jsx`, `src/components/files/UploadZone.jsx`

Fungsi:

- Menampilkan dokumen dari backend `/api/dokumen`.
- Mengelompokkan dokumen menjadi:
  - `input`: SOP/reference
  - `output`: AI reports/generated docs
- Upload dokumen ke n8n upload webhook.
- Preview file via modal.
- Normalisasi file URL Supabase, termasuk membersihkan quote, prefix `=`, dan `localhost:8000`.

Upload constraints:

- Accepted: PDF dan DOCX.
- Max size: 20 MB per file.
- Multiple file upload.
- User bisa rename dokumen sebelum submit.

Data upload:

- `action: upload`
- `file`
- `file_name`
- `kategori`
- `folder`
- `session_id`

User flow:

1. User membuka Document Workspace.
2. App fetch dokumen dari Supabase via backend.
3. User pilih tab input/output.
4. User drag/drop atau pilih file.
5. User isi/ubah nama dokumen.
6. Submit upload ke n8n `upload-file` / workflow upload.
7. n8n upload ke Supabase Storage/Table dan index ke Pinecone.
8. File tampil di folder tree/preview.

### 3.5 Calendar Page

File: `src/pages/CalendarPage.jsx`, `src/services/calendarService.js`

Fungsi:

- Menampilkan event Google Calendar dari akun user yang sedang login.
- Default params:
  - `calendarId: primary`
  - `singleEvents: true`
  - `orderBy: startTime`
  - `maxResults: 50`
  - `timeMin: now`
- Tombol refresh.
- Card event berisi date badge, summary, description, time, location, dan full-day marker.

User flow:

1. User login Google di Integrations.
2. User buka Calendar Page.
3. Frontend memanggil backend `/api/google/calendar`.
4. Backend memakai GoogleToken user dari Prisma.
5. Calendar events tampil.

Catatan penting:

- Current implementation sudah memakai `calendarId: primary`, bukan env shared calendar.
- Event creation via AI dilakukan lewat n8n Scheduler Agent menggunakan `google_access_token`.

### 3.6 Email Page

File: `src/pages/EmailPage.jsx`, `src/store/emailStore.js`, `src/components/email/*`

Fungsi utama:

- Gmail inbox interface.
- Search email.
- Filter:
  - Inbox
  - Starred
  - Unread
  - Sent
- Pagination/load more.
- Email detail:
  - subject
  - from/to/cc/date
  - sanitized HTML body
  - attachments metadata
- Actions:
  - star/unstar
  - mark read/unread
  - Magic Reply

Backend endpoints:

- `GET /api/google/gmail/messages`
- `GET /api/google/gmail/messages/:id`
- `POST /api/google/gmail/messages/:id/modify`
- `POST /api/google/gmail/messages/send`
- `GET /api/google/gmail/labels`

Magic Reply flow:

1. User pilih email.
2. User klik `Magic Reply`.
3. `EmailDetail` parse header `From` dan `To`.
4. Email context dibangun:
   - Email dari
   - Kepada
   - Subject
   - Tanggal
   - Isi Email
5. App navigate ke `/chat/supervisor` dengan `autoSendMessage` dan `emailContext`.
6. Supervisor Chat auto-send prompt.
7. Communication Agent membuat draft email JSON.
8. FE menampilkan draft sebagai action card, bukan raw JSON.
9. User bisa kirim atau regenerate.

Catatan redesign:

- Email UI saat ini punya gaya berbeda dari workspace lain (lebih Gmail-like dengan biru/abu). Bisa disatukan ke design system workspace.
- Compose modal state tersedia di store, tetapi UI compose modal belum terlihat di screen utama.

### 3.7 Jira Page

File: `src/pages/JiraPage.jsx`, `src/services/jiraService.js`

Fungsi:

- Fetch issue Jira dari backend proxy.
- Query default:
  - JQL: `updated >= -90d ORDER BY updated DESC`
  - maxResults: 50
  - fields: summary, status, assignee, priority, updated
- Normalize issue shape agar toleran terhadap beberapa payload.
- Group issue by status.
- Menampilkan status count, issue card, assignee, priority, updated time.
- Menyimpan cache ke `localStorage` agar list tidak hilang saat reload.

User flow:

1. User connect Jira di Integrations.
2. User buka Jira Page.
3. Page load cache jika ada.
4. Jika tidak ada cache atau user refresh, frontend call `/api/integrations/jira/proxy`.
5. Backend ambil active JiraIntegration user, decrypt token, proxy request ke Atlassian.
6. Issue ditampilkan grouped by status.

Catatan penting:

- FE page hanya membaca issue.
- n8n Task Agent juga dibatasi hanya membaca issue Jira, bukan create/update ticket.

### 3.8 Integrations Page

File: `src/pages/IntegrationsPage.jsx`, `src/components/integrations/JiraIntegrationCard.jsx`

Fungsi:

- Mengecek status Google OAuth via `/api/auth/google/status`.
- Login Google via `/api/auth/google`.
- Logout via `/api/auth/logout`.
- Menampilkan connected user.
- Menampilkan Google Workspace cards:
  - Google Sheets
  - Google Calendar
  - Google Docs
- Mengelola Jira integration per user.

Google OAuth scopes:

- profile
- email
- Drive readonly
- Calendar events
- Spreadsheets
- Gmail readonly/send/modify/labels

Jira integration:

- Simpan subdomain `.atlassian.net`, email, API token.
- Test connection ke `/rest/api/3/myself`.
- API token disimpan encrypted di Prisma.
- Credential bisa diberikan ke n8n lewat `/api/integrations/jira/n8n-credentials`.

### 3.9 Token Monitor

File: `src/pages/TokenMonitorPage.jsx`, `src/services/tokenUsageService.js`

Fungsi:

- Fetch recent token usage dari `/api/token-usage`.
- Summary:
  - total eksekusi
  - workflow aktif
  - input tokens
  - completion tokens
  - total tokens
  - latest timestamp
- List 100 data token terbaru.
- Menampilkan execution id, workflow, model, execution time, timestamp, token breakdown.

Data source:

- Supabase table `execution_token_usage`.
- n8n workflow menulis data lewat backend `POST /api/token-usage` memakai `x-n8n-api-key`.

### 3.10 Debug Auth

File: `src/pages/DebugAuthPage.jsx`

Fungsi:

- Debug Google auth status.
- Menampilkan connected/not connected, user id, email, name, has Google token.
- Action:
  - login Google
  - refresh status
  - go to Email Page jika connected

Catatan:

- Screen ini utility/internal. Untuk redesign publik mungkin bisa disembunyikan dari sidebar atau dipindah ke admin/debug area.

## 4. Data, State, dan Persistence

### Frontend state

- `src/store/chatStore.js`
  - Menyimpan `supervisorMessages`, `knowledgeMessages`, session list, active session id, dan auto-send flag.
  - Chat messages disimpan di `sessionStorage`.
  - Session id tab-level juga disimpan di `sessionStorage`.
- `src/store/emailStore.js`
  - Email list, selected email, filters, loading/error, compose modal state.
- `src/store/integrationStore.js`
  - State integrasi jika digunakan oleh integration components.

### Chat session persistence

Backend route `/api/sessions/*` berinteraksi dengan Supabase:

- `POST /api/sessions`: buat session baru.
- `GET /api/sessions?chat_type=...`: ambil session list.
- `GET /api/sessions/:sessionId/history`: ambil `chat_messages` dan output `dokumen` per session.
- `DELETE /api/sessions/:sessionId`: hapus message lalu session.

Frontend `sessionService.ambilRiwayatChat()` melakukan filtering/normalisasi:

- Menghapus internal n8n/LangChain traces.
- Mengubah stored output menjadi message yang bisa dirender.
- Menyertakan `actionResults` seperti email draft dan document URLs.

### Backend persistence

Prisma models:

- `User`
- `GoogleToken`
- `JiraIntegration`
- `chat_sessions`
- `dokumen`
- `n8n_chat_histories`

Supabase REST tables yang dipakai langsung:

- `chat_sessions`
- `chat_messages`
- `dokumen`
- `execution_token_usage`

## 5. Backend API Inventory

### Auth

Mounted at `/api/auth`.

- `GET /api/auth/google`: mulai Google OAuth.
- `GET /api/auth/google/callback`: OAuth callback, simpan token.
- `GET /api/auth/google/status`: cek koneksi Google.
- `POST /api/auth/google/disconnect`: hapus Google token.
- `POST /api/auth/logout`: logout session.
- `GET /api/auth/me`: current user.

### Core API

Mounted at `/api`.

- `GET /api/protected`: contoh protected route.
- `GET /api/google/token`: fresh access token user login untuk dikirim ke n8n.
- `GET /api/dokumen`: list dokumen dari Supabase.
- `POST /api/token-usage`: n8n writes token usage, protected by `x-n8n-api-key`.
- `GET /api/token-usage`: FE reads token usage summary/log.
- `POST /api/sessions`: create chat session.
- `GET /api/sessions`: list chat session.
- `GET /api/sessions/:sessionId/history`: chat history.
- `DELETE /api/sessions/:sessionId`: delete chat session.
- `GET /api/google/docs`: list Google Docs.
- `GET /api/google/sheets`: list Google Sheets.
- `GET /api/google/calendar`: list Calendar events for logged-in user.

### Google API Proxy

Mounted at `/api/google`.

Authentication supports:

- Logged-in user session.
- n8n request with `x-n8n-api-key` and `userId`.

Endpoints:

- Sheets append/read/update:
  - `POST /sheets/spreadsheets/:spreadsheetId/values/:range`
  - `GET /sheets/spreadsheets/:spreadsheetId/values/:range`
  - `PUT /sheets/spreadsheets/:spreadsheetId/values/:range`
- Drive:
  - `GET /drive/files`
- Calendar:
  - `GET /calendar/events`
- Gmail:
  - `GET /gmail/messages`
  - `GET /gmail/messages/:id`
  - `POST /gmail/messages/:id/modify`
  - `POST /gmail/messages/send`
  - `GET /gmail/labels`

### Jira Integration

Mounted at `/api/integrations`.

- `GET /jira`: get current Jira connection.
- `GET /jira/n8n-credentials`: expose active Jira credential to frontend for n8n payload.
- `POST /jira`: connect/update Jira credential after testing.
- `DELETE /jira`: disconnect Jira.
- `POST /jira/proxy`: proxy allowed Jira REST calls for logged-in user.

## 6. n8n Workflow Inventory

Workflow file: `n8n/workflow/AI Assistant Team.json`

Workflow name: `AI Assistant Team`

Current inventory:

- Total nodes: 85
- Connection entries: 76
- Main webhook nodes: 2
- Respond webhook nodes: 5
- Agent tools: 6
- HTTP Request tools: 7
- Supabase nodes: 11
- Code nodes: 6
- Switch nodes: 2
- If nodes: 2
- Execute Workflow nodes: 4
- Vector store nodes: 2

### 6.1 Main entry points

#### Main Webhook

- Node: `Main Webhook`
- Path: `chat`
- Receives chat requests from Supervisor Chat and Knowledge Chat.
- Handles both regular JSON chat and multipart file chat.

High-level flow:

1. `Main Webhook`
2. `is file exist?`
3. If file exists, route by MIME type:
   - image -> `Tesseract` OCR -> `combine promt + text image`
   - PDF -> `Extract text` -> `combine promt + text file`
   - CSV -> `Extract CSV File` -> `combine promt + text csv`
4. If no file -> `user promt only`
5. Prompt goes to `Supervisor Agent`.
6. `Supervisor Agent` may call specialist agent tools.
7. `Extract Full Output` recovers/normalizes output.
8. `Route Output Type` decides final response branch.
9. Response sent to FE and written to Supabase `chat_messages`.
10. Execute workflow branch logs token usage asynchronously.

#### Upload Document

- Node: `Upload Document`
- Path: `upload-document`
- Receives files from Document Workspace upload.

High-level flow:

1. `Upload Document`
2. Upload file to Supabase Storage via `HTTP Request`
3. Create row in Supabase `dokumen`
4. Merge binary/file metadata
5. Load document using LangChain loader
6. Split text with Character Text Splitter
7. Generate embeddings with HuggingFace
8. Store vectors in Pinecone
9. Respond to webhook
10. Write chat/session side effect if configured

Note:

- Frontend `api.js` endpoint key is `UPLOAD: "upload-file"`, while n8n node path shown in JSON is `upload-document`. Confirm deployed webhook path before redesigning upload UX or docs copy.

### 6.2 Supervisor Agent

Node: `Supervisor Agent`

Role:

- Central orchestrator.
- Understands user intent.
- Decides direct answer vs delegation.
- Can chain specialist agents.
- Must not answer domain-specific tasks itself when specialist agent exists.

Connected model/memory:

- `arcee-ai/trinity-large-preview:free-` via OpenRouter.
- `Groq Chat Model`.
- `Postgres Chat Memory`.

Connected agent tools:

- `Report Agent`
- `Communication Agent`
- `Document Agent`
- `Knowledge Agent`
- `Scheduler Agent`
- `Task Agent`

Supervisor responsibilities by domain:

- SOP/kebijakan/internal docs -> Knowledge Agent.
- Calendar/schedule/meeting -> Scheduler Agent.
- Email/draft/send/reply/forward -> Communication Agent.
- Report summary from provided data -> Report Agent.
- PDF/report/slide generation -> Document Agent.
- Jira issue reading/progress/backlog -> Task Agent.

### 6.3 Specialist Agents

#### Knowledge Agent

Purpose:

- Answer factual internal policy/SOP questions using Pinecone vector store.
- Must not hallucinate beyond retrieved documents.

Tools:

- `retrieve vector data`
- Embeddings via `Embeddings HuggingFace Inference2`

Output:

- Indonesian answer.
- Structured numbered/bullet format.
- Source/document reference if available.
- If no relevant info, returns a fixed "information not found" response.

#### Scheduler Agent

Purpose:

- Manage Google Calendar:
  - create event
  - create event with Google Meet
  - get calendar events
  - delete event

Tools:

- `Create Event with Google Meet`
- `Create Event`
- `Get Calendar Events`
- `delete events calendar`

Important behavior:

- Uses Asia/Jakarta timezone.
- Uses current n8n `$now` as date/time source.
- Defaults if missing:
  - duration 1 hour
  - working hours 09:00-17:00
- Calendar actions rely on Google token passed from FE/backend.

#### Task Agent

Purpose:

- Read Jira issue/task/project data.

Tool:

- `Get many issues in Jira Software`

Current limitation:

- Read-only. It explicitly cannot create tickets, update status, assign tasks, or modify Jira.

#### Communication Agent

Purpose:

- Create draft email.
- Send email when explicitly requested.
- Handle reply/forward/follow-up/official written communication.

Tool:

- `Get Email Skills`

Required output:

- Always JSON only, without markdown fence.
- Draft format:
  - `action: draft`
  - `to`
  - `subject`
  - `message` as HTML
- Send format:
  - `action: send`
  - `to`
  - `subject`
  - `message` as HTML

Important downstream nodes:

- `Format Draft Email`
  - Parses JSON output.
  - Fills recipient for reply draft using original email sender when possible.
  - Returns user-facing `display_message` plus structured `action_results.email_draft`.
- `Code in JavaScript1`
  - Prepares send payload.
- `Send Email`
  - Sends email via HTTP request.

#### Document Agent

Purpose:

- Generate formal documents and slide-style presentations.

Tools:

- `Get Report Format`
- `Get PPT Format`

Important behavior:

- Must call the proper format tool before producing document content.
- Document output is routed to PDF generation pipeline when it contains exact download marker text.

Output markers used by `Route Output Type`:

- `Unduh Dokumen (PDF)`
- `Unduh Presentasi (PDF)`

#### Report Agent

Purpose:

- Summarize/restructure data that already exists in prompt/input.
- Create readable Markdown summary/table.

Limitations:

- It is not a data fetcher.
- It cannot create PDF or formal file output.
- It must not invent missing facts.

### 6.4 File input processing branch

`is file exist?` decides whether request includes binary file.

If file exists, `Switch` routes by MIME type:

- `image/*`:
  - `Tesseract`
  - `combine promt + text image`
  - `Supervisor Agent`
- `application/pdf`:
  - `Extract text`
  - `combine promt + text file`
  - `Supervisor Agent`
- `text/csv`:
  - `Extract CSV File`
  - `combine promt + text csv`
  - `Supervisor Agent`

If no file:

- `user promt only`
- `Supervisor Agent`

### 6.5 Output routing branch

Node: `Route Output Type`

Routing rules:

| Output condition | Branch | Next pipeline |
| --- | --- | --- |
| output contains `UnduhDokumen(PDF)` after whitespace removal | Unduh Dokumen (PDF) | `Code in JavaScript` -> `Markdown` -> `HTTP Request1` -> `Edit Fields` -> `HTTP Request2` -> `HTTP Request3` -> `Upload Document to Table` -> response/write chat |
| output contains `UnduhPresentasi(PDF)` after whitespace removal | Unduh Presentasi (PDF) | `Inject PPT CSS` -> `api2pdf PPT` -> `Edit Fields PPT` -> `HTTP Request4` -> `HTTP Request5` -> `Upload Document to Table1` -> response/write chat |
| output contains `"action":"send"` | Send email | `Code in JavaScript1` -> `Send Email` -> response/write chat |
| output contains `"action":"draft"` | Draft email | `Format Draft Email` -> `Respond Draft Email` -> `Write Chat4` |
| fallback | Normal chat response | `Respond to Webhook` -> `Write Chat` |

### 6.6 PDF/document generation

Report document branch:

1. `Code in JavaScript`
2. `Markdown`
3. `HTTP Request1`
4. `Edit Fields`
5. `HTTP Request2`
6. `HTTP Request3`
7. `Upload Document to Table`
8. `Respond to Webhook2`
9. `Write Chat2`

PPT branch:

1. `Inject PPT CSS`
2. `api2pdf PPT`
3. `Edit Fields PPT`
4. `HTTP Request4`
5. `HTTP Request5`
6. `Upload Document to Table1`
7. `Respond to Webhook3`
8. `Write Chat1`

Expected user-facing behavior:

- Chat response includes a download action/link.
- Generated file is stored in Supabase `dokumen` with `kategori: output`.
- History reload should still show the document output because `/api/sessions/:sessionId/history` fetches both chat history and output docs.

### 6.7 Email send/draft branch

Draft branch:

1. Communication Agent returns JSON `action: draft`.
2. `Route Output Type` routes to draft.
3. `Format Draft Email` parses draft and builds:
   - user-facing summary text
   - `action_results.email_draft`
4. `Respond Draft Email` sends structured payload to FE.
5. `Write Chat4` persists output.

Send branch:

1. Communication Agent returns JSON `action: send`.
2. `Route Output Type` routes to send.
3. `Code in JavaScript1` prepares payload.
4. `Send Email` sends request.
5. `Respond to Webhook1` responds.
6. `Write Chat3` persists output.

### 6.8 Token usage and execution time logging

Token logging subflow:

1. `When Executed by Another Workflow`
2. `Wait`
3. `Get execution data`
4. `Calculate Execution Time`
5. `Extract token usage data`
6. `Split Out`
7. `Sum Token Totals - aggregate by model1`
8. `Record token usage`

The main response/write-chat branches call execute workflow nodes:

- `Call 'AI Assistant Team'`
- `Call 'AI Assistant Team'1`
- `Call 'AI Assistant Team'2`
- `Call 'AI Assistant Team'3`

Purpose:

- Asynchronous/self-call logging of execution token usage and execution time after the user-facing response path.

## 7. End-to-End User Flows

### Flow A: Chat task without file

1. User types prompt in Supervisor Chat.
2. FE creates session if needed.
3. FE fetches Google token and Jira credential if connected.
4. FE posts JSON to n8n `chat`.
5. n8n `Main Webhook` -> `is file exist?` false -> `user promt only`.
6. Supervisor Agent delegates or answers.
7. `Extract Full Output` normalizes output.
8. `Route Output Type` picks branch.
9. FE renders response.
10. n8n writes chat to Supabase and triggers token logging.

### Flow B: Chat task with file

1. User attach image/PDF/CSV in Supervisor Chat.
2. FE posts multipart to n8n `chat`.
3. n8n detects file and switches by MIME.
4. File text is extracted/OCRed/parsed.
5. Combined prompt + extracted text goes to Supervisor Agent.
6. Rest of flow follows output routing.

### Flow C: SOP question

1. User asks in Knowledge Chat or Supervisor Chat.
2. Supervisor routes SOP/internal policy intent to Knowledge Agent, or Knowledge Chat sends RAG context directly.
3. Knowledge Agent queries Pinecone.
4. If docs found, answer is grounded and source-aware.
5. If not found, fixed no-info response is returned.

### Flow D: Upload SOP document

1. User opens Document Workspace.
2. User uploads PDF/DOCX to input folder.
3. FE posts file to n8n upload webhook.
4. n8n stores file in Supabase storage/table.
5. n8n indexes content into Pinecone.
6. Document appears in workspace list and can later be retrieved by Knowledge Agent.

### Flow E: Generate PDF report or slide PDF

1. User asks Supervisor for report/PPT.
2. Supervisor delegates to Document Agent.
3. Document Agent calls format tool (`Get Report Format` or `Get PPT Format`).
4. Output includes required `Unduh ... (PDF)` marker.
5. `Route Output Type` sends output to PDF/PPT pipeline.
6. File is generated, uploaded, stored in `dokumen`, and linked in chat.

### Flow F: Gmail Magic Reply

1. User opens Email Page.
2. User selects email.
3. User clicks Magic Reply.
4. FE parses sender/recipient/subject/date/body.
5. FE navigates to Supervisor Chat and auto-sends prompt.
6. Supervisor delegates to Communication Agent.
7. Communication Agent returns JSON draft.
8. FE shows draft card with send/regenerate actions.
9. User sends final email through n8n send branch.

### Flow G: Calendar scheduling

1. User asks to create/check/delete meeting.
2. FE includes Google access token in n8n payload if connected.
3. Supervisor routes to Scheduler Agent.
4. Scheduler Agent calls Calendar tool.
5. Response returns event details/link if available.
6. FE renders result and history persists.

### Flow H: Jira issue visibility

1. User connects Jira in Integrations.
2. Jira page can read issue list via backend proxy.
3. Supervisor Chat can pass Jira credentials to n8n.
4. Supervisor routes Jira read/progress questions to Task Agent.
5. Task Agent uses Jira tool and returns factual issue data.

### Flow I: Token monitoring

1. Any workflow response branch persists chat and calls execute-workflow logger.
2. Logger reads execution data from n8n.
3. Logger extracts token usage and execution time.
4. Logger writes row to `execution_token_usage`.
5. Token Monitor reads and displays latest usage.

## 8. Redesign-Relevant Observations

### Current strengths

- Clear sidebar IA with workspace-oriented navigation.
- Chat sessions are visible in sidebar for both chat products.
- AI result cards support actions, not just text.
- Email Magic Reply is an important cross-screen flow.
- Calendar/Jira summaries already make Dashboard useful.
- Token Monitor provides operational/admin visibility.

### Current UX inconsistencies

- Email Page visual language differs from the rest of the app.
- Calendar/Jira pages use card grids/lists but do not yet expose filtering/search.
- Document upload path is functional but status after upload depends on local state plus backend reload.
- Debug Auth screen includes emoji/instructional copy and feels outside production IA.
- Settings and Integrations overlap conceptually: n8n config is in Settings modal, account integrations are in Integrations page.

### Feature alignment opportunities

- Surface integration status globally:
  - Google connected/not connected
  - Jira connected/not connected
  - n8n env/mode
- Convert Dashboard into command center:
  - recent chats
  - latest generated docs
  - upcoming meetings
  - Jira status
  - token usage health
- Make generated outputs first-class:
  - output document library
  - download/history actions
  - per-session artifacts
- Make Email + Supervisor handoff explicit:
  - "Generate reply"
  - "Review draft"
  - "Send final"
- Clarify Knowledge vs Supervisor:
  - Knowledge for grounded SOP Q&A
  - Supervisor for multi-agent delegation and actions

## 9. Open Checks Before Final Redesign

These are worth verifying in the live app/n8n deployment before committing new UX copy:

- Whether deployed upload webhook path is `upload-file` or `upload-document`.
- Whether Knowledge Chat should stay a separate route if Supervisor can also call Knowledge Agent.
- Whether Jira should remain read-only or roadmap includes create/update issue.
- Whether Email compose modal should be implemented or hidden from state.
- Whether Google Docs/Sheets pages are planned, since backend routes exist but no dedicated FE screen is currently present.
- Whether Debug Auth should be production-hidden.

