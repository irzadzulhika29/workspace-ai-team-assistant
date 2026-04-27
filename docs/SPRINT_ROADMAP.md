# Sprint Roadmap — AI Team Assistant

> **Dokumentasi retrospektif** untuk keperluan project management dan referensi Jira board.

---

## Informasi Proyek

| Item | Detail |
|------|--------|
| **Nama Proyek** | Workspace AI Team Assistant |
| **Deskripsi** | Command center berbasis AI untuk team leads & project managers, mengintegrasikan Google Workspace, Jira, dan multi-agent AI orchestration via n8n |
| **Timeline** | 3 April – 24 April 2026 |
| **Total Durasi** | 3 minggu / 3 sprint |
| **Tools** | Jira, GitHub, n8n, Supabase, Vercel/Railway |

---

## Anggota Tim

| Nama | Role |
|------|------|
| Al | UI/UX Designer |
| Afifah | UI/UX Designer |
| Caca | Front End Developer |
| Bagas | Back End Developer |
| Irza | AI Automation Engineer |
| Aufi | Project Manager |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Zustand, React Router v6, Axios |
| **Backend** | Node.js, Express 4, Passport.js, Prisma 5, PostgreSQL |
| **AI Orchestration** | n8n (self-hosted), webhook-based multi-agent system |
| **Databases** | PostgreSQL (via Prisma) + Supabase REST (chat, dokumen, analytics) |
| **Vector Store** | Pinecone (RAG / Knowledge Agent) |
| **Integrasi Eksternal** | Google Workspace APIs (Gmail, Calendar, Drive, Sheets), Jira Cloud API |

---

## Overview Sprint

| Sprint | Periode | Goal |
|--------|---------|------|
| Sprint 1 | 3 Apr – 9 Apr 2026 | Design system, arsitektur teknis, environment setup |
| Sprint 2 | 10 Apr – 16 Apr 2026 | Implementasi semua halaman, API backend, n8n agent aktif |
| Sprint 3 | 17 Apr – 24 Apr 2026 | Integrasi end-to-end, testing, polish, deployment |

---

## Sprint 1 — Design & Foundation

**Periode:** 3 April – 9 April 2026
**Sprint Goal:** Design system selesai, arsitektur teknis ditetapkan, seluruh environment siap untuk pengembangan.

### Epics & Stories

#### EPIC-1: Design System & Wireframe
*Owner: UI/UX (Al, Afifah)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Perancangan design system: palet warna, tipografi, spacing, komponen dasar (Button, Input, Card, Badge, Modal) | Al, Afifah | 2 hari |
| Wireframe low-fidelity 9 halaman: Dashboard, Supervisor Chat, Email Workspace, Calendar Workspace, Jira Workspace, File Workspace, Integrations, Token Monitor, Debug Auth | Al, Afifah | 2 hari |
| High-fidelity mockup Dashboard & Supervisor Chat (prioritas utama) | Al, Afifah | 1 hari |
| Handoff desain ke developer: dokumentasi komponen dan aset | Al, Afifah | 1 hari |

#### EPIC-2: Frontend Foundation
*Owner: Front End (Caca)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Inisialisasi project: Vite + React 18 + Tailwind CSS + Zustand + React Router v6 | Caca | 0.5 hari |
| Setup folder structure (src/pages, src/components, src/services, src/store) | Caca | 0.5 hari |
| Implementasi layout utama: Sidebar navigasi, TopBar, layout wrapper | Caca | 1 hari |
| Setup routing dasar untuk 9 halaman + protected route guard | Caca | 0.5 hari |
| Konfigurasi Axios instance dan environment variable handler | Caca | 0.5 hari |

#### EPIC-3: Backend Foundation & Auth
*Owner: Back End (Bagas)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Inisialisasi Express server + middleware stack (CORS, session, dotenv) | Bagas | 0.5 hari |
| Prisma schema: tabel `User`, `GoogleToken`, `JiraIntegration` + migration pertama | Bagas | 1 hari |
| Google OAuth 2.0 setup via Passport.js: login, callback, token refresh otomatis | Bagas | 1.5 hari |
| Session management (express-session + connect-pg-simple) | Bagas | 0.5 hari |
| Setup Supabase REST: tabel `chat_sessions`, `n8n_chat_histories`, `dokumen`, `execution_token_usage`, `dashboard_summary_snapshots` | Bagas | 1 hari |
| Auth middleware (`/server/middleware/auth.js`) + route mounting di `server/index.js` | Bagas | 0.5 hari |

