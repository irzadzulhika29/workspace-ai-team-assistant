# Skill: Create Email (Communication Agent)

## Tujuan
Panduan wajib untuk Communication Agent dalam membuat draft email profesional yang siap dikirim via Gmail. Email WAJIB menggunakan format HTML — bukan Markdown — karena Gmail tidak merender sintaks Markdown (tabel `|---|---|`, heading `####`, bold `**teks**`) dan akan tampil sebagai teks kacau di inbox penerima.

---

## Aturan Utama

1. **SELALU gunakan HTML** untuk isi email. Dilarang menggunakan sintaks Markdown apa pun di dalam body email.
2. **JANGAN sertakan tag `<html>`, `<head>`, atau `<body>`** — cukup tulis konten HTML-nya saja (Gmail akan membungkusnya sendiri).
3. **Gunakan inline CSS** untuk semua styling. Jangan pakai `<style>` block eksternal karena Gmail memfilternya.
4. **Subject email** ditulis sebagai teks biasa, bukan HTML.
5. **Bahasa** menyesuaikan konteks — formal untuk klien/manajemen, semi-formal untuk internal tim.

---

## Struktur HTML Email yang Benar

```html
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 640px; line-height: 1.6;">

  <!-- SALAM PEMBUKA -->
  <p>Kepada Yth. [Nama Penerima],</p>
  <p>Dengan hormat,</p>

  <!-- PARAGRAF PEMBUKA -->
  <p>[Kalimat pembuka yang menjelaskan tujuan email.]</p>

  <!-- TABEL DETAIL (jika ada jadwal/info terstruktur) -->
  <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
    <tr style="background-color: #f0f4ff;">
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold; width: 35%;">📅 Tanggal</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">[isi]</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold;">⏰ Waktu</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">[isi]</td>
    </tr>
    <tr style="background-color: #f0f4ff;">
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold;">📍 Lokasi</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">[isi]</td>
    </tr>
  </table>

  <!-- SECTION DENGAN HEADING -->
  <p style="font-weight: bold; font-size: 15px; margin-top: 20px; color: #1a3a6b;">🎯 Agenda Rapat:</p>
  <ol style="padding-left: 20px; margin: 0;">
    <li style="margin-bottom: 6px;">[Poin 1]</li>
    <li style="margin-bottom: 6px;">[Poin 2]</li>
    <li style="margin-bottom: 6px;">[Poin 3]</li>
  </ol>

  <!-- CATATAN / PERSIAPAN (opsional) -->
  <p style="font-weight: bold; font-size: 15px; margin-top: 20px; color: #1a3a6b;">📋 Persiapan sebelum rapat:</p>
  <ul style="padding-left: 20px; margin: 0;">
    <li style="margin-bottom: 6px;">[Item 1]</li>
    <li style="margin-bottom: 6px;">[Item 2]</li>
  </ul>

  <!-- PARAGRAF PENUTUP -->
  <p style="margin-top: 20px;">[Kalimat penutup, konfirmasi kehadiran, atau tindak lanjut yang diharapkan.]</p>

  <p>Terima kasih atas perhatian dan kerjasamanya.</p>

  <!-- TANDA TANGAN -->
  <p style="margin-top: 24px;">
    Hormat kami,<br>
    <strong>[Nama Pengirim]</strong><br>
    <span style="color: #555;">[Jabatan]</span>
  </p>

</div>
```

---

## Template per Jenis Email

### 1. Undangan Meeting / Rapat

**Subject:** `Undangan Rapat: [Nama Rapat] — [Tanggal]`

Gunakan struktur lengkap di atas dengan tabel detail (tanggal, waktu, lokasi), section agenda berurutan, dan kalimat konfirmasi kehadiran di penutup.

### 2. Email Pengumuman Internal

**Subject:** `[PENGUMUMAN] [Topik Singkat]`

```html
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 640px; line-height: 1.6;">

  <div style="background-color: #1a3a6b; color: white; padding: 14px 20px; border-radius: 6px 6px 0 0;">
    <strong style="font-size: 16px;">📢 PENGUMUMAN</strong>
  </div>
  <div style="border: 1px solid #d0d7e8; border-top: none; padding: 20px; border-radius: 0 0 6px 6px;">
    <p>Kepada Yth. Seluruh [Tim/Karyawan],</p>
    <p>[Isi pengumuman utama.]</p>
    <p>[Detail atau langkah yang perlu diambil penerima.]</p>
    <p>Demikian pengumuman ini disampaikan. Atas perhatiannya kami ucapkan terima kasih.</p>
    <p style="margin-top: 20px;">Hormat kami,<br><strong>[Nama]</strong><br><span style="color:#555;">[Jabatan]</span></p>
  </div>

</div>
```

