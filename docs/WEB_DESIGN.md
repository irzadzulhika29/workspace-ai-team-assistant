# Web Design Detail - AI Team Assistant

Dokumen ini menjabarkan detail screen, user flow, data yang ditampilkan, dan komponen UI berdasarkan `docs/PLAN.md`. Dokumen ini ditujukan sebagai handoff untuk tim UI/UX.

## 1. Product Direction

### Positioning

AI Team Assistant diposisikan sebagai command center untuk team lead atau project manager. Fokus utamanya bukan chatbot tunggal, tetapi workspace operasional untuk memahami kondisi tim, mengambil keputusan, dan menjalankan aksi lewat AI dengan pola draft atau preview sebelum user approve.

### Prinsip desain utama

- Dashboard menjadi titik awal untuk briefing lintas domain.
- Workspace menjadi tempat user memeriksa detail data per domain.
- Supervisor Chat menjadi execution layer untuk membuat draft, report, email, agenda, slides, atau output lain.
- Semua aksi penting harus approval-gated: send email, create meeting, update calendar, export document, dan future Jira write.
- Recommended action harus kontekstual di dalam domain card atau workspace, bukan satu daftar global yang mencampur semua domain.
- Generated output harus menjadi object yang bisa ditemukan lagi, terutama di Documents Workspace.

### Target user utama

- Team lead, project manager, atau operational lead.
- Butuh scanning cepat untuk Jira, Calendar, Email, dan penggunaan AI.
- Sering harus membuat report, membalas email, menyiapkan meeting, dan mengubah data menjadi dokumen.
- Membutuhkan transparansi context sebelum AI menjalankan output.

## 2. Information Architecture

### Navigasi utama

Sidebar disarankan memakai grouping berikut:

- Main
  - Dashboard
  - Supervisor Chat
- Workspaces
  - Jira
  - Email
  - Calendar
  - Documents
- Operations
  - Integrations
  - Token Usage atau Monitoring
- Admin / Dev
  - Debug Auth
  - n8n Settings

Catatan: Debug Auth dan n8n developer settings tidak boleh tampil sebagai primary user-facing screen. Keduanya tetap tersedia untuk kebutuhan development atau troubleshooting.

### Screen inventory

| Screen | Fungsi utama | Prioritas |
| --- | --- | --- |
| Dashboard / Command Center | Briefing lintas domain dan action context handoff | P0 |
| Supervisor Chat | Eksekusi output lintas tool dengan draft/preview | P0 |
| Jira Workspace | Inspect issue, risk, dan generate report | P0, P2 untuk write |
| Email Workspace | Inbox, unread priority, Magic Reply, draft approval | P0 |
| Calendar Workspace | Agenda, event detail, meeting prep, event action handoff | P0 |
| Documents Workspace | Generated output library dan uploaded knowledge files | P1 |
| Integrations | Health display dan status koneksi layanan | P0 |
| Token Usage / Monitoring | Detail pemakaian AI dan workflow | P0 |

## 3. Shared Interaction Model

### AI action/context handoff

Semua action dari Dashboard dan Workspace yang membutuhkan AI harus dikirim ke Supervisor Chat memakai bentuk data yang konsisten.

```json
{
  "source": "dashboard | jira | email | calendar | documents",
  "intent": "generate_report | draft_reply | prepare_meeting | review_blockers | ask_ai",
  "displayLabel": "Buat Report",
  "prompt": "Prompt lengkap yang boleh diedit user sebelum dikirim",
  "context": {
    "domainData": "structured source data"
  }
}
```

### Pola action umum

1. User melihat data di Dashboard atau Workspace.
2. User klik action kontekstual.
3. Sistem membuka Supervisor Chat dengan prompt template dan context otomatis.
4. User bisa mengedit prompt sebelum submit.
5. Supervisor membuat draft atau preview.
6. User review.
7. User approve untuk send, export, create, atau simpan output.

### Shared UI rules