#### EPIC-4: AI Architecture Design
*Owner: AI Automation Engineer (Irza)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Desain arsitektur n8n: blueprint 6 specialist agent (Knowledge, Scheduler, Task, Communication, Document, Report) | Irza | 1.5 hari |
| Setup n8n instance + konfigurasi webhook endpoint (prod/dev, publish/test mode) | Irza | 1 hari |
| Konfigurasi koneksi n8n ke Google APIs dan Supabase credentials | Irza | 1 hari |
| Desain skema routing pesan Supervisor Agent → specialist agents | Irza | 1 hari |

#### EPIC-5: Project Setup & Sprint Planning
*Owner: PM (Aufi)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Setup Jira project: board, workflow status, label per role | Aufi | 0.5 hari |
| Backlog grooming: breakdown semua fitur menjadi stories dan estimasi | Aufi | 1 hari |
| Sprint 1 planning meeting + definisi DoD (Definition of Done) | Aufi | 0.5 hari |
| Setup repository structure, branch convention, PR template | Aufi | 0.5 hari |

---

## Sprint 2 — Core Feature Development

**Periode:** 10 April – 16 April 2026
**Sprint Goal:** Semua halaman core selesai diimplementasi, seluruh API backend aktif, dan n8n multi-agent berjalan.

### Epics & Stories

#### EPIC-6: Dashboard Page
*Owner: Front End (Caca)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Dashboard layout: 4-card grid (Jira, Calendar, Email briefing + Token Usage overview) | Caca | 1 hari |
| AI Briefing cards: headline, bullet summary, priority badge, last updated, status indicator | Caca | 1 hari |
| Workspace shortcuts & quick navigation | Caca | 0.5 hari |
| Refresh button (trigger n8n Get Summary Activity) | Caca | 0.5 hari |

#### EPIC-7: Supervisor Chat
*Owner: Front End (Caca)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Chat UI: message list, input bar, send button, loading state | Caca | 1 hari |
| File attachment support (PDF, DOCX via React Dropzone) | Caca | 0.5 hari |
| Session history: sidebar daftar sesi, switch session | Caca | 1 hari |
| Chat history filtering: strip n8n internal tool traces dari rendering | Caca | 0.5 hari |
| Markdown rendering untuk AI response (react-markdown + rehype-raw + DOMPurify) | Caca | 0.5 hari |

#### EPIC-8: Email Workspace
*Owner: Front End (Caca)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Inbox list: tampilan email dengan sender, subject, snippet, waktu | Caca | 1 hari |
| Filter tab: Inbox, Starred, Unread, Sent | Caca | 0.5 hari |
| Search bar + pagination / load-more | Caca | 0.5 hari |
| Email detail view: HTML body (sanitized), metadata, aksi bintang/baca | Caca | 0.5 hari |
| Magic Reply: generate balasan via Supervisor dengan konteks email | Caca | 1 hari |
| Draft management: tampilkan draft, kirim/revisi flow | Caca | 0.5 hari |

#### EPIC-9: Calendar Workspace
*Owner: Front End (Caca)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Event list dengan filter Today / Upcoming | Caca | 0.5 hari |
| Event detail: judul, waktu, lokasi, daftar peserta | Caca | 0.5 hari |
| Create event form (judul, waktu, deskripsi, Google Meet toggle) | Caca | 1 hari |
| AI summary panel per event | Caca | 0.5 hari |

#### EPIC-10: Jira Workspace
*Owner: Front End (Caca)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Issue list: summary, status badge, assignee, priority, due date | Caca | 1 hari |
| Grouping by status (To Do, In Progress, Done) | Caca | 0.5 hari |
| Local caching (localStorage) untuk data Jira | Caca | 0.5 hari |
| Risk detection indicator (warna/badge untuk issues berisiko) | Caca | 0.5 hari |

#### EPIC-11: File Workspace
*Owner: Front End (Caca)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Upload zona (drag & drop via React Dropzone, PDF/DOCX max 20MB) | Caca | 0.5 hari |
| Kategorisasi dokumen: folder Input (SOP) vs Output (Generated) | Caca | 0.5 hari |
| File list dengan metadata (nama, ukuran, tanggal upload) | Caca | 0.5 hari |
| Preview modal untuk dokumen | Caca | 0.5 hari |