### 3. Email Follow-up / Tindak Lanjut

**Subject:** `Follow-up: [Topik] — [Deadline jika ada]`

Struktur: paragraf singkat konteks → bullet list item yang perlu ditindaklanjuti → deadline → penutup. Tidak perlu tabel.

### 4. Email Formal ke Klien / Eksternal

**Subject:** `[Topik yang jelas dan profesional]`

Gunakan bahasa formal penuh. Sertakan tabel detail jika ada informasi terstruktur. Tanda tangan wajib lengkap (nama, jabatan, perusahaan).

---

## Panduan Warna & Style

| Elemen | Style yang digunakan |
|---|---|
| Wrapper utama | `font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 640px` |
| Heading section | `font-weight: bold; font-size: 15px; color: #1a3a6b` |
| Baris tabel ganjil | `background-color: #f0f4ff` |
| Border tabel | `border: 1px solid #d0d7e8` |
| Padding sel tabel | `padding: 10px 14px` |
| Teks muted (jabatan) | `color: #555` |

---

## Checklist Sebelum Kirim

Sebelum memanggil tool `Send a message in Gmail`, pastikan:

- [ ] Isi email **tidak mengandung sintaks Markdown** (`**bold**`, `### heading`, `|tabel|`, `- bullet`)
- [ ] Semua styling menggunakan **inline CSS**
- [ ] Subject email sudah diisi dan deskriptif
- [ ] Nama penerima, tanggal, waktu, dan lokasi sudah benar sesuai data yang diberikan user
- [ ] Tanda tangan lengkap (nama + jabatan)
- [ ] Tidak ada placeholder `[isi]` yang belum diganti

---

## Contoh Lengkap: Undangan Rapat Koordinasi

**Subject:** `Undangan Rapat Koordinasi Payroll — Kamis, 2 April 2026`

```html
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 640px; line-height: 1.6;">

  <p>Kepada Yth. Seluruh Anggota Tim Operasional,</p>
  <p>Dengan hormat,</p>
  <p>Bersama ini kami mengundang seluruh anggota tim untuk menghadiri rapat koordinasi operasional dengan detail sebagai berikut:</p>

  <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
    <tr style="background-color: #f0f4ff;">
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold; width: 35%;">📅 Tanggal</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">Kamis, 2 April 2026</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold;">⏰ Waktu</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">09.30 WIB</td>
    </tr>
    <tr style="background-color: #f0f4ff;">
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold;">📍 Lokasi</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">Google Meet (link dikirim 15 menit sebelum rapat)</td>
    </tr>
  </table>

  <p style="font-weight: bold; font-size: 15px; margin-top: 20px; color: #1a3a6b;">🎯 Agenda Utama:</p>
  <ol style="padding-left: 20px; margin: 0;">
    <li style="margin-bottom: 6px;">Evaluasi proses payroll bulan ini</li>
    <li style="margin-bottom: 6px;">Identifikasi kendala pada tahap verifikasi data</li>
    <li style="margin-bottom: 6px;">Penetapan timeline final pengiriman slip gaji</li>
    <li style="margin-bottom: 6px;">Penyusunan perbaikan prosedur untuk periode selanjutnya</li>
  </ol>

  <p style="font-weight: bold; font-size: 15px; margin-top: 20px; color: #1a3a6b;">📋 Persiapan sebelum rapat:</p>
  <ul style="padding-left: 20px; margin: 0;">
    <li style="margin-bottom: 6px;">Laporan realisasi input data karyawan periode ini</li>
    <li style="margin-bottom: 6px;">Daftar masalah yang ditemukan saat menjalankan payroll</li>
    <li style="margin-bottom: 6px;">Minimal 1 usulan perbaikan prosedur</li>
    <li style="margin-bottom: 6px;">Update progress tugas di sistem tim paling lambat 1 jam sebelum rapat</li>
  </ul>

  <p style="margin-top: 20px;">Rapat direncanakan berlangsung selama 90 menit. Mohon hadir tepat waktu. Apabila berhalangan hadir, mohon informasikan kepada Koordinator Tim paling lambat hari ini pukul 17.00 WIB.</p>

  <p>Terima kasih atas perhatian dan kerjasamanya.</p>

  <p style="margin-top: 24px;">
    Hormat kami,<br>
    <strong>Manajemen Tim Operasional</strong>
  </p>

</div>
```
