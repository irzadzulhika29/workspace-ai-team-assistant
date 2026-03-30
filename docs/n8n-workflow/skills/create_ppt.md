# Skill: Create Presentation

## Tujuan
Gunakan skill ini untuk membuat materi presentasi atau slide. Jangan gunakan skill ini untuk menyusun laporan dokumen teks panjang.

## Struktur Slide Wajib
Bagi informasi menjadi beberapa bagian menggunakan tag HTML `<section>`. Setiap `<section>` mewakili satu slide presentasi.

1. **Slide Judul:** Gunakan tag `<h1>` untuk judul utama dan `<h2>` untuk subjudul.
2. **Slide Agenda:** Tampilkan daftar isi atau poin utama presentasi.
3. **Slide Konten (Teks):** Gunakan daftar peluru (`<ul>` dan `<li>`) untuk menjelaskan rincian. Batasi jumlah teks agar tetap ringkas.
4. **Slide Konten (Visual/Data):** Jika menyajikan perbandingan, matriks, atau garis waktu (timeline), WAJIB gunakan format tabel (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`) agar data lebih terstruktur secara visual.
5. **Slide Penutup:** Tuliskan kesimpulan ringkas atau sesi tanya jawab.

## Aturan Penulisan HTML
* Hasilkan kode HTML yang valid dan bersih.
* Jangan tambahkan gaya CSS sebaris (*inline CSS*).
* Tulis kalimat pendek, aktif, dan padat untuk isi presentasi. Hindari paragraf panjang.
* Variasikan isi presentasi! Jangan hanya menggunakan `<ul>` di setiap slide. Sisipkan setidaknya satu tabel jika ada data yang relevan.
* Gunakan tag `<strong>` untuk menebalkan kata kunci penting agar audiens mudah menangkap inti poin.

## Langkah Eksekusi
1. Ekstrak poin-poin penting dari permintaan pengguna.
2. Rancang alur presentasi secara logis (Judul -> Agenda -> Isi -> Kesimpulan).
3. Tulis kode HTML sesuai struktur wajib dan pastikan ada variasi elemen visual (tabel).

## Contoh Keluaran (Referensi Format)
Keluarkan hasil akhir dalam format HTML murni seperti contoh di bawah ini:

```html
<section>
  <h1>Arsitektur Document Agent</h1>
  <h2>Penerapan <strong>Router Pattern</strong> di n8n</h2>
</section>

<section>
  <h1>Agenda Presentasi</h1>
  <ul>
    <li>Pendahuluan & Masalah</li>
    <li>Perbandingan Arsitektur</li>
    <li>Solusi Skill Terpisah</li>
    <li>Kesimpulan</li>
  </ul>
</section>

<section>
  <h1>Masalah Prompt Tunggal</h1>
  <ul>
    <li>Satu instruksi besar sering memicu <strong>konflik internal</strong> pada AI.</li>
    <li>AI gagal membedakan format laporan teks panjang dan slide presentasi.</li>
    <li>Akurasi keluaran dan penataan format menurun secara tajam.</li>
  </ul>
</section>

<section>
  <h1>Perbandingan Arsitektur</h1>
  <table>
    <thead>
      <tr>
        <th>Kriteria</th>
        <th>Prompt Tunggal</th>
        <th>Skill Terpisah (Router)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Akurasi Format</strong></td>
        <td>Rendah (Sering Bentrok)</td>
        <td>Tinggi (Terisolasi)</td>
      </tr>
      <tr>
        <td><strong>Skalabilitas</strong></td>
        <td>Sulit ditambah instruksi baru</td>
        <td>Sangat mudah (Tinggal tambah node)</td>
      </tr>
      <tr>
        <td><strong>Pemeliharaan</strong></td>
        <td>Rumit dan rawan rusak</td>
        <td>Rapi via GitHub (Version Control)</td>
      </tr>
    </tbody>
  </table>
</section>

<section>
  <h1>Kesimpulan</h1>
  <ul>
    <li>Pemisahan tugas meningkatkan keandalan sistem secara drastis.</li>
    <li>Manajemen file melalui GitHub memudahkan pelacakan versi tanpa mengganggu workflow n8n.</li>
  </ul>
  <h2>Terima Kasih</h2>
</section>
```