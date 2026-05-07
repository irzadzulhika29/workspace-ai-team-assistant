# Rencana Pengujian Irza

## Summary

Dokumen ini merupakan versi ringkas dari [TESTING-PLAN.md](C:/Dev/capstone/workspace-ai-team-assistant/docs/TESTING-PLAN.md) yang disesuaikan untuk kebutuhan laporan pengujian Irza. Fokus pengujian disusun ke dalam 4 kelompok utama:
- `Login / Autentikasi`
- `Input Data`
- `Proses Utama`
- `Output`

Struktur ini tetap memakai area fitur utama aplikasi yang sudah didefinisikan sebelumnya, terutama `Auth & Access`, `Integrations & Settings`, `Supervisor Core`, `Dashboard`, `Email Workspace`, `Calendar Workspace`, `Jira Workspace`, `File Workspace`, serta `Session & History Regression`.

## Tujuan Pengujian

Tujuan pengujian adalah memastikan bahwa:
- pengguna dapat masuk dan memakai aplikasi dengan sesi yang valid
- data atau instruksi yang dimasukkan user dapat diterima dan diteruskan dengan benar
- proses utama aplikasi berjalan sesuai intent dan flow yang diharapkan
- output yang ditampilkan ke user benar, rapi, dan konsisten termasuk setelah reload

## Ruang Lingkup

Pengujian dilakukan dari sisi aplikasi web, bukan dengan menguji workflow n8n secara langsung. Verifikasi dilakukan melalui:
- tampilan UI
- request/response aplikasi
- konsistensi riwayat dan reload

## 1. Login / Autentikasi

Fokus area ini diambil dari section `Auth & Access` pada testing plan utama. Pengujian memastikan hanya user dengan sesi valid yang dapat mengakses fitur inti aplikasi, serta perpindahan akun tidak mencampur data, session, maupun konteks integrasi.

### Area yang diuji
- login dengan akun valid
- pembatasan akses ke route protected
- persistensi session setelah login
- penanganan session tidak valid atau expired
- isolasi data saat berganti akun

### Tabel Pengujian

| ID | Feature Area | Skenario | Expected Agent/Flow | Expected Result |
| --- | --- | --- | --- | --- |
| AUTH-001 | Auth & Access | Login dengan akun valid melalui halaman login | Google OAuth / Backend Auth Flow | User berhasil masuk ke aplikasi dan diarahkan ke halaman utama tanpa error |
| AUTH-002 | Auth & Access | Akses route internal tanpa login | Protected Route Guard | User tidak bisa masuk ke halaman protected dan diarahkan ke login |
| AUTH-003 | Auth & Access | Login lalu navigasi ke Dashboard, Supervisor, dan Workspace | Auth Session Persistence | Session tetap aktif di seluruh halaman tanpa logout paksa |
| AUTH-004 | Auth & Access | Gunakan aplikasi setelah session/cookie tidak valid | Auth Session Validation | Aplikasi menolak akses lanjutan secara jelas dan meminta login ulang |
| AUTH-005 | Auth & Access | Login dengan akun A, lalu logout dan login dengan akun B | Auth + User Isolation Flow | Session, history, dan konteks integrasi akun A tidak terbawa ke akun B |

## 2. Input Data

Kelompok ini memetakan bagaimana aplikasi menerima input dari user, baik berupa prompt, file, context workspace, maupun data integrasi. Fokusnya adalah validasi bahwa input yang dikirim user benar-benar masuk ke flow yang tepat.

### Area yang diuji
- input prompt umum di Supervisor
- input prompt email, dokumen, presentasi, dan pertanyaan dokumen
- input data dari handoff Dashboard ke Supervisor
- input data dari Email Workspace, Calendar Workspace, Jira Workspace, dan File Workspace
- input file attachment ke Supervisor
- penanganan input saat precondition penting belum terpenuhi

### Tabel Pengujian

