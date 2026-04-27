# Skill: Create Presentation

## Tujuan
Gunakan skill ini untuk membuat materi presentasi atau slide. Jangan gunakan skill ini untuk menyusun laporan dokumen teks panjang.

## Aturan Batas Slide (SANGAT PENTING)
Logika pembuatan slide Anda harus mengikuti aturan ini:
1. **Satu Slide = Satu Section:** Setiap slide presentasi **WAJIB** dibungkus oleh tag `<section class="slide">` dan diakhiri dengan `</section>`.
2. **Batas `<h1>`:** Setiap `<section class="slide">` **HANYA BOLEH MEMILIKI SATU** tag `<h1>` sebagai judul utama slide di bagian paling atas.
3. **Isi Slide:** Semua konten pendukung untuk judul tersebut (seperti `<h2>`, `<ul>`, `<table>`, atau diagram) harus diletakkan **di dalam** `<section>` yang sama, di bawah `<h1>`. 
4. **Pindah Slide:** Jika Anda ingin membuat judul `<h1>` baru (topik baru), Anda **WAJIB** menutup slide saat ini dengan `</section>` terlebih dahulu, lalu buka `<section class="slide">` baru.

## Validasi Struktur Wajib Sebelum Mengirim Hasil
Sebelum mengirim HTML final, WAJIB cek ulang semua poin ini:
1. Setiap slide HARUS berbentuk `<section class="slide"> ... </section>`.
2. Setiap `<section class="slide">` HARUS memiliki **tepat satu** `<h1>`.
   - Tidak boleh 0 `<h1>`.
   - Tidak boleh 2 atau lebih `<h1>`.
3. DILARANG menulis `<h1>` di luar `<section class="slide">`.
4. Jika ingin membuat topik/judul baru:
   - tutup slide saat ini dengan `</section>`
   - buka slide baru dengan `<section class="slide">`
   - lalu tulis `<h1>` baru
5. Semua isi pendukung untuk satu judul harus tetap berada di slide yang sama, di bawah `<h1>` tersebut.

Jika struktur ini tidak terpenuhi, hasil dianggap tidak valid.

## Pilihan Format Konten Slide
Pilih format yang paling cocok untuk isi slide Anda agar rapi dan tidak membosankan:
* **Teks Biasa:** Gunakan `<ul>` dan `<li>`. Batasi teks agar tetap ringkas. Gunakan tag `<strong>` untuk menebalkan kata kunci.
* **Matriks/Perbandingan:** WAJIB gunakan format tabel (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`).
* **Alur/Langkah-langkah:** WAJIB gunakan struktur diagram HTML ini:
  ```html
  <div class="flow-container">
    <div class="flow-box">Langkah 1</div>
    <div class="flow-arrow">&#8594;</div>
    <div class="flow-box">Langkah 2</div>
  </div>
  ```

## Aturan Penulisan HTML
* Hasilkan kode HTML yang valid dan bersih tanpa CSS sebaris (inline CSS).
* Jangan pernah meletakkan teks atau elemen HTML apa pun di luar tag `<section class="slide">`.
* Jangan pernah menaruh dua `<h1>` di dalam satu `<section class="slide">`.
* Jangan pernah membuka topik baru tanpa membuat `<section class="slide">` baru.

## Contoh Keluaran Wajib (Referensi Format)
Keluarkan hasil akhir dalam format HTML murni persis seperti struktur di bawah ini:

```html
<section class="slide">
  <h1>Judul Presentasi Utama</h1>
  <h2>Subjudul atau Nama Pemateri</h2>
</section>

<section class="slide">
  <h1>Agenda Pembahasan</h1>
  <ul>
    <li>Poin Pembahasan Pertama</li>
    <li>Poin Pembahasan Kedua</li>
  </ul>
</section>

<section class="slide">
  <h1>Perbandingan Kinerja (Contoh Tabel)</h1>
  <table>
    <thead>
      <tr>
        <th>Kategori A</th>
        <th>Kategori B</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</section>

<section class="slide">
  <h1>Proses Eksekusi (Contoh Diagram Alur)</h1>
  <div class="flow-container">
    <div class="flow-box">Input Data</div>
    <div class="flow-arrow">&#8594;</div>
    <div class="flow-box">Proses AI</div>
    <div class="flow-arrow">&#8594;</div>
    <div class="flow-box">Output Selesai</div>
  </div>
</section>

<section class="slide">
  <h1>Kesimpulan</h1>
  <ul>
    <li>Satu section hanya untuk satu H1.</li>
    <li>Semua isi terkunci rapi di dalam section.</li>
  </ul>
</section>
```

## Contoh Struktur Salah (DILARANG)

```html
<section class="slide">
  <h1>Pembukaan</h1>
  <ul>
    <li>Poin pembuka</li>
  </ul>
  <h1>Pembahasan Utama</h1>
  <ul>
    <li>Poin lanjutan</li>
  </ul>
</section>
```

Alasan salah:
- Satu `section.slide` mengandung lebih dari satu `<h1>`.
- `Pembahasan Utama` seharusnya berada pada slide baru.

Versi benar:

```html
<section class="slide">
  <h1>Pembukaan</h1>
  <ul>
    <li>Poin pembuka</li>
  </ul>
</section>

<section class="slide">
  <h1>Pembahasan Utama</h1>
  <ul>
    <li>Poin lanjutan</li>
  </ul>
</section>
```

## Kalimat Penutup Wajib (TIDAK BOLEH DIUBAH)

Setelah seluruh slide selesai ditulis, tutup respons dengan kalimat PERSIS berikut — tidak boleh diparafrase, disingkat, atau diganti dengan kalimat lain apapun:

"Presentasi Anda sudah siap. Silakan klik tombol 'Unduh Presentasi (PDF)' untuk menyimpannya."

Frasa **'Unduh Presentasi (PDF)'** adalah trigger kata kunci yang digunakan sistem backend untuk mendeteksi dan memproses ekspor PDF secara otomatis. Jika frasa ini tidak ada atau berubah bentuk, sistem tidak akan berjalan dan PDF tidak akan ter-generate.

DILARANG menggunakan variasi seperti:
- "Unduh Presentasi dalam Format PowerPoint / PDF"
- "Klik disini untuk mengunduh"
- "Download presentasi"
- Atau frasa apapun selain yang tertulis di atas.
