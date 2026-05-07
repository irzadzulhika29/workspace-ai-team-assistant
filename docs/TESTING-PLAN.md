# Manual Testing Plan

## Summary

Dokumen ini menjadi master plan untuk manual testing aplikasi `AI Team Assistant`. Fokus utamanya bukan hanya mengecek apakah fitur tampil, tetapi memastikan kontrak input-output tetap benar di seluruh jalur penting: `UI -> frontend service -> backend/auth context -> n8n workflow -> UI response -> history/reload`.

Manual testing di project ini harus selalu memakai 3 oracle utama:
- `UI`: apa yang terlihat user di layar
- `Network/Payload`: request dan response yang dikirim/diterima
- `History/Reload`: apakah hasil live tetap konsisten saat halaman direload atau riwayat dibuka ulang

Batas pengujian pada dokumen ini:
- Pengujian dilakukan dari sisi aplikasi web, bukan dengan menguji workflow n8n secara langsung
- Konfigurasi webhook `dev/prod` dan `publish/test` tidak masuk scope user testing reguler
- Kebutuhan knowledge/chat berbasis dokumen diperlakukan sebagai bagian dari flow dokumen di `File Workspace`, bukan sebagai feature area terpisah

## Scope

Area yang dicakup dalam plan ini:
- `Auth & Access`
- `Integrations & Settings`
- `Supervisor Core`
- `Dashboard`
- `Email Workspace`
- `Calendar Workspace`
- `Jira Workspace`
- `File Workspace`
- `Session & History Regression`

## Prioritas

- `P0`: flow kritis yang memblokir penggunaan utama aplikasi
- `P1`: flow penting lintas workspace dan integrasi
- `P2`: flow pelengkap, visual, dan non-blocking issue

## Status Legend

- `Not Run`
- `Pass`
- `Fail`
- `Blocked`

## Environment dan Precondition Umum

- Frontend, backend, dan n8n webhook aktif
- Database PostgreSQL dan Supabase dapat diakses normal
- Minimal tersedia 3 kondisi akun uji:
  - akun belum connect integrasi
  - akun sudah connect Google
  - akun sudah connect Google + Jira
- Browser devtools/network tab tersedia untuk inspeksi request-response
- Tester dapat login dan berpindah halaman aplikasi tanpa hambatan environment

## Format Tabel Eksekusi

Gunakan format berikut untuk seluruh section:

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Keterangan singkat:
- `Expected Agent/Flow` dipakai untuk menandai agent atau backend flow yang seharusnya menangani intent tersebut
- `Expected Result` harus menjelaskan hasil UI dan perilaku inti sistem
- `Hasil` diisi saat eksekusi aktual
- `Catatan` dipakai untuk screenshot, error message, payload aneh, session id, atau evidence lain

## Auth & Access

Fokus area ini adalah memastikan pengguna hanya bisa mengakses aplikasi melalui sesi login yang valid, serta perpindahan akun tidak mencampur konteks user, session, maupun integrasi.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-001 | P0 | Auth & Access | Login dengan akun valid melalui halaman login | Google OAuth / Backend Auth Flow | User belum login | User berhasil masuk ke aplikasi dan diarahkan ke halaman utama tanpa error |  | Not Run |  |
| AUTH-002 | P0 | Auth & Access | Akses route internal tanpa login | Protected Route Guard | Browser belum memiliki sesi login | User tidak bisa masuk ke halaman protected dan diarahkan ke login |  | Not Run |  |
| AUTH-003 | P0 | Auth & Access | Login lalu navigasi ke Dashboard, Supervisor, dan Workspace | Auth Session Persistence | User sudah login | Session tetap aktif di seluruh halaman tanpa logout paksa |  | Not Run |  |
| AUTH-004 | P1 | Auth & Access | Gunakan aplikasi setelah session/cookie tidak valid | Auth Session Validation | User pernah login lalu session invalid | Aplikasi menolak akses lanjutan secara jelas dan meminta login ulang |  | Not Run |  |
| AUTH-005 | P0 | Auth & Access | Login dengan akun A, lalu logout dan login dengan akun B | Auth + User Isolation Flow | Dua akun uji tersedia | Session, history, dan konteks integrasi akun A tidak terbawa ke akun B |  | Not Run |  |

## Integrations & Settings