| ID | Feature Area | Skenario | Expected Agent/Flow | Expected Result |
| --- | --- | --- | --- | --- |
| SUP-002 | Supervisor Core | Kirim pertanyaan umum ke Supervisor | Supervisor Agent | Input prompt umum diterima dan diproses sebagai chat normal |
| SUP-004 | Supervisor Core | Minta dibuatkan draft email baru | Supervisor Agent -> Communication Agent | Input intent email diteruskan ke flow draft email yang sesuai |
| SUP-005 | Supervisor Core | Minta draft email dengan alamat tujuan eksplisit | Supervisor Agent -> Communication Agent | Recipient dari input user terbaca dan dipakai di draft |
| SUP-009 | Supervisor Core | Minta pembuatan dokumen/laporan | Supervisor Agent -> Document Agent | Input intent dokumen diteruskan ke flow dokumen yang sesuai |
| SUP-010 | Supervisor Core | Minta pembuatan presentasi/PPT | Supervisor Agent -> Document Agent | Input intent presentasi diteruskan ke flow presentasi yang sesuai |
| SUP-011 | Supervisor Core | Upload file lalu kirim prompt ke Supervisor | Supervisor Agent + File Attachment Flow | File attachment dan prompt terkirim bersama tanpa crash |
| DASH-002 | Dashboard | Klik action dashboard yang membuka Supervisor | Dashboard -> Supervisor Handoff | Input context dari dashboard diteruskan ke Supervisor sesuai intent action |
| EMAIL-002 | Email Workspace | Dari detail email, minta draft balasan via Supervisor | Email Workspace -> Supervisor -> Communication Agent | Context email sumber terbawa ke prompt Supervisor |
| CAL-002 | Calendar Workspace | Gunakan quick action event ke Supervisor | Calendar Workspace -> Supervisor Handoff | Context event dari calendar terbawa ke Supervisor |
| JIRA-004 | Jira Workspace | Jalankan action dari Jira ke Supervisor | Jira Workspace -> Supervisor -> Task Agent/Report Agent | Context Jira terbawa ke Supervisor untuk intent lanjutan |
| FILE-002 | File Workspace | Gunakan action `Ask Supervisor` dari dokumen existing | File Workspace -> Supervisor Handoff | Context dokumen terbawa ke Supervisor |
| FILE-003 | File Workspace | Kirim pertanyaan lanjutan dari dokumen | File Workspace -> Supervisor Document Context Flow | Request membawa `document_id`, `document_name`, atau `document_url` sesuai kontrak |

## 3. Proses Utama

Kelompok ini fokus pada bagaimana sistem memproses input user menjadi aksi yang bermakna. Yang diverifikasi bukan workflow n8n secara langsung, tetapi apakah dari sisi web proses utamanya berjalan ke agent atau flow yang benar.

### Area yang diuji
- routing intent di Supervisor
- proses draft email, revise, clarify, dan send
- proses dokumen dan presentasi
- proses handoff dari workspace ke Supervisor
- proses integrasi Google dan Jira saat dipakai dalam flow utama
- proses session dan history setelah action berjalan

### Tabel Pengujian

| ID | Feature Area | Skenario | Expected Agent/Flow | Expected Result |
| --- | --- | --- | --- | --- |
| INT-005 | Integrations & Settings | Trigger aksi email/send tanpa Google token valid | Communication Flow + Google Token Guard | Sistem menghentikan proses dan menampilkan error yang jelas |
| INT-006 | Integrations & Settings | Trigger flow Jira tanpa credential Jira valid | Jira Flow + Credential Guard | Sistem menghentikan proses dan menampilkan failure state yang jelas |
| SUP-006 | Supervisor Core | Minta kirim email final dengan penerima, subject, dan isi lengkap | Supervisor Agent -> Communication Agent -> Gmail Send Flow | Flow masuk ke jalur kirim email dan diproses sebagai send, bukan chat biasa |
| SUP-007 | Supervisor Core | Minta kirim email tetapi tanpa alamat penerima | Supervisor Agent -> Communication Agent | Sistem meminta klarifikasi penerima sebelum lanjut |
| SUP-008 | Supervisor Core | Gunakan aksi regenerate/perbaikan draft email | Supervisor Agent -> Communication Agent | Sistem memproses revisi draft berdasarkan instruksi tambahan |
| SUP-012 | Supervisor Core | Jalankan intent yang memicu agent berbeda | Supervisor Agent Routing | Sistem merutekan intent ke agent yang sesuai |
| CAL-003 | Calendar Workspace | Kirim prompt follow-up dari event tertentu | Calendar Workspace -> Supervisor -> Scheduler Agent | Flow memproses konteks event ke jalur scheduling yang sesuai |
| FILE-004 | File Workspace | Ajukan pertanyaan tentang dokumen yang sudah dipilih | File Workspace -> Supervisor -> Knowledge Agent | Flow memproses pertanyaan dokumen melalui jalur knowledge berbasis context dokumen |
| HIST-001 | Session & History Regression | Kirim prompt pertama pada sesi baru | Session Title Update Flow | Sistem memperbarui judul sesi setelah proses respons pertama |
| HIST-002 | Session & History Regression | Kirim chat lalu reload halaman Supervisor | Session History Replay Flow | Sistem memproses penyimpanan dan pemuatan ulang riwayat dengan konsisten |

