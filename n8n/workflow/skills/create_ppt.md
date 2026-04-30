# Skill: Create Presentation

## Tujuan
Gunakan skill ini untuk membuat presentasi yang ringkas, jelas, dan enak dipindai dalam bentuk HTML slide. Fokus utama skill ini adalah kualitas presentasi, bukan hanya HTML yang valid.

## Prinsip Presentasi
1. **Satu slide = satu ide utama.**
   Jika satu slide mencoba menjelaskan dua ide besar sekaligus, pecah menjadi dua slide.
2. **Slide harus mudah dipindai dalam 5-8 detik.**
   Pembaca harus cepat menangkap inti tanpa membaca paragraf panjang.
3. **Narasi deck harus runtut.**
   Urutan minimal yang disarankan:
   - pembuka / konteks
   - inti pembahasan
   - keputusan / rekomendasi / next step
4. **Prioritaskan insight, bukan transkrip.**
   Jangan salin semua detail mentah ke slide. Ambil inti yang paling penting.

## Struktur Deck yang Disarankan
Gunakan alur yang proporsional untuk deck singkat maksimal 10 slide:

1. **Slide pembuka**
   - judul utama
   - subjudul singkat bila perlu
2. **Slide konteks / tujuan**
   - mengapa topik ini penting
   - apa yang akan dibahas
3. **Slide inti 1**
   - insight, data, perbandingan, atau status utama
4. **Slide inti 2**
   - lanjutan analisis, alur kerja, risiko, atau opsi
5. **Slide penutup**
   - kesimpulan, keputusan, atau next step

Jika isi lebih sedikit, tidak wajib memaksakan jumlah slide tertentu. Lebih baik 3-6 slide yang kuat daripada banyak slide kosong atau repetitif.

## Aturan Kepadatan Isi
- Maksimal 5 bullet per slide.
- Setiap bullet idealnya 4-14 kata, jangan berubah menjadi paragraf penuh.
- Paragraf singkat 1-3 kalimat diperbolehkan jika memang lebih tepat daripada bullet list.
- Gunakan ukuran konten yang lebih padat untuk detail pendukung, tetapi tetap utamakan scanability.
- Hindari tabel besar dan padat.
- Jika data terlalu banyak, ringkas menjadi kategori, angka utama, atau perbandingan inti.

## Pemilihan Format Isi
Pilih format yang paling cocok untuk isi slide:

### 1. Bullet List
Gunakan jika:
- menjelaskan poin utama
- merangkum status
- menyusun daftar tindakan

Gunakan:
- `<ul>` dan `<li>`
- `<strong>` untuk kata kunci penting

### 1A. Paragraf Ringkas
Gunakan jika:
- perlu menjelaskan konteks singkat
- ada kalimat keputusan atau catatan penting yang tidak cocok dibelah jadi bullet

Gunakan:
- `<p>` untuk 1-3 kalimat singkat
- `<h2>` sebagai subjudul bila perlu
- maksimal 2 paragraf pendek per slide

### 2. Tabel
Gunakan jika:
- perlu menunjukkan perbandingan singkat
- ada 2-4 kolom yang memang membantu keputusan

Jangan gunakan tabel jika:
- isi tabel terlalu padat
- data lebih mudah dipahami sebagai bullet

### 3. Flow Diagram
Gunakan jika:
- menjelaskan proses
- menjelaskan alur kerja
- menjelaskan tahapan

Gunakan struktur ini:

```html
<div class="flow-container">
  <div class="flow-box">Langkah 1</div>
  <div class="flow-arrow">&#8594;</div>
  <div class="flow-box">Langkah 2</div>
</div>
```

## Aturan Struktur HTML
Aturan ini tetap WAJIB dipatuhi:
1. Setiap slide HARUS berbentuk `<section class="slide"> ... </section>`.
2. Setiap `<section class="slide">` HARUS memiliki **tepat satu** `<h1>`.
3. Jangan menulis `<h1>` di luar `<section class="slide">`.
4. Jika topik berganti, tutup slide lama lalu buka slide baru.
5. Semua isi pendukung untuk satu judul harus tetap berada di slide yang sama, di bawah `<h1>`.

## Aturan Penulisan HTML
- Hasilkan HTML yang valid dan bersih tanpa inline CSS.
- Jangan letakkan elemen HTML apa pun di luar `<section class="slide">`.
- Jangan gunakan dua `<h1>` dalam satu slide.
- Jangan membuat slide kosong.
- Jangan membuat slide penutup yang hanya berisi ucapan generik tanpa isi bermakna.

## Checklist Kualitas Sebelum Mengirim
Sebelum mengirim HTML final, cek ulang:
1. Apakah setiap slide membawa satu ide utama?
2. Apakah deck punya alur pembuka -> isi -> penutup?
3. Apakah bullet dan paragraf tetap mudah dipindai walau informasinya lebih padat?
4. Apakah tabel benar-benar perlu?
5. Apakah tidak ada slide yang terasa terlalu penuh?
6. Apakah seluruh slide sudah valid secara struktur HTML?

## Contoh Keluaran Wajib

```html
<section class="slide">
  <h1>Evaluasi Kinerja Tim Produk Q2 2026</h1>
  <h2>Ringkasan untuk Leadership Team</h2>
</section>

<section class="slide">
  <h1>Konteks dan Fokus Evaluasi</h1>
  <ul>
    <li><strong>Tujuan:</strong> menilai progres kuartal berjalan</li>
    <li><strong>Fokus:</strong> delivery, kualitas, dan risiko</li>
    <li><strong>Periode:</strong> April-Juni 2026</li>
  </ul>
</section>

<section class="slide">
  <h1>Pencapaian Utama</h1>
  <ul>
    <li><strong>3 fitur utama</strong> selesai diluncurkan</li>
    <li><strong>Lead time</strong> turun 18%</li>
    <li><strong>Bug kritis</strong> turun signifikan</li>
  </ul>
</section>

<section class="slide">
  <h1>Risiko dan Hambatan</h1>
  <table>
    <thead>
      <tr>
        <th>Area</th>
        <th>Kondisi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>QA Capacity</td>
        <td>Masih jadi bottleneck release</td>
      </tr>
      <tr>
        <td>Dependency</td>
        <td>Integrasi vendor belum stabil</td>
      </tr>
    </tbody>
  </table>
</section>

<section class="slide">
  <h1>Keputusan dan Next Step</h1>
  <ul>
    <li>Tambahkan kapasitas QA sementara</li>
    <li>Prioritaskan stabilisasi integrasi vendor</li>
    <li>Review ulang milestone bulan depan</li>
  </ul>
</section>
```

## Kalimat Penutup Wajib (TIDAK BOLEH DIUBAH)

Setelah seluruh slide selesai ditulis, tutup respons dengan kalimat PERSIS berikut:

"Presentasi Anda sudah siap. Silakan klik tombol 'Unduh Presentasi (PDF)' untuk menyimpannya."

Frasa **'Unduh Presentasi (PDF)'** adalah trigger kata kunci yang digunakan sistem backend untuk mendeteksi dan memproses ekspor PDF secara otomatis. Jika frasa ini tidak ada atau berubah bentuk, sistem tidak akan berjalan dan PDF tidak akan ter-generate.

DILARANG menggunakan variasi seperti:
- "Unduh Presentasi dalam Format PowerPoint / PDF"
- "Klik disini untuk mengunduh"
- "Download presentasi"
- Atau frasa apapun selain yang tertulis di atas.