#### EPIC-12: Integrations & Token Monitor
*Owner: Front End (Caca)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Integrations page: status koneksi Google OAuth dan Jira | Caca | 0.5 hari |
| Connect/disconnect Google OAuth flow | Caca | 0.5 hari |
| Token Monitor page: tabel eksekusi, grafik usage | Caca | 1 hari |

#### EPIC-13: Backend API — Google Workspace Proxy
*Owner: Back End (Bagas)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Gmail proxy: list messages, get detail, send, modify (bintang/baca), labels | Bagas | 1.5 hari |
| Calendar proxy: list events, create event (dengan Google Meet) | Bagas | 1 hari |
| Drive proxy: list files | Bagas | 0.5 hari |
| Sheets proxy: append, read, update data | Bagas | 0.5 hari |
| Auth header support untuk n8n-originated requests (`x-n8n-api-key`) | Bagas | 0.5 hari |

#### EPIC-14: Backend API — Jira & Sessions
*Owner: Back End (Bagas)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Jira integration: simpan/ambil credential (terenkripsi), test koneksi, proxy ke Jira API | Bagas | 1.5 hari |
| Chat session API: create, list, get history, delete (`/api/sessions/*`) | Bagas | 1 hari |
| Email draft API: simpan/ambil draft revisi | Bagas | 0.5 hari |
| Dashboard briefing API: get semua briefing, get per domain (Jira/Calendar/Email), upsert dari n8n | Bagas | 1 hari |
| Token usage logging endpoint + expose credential Jira ke n8n | Bagas | 0.5 hari |

#### EPIC-15: n8n Multi-Agent Core
*Owner: AI Automation Engineer (Irza)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Supervisor Agent: routing intent ke 6 specialist agents | Irza | 1.5 hari |
| Knowledge Agent: RAG dengan Pinecone vector store, dokumen retrieval | Irza | 1.5 hari |
| Scheduler Agent: buat/rangkum event Google Calendar | Irza | 1 hari |
| Task Agent: baca dan analisis Jira issues | Irza | 1 hari |
| Communication Agent: draft email, Magic Reply, kirim via Gmail proxy | Irza | 1.5 hari |
| Document Agent: OCR, PDF extraction, Pinecone indexing | Irza | 1 hari |
| Report Agent: generate laporan ringkasan aktivitas | Irza | 1 hari |

#### EPIC-16: Sprint Review & Progress Tracking
*Owner: PM (Aufi)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Daily standup tracking + blocker log | Aufi | Ongoing |
| Update Jira board: status stories per hari | Aufi | Ongoing |
| Sprint 2 review meeting + demo ke stakeholder | Aufi | 1 hari |
| Sprint 3 planning berdasarkan sisa backlog | Aufi | 0.5 hari |

---

## Sprint 3 — Integration, Polish & Testing

**Periode:** 17 April – 24 April 2026
**Sprint Goal:** End-to-end flow berjalan mulus, semua bug kritis terselesaikan, UI polish selesai, siap deploy.

### Epics & Stories

#### EPIC-17: UI Polish & Responsiveness
*Owner: UI/UX (Al, Afifah)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Review visual consistency seluruh halaman berdasarkan design system | Al, Afifah | 1 hari |
| Penyesuaian responsive layout (mobile-friendly adjustments) | Al, Afifah | 1 hari |
| Micro-interaction & loading state polish (skeleton, spinner, empty state) | Al, Afifah | 1 hari |
| Final design QA dan feedback ke developer | Al, Afifah | 0.5 hari |

#### EPIC-18: n8n Advanced Workflows
*Owner: AI Automation Engineer (Irza)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| n8n Get Summary Activity workflow: kumpulkan data Calendar, Gmail, Jira secara paralel → AI analisis → upsert ke Supabase | Irza | 2 hari |
| Token usage tracking: log per eksekusi ke `execution_token_usage` di Supabase | Irza | 0.5 hari |
| Webhook URL builder: dynamic endpoint berdasarkan env (prod/dev) + mode (publish/test) | Irza | 0.5 hari |
| Document generation: output PDF via n8n → routing ke File Workspace | Irza | 1 hari |
| PowerPoint generation: output PPTX via n8n → routing ke File Workspace | Irza | 1 hari |