- Tombol action utama harus singkat dan domain-specific.
- Prompt template boleh terlihat di Supervisor, tetapi tidak perlu ditampilkan penuh di card Dashboard.
- Context mentah tidak ditampilkan sebagai JSON kepada user.
- Jika sistem membawa metadata, tampilkan sebagai compact context card.
- Semua loading state harus menjelaskan data domain yang sedang dimuat, misalnya "Memuat agenda..." atau "Memuat issue Jira...".
- Empty state harus actionable, misalnya "Belum ada email prioritas. Refresh inbox atau buka Inbox."

## 4. Dashboard / Command Center

### Tujuan screen

Memberi ringkasan kondisi harian untuk team lead/PM dan menjadi entry point ke workspace atau Supervisor. Dashboard harus terasa seperti operational briefing, bukan landing page.

### Layout desktop

Dashboard memakai grid 2 kolom:

- Baris 1: Jira Summary, Calendar Summary
- Baris 2: Email Summary, Token Usage

Header halaman:

- Title: Dashboard atau Command Center
- Subtitle singkat: tanggal, status update terakhir, dan tombol refresh
- Action: Refresh Briefing

### Layout mobile

- Semua card ditumpuk vertikal.
- Urutan: Jira Summary, Calendar Summary, Email Summary, Token Usage.
- Action tetap berada di dalam card masing-masing.

### Data yang ditampilkan

#### Jira Summary card

Data:

- Total issue aktif
- Issue in progress
- Issue blocked
- Issue overdue
- Sprint completion
- Insight singkat dari AI atau summary rule-based
- Last updated

Komponen UI:

- Summary card
- Metric row atau compact stat tiles
- Risk badges: Blocked, Overdue, High Priority, Stale
- Insight text area
- Action buttons:
  - Lihat Jira
  - Buat Report

Interaction:

- `Lihat Jira` membuka Jira Workspace.
- `Buat Report` membuka Supervisor Chat dengan context issue dan prompt report Jira hari ini.

#### Calendar Summary card

Data:

- Jumlah event hari ini
- Meeting terdekat
- Upcoming event penting
- Meet link bila tersedia
- Conflict indicator
- Needs prep indicator
- Insight singkat

Komponen UI:

- Summary card
- Next meeting row
- Event mini list
- Status badges: Ongoing, Next, Conflict, Needs Prep, Has Meet
- Action buttons:
  - Lihat Calendar
  - Siapkan

Interaction:

- `Lihat Calendar` membuka Calendar Workspace.
- `Siapkan` membuka Supervisor Chat dengan prompt persiapan meeting dari event terdekat atau event yang dipilih.

#### Email Summary card

Data:

- Jumlah unread
- Top 5 unread email
- Sender
- Subject
- Snippet
- Waktu masuk
- Priority label: urgent, medium, low
- Needs reply indicator
- Insight singkat

Komponen UI:

- Summary card
- Top 5 compact email list
- Priority badge
- Sender avatar atau initial
- Action buttons:
  - Lihat Email
  - Draft Reply

Interaction:

- `Lihat Email` membuka Email Workspace.
- `Draft Reply` membuka Supervisor Chat dengan context email prioritas tertinggi, atau membuka Email Workspace jika user perlu memilih email dulu.

#### Token Usage card

Data:

- Total token hari ini
- Workflow paling sering dipakai
- Estimasi penggunaan per domain bila tersedia
- Ringkasan penggunaan
- Link ke detail monitoring

Komponen UI:

- Summary card
- Token total metric
- Workflow usage list
- Small chart atau progress bars
- Action:
  - Lihat Detail

Interaction:

- `Lihat Detail` membuka Token Usage / Monitoring.

### User flow

Dashboard flow utama:

1. User membuka Dashboard.
2. Sistem memuat briefing Jira, Calendar, Email, dan Token Usage.
3. User membaca card domain.
4. User klik action di card domain.
5. Jika action bersifat inspect, user masuk workspace.
6. Jika action bersifat generate, user masuk Supervisor Chat dengan prompt dan context.
7. User review hasil dan approve output.

