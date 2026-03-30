# Skill: Create Presentation

## Tujuan
Gunakan skill ini untuk membuat materi presentasi atau slide. Jangan gunakan skill ini untuk menyusun laporan dokumen teks panjang.

## Struktur Slide Wajib
Bagi informasi menjadi beberapa bagian menggunakan tag HTML `<section>`. Setiap `<section>` mewakili satu slide presentasi.

1. **Slide Judul:** Gunakan tag `<h1>` untuk judul utama dan `<h2>` untuk subjudul.
2. **Slide Agenda:** Tampilkan daftar isi atau poin utama presentasi.
3. **Slide Konten:** Fokus pada satu ide utama per slide. Gunakan daftar peluru (`<ul>` dan `<li>`) untuk menjelaskan rincian. Batasi jumlah teks agar tetap ringkas.
4. **Slide Penutup:** Tuliskan kesimpulan ringkas atau sesi tanya jawab.

## Aturan Penulisan HTML
* Hasilkan kode HTML yang valid dan bersih.
* Jangan tambahkan gaya CSS sebaris (*inline CSS*).
* Tulis kalimat pendek, aktif, dan padat untuk isi presentasi.
* Hindari paragraf panjang di dalam slide.
* Buat poin-poin yang langsung pada intinya.

## Langkah Eksekusi
1. Ekstrak poin-poin penting dari permintaan pengguna.
2. Rancang alur presentasi secara logis.
3. Tulis kode HTML sesuai struktur wajib.

## Contoh Keluaran (Referensi Format)
Keluarkan hasil akhir dalam format HTML murni seperti contoh di bawah ini:

```html
<section>
  <h1>Arsitektur Document Agent</h1>
  <h2>Penerapan Router Pattern di n8n</h2>
</section>

<section>
  <h1>Agenda</h1>
  <ul>
    <li>Pendahuluan</li>
    <li>Masalah Prompt Tunggal</li>
    <li>Solusi Skill Terpisah</li>
    <li>Kesimpulan</li>
  </ul>
</section>

<section>
  <h1>Masalah Prompt Tunggal</h1>
  <ul>
    <li>Satu instruksi besar memicu konflik.</li>
    <li>AI gagal membedakan format laporan dan slide.</li>
    <li>Akurasi keluaran menurun secara tajam.</li>
  </ul>
</section>

<section>
  <h1>Solusi Skill Terpisah</h1>
  <ul>
    <li>Agen utama mengklasifikasi permintaan pengguna.</li>
    <li>Agen mengunduh file markdown spesifik dari GitHub.</li>
    <li>Pemisahan instruksi mencegah kebingungan AI.</li>
  </ul>
</section>

<section>
  <h1>Kesimpulan</h1>
  <ul>
    <li>Pemisahan tugas meningkatkan keandalan sistem.</li>
    <li>Manajemen file GitHub memudahkan pelacakan versi.</li>
  </ul>
  <h2>Terima Kasih</h2>
</section>
```