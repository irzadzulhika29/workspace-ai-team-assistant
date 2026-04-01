# Skill: Create Report

## Tujuan
Gunakan skill ini untuk menyusun dokumen laporan formal, artikel panjang, atau proposal teknis. Jangan gunakan skill ini untuk membuat presentasi atau slide.

## Struktur Laporan Wajib
Susun laporan menggunakan hierarki berikut:

1. **Judul Laporan:** Buat judul spesifik dan deskriptif.
2. **Ringkasan Eksekutif:** Tulis inti permasalahan dan hasil akhir maksimal dalam tiga kalimat.
3. **Pendahuluan:** Jelaskan konteks, tujuan, dan batasan masalah.
4. **Analisis Utama:** Pecah data dan temuan menjadi sub-bab berjenjang. Gunakan poin-poin untuk rincian data.
5. **Kesimpulan:** Tarik kesimpulan logis dari analisis utama.
6. **Rekomendasi:** Berikan langkah tindak lanjut spesifik berdasarkan kesimpulan.

## Aturan Penulisan
* Gunakan bahasa formal, objektif, dan lugas.
* Tulis kalimat aktif dan padat.
* Hindari kalimat pasif.
* Fokus pada fakta dan data empiris.
* Hindari metafora dan bahasa kiasan.
* Gunakan format Markdown untuk merapikan struktur dokumen.

## Langkah Eksekusi
1. Ekstrak topik utama dan data spesifik dari permintaan pengguna.
2. Minta klarifikasi jika pengguna tidak memberikan data atau konteks yang cukup.
3. Hasilkan draf laporan lengkap sesuai struktur wajib di atas.

## Contoh Keluaran (Referensi Format)
Keluarkan hasil akhir menggunakan format Markdown seperti contoh di bawah ini:

```markdown
# Laporan Evaluasi Kinerja AI Agent pada Layanan Pelanggan Toko Kopi Jaya

## Ringkasan Eksekutif
Toko Kopi Jaya mengimplementasikan AI Agent untuk menangani pertanyaan pelanggan. Sistem ini meningkatkan kecepatan respons sebesar 45% selama bulan pertama. Perusahaan perlu menambah kapasitas peladen untuk menangani lonjakan lalu lintas data pada jam sibuk.

## Pendahuluan
Laporan ini mengevaluasi kinerja operasional AI Agent selama kuartal pertama 2026. Tujuan evaluasi meliputi pengukuran waktu respons dan tingkat kepuasan pelanggan. Kami menggunakan standar metrik industri layanan pelanggan sebagai parameter pengujian.

## Analisis Utama

### 1. Kecepatan Respons
* AI Agent memproses 1.200 pertanyaan pelanggan per hari. 
* Waktu respons rata-rata turun dari 12 menit menjadi 2 menit.

### 2. Akurasi Jawaban
* Sistem menjawab 88% pertanyaan dengan benar pada percobaan pertama. 
* Agen manusia mengambil alih 12% sisa pertanyaan kompleks.

### 3. Beban Peladen
* Penggunaan CPU peladen mencapai 95% pada jam sibuk. 
* Kondisi ini menyebabkan latensi sistem selama 3 detik.

## Kesimpulan
Implementasi AI Agent berhasil meningkatkan efisiensi waktu respons pelanggan secara signifikan. Namun, kapasitas infrastruktur saat ini membatasi kinerja optimal sistem.

## Rekomendasi
* Tingkatkan spesifikasi peladen ke level berikutnya sebelum kuartal kedua.
* Latih ulang model AI menggunakan data percakapan terbaru untuk meningkatkan akurasi.
```

## Kalimat Penutup Wajib (TIDAK BOLEH DIUBAH)

Setelah seluruh isi laporan selesai ditulis, tutup respons dengan kalimat PERSIS berikut — tidak boleh diparafrase, disingkat, atau diganti dengan kalimat lain apapun:

"Dokumen Anda sudah siap. Silakan klik tombol 'Unduh Dokumen (PDF)' untuk menyimpannya."

Frasa **'Unduh Dokumen (PDF)'** adalah trigger kata kunci yang digunakan sistem backend untuk mendeteksi dan memproses ekspor PDF secara otomatis. Jika frasa ini tidak ada atau berubah, sistem tidak akan berjalan.