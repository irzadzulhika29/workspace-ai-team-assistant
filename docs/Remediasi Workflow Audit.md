# Remediasi Workflow Audit

Status tags:
- `[todo]` belum dikerjakan
- `[doing]` sedang dikerjakan
- `[done]` sudah diperbaiki di workflow

## Summary
Workflow `AI Assistant Team - Prod.json` tidak menunjukkan benturan koneksi node yang fatal, tetapi ada beberapa mismatch penting antara system prompt, tool yang benar-benar tersedia, dan router output. Prioritas utama adalah menyamakan kontrak kemampuan agen dengan tool aktual, lalu mengurangi ketergantungan pada parsing berbasis frasa bebas.

## Key Changes
- `[done]` Sinkronkan `Scheduler Agent` dan prompt supervisor untuk alur `update/reschedule`.
  `Scheduler Agent` dan supervisor sekarang mewajibkan target event disebut jelas. Jika target belum pasti atau tidak ada yang benar-benar cocok, agent harus menampilkan event kandidat terdekat dan meminta konfirmasi pengguna. Tool HTTP `Update Event` juga sudah ditambahkan ke workflow untuk eksekusi perubahan agenda.
- `[todo]` Sinkronkan `Task Agent` dengan tool Jira.
  Jika agent memang harus bisa memfilter berdasarkan kebutuhan user, ubah tool agar JQL dibentuk dari input agent. Jika tidak, persempit prompt agar jelas hanya mendukung daftar issue terbaru 90 hari terakhir.
- `[todo]` Sederhanakan kontrak `Supervisor Agent` untuk multi-intent.
  Jika workflow tetap single-response, larang dua jalur tugas terpisah dalam satu request dan arahkan supervisor untuk meminta user memecah permintaan.
- `[todo]` Seragamkan pembentukan `PromptFinal` di semua branch input.
  Samakan format text, PDF, CSV, dan OCR; perbaiki prefix `==instruction:` pada branch PDF bila itu memang typo.
- `[todo]` Kurangi ketergantungan pada prompt-only output routing.
  Tambahkan parser atau validator eksplisit untuk output email JSON dan marker output dokumen/presentasi yang lebih deterministik daripada frasa penutup exact.
- `[todo]` Hilangkan credential hardcoded dari workflow JSON.
  Pindahkan API key dan token ke credential store atau environment n8n.

## Document Agent To-Do
- `[done]` Pecah template dokumen berdasarkan jenis output.
  Jalur `Document Agent` sekarang memisahkan format minimal untuk `laporan formal`, `proposal`, `MOM/notulen`, `artikel`, dan `presentasi`. Skill report sudah dipecah menjadi template per jenis dokumen teks, dan prompt `Document Agent` sekarang mewajibkan pemilihan satu template yang sesuai sebelum menulis.
- `[done]` Revisi prompt `Document Agent` agar lebih fokus ke kualitas isi.
  Prompt `Document Agent` sekarang menempatkan audience, tone, completeness, hierarchy, dan kualitas isi sebagai fokus utama. Aturan backend dipersempit menjadi kontrak output di bagian akhir, bukan inti dari prompt.
- `[todo]` Revisi `create_report.md` agar struktur dokumen adaptif.
  Jangan pakai satu pola wajib untuk semua dokumen. Tambahkan aturan pemilihan struktur berdasarkan jenis dokumen dan konteks permintaan pengguna.
- `[todo]` Revisi `create_ppt.md` agar fokus ke kualitas slide, bukan hanya validitas tag.
  Tambahkan aturan seperti `one insight per slide`, batas kepadatan teks, pemilihan format isi per slide, dan alur deck dari pembuka sampai penutup.
- `[todo]` Perketat kontrak output `Document Agent`.
  Targetnya node transform sesudah agent hanya melakukan validasi ringan, bukan recovery agresif terhadap HTML/Markdown yang tidak stabil.
- `[todo]` Rapikan jalur presentasi setelah `Document Agent`.
  Sederhanakan `Code - Prepare Presentation HTML` agar tidak perlu terlalu banyak membersihkan, membelah ulang slide, atau memperbaiki struktur hasil agent.
