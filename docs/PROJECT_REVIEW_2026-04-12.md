# Project Review — Team Assistant Workspace

Tanggal review: 12 April 2026

## Ringkasan singkat

Secara umum project sudah punya fondasi yang bagus: struktur frontend/backend rapi, sudah pakai Prisma, session-based auth, dan dokumentasi setup cukup lengkap. Namun ada beberapa area penting yang sebaiknya diprioritaskan agar lebih aman, stabil, dan maintainable untuk produksi.

## Prioritas tinggi (High Impact)

### 1) Perketat konfigurasi session secret di production
**Temuan:** server masih menyediakan fallback secret default (`your-secret-key-change-this`) saat `SESSION_SECRET` tidak diisi. Ini berisiko tinggi bila lolos ke production.

**Dampak:** session hijacking / invalidasi keamanan session.

**Saran:**
- Fail-fast saat `NODE_ENV=production` dan `SESSION_SECRET` kosong.
- Gunakan secret panjang (>= 32 bytes random).
- Tambahkan check startup dan hentikan server bila tidak valid.

---

### 2) Hindari log token OAuth dan data sensitif
**Temuan:** ada logging callback OAuth yang menampilkan status token/profile detail secara verbose.

**Dampak:** kebocoran data sensitif di log aggregator / observability tools.

**Saran:**
- Redact seluruh token (`accessToken`, `refreshToken`) dan PII.
- Gunakan structured logging (pino/winston) dengan level log.
- Aktifkan verbose log hanya di development.

---

### 3) Hardcoded endpoint eksternal di frontend
**Temuan:** `PROD_BASE_URL = "https://n8n.karyatech.web.id"` hardcoded di code frontend.

**Dampak:** sulit multi-environment, risiko salah kirim request saat deploy staging.

**Saran:**
- Pindahkan semua endpoint ke env (`VITE_*`) dan validasi saat startup app.
- Siapkan konfigurasi terpisah dev/staging/prod.

---

### 4) Potensi null handling pada endpoint status Google
**Temuan:** endpoint status mengasumsikan user selalu ditemukan, padahal ada kemungkinan record user sudah terhapus/tidak sinkron.

**Dampak:** 500 error intermiten.

**Saran:**
- Tambahkan guard `if (!user) ...` dan return 404/`connected:false`.
- Tambahkan test untuk scenario user session orphan.

## Prioritas menengah

### 5) Consolidate inisialisasi Prisma Client
**Temuan:** beberapa file membuat instance `new PrismaClient()` sendiri.

**Dampak:** overhead koneksi, menyulitkan tracing/monitoring.

**Saran:**
- Gunakan singleton Prisma client (mis. `server/lib/prisma.js`) dan import dari satu tempat.

---

### 6) Perluasan automated testing
**Temuan:** belum terlihat setup test yang aktif (unit/integration/e2e).

**Saran:**
- Backend: vitest/jest + supertest untuk route auth, error handler, integration routes.
- Frontend: React Testing Library untuk komponen kritis.
- Tambahkan CI minimal: lint + test + build.

---

### 7) Hardening API middleware
**Saran tambahan:**
- Tambahkan `helmet` untuk secure headers.
- Tambahkan rate limiting pada endpoint auth/public.
- Validasi payload dengan zod/joi di boundary API.

## Prioritas rendah (quick wins)

1. Tambahkan endpoint `/api/health` dengan info dependency check (DB reachable, version).
2. Dokumentasikan strategy rotasi Google refresh token.
3. Standarisasi bahasa penamaan model/tabel (campur ID/EN saat ini) agar lebih konsisten.

## Usulan roadmap implementasi

### Sprint 1 (keamanan & stabilitas)
- Enforce `SESSION_SECRET` di production.
- Redact token/PII di logger.
- Fix null-handling endpoint Google status.
- Tambah `helmet` + basic rate limiter.

### Sprint 2 (quality)
- Prisma singleton refactor.
- Tambah test backend untuk auth & integration routes.
- Tambah pipeline CI sederhana.

### Sprint 3 (DX & scaling)
- Centralized config loader + validation.
- Structured logging + request correlation ID.
- Observability (error budget, latency dashboard).

## Penutup

Project ini sudah punya pondasi yang kuat untuk jadi workspace internal yang production-ready. Fokus terbesar berikutnya adalah hardening keamanan auth/session, standardisasi konfigurasi environment, dan test automation agar perubahan fitur lebih aman saat scale.