Area ini memastikan status integrasi yang user gunakan memang sinkron dengan perilaku aplikasi. Pengujian tetap dilihat dari sisi web app, bukan dari pengujian workflow n8n secara langsung.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INT-001 | P1 | Integrations & Settings | Buka halaman integrasi saat akun belum connect Google | Google Integration Status Flow | User login, Google belum terhubung | UI menampilkan status belum terhubung dengan call to action yang benar |  | Not Run |  |
| INT-002 | P1 | Integrations & Settings | Buka halaman integrasi saat akun sudah connect Google | Google Integration Status Flow | User login, Google sudah terhubung | UI menampilkan status connected tanpa misleading state |  | Not Run |  |
| INT-003 | P1 | Integrations & Settings | Buka halaman integrasi saat akun belum connect Jira | Jira Integration Status Flow | User login, Jira belum terhubung | UI menampilkan status belum terhubung dan tidak menampilkan data palsu |  | Not Run |  |
| INT-004 | P1 | Integrations & Settings | Buka halaman integrasi saat akun sudah connect Jira | Jira Integration Status Flow | User login, Jira sudah terhubung | UI menampilkan status connected dan credential siap dipakai workflow |  | Not Run |  |
| INT-005 | P0 | Integrations & Settings | Trigger aksi email/send tanpa Google token valid | Communication Flow + Google Token Guard | User login, Google token tidak tersedia | Flow gagal dengan pesan yang jelas, bukan silent failure atau output kosong |  | Not Run |  |
| INT-006 | P1 | Integrations & Settings | Trigger flow Jira tanpa credential Jira valid | Jira Flow + Credential Guard | User login, Jira credential tidak tersedia | Aplikasi menampilkan failure state yang jelas dan tidak menghasilkan insight palsu |  | Not Run |  |

## Supervisor Core

Ini adalah area paling kritis. Fokus pengujian adalah memastikan `SupervisorChat` mengirim intent yang benar, backend flow memilih output branch yang benar, dan UI hanya menampilkan ringkasan yang user-facing tanpa membocorkan machine payload mentah.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SUP-001 | P0 | Supervisor Core | Buka Supervisor tanpa sesi aktif lalu buat chat baru | Supervisor Chat Session Flow | User login | Sesi baru berhasil dibuat dan user dapat mulai mengirim pesan |  | Not Run |  |
| SUP-002 | P0 | Supervisor Core | Kirim pertanyaan umum ke Supervisor | Supervisor Agent | Ada sesi aktif | User menerima jawaban chat normal yang terbaca rapi di bubble AI |  | Not Run |  |
| SUP-003 | P0 | Supervisor Core | Coba kirim pesan tanpa sesi aktif | Supervisor Chat Session Guard | Tidak ada sesi aktif | UI menolak pengiriman dan menampilkan error yang jelas |  | Not Run |  |
| SUP-004 | P0 | Supervisor Core | Minta dibuatkan draft email baru | Supervisor Agent -> Communication Agent | Ada sesi aktif, Google token opsional | Response AI menampilkan ringkasan draft yang user-facing, bukan body draft mentah, dan action result draft tersedia |  | Not Run | Cek response payload |
| SUP-005 | P0 | Supervisor Core | Minta draft email dengan alamat tujuan eksplisit | Supervisor Agent -> Communication Agent | Ada sesi aktif | Recipient pada draft terisi sesuai input user dan ringkasan chat tetap rapi |  | Not Run |  |
| SUP-006 | P0 | Supervisor Core | Minta kirim email final dengan penerima, subject, dan isi lengkap | Supervisor Agent -> Communication Agent -> Gmail Send Flow | Ada sesi aktif, Google token valid | Backend flow masuk ke jalur kirim email dan AI memberi konfirmasi sukses yang jelas |  | Not Run |  |
| SUP-007 | P0 | Supervisor Core | Minta kirim email tetapi tanpa alamat penerima | Supervisor Agent -> Communication Agent | Ada sesi aktif | User menerima clarify yang natural di chat, bukan JSON mentah |  | Not Run |  |
| SUP-008 | P0 | Supervisor Core | Gunakan aksi regenerate/perbaikan draft email | Supervisor Agent -> Communication Agent | Draft email sudah terbentuk | Draft baru dihasilkan berdasarkan instruksi revisi dan response tetap tampil sebagai ringkasan user-facing |  | Not Run |  |
| SUP-009 | P1 | Supervisor Core | Minta pembuatan dokumen/laporan | Supervisor Agent -> Document Agent | Ada sesi aktif | Response masuk ke jalur dokumen yang sesuai dan tetap usable dari sisi user |  | Not Run |  |
| SUP-010 | P1 | Supervisor Core | Minta pembuatan presentasi/PPT | Supervisor Agent -> Document Agent | Ada sesi aktif | Response masuk ke jalur presentasi yang sesuai tanpa fallback ke chat biasa |  | Not Run |  |
| SUP-011 | P1 | Supervisor Core | Upload file lalu kirim prompt ke Supervisor | Supervisor Agent + File Attachment Flow | Ada sesi aktif, file valid tersedia | Request membawa file attachment dan AI merespons dengan konteks file tanpa crash |  | Not Run | Cek multipart request |
| SUP-012 | P1 | Supervisor Core | Jalankan intent yang memicu agent berbeda | Supervisor Agent Routing | Ada sesi aktif | Status/label agent di UI mengikuti agent yang benar jika tersedia |  | Not Run |  |
| SUP-013 | P1 | Supervisor Core | Trigger kondisi backend flow lambat atau tidak merespons | Supervisor Flow Error Handling | Environment dapat mensimulasikan slow response | UI menampilkan error timeout atau koneksi yang informatif |  | Not Run |  |

