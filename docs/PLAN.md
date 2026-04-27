# Fiksasi Screen, Flow, dan Fitur AI Team Assistant

## Summary

- Positioning final: **AI Team Assistant = command center untuk team lead/PM**, bukan sekadar chatbot dengan banyak integrasi.
- Fokus UX utama: **Dashboard + Workspaces**. Supervisor Chat menjadi execution layer ketika user menjalankan recommended action.
- Roadmap dikunci penuh, tapi implementasi dibagi fase: P0 yang sudah realistis dengan capability sekarang, P1 untuk output/library, P2 untuk automation dan Jira write capability.
- Semua action AI memakai pola **draft/preview dulu, lalu user approve** sebelum send/export/create/update.

## Screen & Flow Final

### Dashboard / Command Center

- Dashboard fokus pada 4 card utama:
  - `Jira Summary`
  - `Calendar Summary`
  - `Email Summary`
  - `Token Usage`
- Dashboard tidak memakai section `Recommended Actions` global agar action tidak tercampur antar domain.
- Action tetap ada, tetapi kontekstual di dalam masing-masing card domain.
- Struktur layout dashboard:
  - baris atas: `Jira Summary` + `Calendar Summary`
  - baris bawah: `Email Summary` + `Token Usage`
  - versi mobile: semua card ditumpuk vertikal
- Detail tiap card:
  - `Jira Summary`: progres issue hari ini, blocked, overdue, sprint progress, insight singkat, action seperti `Lihat Jira` dan `Buat Report`.
  - `Calendar Summary`: agenda hari ini, meeting terdekat, upcoming event, Meet link, insight singkat, action seperti `Lihat Calendar` dan `Siapkan`.
  - `Email Summary`: jumlah unread, top 5 unread, urgent/needs reply, insight singkat, action seperti `Lihat Email` dan `Draft Reply`.
  - `Token Usage`: total token hari ini, workflow paling sering dipakai, ringkasan penggunaan, dan link ke detail monitoring.
- Flow utama dashboard:
  - `User lihat summary domain -> klik action di card -> masuk ke workspace terkait atau Supervisor -> review -> output/draft`.
- Semua action dari card domain diarahkan ke Supervisor dengan prompt template yang sudah diisi otomatis, bukan langsung eksekusi.
- User tetap bisa mengedit prompt template itu sebelum dikirim.
- Pola ini berlaku untuk ketiga domain utama: Jira, Calendar, dan Email.
- Contoh pola action:
  - `Jira Summary -> Buat Report -> buka Supervisor dengan prompt template laporan Jira hari ini`
  - `Calendar Summary -> Siapkan -> buka Supervisor dengan prompt template persiapan meeting`
  - `Email Summary -> Draft Reply -> buka Supervisor dengan prompt template balasan email`
- Setiap action handoff ke Supervisor sebaiknya membawa:
  - `domain`
  - `intent`
  - `templatePrompt`
  - `context`
- `context` berisi data domain yang relevan, misalnya issue list ringkas, event yang dipilih, attendee, atau metadata email.

### AI Assistant / Supervisor Chat

- Tetap sebagai tempat eksekusi lintas tool: report, email draft/send, calendar create/check, file/PDF generation.
- Menerima handoff context dari Dashboard/Jira/Email/Calendar via navigation state.
- Chat tidak jadi satu-satunya entry point; user idealnya mulai dari Dashboard atau Workspace.

### Jira Workspace

- Struktur final: `Overview`, `Issues`, `Summary`, `Reports`.
- P0: issue list, filter/search, progress by status, stale/high-priority/unassigned risk detection, generate progress report.
- P2: create/update/assign/transition issue, karena n8n Task Agent saat ini eksplisit read-only.
- Detail konten per tab:
  - `Overview`: progress summary, sprint health, assignee load, due soon, recent movement.
  - `Issues`: tabel/list issue dengan kolom `Key`, `Summary`, `Status`, `Priority`, `Assignee`, `Updated`, `Due Date`, plus search dan filter.
  - `Summary`: ringkasan insight dan blocker hasil pembacaan data Jira yang sudah ditarik dari sistem.
  - `Reports`: area action untuk memilih jenis report yang ingin dibuat.
- Contoh konten `Overview`:
  - `42 Total Issues`
  - `11 In Progress`
  - `4 Blocked`
  - `6 Overdue`
  - `Sprint completion 58%`
- Contoh konten `Summary`:
  - `High priority unassigned`
  - `Issue overdue`
  - `Stale issues` yang tidak update lebih dari 3 hari
  - `Too many in-progress` dalam satu assignee
  - `Blocked issues`
  - `Near deadline but still To Do`
