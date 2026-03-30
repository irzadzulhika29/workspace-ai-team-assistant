# Skill: Create Presentation

## Tujuan
Gunakan skill ini untuk membuat materi presentasi atau slide. Jangan gunakan skill ini untuk menyusun laporan dokumen teks panjang.

## Struktur Slide Wajib
Bagi informasi menjadi beberapa bagian menggunakan tag `<section class="slide">`. **WAJIB** menambahkan `class="slide"` pada setiap section agar format ukuran slide bekerja.

1. **Slide Judul:** Gunakan `<h1>` untuk judul utama dan `<h2>` untuk subjudul.
2. **Slide Konten (Teks):** Gunakan `<ul>` dan `<li>` untuk poin-poin.
3. **Slide Konten (Data/Tabel):** Gunakan format tabel HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`) untuk matriks atau perbandingan.
4. **Slide Konten (Alur/Diagram):** WAJIB gunakan struktur div khusus ini untuk membuat alur proses atau diagram langkah:
   ```html
   <div class="flow-container">
     <div class="flow-box">Langkah 1</div>
     <div class="flow-arrow">&#8594;</div>
     <div class="flow-box">Langkah 2</div>
     <div class="flow-arrow">&#8594;</div>
     <div class="flow-box">Langkah 3</div>
   </div>
   ```

## Aturan Penulisan HTML
* Hasilkan kode HTML yang valid dan bersih tanpa CSS sebaris (inline CSS).
* Variasikan isi presentasi! Gunakan *list*, tabel, atau *flow-container* sesuai konteks data.
* Gunakan tag `<strong>` untuk menebalkan kata kunci.

## Contoh Keluaran (Referensi Format)
Keluarkan hasil akhir dalam format HTML murni seperti contoh di bawah ini:

```html
<section class="slide">
  <h1>Arsitektur Document Agent</h1>
  <h2>Penerapan <strong>Router Pattern</strong></h2>
</section>

<section class="slide">
  <h1>Alur Kerja Sistem</h1>
  <div class="flow-container">
    <div class="flow-box">Input Pengguna</div>
    <div class="flow-arrow">&#8594;</div>
    <div class="flow-box">AI Klasifikasi</div>
    <div class="flow-arrow">&#8594;</div>
    <div class="flow-box">Cetak Dokumen</div>
  </div>
</section>

<section class="slide">
  <h1>Perbandingan Kinerja</h1>
  <table>
    <thead>
      <tr>
        <th>Metode</th>
        <th>Akurasi</th>
        <th>Kecepatan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Prompt Tunggal</td>
        <td>Rendah</td>
        <td>Cepat</td>
      </tr>
      <tr>
        <td>Skill Terpisah</td>
        <td><strong>Tinggi</strong></td>
        <td>Stabil</td>
      </tr>
    </tbody>
  </table>
</section>

<section class="slide">
  <h1>Kesimpulan</h1>
  <ul>
    <li>Pemisahan tugas meningkatkan keandalan sistem.</li>
    <li>Penggunaan diagram memperjelas proses kompleks.</li>
  </ul>
  <h2>Terima Kasih</h2>
</section>
```