## Dashboard

Pengujian Dashboard berfokus pada handoff action ke Supervisor. Action tidak boleh hanya membuka halaman, tetapi harus membawa prompt dan konteks yang tepat agar output Supervisor relevan.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DASH-001 | P1 | Dashboard | Buka Dashboard setelah login | Dashboard UI Load | User login | Dashboard tampil normal dan seluruh card utama termuat |  | Not Run |  |
| DASH-002 | P1 | Dashboard | Klik action dashboard yang membuka Supervisor | Dashboard -> Supervisor Handoff | Dashboard memuat card dengan action aktif | Supervisor terbuka dengan prompt/context yang sesuai intent action |  | Not Run |  |
| DASH-003 | P1 | Dashboard | Jalankan handoff dari dashboard ke Supervisor | Dashboard -> Supervisor Handoff | Ada action dashboard yang auto-fill prompt | Bubble user menampilkan prompt ringkas, sementara request tetap membawa konteks yang dibutuhkan |  | Not Run |  |
| DASH-004 | P1 | Dashboard | Jalankan action dashboard lalu reload sesi chat | Dashboard -> Supervisor -> History Flow | Handoff dashboard sudah pernah dikirim | Riwayat chat tetap tampil konsisten setelah reload |  | Not Run |  |

## Email Workspace

Area email adalah jalur paling sensitif karena melibatkan parsing context email, draft, revise, dan send. Fokus utama adalah recipient, subject, dan tampilan draft di UI harus tetap konsisten dari awal sampai history reload.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EMAIL-001 | P1 | Email Workspace | Buka Email Workspace | Email Workspace UI Load | User login, integrasi Google tersedia | Halaman email termuat tanpa error blocking |  | Not Run |  |
| EMAIL-002 | P0 | Email Workspace | Dari detail email, minta draft balasan via Supervisor | Email Workspace -> Supervisor -> Communication Agent | Email detail dapat dibuka | Supervisor menerima konteks email sumber dan menghasilkan draft balasan yang relevan |  | Not Run |  |
| EMAIL-003 | P0 | Email Workspace | Buat draft balasan dari email yang punya pengirim jelas | Email Workspace -> Supervisor -> Communication Agent | Email sumber memiliki header pengirim valid | Recipient default mengikuti pengirim email sumber kecuali diubah eksplisit |  | Not Run |  |
| EMAIL-004 | P1 | Email Workspace | Jalankan flow forward email ke Supervisor | Email Workspace -> Supervisor -> Communication Agent | Email sumber tersedia | Recipient forward mengikuti instruksi user dan tidak salah memakai pengirim asli |  | Not Run |  |
| EMAIL-005 | P0 | Email Workspace | Periksa tampilan hasil draft email di chat | Communication Agent Draft Response Flow | Draft email sudah terbentuk | UI hanya menampilkan summary user-facing, sedangkan payload draft tetap tersimpan sebagai action result |  | Not Run |  |
| EMAIL-006 | P0 | Email Workspace | Kirim draft email yang sudah terbentuk | Communication Agent -> Gmail Send Flow | Draft valid tersedia, Google token valid | Email terkirim dan UI memberi konfirmasi sukses yang jelas |  | Not Run |  |
| EMAIL-007 | P1 | Email Workspace | Revisi draft yang sudah ada dengan instruksi perubahan | Email Workspace -> Supervisor -> Communication Agent | Draft valid tersedia | Revisi mempertahankan konteks thread kecuali diminta berubah |  | Not Run |  |