### Empty/error state

- Jika briefing gagal dimuat, tampilkan card dengan error compact dan tombol Retry.
- Jika satu domain gagal, domain lain tetap tampil.
- Jika webhook belum punya recommended action, UI boleh derive action dasar dari client-side.

## 5. Supervisor Chat

### Tujuan screen

Menjadi execution layer untuk semua aksi AI lintas domain: report, email draft/send, calendar create/check, document/PDF/slides generation, dan follow-up.

### Layout utama

- Chat transcript di area utama.
- Composer di bawah.
- Context panel atau context card muncul saat masuk dari Dashboard/Workspace.
- Optional output preview panel untuk draft email, report, PDF, slides, atau generated document.

### Data yang ditampilkan

- Pesan user dan AI.
- Context handoff:
  - Source domain
  - Intent
  - Display label
  - Ringkasan context
  - Prompt template editable
- Draft output:
  - Email draft
  - Report draft
  - Meeting agenda
  - Slides/report metadata
  - Download atau export link jika sudah dibuat

### Komponen UI

- Chat message bubbles
- Context card
- Editable prompt composer
- Draft preview card
- Approval action bar
- File attachment area
- Generated document link card

### Action

- Submit prompt
- Edit prompt before submit
- Approve send/export/create
- Revise draft
- Download document
- Send by email
- Continue asking

### User flow dari handoff

1. User tiba dari Dashboard/Workspace.
2. Chat menampilkan context card dan prompt template.
3. User mengedit atau langsung submit.
4. AI membuat draft/preview.
5. User memilih Approve, Revise, Download, Send, atau Save to Documents.

### UX rules

- Jangan tampilkan payload mentah sebagai isi chat.
- Untuk email draft, tampilkan draft card yang terstruktur.
- Untuk clarify response, tampilkan pesan human-readable, bukan JSON.
- Riwayat chat harus tetap bisa render metadata yang sama setelah reload.

## 6. Jira Workspace

### Tujuan screen

Memberi ruang kerja untuk memahami status Jira, menemukan risiko, dan membuat report berbasis data issue yang sudah ditarik dari sistem.

### Struktur tab

- Overview
- Issues
- Summary
- Reports

### Tab: Overview

Data:

- Total Issues
- In Progress
- Blocked
- Overdue
- Sprint completion
- Assignee load
- Due soon
- Recent movement

Komponen UI:

- Metric tiles
- Sprint progress bar
- Risk summary list
- Assignee load chart
- Recent movement list

Interaction:

- Klik risk item membuka tab Summary atau Issues dengan filter relevan.
- Klik assignee membuka issue list terfilter.

### Tab: Issues

Data tabel/list:

- Key
- Summary
- Status
- Priority
- Assignee
- Updated
- Due Date

Komponen UI:

- Search input
- Filter controls: status, priority, assignee, due date, risk type
- Sort control
- Issue table atau responsive issue list
- Status badge
- Priority badge
- Empty state per filter

Interaction:

- Search issue.
- Filter issue.
- Klik issue membuka detail drawer atau detail page.
- P0 tidak menampilkan create/update/assign/transition action.

### Tab: Summary

Data:

- High priority unassigned
- Issue overdue
- Stale issues, misalnya tidak update lebih dari 3 hari
- Too many in-progress per assignee
- Blocked issues
- Near deadline but still To Do
- AI summary dan recommended action

Komponen UI:

- Insight list
- Risk severity badge
- Affected issue links
- Recommended action button per insight

Interaction:

- Klik recommended action membuka Supervisor dengan context insight dan issue terkait.
- Klik issue link membuka Issues tab dengan filter/selection.

### Tab: Reports

Tujuan:

Area action untuk memilih jenis report yang ingin dibuat. Ini bukan list report pasif.

Komponen UI:

- Quick action buttons:
  - Daily Standup Report
  - Weekly Progress Report
  - Sprint Risk Report
  - Stakeholder Update
  - Meeting Agenda from Jira
