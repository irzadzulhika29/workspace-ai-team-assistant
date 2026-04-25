# Plan: AI Dashboard Briefing Summary

## Summary
Bangun Dashboard sebagai briefing center untuk leader team. Setiap hari n8n membuat AI summary terjadwal default pukul `07:00` dan `15:00` WIB, hasilnya disimpan sebagai snapshot Supabase, lalu Dashboard menampilkan briefing card terpisah untuk Jira, Google Calendar, dan Email Inbox.

## Key Changes
- Tambahkan section utama di Dashboard: `AI Briefing`.
- Tampilkan 3 card domain:
  - `Jira Progress`: ringkasan progres issue, blocker/stuck issue, prioritas, dan status sprint/proyek bila tersedia.
  - `Calendar Briefing`: jadwal terdekat, Google Meet link jika ada, meeting tanpa agenda/deskripsi, dan highlight jadwal penting.
  - `Email Inbox Briefing`: email masuk terbaru, unread/urgent email, email yang perlu follow-up, dan ringkasan prioritas.
- Setiap card memakai format:
  - domain label
  - priority: `high | medium | low`
  - headline AI summary
  - 2-4 bullet briefing
  - last updated
  - next scheduled update
  - CTA `Lihat detail` ke `/workspace/jira`, `/workspace/calendar`, atau `/workspace/email`
- Scope data: per logged-in leader/user, memakai integrasi Google/Jira/Gmail yang tersambung ke akun tersebut.
- Config jadwal v1: teknis dulu via n8n/env, default `07:00` dan `15:00` WIB. UI hanya menampilkan jadwal aktif dan last updated.

## Interfaces
- Tambah tabel Supabase baru, misalnya `dashboard_summary_snapshots`:
  - `id`
  - `user_id`
  - `domain`: `jira | calendar | email`
  - `priority`: `high | medium | low`
  - `headline`
  - `summary_points` JSON array
  - `source_metrics` JSON object
  - `generated_at`
  - `next_run_at`
  - `status`: `success | partial | failed`
  - `error_message`
- Tambah backend endpoint read-only:
  - `GET /api/dashboard/briefings`
  - Mengembalikan snapshot terbaru per domain untuk user login.
- Tambah n8n scheduled workflow:
  - berjalan default `07:00` dan `15:00` WIB
  - mengambil data Jira, Calendar, dan Gmail per user leader yang connected
  - memanggil AI summarizer per domain
  - menyimpan snapshot per domain ke Supabase
- Dashboard tidak menjalankan AI saat page dibuka; hanya membaca snapshot agar cepat dan stabil.

## Implementation Notes
- Gunakan n8n sebagai engine AI summary karena workflow AI dan integrasi agent sudah ada.
- Backend bertugas sebagai read API dan sumber token/user-scoped data jika n8n perlu mengambil data melalui proxy.
- Jika snapshot belum ada, Dashboard menampilkan empty state: “Briefing belum tersedia. Update berikutnya pukul 07:00/15:00.”
- Jika satu domain gagal, domain lain tetap tampil; card gagal menampilkan status ringan dan waktu percobaan terakhir.
- CTA v1 selalu membuka halaman detail, bukan langsung mengeksekusi action dari Dashboard.

## Test Plan
- Dashboard menampilkan tiga briefing card jika snapshot tersedia.
- Jika hanya satu/dua domain punya snapshot, card lain menampilkan empty/error state tanpa merusak layout.
- `GET /api/dashboard/briefings` hanya mengembalikan data user login.
- n8n scheduled workflow menghasilkan snapshot untuk Jira, Calendar, dan Email.
- Calendar summary menyertakan Google Meet link bila event memilikinya.
- Email summary tidak menampilkan raw email panjang, hanya ringkasan dan indikator prioritas.
- Jira summary tidak mengarang progress jika data issue kosong atau Jira belum connected.
- Default schedule `07:00` dan `15:00` WIB muncul sebagai next update di UI.

## Assumptions
- User utama v1 adalah leader team yang memakai dashboard personal berdasarkan akun login.
- Summary AI dibuat terjadwal, bukan saat Dashboard dibuka.
- Data snapshot disimpan di tabel Supabase baru.
- Schedule bisa dikonfigurasi secara teknis dulu, belum lewat UI.
- Cross-domain proactive insight ditunda setelah briefing per-domain stabil.