## 4. Output

Kelompok ini memastikan hasil akhir yang diterima user sudah sesuai, baik berupa jawaban chat, draft email, dokumen, presentasi, error message, maupun history setelah reload. Fokus utamanya adalah kualitas output dari sisi user-facing.

### Area yang diuji
- output chat umum
- output draft email
- output send email
- output clarify
- output dokumen dan presentasi
- output error saat flow gagal
- output history/reload agar tidak berubah bentuk atau bocor JSON mentah

### Tabel Pengujian

| ID | Feature Area | Skenario | Expected Agent/Flow | Expected Result |
| --- | --- | --- | --- | --- |
| SUP-002 | Supervisor Core | Kirim pertanyaan umum ke Supervisor | Supervisor Agent | User menerima jawaban chat normal yang terbaca rapi di bubble AI |
| SUP-004 | Supervisor Core | Minta dibuatkan draft email baru | Supervisor Agent -> Communication Agent | User menerima ringkasan draft email yang user-facing, bukan payload mentah |
| SUP-006 | Supervisor Core | Minta kirim email final dengan penerima, subject, dan isi lengkap | Supervisor Agent -> Communication Agent -> Gmail Send Flow | User menerima konfirmasi sukses pengiriman email yang jelas |
| SUP-007 | Supervisor Core | Minta kirim email tetapi tanpa alamat penerima | Supervisor Agent -> Communication Agent | User menerima clarify yang natural, bukan JSON mentah |
| SUP-009 | Supervisor Core | Minta pembuatan dokumen/laporan | Supervisor Agent -> Document Agent | User menerima output dokumen yang sesuai dan usable |
| SUP-010 | Supervisor Core | Minta pembuatan presentasi/PPT | Supervisor Agent -> Document Agent | User menerima output presentasi yang sesuai dan usable |
| EMAIL-005 | Email Workspace | Periksa tampilan hasil draft email di chat | Communication Agent Draft Response Flow | Draft tampil sebagai summary user-facing, payload tetap tersimpan terstruktur |
| HIST-003 | Session & History Regression | Buat draft email lalu reload sesi | Communication Agent Draft Replay Flow | History tetap menampilkan summary draft yang rapi, bukan payload mentah |
| HIST-004 | Session & History Regression | Trigger clarify lalu reload sesi | Clarify Replay Flow | History tetap menampilkan pesan clarify yang human-readable |
| HIST-005 | Session & History Regression | Jalankan handoff dari dashboard lalu reload sesi | Dashboard -> Supervisor -> History Flow | Prompt dan hasil tetap konsisten saat dibuka ulang |
| HIST-006 | Session & History Regression | Jalankan handoff dari File Workspace lalu reload sesi | File Workspace -> Supervisor -> History Flow | Metadata atau indikasi dokumen tetap konsisten saat history dibuka |

## Kesimpulan Rencana Pengujian

Berdasarkan struktur di atas, pengujian Irza dapat dipresentasikan dengan alur yang sederhana:
- `Login / Autentikasi` untuk memastikan user bisa masuk dan memakai sistem dengan sesi valid
- `Input Data` untuk memastikan semua instruksi, file, dan context workspace masuk ke flow yang benar
- `Proses Utama` untuk memastikan routing intent dan eksekusi backend flow berjalan sesuai yang diharapkan
- `Output` untuk memastikan hasil akhir yang diterima user benar, rapi, dan konsisten

Dokumen ini tidak menggantikan [TESTING-PLAN.md](C:/Dev/capstone/workspace-ai-team-assistant/docs/TESTING-PLAN.md), tetapi menjadi versi laporan yang lebih ringkas dan lebih mudah dipakai untuk kebutuhan presentasi atau dokumentasi pengujian tingkat tinggi.