- Custom request input: "Buat report lain..."
- Context preview compact: jumlah issue dan filter aktif

Flow:

1. User klik salah satu quick button atau isi custom request.
2. Sistem membuat handoff context Jira.
3. Supervisor membuat draft output.
4. User review.
5. User pilih download, send by email, atau save to Documents.

### Detection logic expectation

- Risk detection harus rule-based dan audit-able dari field status, priority, assignee, updated, dan due date.
- AI dipakai untuk merangkum dan memberi wording/action, bukan satu-satunya sumber deteksi.

## 7. Email Workspace

### Tujuan screen

Membantu user memprioritaskan inbox, memahami email penting, membuat draft balasan, merevisi, dan mengirim hanya setelah approval.

### Struktur section

- Inbox
- Unread
- Drafts
- Sent / Follow-up

### Shared layout

- Kiri: email list atau section list.
- Kanan: email detail atau draft detail.
- Mobile: list dulu, lalu detail dengan back button.

### Section: Inbox

Data:

- Sender
- Subject
- Snippet
- Received time
- Read/unread state
- Label atau category bila tersedia

Komponen UI:

- Search input
- Filter: unread, sender, priority, needs reply
- Email list item
- Email detail panel
- Magic Reply button

Interaction:

- Klik email membuka detail.
- Magic Reply membuat draft berbasis context email.

### Section: Unread

Data:

- Top 5 unread email paling perlu perhatian
- Sender
- Subject
- Time
- Snippet
- Priority label
- AI reason atau short explanation

Komponen UI:

- Top 5 Email Summary card
- Priority badges: urgent, medium, low
- Email compact list
- Action per item:
  - Draft Reply
  - Open Detail

Priority logic:

- Rule-based: unread status, sender penting, kata kunci urgent, follow-up keyword.
- AI: menjelaskan alasan prioritas dan merangkum isi email.

### Section: Drafts

Data:

- Source email metadata
- Draft subject
- Draft body
- Tone atau instruction terakhir
- Status: draft, revised, ready to send
- Created time

Komponen UI:

- Draft list
- Draft preview card
- Source email card
- Action buttons:
  - Send
  - Revise
  - Discard

Flow Send:

1. User membuka draft.
2. User review isi draft.
3. User klik Send.
4. Sistem menampilkan confirmation state bila perlu.
5. Email dikirim.
6. Draft berpindah ke Sent / Follow-up.

Flow Revise:

1. User klik Revise.
2. User menulis arahan perbaikan, misalnya tone, detail, CTA, atau ringkas.
3. Sistem membawa context email dan draft sebelumnya ke Supervisor.
4. Draft baru menggantikan draft lama.
5. User review lagi sebelum Send.

### Section: Sent / Follow-up

Data:

- Email terkirim
- Recipient
- Subject
- Sent time
- Follow-up status
- Suggested reminder bila tersedia

Komponen UI:

- Sent list
- Follow-up badge
- Reminder suggestion card

### Empty/error state

- Jika tidak ada unread, tampilkan "Tidak ada email unread prioritas."
- Jika Google belum connected, tampilkan CTA ke Integrations.
- Jika draft gagal dibuat, tampilkan retry dan tetap tampilkan source email.

## 8. Calendar Workspace

### Tujuan screen

Menampilkan agenda user, membantu memahami event penting, dan mengarahkan aksi terkait event ke Supervisor.

### Layout desktop

Master-detail 2 kolom:

- Panel kiri: Agenda Overview, sekitar 35 persen lebar.
- Panel kanan: Event Workspace, sekitar 65 persen lebar.
- Panel kiri dan kanan bisa scroll terpisah.

### Layout mobile

- List agenda tampil dulu.
- Klik event membuka detail event.
- Detail punya back button untuk kembali ke agenda.

### Panel kiri: Agenda Overview

#### AI Summary Card

Data:

- Jumlah event hari ini
- Event paling dekat atau paling penting
- Conflict indicator
- Needs prep indicator
- Rekomendasi singkat