## Calendar Workspace

Calendar Workspace diuji terutama pada handoff event ke Supervisor. Context event harus cukup untuk kebutuhan follow-up, persiapan meeting, atau permintaan aksi lain dari user.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAL-001 | P1 | Calendar Workspace | Buka Calendar Workspace | Calendar Workspace UI Load | User login, Google Calendar tersedia | Halaman calendar tampil tanpa error blocking |  | Not Run |  |
| CAL-002 | P1 | Calendar Workspace | Gunakan quick action event ke Supervisor | Calendar Workspace -> Supervisor Handoff | Event tersedia di workspace | Supervisor terbuka dengan konteks event yang sesuai |  | Not Run |  |
| CAL-003 | P1 | Calendar Workspace | Kirim prompt follow-up dari event tertentu | Calendar Workspace -> Supervisor -> Scheduler Agent | Event tersedia dan handoff aktif | Request membawa detail event penting yang dibutuhkan agent |  | Not Run | Cek payload/context |
| CAL-004 | P2 | Calendar Workspace | Buka workspace saat data event kosong/tidak tersedia | Calendar Workspace Error/Empty State Flow | Akun tanpa event atau token bermasalah | UI menampilkan empty/error state yang jelas |  | Not Run |  |

## Jira Workspace

Jira Workspace diuji dari sisi akurasi status koneksi, keterbacaan data, dan kelengkapan handoff ke Supervisor. Jika credential tidak tersedia, sistem harus jujur gagal, bukan memberi insight seolah-olah valid.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JIRA-001 | P1 | Jira Workspace | Buka Jira Workspace | Jira Workspace UI Load | User login | Halaman Jira termuat dan tidak crash |  | Not Run |  |
| JIRA-002 | P1 | Jira Workspace | Buka Jira Workspace dengan credential valid | Jira Workspace Connected Flow | Jira sudah terhubung | Data Jira tampil sesuai state aplikasi |  | Not Run |  |
| JIRA-003 | P1 | Jira Workspace | Buka Jira Workspace tanpa credential valid | Jira Workspace Error/Disconnected Flow | Jira belum terhubung | UI menampilkan status tidak terhubung atau error yang jelas |  | Not Run |  |
| JIRA-004 | P1 | Jira Workspace | Jalankan action dari Jira ke Supervisor | Jira Workspace -> Supervisor -> Task Agent/Report Agent | Data Jira tersedia | Supervisor menerima konteks Jira yang cukup untuk intent lanjutan |  | Not Run |  |
| JIRA-005 | P1 | Jira Workspace | Jalankan action Jira-dependent tanpa credential valid | Jira Flow + Credential Guard | Jira belum terhubung | Flow berhenti dengan pesan error yang jelas dan tidak misleading |  | Not Run |  |

## File Workspace

File Workspace perlu diuji untuk memastikan dokumen yang dipilih benar-benar ikut ke request Supervisor sebagai context, bukan hanya tampil di UI. Di scope ini, kebutuhan knowledge/chat berbasis dokumen diperlakukan sebagai bagian dari flow dokumen di workspace ini.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FILE-001 | P1 | File Workspace | Buka File Workspace | File Workspace UI Load | User login | Halaman file workspace tampil normal |  | Not Run |  |
| FILE-002 | P1 | File Workspace | Gunakan action `Ask Supervisor` dari dokumen existing | File Workspace -> Supervisor Handoff | Ada dokumen yang bisa dipilih | Supervisor terbuka dengan context dokumen yang benar |  | Not Run |  |
| FILE-003 | P1 | File Workspace | Kirim pertanyaan lanjutan dari dokumen | File Workspace -> Supervisor Document Context Flow | Dokumen sudah terpilih | Request membawa `document_id`, `document_name`, atau `document_url` sesuai kontrak |  | Not Run | Cek payload |
| FILE-004 | P1 | File Workspace | Ajukan pertanyaan tentang dokumen yang sudah dipilih | File Workspace -> Supervisor -> Knowledge Agent | Ada dokumen yang relevan dan context dokumen aktif | User menerima jawaban yang tetap terikat ke konteks dokumen yang dipilih dan flow tetap usable dari sisi web |  | Not Run |  |
| FILE-005 | P2 | File Workspace | Buka File Workspace saat belum ada file/dokumen | File Workspace Empty State Flow | Tidak ada data dokumen | UI menampilkan empty state yang jelas dan usable |  | Not Run |  |