- Contoh insight di `Summary`:
  - `3 issue high priority belum punya assignee`
  - `2 issue overdue sejak 4 hari lalu`
  - `5 issue tidak ada update dalam 6 hari`
  - `Rina menangani 9 issue aktif, paling tinggi di tim`
- Cara kerjanya:
  - sistem ambil raw data Jira dulu;
  - deteksi insight deterministik dilakukan dari field seperti `status`, `priority`, `assignee`, `updated`, dan `due date`;
  - AI dipakai untuk merangkum kondisi dan memberi recommended action, bukan sebagai satu-satunya sumber deteksi.
- `Reports` sebaiknya berupa kumpulan recommended action buttons, bukan list report pasif.
- `Reports` juga boleh memiliki satu input tambahan untuk custom request jika user ingin jenis report di luar rekomendasi utama.
- Contoh tombol di `Reports`:
  - `Daily Standup Report`
  - `Weekly Progress Report`
  - `Sprint Risk Report`
  - `Stakeholder Update`
  - `Meeting Agenda from Jira`
- Struktur UX `Reports`:
  - quick buttons untuk jenis report yang paling umum;
  - optional input `buat report lain...` untuk permintaan yang lebih spesifik.
- Flow `Reports`:
  - user klik salah satu tombol report;
  - context Jira aktif dikirim ke Supervisor;
  - Supervisor membuat draft output;
  - user review lalu pilih download, send by email, atau lanjut ke dokumen.

### Email Workspace

- Struktur final: `Inbox`, `Unread`, `Drafts`, `Sent / Follow-up`.
- P0: inbox/detail/search, unread top 5, email summary card, priority labeling, Magic Reply, draft card, send after approval, revise draft flow.
- Detail konten per section:
  - `Inbox`: daftar semua pesan masuk yang relevan, lengkap dengan search dan email detail.
  - `Unread`: hanya 5 email unread teratas yang paling perlu perhatian user.
  - `Drafts`: daftar draft balasan AI yang belum dikirim.
  - `Sent / Follow-up`: email yang sudah dikirim dan tindak lanjut yang perlu dipantau.
- Komponen utama di atas list email:
  - satu card `Top 5 Email Summary`;
  - berisi ringkasan isi 5 email unread teratas;
  - menandai apakah email termasuk `urgent`, `medium`, atau `low priority`;
  - membantu user cepat tahu email mana yang perlu dibalas lebih dulu.
- Aturan `Unread`:
  - hanya ambil 5 email unread teratas;
  - setiap item menampilkan subject, sender, waktu, snippet singkat, dan label priority;
  - setiap item punya action seperti `Draft Reply` atau `Open Detail`.
- Penentuan priority email:
  - idealnya kombinasi rule-based dan AI summary;
  - rule bisa melihat unread status, sender penting, kata kunci urgent, atau konteks follow-up;
  - AI dipakai untuk menjelaskan kenapa email tampak penting dan merangkum isinya dengan singkat.
- Flow draft balasan:
  - user klik `Draft Reply` dari email unread atau email detail;
  - sistem membuat draft balasan berbasis context email;
  - hasil draft masuk ke kolom `Drafts`.
- Aturan di `Drafts`:
  - setiap draft yang belum dikirim punya dua tombol: `Send` dan `Revise`;
  - `Send` mengirim draft final setelah user approve;
  - `Revise` membuka review agar user bisa menuliskan apa yang perlu diperbaiki.
- Flow `Revise`:
  - user klik `Revise`;
  - user memberi arahan perbaikan, misalnya tone, isi, detail, atau CTA;
  - sistem meregenerasi draft dengan tetap membawa context email dan isi draft sebelumnya;
  - hasil revisi menggantikan draft lama di kolom `Drafts`.
- Flow utama:
  - `Unread top 5 -> lihat summary/priority -> Draft Reply -> Drafts -> Send atau Revise`.
  - `Email detail -> Magic Reply -> Drafts -> review -> Send`.

### Calendar Workspace

- Calendar diposisikan sebagai workspace untuk melihat agenda, memahami event penting, dan menghasilkan output dari event tersebut.
- Struktur layout final memakai pola `master-detail`, agar user bisa scanning agenda di kiri dan bekerja pada event terpilih di kanan tanpa berpindah halaman:
  - panel kiri: `Agenda Overview`
  - panel kanan: `Event Workspace`
- Panel kiri `Agenda Overview` berisi:
  - `AI Summary Card` di bagian atas;
  - `Today Events` di bagian tengah;
  - `Upcoming Events` di bagian bawah.
