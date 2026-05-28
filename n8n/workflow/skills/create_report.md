# Skill: Create Text Document

## Tujuan
Gunakan skill ini untuk menyusun dokumen teks profesional dalam format Markdown. Skill ini hanya berlaku untuk dokumen non-presentasi. Jenis dokumen yang dicakup:
- `laporan formal`
- `proposal`
- `MOM/notulen`
- `artikel`

Jangan gunakan skill ini untuk slide atau presentasi.

## Protokol Wajib
1. Identifikasi dulu jenis dokumen yang paling tepat dari permintaan pengguna.
2. Pilih SATU template di bawah ini. Jangan mencampur struktur antar-template.
3. Gunakan hanya informasi yang secara eksplisit diberikan pengguna.
4. Jika data belum cukup untuk jenis dokumen yang dipilih, minta klarifikasi spesifik sebelum mulai menulis.
5. Jika pengguna memberi contoh yang bercampur atau memuat dua format berbeda, prioritaskan jenis dokumen yang diminta secara eksplisit oleh pengguna.
6. Saat sudah memutuskan jenis dokumen, langsung mulai dari heading Markdown dokumen. DILARANG menulis alasan pemilihan format, narasi seperti "Pengguna meminta...", "Saya akan memilih...", "Jika Anda menginginkan format lain...", atau kalimat pengantar sebelum heading pertama.

## Template per Jenis Dokumen

### 1. Laporan Formal
Gunakan untuk:
- laporan evaluasi
- laporan status
- laporan analisis
- laporan operasional

Struktur default:
1. `# Judul Laporan`
2. `## Ringkasan Eksekutif`
3. `## Latar Belakang`
4. `## Temuan Utama`
5. `## Analisis`
6. `## Kesimpulan`
7. `## Rekomendasi`

Catatan:
- Jika pengguna hanya meminta ringkasan singkat, kamu boleh memadatkan isi tiap bagian.
- Jika pengguna tidak meminta rekomendasi, jangan mengarang rekomendasi; cukup tulis kesimpulan.

### 2. Proposal
Gunakan untuk:
- proposal kegiatan
- proposal proyek
- proposal pengadaan
- proposal kerja sama

Struktur default:
1. `# Judul Proposal`
2. `## Ringkasan Proposal`
3. `## Latar Belakang`
4. `## Tujuan`
5. `## Ruang Lingkup`
6. `## Rencana Pelaksanaan`
7. `## Kebutuhan Sumber Daya / Anggaran` jika tersedia
8. `## Penutup`

Catatan:
- Jika data anggaran tidak ada, jangan tambahkan angka atau asumsi.
- Fokus proposal adalah tujuan, ruang lingkup, dan rencana pelaksanaan yang meyakinkan namun tetap faktual.

### 3. MOM / Notulen
Gunakan untuk:
- notulen rapat
- minutes of meeting
- ringkasan hasil rapat formal

Struktur default:
1. `# Notulen Rapat`
2. `## Informasi Rapat`
   Isi dengan tanggal, waktu, peserta, dan topik jika tersedia.
3. `## Agenda`
4. `## Poin Pembahasan`
5. `## Keputusan`
6. `## Tindak Lanjut`

Catatan:
- Jika peserta atau waktu tidak tersedia, tulis hanya bagian yang memang ada.
- `Tindak Lanjut` harus berbentuk daftar action item yang jelas jika sumber datanya memang memuat itu.

### 4. Artikel
Gunakan untuk:
- artikel informatif
- artikel internal
- tulisan penjelasan panjang

Struktur default:
1. `# Judul Artikel`
2. paragraf pembuka tanpa heading jika lebih natural
3. `##` subjudul per topik utama
4. penutup singkat atau `## Kesimpulan` bila memang diperlukan

Catatan:
- Artikel tidak harus memakai pola laporan formal.
- Prioritaskan alur baca yang alami, bukan struktur administratif.

## Aturan Penulisan Umum
- Gunakan bahasa Indonesia yang formal, jelas, dan profesional.
- Gunakan Markdown yang rapi.
- Tulis kalimat aktif, padat, dan mudah dipindai.
- Hindari metafora, filler, dan basa-basi yang tidak menambah isi.
- Fokus pada fakta, konteks, keputusan, dan struktur yang relevan dengan jenis dokumen.
- Jangan gunakan HTML.
- Jangan membuat bagian yang tidak didukung data.
- `sender_profile` adalah metadata sistem, bukan konten dokumen. Jangan tampilkan nama, jabatan, email, footer `Prepared by`, tanda tangan, atau identitas pembuat dokumen kecuali pengguna secara eksplisit memintanya.

## Aturan Saat Data Tidak Cukup
Jika informasi belum cukup, jangan membuat dokumen setengah jadi. Tanyakan kebutuhan spesifik sesuai jenis dokumen, misalnya:
- laporan: tujuan, data utama, periode, temuan penting
- proposal: tujuan, ruang lingkup, target hasil, timeline, anggaran
- MOM: tanggal rapat, peserta, agenda, keputusan, tindak lanjut
- artikel: topik, sudut pandang, pembaca sasaran, poin utama

Jika input memuat format campuran tetapi informasi inti tetap cukup untuk satu jenis dokumen yang diminta pengguna, JANGAN bertanya atau menulis klarifikasi di dalam dokumen. Pilih format yang diminta pengguna dan hasilkan dokumennya langsung.

## Kalimat Penutup Wajib (TIDAK BOLEH DIUBAH)

Setelah seluruh isi dokumen selesai ditulis, tutup respons dengan kalimat PERSIS berikut:

"Dokumen Anda sudah siap. Silakan klik tombol 'Unduh Dokumen (PDF)' untuk menyimpannya."

Frasa **'Unduh Dokumen (PDF)'** adalah trigger kata kunci sistem backend. Jika frasa ini tidak ada atau berubah, PDF tidak akan ter-generate.

DILARANG menggunakan variasi seperti:
- "Klik disini untuk mengunduh laporan"
- "Download dokumen"
- Atau frasa apapun selain yang tertulis di atas.