## Session & History Regression

Area ini wajib dijalankan di hampir semua regression karena banyak bug kelas ini hanya muncul setelah reload. Response live yang benar tetapi history replay rusak tetap dianggap defect.

| ID | Prioritas | Feature Area | Skenario | Expected Agent/Flow | Precondition | Expected Result | Hasil | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HIST-001 | P0 | Session & History Regression | Kirim prompt pertama pada sesi baru | Session Title Update Flow | Ada sesi baru aktif | Judul sesi ter-update tanpa perlu full refresh manual |  | Not Run |  |
| HIST-002 | P0 | Session & History Regression | Kirim chat lalu reload halaman Supervisor | Session History Replay Flow | Sudah ada sesi dengan pesan user dan AI | Riwayat chat muncul kembali dengan isi yang konsisten |  | Not Run |  |
| HIST-003 | P0 | Session & History Regression | Buat draft email lalu reload sesi | Communication Agent Draft Replay Flow | Draft email sudah pernah muncul live | History tetap menampilkan summary draft yang rapi, bukan payload mentah |  | Not Run |  |
| HIST-004 | P0 | Session & History Regression | Trigger clarify lalu reload sesi | Clarify Replay Flow | Clarify sudah pernah muncul live | History tetap menampilkan pesan clarify yang human-readable |  | Not Run |  |
| HIST-005 | P1 | Session & History Regression | Jalankan handoff dari dashboard lalu reload sesi | Dashboard -> Supervisor -> History Flow | Chat dari dashboard sudah tersimpan | Prompt dan hasil tetap konsisten saat dibuka ulang |  | Not Run |  |
| HIST-006 | P1 | Session & History Regression | Jalankan handoff dari File Workspace lalu reload sesi | File Workspace -> Supervisor -> History Flow | Chat dengan dokumen sudah tersimpan | Metadata/indikasi dokumen tetap konsisten saat history dibuka |  | Not Run |  |

## Exploratory Testing Charter

Selain test case terstruktur di atas, jalankan exploratory testing untuk area berisiko tinggi berikut:

### Charter 1: Email Draft and Send
- Fokus: draft, revise, clarify, send
- Cari masalah pada recipient, subject, HTML body, dan UI summary
- Cek apakah output user-facing terpisah dari machine payload

### Charter 2: History Rehydration
- Fokus: perbedaan antara response live dan history setelah reload
- Cari JSON mentah, action result yang hilang, atau bubble yang berubah makna

### Charter 3: Cross-Workspace Handoff
- Fokus: Dashboard, Email, Calendar, Jira, File menuju Supervisor
- Cari konteks yang hilang, prompt yang terlalu mentah, atau action yang hanya navigasi tanpa payload relevan

## Evidence dan Bug Reporting

Saat test case gagal, minimal simpan:
- screenshot halaman saat issue muncul
- request/response terkait dari devtools network jika relevan
- langkah reproduksi singkat
- hasil aktual
- informasi akun dan kondisi integrasi yang dipakai

Format bug report yang direkomendasikan:

| Bug ID | Area | Severity | Ringkasan | Steps to Reproduce | Expected | Actual | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | Supervisor | Critical | Draft email tampil sebagai JSON mentah di history | ... | ... | ... | screenshot/link |

## Exit Criteria

Siklus manual testing dianggap cukup untuk release kandidat ketika:
- seluruh `P0` sudah dieksekusi
- tidak ada `P0` berstatus `Fail`
- flow `Supervisor -> output -> history/reload` stabil pada skenario utama
- flow handoff dari workspace utama ke Supervisor sudah tervalidasi
- issue `P1` yang tersisa sudah terdokumentasi dan diterima secara sadar