- `[todo]` Tambahkan template HTML formal untuk jalur report PDF.
  Hasil Markdown report sebaiknya dibungkus ke layout dokumen formal dengan typography, spacing, heading scale, dan styling tabel yang lebih rapi sebelum dirender ke PDF.
- `[todo]` Ekstrak styling render presentasi dari string inline panjang.
  Pindahkan HTML/CSS presentasi ke template yang lebih mudah dirawat dan siapkan ruang untuk beberapa preset tema visual.
- `[todo]` Sinkronkan wording response akhir jalur presentasi.
  Saat ini response presentasi masih memakai copy `Laporan Anda sudah siap`, padahal output-nya presentasi PDF.
- `[todo]` Tambahkan test case khusus kualitas dokumen.
  Uji masing-masing jenis dokumen pada skenario data lengkap, data minim, data ambigu, tabel padat, dan presentasi dengan beberapa topik besar.

## Implementation Notes
- `Scheduler Agent` dan prompt supervisor sudah diperbarui agar alur `update/reschedule` selalu menuntut identitas event target yang jelas, fallback ke konfirmasi kandidat event terdekat, dan eksekusi perubahan memakai tool `Update Event`.
- `Task Agent` saat ini terlihat seolah bisa membaca data Jira sesuai konteks user, tetapi tool Jira masih hardcode JQL `updated >= -90d ORDER BY updated DESC`.
- `Supervisor Agent` mengizinkan dua cabang pekerjaan sekaligus, tetapi downstream hanya punya satu `Switch - Output Type` dengan satu outcome final per eksekusi.
- `Code - Extract Final Output` menunjukkan workflow saat ini sudah mengandalkan recovery heuristik karena output supervisor/agent kadang tidak stabil.
- `Code - Format Draft Email Response` masih hard-depend ke `Set - Prompt From User`, sehingga perlu diperlakukan sama seperti perbaikan fallback yang sudah diterapkan pada logging dan final output recovery.
- Jalur `Document Agent` masih sangat bergantung pada trigger frasa penutup exact, skill format yang generik, dan node transform yang melakukan recovery terhadap output agent.

## Test Plan
- Uji `Scheduler Agent` untuk: `cek jadwal`, `buat event`, `buat meeting dengan Google Meet`, dan `update/reschedule` dengan event target yang jelas maupun ambigu.
  Pastikan skenario ambigu berhenti di konfirmasi kandidat event, sedangkan skenario jelas benar-benar memanggil `Update Event`.
- Uji `Task Agent` untuk: daftar issue umum, filter spesifik, backlog, status sprint, dan rekap progres.
- Uji `Supervisor Agent` untuk: single-intent dan multi-intent.
  Contoh: `buat draft email`, `buat meeting`, `buat draft email dan jadwalkan meeting`.
- Uji seluruh branch input: text biasa, PDF, CSV, dan OCR image; pastikan `PromptFinal`, logging, dan routing output konsisten.
- Uji seluruh branch output: chat normal, draft email, send email, report PDF, dan presentation PDF.
- Verifikasi bahwa kasus normal tidak lagi bergantung pada recovery heuristik untuk menjaga output tetap valid.
- Uji kualitas `Document Agent` untuk: laporan formal, proposal, MOM/notulen, artikel, dan presentasi; pastikan masing-masing punya struktur yang tepat, tidak terasa generik, dan tidak memerlukan cleanup berat di node sesudahnya.

## Assumptions
- Workflow ini ditujukan sebagai single-response webhook per request.
- Chain berurutan antar-agent tetap dibutuhkan untuk alur seperti `Task -> Report -> Document`.
- Kontrak kemampuan yang lebih sempit tetapi akurat lebih penting daripada prompt yang luas namun tidak didukung tool.
- Remediasi tahap pertama sebaiknya fokus pada kestabilan routing dan kontrak agent/tool sebelum perbaikan UX dan refactor tambahan.