Komponen UI:

- Compact summary card
- Status badge
- Refresh button kecil

#### Today Events

Data:

- Title
- Start time
- End time
- Location
- Meet link
- Attendees singkat
- Calendar source
- State: ongoing, next, past
- Indicators: Conflict, Needs Prep, Has Meet, AI Suggested

Komponen UI:

- Event list item
- Time block
- Status badge
- Meet icon/button

Interaction:

- Klik event membuka Event Workspace di kanan.
- Event ongoing diberi highlight paling kuat.
- Event next diberi highlight ringan.
- Event past dibuat muted.

#### Upcoming Events

Data:

- Events setelah hari ini
- Grouping: Tomorrow, This Week, Next Week
- Title, date/time, location/Meet link, indicators

Komponen UI:

- Grouped list
- Compact event item

### Panel kanan: Event Workspace

#### Empty state

Saat belum ada event dipilih:

- Text: "Pilih event dari daftar untuk melihat detail."
- Optional hint: "AI bisa bantu membuat agenda, follow-up, atau report dari event."

#### Event Detail Header

Data:

- Event title
- Date
- Time
- Status
- Calendar source
- Location
- Meet link
- Attendees ringkas

Komponen UI:

- Detail header
- Attendee chips
- Link buttons:
  - Open Calendar
  - Copy Meeting Link
  - Join Meeting
  - Refresh Event

#### Event Summary

Data:

- Tujuan meeting
- Konteks penting
- Peserta kunci
- Hal yang perlu disiapkan
- Risiko
- Follow-up potensial

Empty summary:

- Jika description kosong, tampilkan: "Belum ada deskripsi detail. AI bisa bantu membuat agenda atau preparation brief berdasarkan judul dan peserta."

#### Quick Actions

Komponen UI:

- Compact action chips/buttons:
  - Prepare Agenda
  - Generate Slides
  - Generate Report
  - Draft Follow-up
  - Draft Reminder

Interaction:

- Klik action tidak langsung menjalankan output di Calendar.
- Action membuka Supervisor dengan context event terpilih.

#### Custom Request Input

Data/context otomatis:

- Event title
- Time
- Attendees
- Location
- Meet link
- Description

Komponen UI:

- Text input atau textarea compact
- Submit button
- Placeholder: "Minta AI membuat output dari event ini..."

Contoh input:

- "buat slides sprint review"
- "buat laporan blocker"
- "buat notes template"

### User flow

1. User membuka Calendar Workspace.
2. User membaca AI Summary.
3. User memilih event di Today atau Upcoming.
4. Event detail muncul.
5. User klik quick action atau mengisi custom request.
6. Sistem membuka Supervisor dengan source `calendar`, intent, prompt, dan context event.
7. Supervisor membuat output draft.
8. User review lalu send, export, create, atau simpan.

## 9. Documents Workspace

### Tujuan screen

Menjadi library untuk semua dokumen user-facing: hasil generate AI, file upload manual, referensi knowledge, report, meeting material, dan email export.

### Struktur segment

- Generated
- Uploaded

Knowledge tidak menjadi menu utama terpisah untuk MVP. Knowledge menjadi capability di Documents lewat action seperti Ask Document, Ask Knowledge Base, dan Use as Context.

### Segment: Generated

Data:

- Document title
- Category: Slides, Report, MOM, Agenda, Email, SOP, Policy, Reference
- Source: Supervisor, Jira, Calendar, Email, Documents
- Created time
- Owner/session
- File type
- Download URL atau preview availability

Komponen UI:

- Segment control
- Document grid/list
- Category badge
- Source badge
- Search/filter
- Sort by created date/category/source

Interaction:

- Klik document membuka detail.
- Download document.
- Send by Email.
- Use as Context.

### Segment: Uploaded

Data:

- File name
- Category
- Upload date
- File type
- Processing status
- Knowledge/RAG availability

Komponen UI:

- Upload dropzone/button
- Uploaded document list
- Processing status badge
- Error badge bila gagal indexing