- Panel kanan `Event Workspace` berisi:
  - `Event Detail Header`;
  - `Event Summary`;
  - `Quick Actions`;
  - `Custom Request Input`;
  - `Supervisor Handoff / Draft Preview`.
- P0: tampilkan agenda user, ringkasan AI untuk event penting, event detail, action input, handoff context event ke Supervisor, create meeting via AI setelah user approval, dan draft follow-up/reminder berbasis attendee.
- `AI Summary Card` di panel kiri:
  - tampil sebagai card compact, bukan hero besar;
  - menampilkan jumlah event hari ini;
  - menampilkan event paling dekat atau paling penting;
  - menandai konflik jadwal jika ada;
  - menandai event yang tampak butuh persiapan;
  - memberi rekomendasi singkat seperti `meeting client pukul 14.00 butuh brief` atau `tidak ada konflik jadwal`.
- `Today Events`:
  - menampilkan event hari ini dengan judul, jam mulai-selesai, lokasi/Meet link, attendees singkat, dan calendar source;
  - event `ongoing` diberi highlight paling kuat;
  - event berikutnya diberi highlight ringan;
  - event yang sudah lewat dibuat lebih muted;
  - event bermasalah diberi indikator seperti `Conflict`, `Needs Prep`, `Has Meet`, atau `AI Suggested`.
- `Upcoming Events`:
  - menampilkan agenda setelah hari ini;
  - grouping bisa memakai `Tomorrow`, `This Week`, dan `Next Week`;
  - item tetap compact dengan judul, tanggal/waktu, lokasi/Meet link, dan indikator penting.
- `Event Detail Header` di panel kanan:
  - menampilkan judul event, tanggal, waktu, status, calendar source, lokasi, Meet link, dan peserta ringkas;
  - action kecil di header bisa berupa `open calendar`, `copy meeting link`, `join meeting`, dan `refresh event`.
- `Event Summary`:
  - berisi pemahaman AI terhadap event terpilih;
  - dapat mencakup tujuan meeting, konteks penting, peserta kunci, hal yang perlu disiapkan, risiko, dan kemungkinan follow-up;
  - jika description kosong, tampilkan empty state yang tetap berguna, misalnya `Belum ada deskripsi detail. AI bisa bantu membuat agenda atau preparation brief berdasarkan judul dan peserta.`
- `Quick Actions`:
  - berupa action chips atau button compact, bukan card besar;
  - action dipakai untuk membuat prompt terstruktur ke Supervisor dengan context event otomatis;
  - tidak menjalankan output langsung di panel Calendar.
- Action utama per event:
  - `Prepare Agenda`
  - `Generate Slides`
  - `Generate Report`
  - `Draft Follow-up`
  - `Draft Reminder`
- `Custom Request Input`:
  - dipakai ketika user ingin memberi instruksi bebas terkait event;
  - placeholder dapat berupa `Minta AI membuat output dari event ini...`;
  - input otomatis membawa context event, sehingga user tidak perlu menulis ulang judul, waktu, peserta, lokasi, link, atau description.
- Input bebas dipakai untuk kebutuhan fleksibel seperti:
  - `buat slides sprint review`
  - `buat laporan blocker`
  - `buat notes template`
- `Supervisor Handoff / Draft Preview`:
  - setelah user klik quick action atau submit custom request, sistem mengarahkan user ke Supervisor Chat;
  - handoff membawa `source: calendar`, `intent`, `displayLabel`, `prompt`, dan `context` event terpilih;
  - Supervisor menjadi execution layer untuk membuat agenda, slides, report, follow-up email, reminder, atau output lain;
  - hasil dari Supervisor tetap memakai pola draft/preview dulu sebelum send/export/create;
  - jika user kembali dari Supervisor atau output tersimpan sebagai generated object, Calendar boleh menampilkan preview ringkas output terakhir, tetapi sumber eksekusinya tetap Supervisor.
- Jika event memiliki `attendees`, context itu dipakai untuk:
  - draft follow-up ke peserta;
  - draft reminder ke peserta;
  - kemungkinan undangan/update event jika capability create event ditingkatkan.
- Semua output dari Calendar sebaiknya menjadi draft dulu, lalu user review sebelum kirim atau ekspor.
- Perilaku layout:
  - saat belum ada event yang dipilih, panel kanan menampilkan empty state seperti `Pilih event dari daftar untuk melihat detail`;
  - saat event dipilih, panel kanan berubah menjadi workspace aksi untuk event tersebut;
  - desktop memakai 2 kolom, sekitar 35% kiri dan 65% kanan;
  - panel kiri dan kanan bisa scroll terpisah;
  - mobile menampilkan daftar event lebih dulu, lalu pindah ke detail event setelah item dipilih, dengan back button untuk kembali.
