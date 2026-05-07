# Skill: Create Email (Communication Agent)

## Tujuan
Panduan wajib untuk Communication Agent dalam membuat draft email profesional yang siap dikirim via Gmail. Email wajib menggunakan format HTML, bukan Markdown, karena Gmail tidak merender sintaks Markdown dengan baik.

---

## Aturan Utama

1. Selalu gunakan HTML untuk isi email. Jangan gunakan Markdown di dalam body email.
2. Jangan sertakan tag `<html>`, `<head>`, atau `<body>`. Cukup kirim konten HTML email-nya saja.
3. Gunakan inline CSS untuk styling. Jangan mengandalkan `<style>` block.
4. Subject email harus berupa teks biasa, bukan HTML.
5. Bahasa menyesuaikan konteks: formal untuk klien atau manajemen, semi-formal untuk komunikasi internal.
6. Footer atau tanda tangan wajib mengikuti profil user aktif jika konteks menyediakan `user_name`, `user_job_title`, atau `user_email`.
7. Jangan gunakan tanda tangan generik seperti `Manajemen`, `Admin`, `Tim Operasional`, atau placeholder `[Nama Pengirim]` jika nama user tersedia.
8. Jika jabatan kosong, tampilkan nama saja tanpa baris jabatan kosong.
9. Jangan pernah menyalin token contoh seperti `[Nama Pengirim dari user_name]` atau `[Jabatan dari user_job_title jika ada]` ke output final. Token itu hanya penanda, dan wajib diganti dengan nilai aktual.

---

## Konteks Profil Pengirim

Jika workflow memberikan konteks berikut, gunakan sebagai sumber kebenaran footer:

- `user_name` untuk nama pengirim
- `user_job_title` untuk jabatan pengirim
- `user_email` untuk email pengirim bila perlu disebutkan

Prioritas penerapan:

1. Jika `user_name` ada, gunakan pada tanda tangan.
2. Jika `user_job_title` ada, tampilkan di bawah nama dengan style muted.
3. Jika `user_name` tidak ada, hindari mengarang identitas palsu. Gunakan penutup netral seperlunya.

---

## Struktur HTML Email yang Benar

```html
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 640px; line-height: 1.6;">

  <p>Kepada Yth. [Nama Penerima],</p>
  <p>Dengan hormat,</p>

  <p>[Kalimat pembuka yang menjelaskan tujuan email.]</p>

  <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
    <tr style="background-color: #f0f4ff;">
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold; width: 35%;">Tanggal</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">[isi]</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold;">Waktu</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">[isi]</td>
    </tr>
    <tr style="background-color: #f0f4ff;">
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8; font-weight: bold;">Lokasi</td>
      <td style="padding: 10px 14px; border: 1px solid #d0d7e8;">[isi]</td>
    </tr>
  </table>

  <p style="font-weight: bold; font-size: 15px; margin-top: 20px; color: #1a3a6b;">Agenda:</p>
  <ol style="padding-left: 20px; margin: 0;">
    <li style="margin-bottom: 6px;">[Poin 1]</li>
    <li style="margin-bottom: 6px;">[Poin 2]</li>
    <li style="margin-bottom: 6px;">[Poin 3]</li>
  </ol>

  <p style="font-weight: bold; font-size: 15px; margin-top: 20px; color: #1a3a6b;">Persiapan:</p>
  <ul style="padding-left: 20px; margin: 0;">
    <li style="margin-bottom: 6px;">[Item 1]</li>
    <li style="margin-bottom: 6px;">[Item 2]</li>
  </ul>

  <p style="margin-top: 20px;">[Kalimat penutup, konfirmasi kehadiran, atau tindak lanjut yang diharapkan.]</p>

  <p>Terima kasih atas perhatian dan kerjasamanya.</p>

  <p style="margin-top: 24px;">
    Hormat saya,<br>
    <strong>Nama User Aktual</strong><br>
    <span style="color: #555;">Jabatan User Aktual</span>
  </p>

</div>
```

---

## Template per Jenis Email

### 1. Undangan Meeting atau Rapat

Subject: `Undangan Rapat: [Nama Rapat] - [Tanggal]`

Gunakan tabel detail, agenda, dan penutup yang meminta konfirmasi kehadiran.

### 2. Email Pengumuman Internal

Subject: `[PENGUMUMAN] [Topik Singkat]`

```html
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 640px; line-height: 1.6;">
  <div style="background-color: #1a3a6b; color: white; padding: 14px 20px; border-radius: 6px 6px 0 0;">
    <strong style="font-size: 16px;">PENGUMUMAN</strong>
  </div>
  <div style="border: 1px solid #d0d7e8; border-top: none; padding: 20px; border-radius: 0 0 6px 6px;">
    <p>Kepada Yth. Seluruh [Tim atau Karyawan],</p>
    <p>[Isi pengumuman utama.]</p>
    <p>[Detail atau langkah yang perlu diambil penerima.]</p>
    <p>Demikian pengumuman ini disampaikan. Atas perhatiannya kami ucapkan terima kasih.</p>
    <p style="margin-top: 20px;">Hormat saya,<br><strong>Nama User Aktual</strong><br><span style="color:#555;">Jabatan User Aktual</span></p>
  </div>
</div>
```

### 3. Email Follow-up

Subject: `Follow-up: [Topik] - [Deadline jika ada]`

Struktur: konteks singkat, bullet action items, deadline, penutup.

### 4. Email Formal ke Klien atau Eksternal

Subject harus jelas dan profesional. Tanda tangan wajib mengikuti profil user aktif jika tersedia.

---

## Panduan Warna dan Style

| Elemen | Style |
|---|---|
| Wrapper utama | `font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 640px` |
| Heading section | `font-weight: bold; font-size: 15px; color: #1a3a6b` |
| Baris tabel selang-seling | `background-color: #f0f4ff` |
| Border tabel | `border: 1px solid #d0d7e8` |
| Padding sel tabel | `padding: 10px 14px` |
| Teks muted | `color: #555` |

---

## Checklist Sebelum Kirim

- Body email tidak mengandung sintaks Markdown
- Semua styling memakai inline CSS
- Subject email sudah deskriptif
- Nama penerima, tanggal, waktu, dan lokasi sudah benar
- Tanda tangan mengikuti profil user aktif
- Jika jabatan kosong, tidak ada placeholder atau baris kosong
- Tidak ada placeholder `[isi]` yang tersisa

---

## Contoh Footer yang Benar

```html
<p style="margin-top: 24px;">
  Hormat saya,<br>
  <strong>Nama User</strong><br>
  <span style="color: #555;">Senior Product Manager</span>
</p>
```

Jika `user_job_title` kosong:

```html
<p style="margin-top: 24px;">
  Hormat saya,<br>
  <strong>Nama User</strong>
</p>
```