Interaction:

- Upload file.
- Klik file untuk preview/detail.
- Ask Document atau Ask Knowledge Base.
- Use as Context untuk Supervisor.

### Document detail layout

Layout desktop:

- Area utama: preview/metadata dokumen.
- Panel kanan: chat/RAG dengan dokumen sebagai context.

Data:

- Title
- Category
- Source
- Created/uploaded time
- Preview
- File metadata
- Related chat/session bila tersedia

Komponen UI:

- Document preview
- Metadata panel
- Ask AI side panel
- Action bar:
  - Download
  - Ask Document
  - Use as Context
  - Send by Email

### User flow

Generated output flow:

1. Supervisor menghasilkan report/PDF/slides.
2. Output disimpan sebagai Generated document.
3. User membuka Documents Workspace.
4. User klik dokumen.
5. User preview, Ask AI, Download, atau Send by Email.

Uploaded knowledge flow:

1. User upload SOP/reference.
2. File masuk Uploaded.
3. User klik dokumen.
4. RAG chat aktif di sisi kanan.
5. User bertanya isi dokumen.
6. Jawaban bisa dikirim ke Supervisor untuk dijadikan checklist/report.
7. Output baru masuk Generated.

## 10. Integrations

### Tujuan screen

Menampilkan status koneksi layanan dan membantu user memperbaiki koneksi yang diperlukan untuk Dashboard/Workspace.

### Data yang ditampilkan

- Google account connection status
- Gmail access status
- Calendar access status
- Drive/Docs access status bila relevan
- Jira integration status
- Last sync time
- Error state atau expired token indicator

### Komponen UI

- Integration status cards
- Connected/disconnected badges
- Reconnect button
- Last sync row
- Permission explanation compact

### Interaction

- Connect/reconnect Google.
- Connect/reconnect Jira.
- Refresh status.
- Jika workspace membutuhkan integration yang belum aktif, CTA diarahkan ke screen ini.

## 11. Token Usage / Monitoring

### Tujuan screen

Memberi detail penggunaan token dan workflow agar user/admin bisa memantau konsumsi AI.

### Data yang ditampilkan

- Total token hari ini
- Token per workflow
- Token per domain bila tersedia
- Jumlah execution
- Workflow paling sering dipakai
- Trend penggunaan

### Komponen UI

- Metric tiles
- Usage table
- Bar chart atau line chart
- Date range filter
- Workflow filter

### Interaction

- Filter by date range.
- Filter by workflow/domain.
- Buka detail execution bila tersedia.

## 12. Cross-Screen User Flows

### Flow A: Dashboard to Jira Report

1. User membuka Dashboard.
2. User melihat Jira Summary.
3. User klik `Buat Report`.
4. Supervisor Chat terbuka dengan context issue dan prompt report.
5. User mengedit prompt bila perlu.
6. Supervisor membuat draft report.
7. User review.
8. User download, send by email, atau save to Documents.

### Flow B: Jira Risk to Supervisor

1. User membuka Jira Workspace.
2. User masuk tab Summary.
3. User melihat risk `High priority unassigned`.
4. User klik recommended action.
5. Supervisor terbuka dengan issue terkait sebagai context.
6. Supervisor membuat summary/action plan.
7. User menyimpan atau membagikan output.

### Flow C: Email Magic Reply

1. User membuka Email Workspace.
2. User masuk Unread atau Inbox.
3. User memilih email.
4. User klik `Draft Reply` atau `Magic Reply`.
5. Sistem membuat draft berbasis context email.
6. Draft masuk ke Drafts.
7. User pilih Send atau Revise.
8. Send hanya terjadi setelah approval.

### Flow D: Email Draft Revise

1. User membuka draft.
2. User klik Revise.
3. User menulis instruksi revisi.
4. Supervisor meregenerasi draft dengan source email dan draft lama.
5. Draft baru menggantikan draft lama.
6. User review dan approve Send.

### Flow E: Calendar Meeting Prep