- Flow:
  - `AI Summary -> pilih event di Today/Upcoming -> buka Event Detail -> pilih quick action atau isi input -> kirim context ke Supervisor -> Supervisor generate output -> user review -> send/export/create`.

### Documents Workspace

- Documents dan Knowledge disatukan sebagai satu workspace user-facing.
- Documents menjadi tempat untuk manage semua dokumen: hasil generate AI, file upload manual, referensi knowledge, report, meeting material, dan email export.
- Knowledge bukan menu utama terpisah untuk MVP; ia menjadi capability di dalam Documents melalui action seperti `Ask Document`, `Ask Knowledge Base`, dan `Use as Context`.
- Generated outputs menjadi first-class objects, tidak hanya tenggelam di chat history.
- Struktur final cukup dua segmen:
  - `Generated`: semua dokumen hasil AI/Supervisor/Document Agent.
  - `Uploaded`: semua dokumen input manual untuk knowledge/RAG/Q&A.
- Setiap dokumen memakai label kategori, misalnya `Slides`, `Report`, `MOM`, `Agenda`, `Email`, `SOP`, `Policy`, atau `Reference`.
- Saat user klik dokumen, buka detail dokumen dengan preview/metadata di sisi utama dan chat/RAG di sisi kanan.
- Chat di detail dokumen memakai dokumen terpilih sebagai context utama, sehingga user bisa tanya isi dokumen, minta ringkasan, atau minta Supervisor mengubahnya menjadi output baru.
- Flow utama:
  - `Upload SOP/reference -> Uploaded -> klik dokumen -> RAG chat aktif di sisi kanan -> Convert answer to checklist/report via Supervisor -> Generated`.
  - `Supervisor generates report/PDF/slides -> Generated -> klik dokumen -> Preview/Ask AI/Download/Send by Email`.

## Feature Phasing

### P0

- Dashboard command center with recommended actions.
- Context handoff from Dashboard/Jira/Email/Calendar into Supervisor Chat.
- Jira risk detection from existing read data.
- Email Magic Reply + send approval flow.
- Calendar prep/create meeting flow.
- Integration health display.

### P1

- Generated output library inside Documents workspace.
- Documents workspace with two main segments: Generated and Uploaded, plus per-document category labels such as Slides, Report, MOM, Agenda, Email, SOP, Policy, and Reference.
- Meeting agenda generator.
- Report templates.
- Follow-up reminders as draft/reminder suggestions.

### P2

- Jira create/update/assign/transition issue.
- Automated recurring briefings.
- Team analytics.
- Role-based permissions.
- Slack/Teams integration.
- Autonomous execution, still gated by explicit user approval.

## API / Data Shape Changes

- Add a shared **AI action/context handoff shape** used by Dashboard and workspaces:
  - `source`: `dashboard | jira | email | calendar | documents`
  - `intent`: `generate_report | draft_reply | prepare_meeting | review_blockers | ask_ai`
  - `displayLabel`: button/card text
  - `prompt`: full prompt sent to Supervisor
  - `context`: structured source data such as issue ids, email metadata, event id, briefing domain
- Extend dashboard briefing rendering to support `recommended_actions` when available, while still deriving basic actions client-side if webhook data does not provide them yet.
- Keep send/create/export endpoints behind explicit user action; no direct autonomous execution from briefing cards.
- Untuk Jira insights, prioritaskan deteksi rule-based yang audit-able; AI berada di layer summary dan recommended action.

## Test Plan

- Manual only, because this repo has no automated tests.
- Verify Dashboard:
  - briefing loads from `/api/dashboard/briefings`;
  - refresh uses `urls.getBriefings()`;
  - recommended action opens correct workspace/chat with context.
- Verify Jira:
  - issue list still loads via `/api/integrations/jira/proxy`;
  - risk detection works from existing fields;
  - create/update Jira actions are not exposed in P0.
- Verify Email:
  - Magic Reply preserves source email context;
  - draft card renders cleanly;
  - send only happens after user approval.
- Verify Calendar:
  - upcoming events load from `/api/google/calendar`;
  - prepare agenda passes selected event context;
  - meeting creation remains approval-gated.
- Verify navigation:
  - sidebar grouping follows Main, Workspaces, Operations, Admin/Dev;
  - Debug Auth and n8n developer settings are not treated as primary user-facing screens.

## Assumptions

- "Full roadmap" means all target features are documented and phased, not all implemented in one pass.
- Immediate implementation should prioritize P0 around Dashboard + Workspace maturity.
- User approval remains mandatory for email sending, meeting creation/update, document export, and future Jira writes.
- Jira write capability is intentionally deferred until backend/n8n tools support it end-to-end.