#### EPIC-19: Integration Testing
*Owner: Front End (Caca) + Back End (Bagas)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| E2E flow: Google OAuth login → session persisted → Google API calls berhasil | Caca, Bagas | 1 hari |
| E2E flow: kirim pesan ke Supervisor → n8n webhook → response di chat | Caca, Bagas | 1 hari |
| E2E flow: upload dokumen → Pinecone indexed → Knowledge Agent bisa retrieve | Caca, Irza | 1 hari |
| E2E flow: Magic Reply → draft email di Email Workspace → kirim | Caca, Bagas | 0.5 hari |
| E2E flow: Dashboard refresh → n8n Get Summary Activity → briefing cards update | Caca, Irza | 0.5 hari |

#### EPIC-20: Bug Fixing
*Owner: Front End (Caca) + Back End (Bagas)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Chat history filtering: pastikan n8n internal traces (tool calls, `[{"output"...}]` blobs) tidak ter-render | Caca | 0.5 hari |
| PDF URL injection ke AI messages yang mengandung download trigger | Caca | 0.5 hari |
| Token refresh race condition: pastikan token baru tersimpan ke `GoogleToken` sebelum request berikutnya | Bagas | 0.5 hari |
| Session persistence per tab (sessionStorage UUID tidak bocor antar tab) | Caca | 0.5 hari |
| Jira credential encryption validation di backend | Bagas | 0.5 hari |

#### EPIC-21: Environment & Deployment
*Owner: Back End (Bagas)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Finalisasi `.env` produksi (VITE_N8N_ENV=prod, VITE_N8N_PROD_URL, Supabase keys) | Bagas | 0.5 hari |
| Finalisasi `.env` backend produksi (DATABASE_URL, GOOGLE_*, N8N_API_KEY) | Bagas | 0.5 hari |
| Konfigurasi CORS untuk domain produksi | Bagas | 0.5 hari |
| Deploy backend ke Railway/VPS + verifikasi koneksi database | Bagas | 1 hari |
| Deploy frontend ke Vercel + verifikasi semua environment variable | Caca | 0.5 hari |

#### EPIC-22: Documentation & Handoff
*Owner: PM (Aufi)*

| Story | PIC | Estimasi |
|-------|-----|----------|
| Finalisasi `docs/WEBSITE_FEATURE_AND_WORKFLOW_INVENTORY.md` | Aufi | 1 hari |
| Penulisan `docs/SPRINT_ROADMAP.md` (dokumen ini) | Aufi | 0.5 hari |
| User guide singkat: cara koneksi Google OAuth + Jira | Aufi | 0.5 hari |
| Sprint 3 review + retrospective meeting | Aufi | 1 hari |
| Final handoff: transfer credential, akses repository, n8n instance | Aufi | 0.5 hari |

---

## Summary Deliverables per Role

### UI/UX (Al, Afifah)
- Design system lengkap (warna, tipografi, komponen)
- Wireframe + high-fidelity mockup 9 halaman
- Design QA dan responsive review

### Front End (Caca)
- 9 halaman React terimplementasi penuh
- Integrasi dengan seluruh backend API dan n8n webhook
- State management (Zustand) + routing + session handling
- Chat history filtering + markdown rendering

### Back End (Bagas)
- Google OAuth 2.0 dengan auto token refresh
- 4 Google API proxy (Gmail, Calendar, Drive, Sheets)
- Jira integration (encrypted credentials, proxy)
- Session, chat history, email draft, dashboard briefing, token usage API
- PostgreSQL (Prisma) + Supabase setup + deployment

### AI Automation Engineer (Irza)
- n8n workflow utama: Supervisor + 6 specialist agents (85+ nodes)
- n8n Get Summary Activity workflow (Dashboard briefing)
- RAG integration via Pinecone (Knowledge Agent)
- PDF/PPT document generation
- Token usage tracking

### PM (Aufi)
- Sprint planning & retrospective (3 sprint)
- Jira board management + daily tracking
- Dokumentasi: Feature Inventory, Sprint Roadmap, User Guide
- Final handoff project

---

## Definition of Done (DoD)

Sebuah story dinyatakan **Done** apabila:
1. Fitur berjalan sesuai acceptance criteria yang disepakati
2. Tidak ada error kritis di browser console / server logs
3. Code sudah di-merge ke branch `main`
4. Jira story status diperbarui ke **Done**

---

*Dokumen ini disusun sebagai retroactive documentation untuk sprint yang telah dieksekusi dalam periode 3–24 April 2026.*