1. User membuka Calendar Workspace.
2. User memilih event hari ini.
3. User klik `Prepare Agenda`.
4. Supervisor terbuka dengan context event.
5. Supervisor membuat agenda draft.
6. User review.
7. User export, save to Documents, atau kirim follow-up.

### Flow F: Document Q&A to Generated Output

1. User upload dokumen referensi.
2. User membuka detail dokumen.
3. User bertanya lewat Ask Document.
4. AI menjawab berbasis dokumen.
5. User memilih Use as Context.
6. Supervisor membuat checklist/report.
7. Output tersimpan di Generated.

## 13. Responsive Behavior

### Desktop

- Dashboard: 2 kolom.
- Calendar: master-detail 35/65.
- Email: list-detail.
- Documents: preview plus AI panel.
- Jira: tabbed workspace dengan table/list yang padat.

### Tablet

- Dashboard bisa tetap 2 kolom jika ruang cukup.
- Workspace list-detail boleh berubah menjadi stacked layout.
- Filter penting tetap terlihat, filter tambahan masuk menu.

### Mobile

- Dashboard semua card vertikal.
- Email, Calendar, dan Documents memakai list first, detail second.
- Tab dan segment harus bisa horizontal scroll atau menjadi compact segmented control.
- Primary action tetap sticky di area bawah hanya bila tidak menutup konten penting.

## 14. Approval and Safety Rules

Action yang wajib approval eksplisit:

- Send email.
- Create meeting.
- Update meeting.
- Export/send document.
- Future Jira create/update/assign/transition.
- Autonomous execution apa pun.

UI harus membedakan:

- Draft: belum dikirim atau belum dibuat di sistem eksternal.
- Preview: hasil bisa dilihat sebelum export/send.
- Approved: user sudah memberi konfirmasi.
- Sent/Created/Exported: aksi eksternal sudah selesai.

## 15. Accessibility and UX Quality

- Gunakan kontras warna yang cukup untuk badges dan status.
- Jangan hanya mengandalkan warna untuk priority; selalu beri label teks.
- Semua action penting harus bisa dijangkau keyboard.
- Button label harus jelas, misalnya `Draft Reply`, `Buat Report`, `Prepare Agenda`.
- Loading state harus domain-specific.
- Error message harus menyebut apa yang gagal dan action recovery.
- Empty state harus memberi next action yang masuk akal.

## 16. P0/P1/P2 Design Scope

### P0

- Dashboard command center dengan 4 card utama.
- Context handoff dari Dashboard/Jira/Email/Calendar ke Supervisor.
- Jira read/risk detection dan report generation.
- Email inbox/unread priority, Magic Reply, draft approval, send after approval.
- Calendar agenda, event detail, quick action handoff, create meeting after approval.
- Integration health display.
- Token Usage summary dan detail monitoring.

### P1

- Documents Generated/Uploaded library.
- Generated output sebagai first-class object.
- Per-document detail dengan preview dan Ask AI.
- Meeting agenda generator.
- Report templates.
- Follow-up reminder suggestions.

### P2

- Jira create/update/assign/transition.
- Automated recurring briefings.
- Team analytics.
- Role-based permissions.
- Slack/Teams integration.
- Autonomous execution tetap gated by explicit user approval.

## 17. UI/UX Handoff Checklist

- Buat wireframe Dashboard 2x2 cards dan versi mobile stacked.
- Buat desain card domain dengan metric, insight, badges, dan action buttons.
- Buat desain Supervisor handoff state: context card, editable prompt, dan draft preview.
- Buat Jira tabbed workspace: Overview, Issues, Summary, Reports.
- Buat Email list-detail workspace plus Drafts flow.
- Buat Calendar master-detail workspace.
- Buat Documents Generated/Uploaded library dan document detail.
- Buat Integrations health screen.
- Buat Token Usage monitoring screen.
- Definisikan komponen reusable: Summary Card, Metric Tile, Badge, Action Button, Context Card, Draft Preview, List Item, Detail Header, Empty State, Error State.
