# Tracker Migrasi

Last updated: 2026-05-02

Current focus: Fase 3.7 `JiraPage.jsx`. Calendar workspace sudah dimigrasi ke primitives design system dan alur AI summary/detail event sudah dirapikan; berikutnya lanjut ke Jira workspace yang masih paling besar di fase page migration.

Catatan rollout saat ini:
- Fondasi dibuat additive agar migrasi bisa benar-benar dilakukan satu per satu.
- `brand-*`, `slateui-*`, `.panel`, `.ghost-divider`, dan `.font-headline` masih dipertahankan sementara untuk menjaga halaman lama tetap hidup sampai tiap page dimigrasi.
- Sumber referensi dokumentasi: Vite `resolve.alias`, Tailwind config/plugin scanning, dan pola CVA dari Context7.

| Item | Status | Catatan |
|------|--------|---------|
| Fase 0.1 - Install dependencies | DONE | `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `tailwindcss-animate` sudah terpasang |
| Fase 0.2 - Setup path alias di Vite | DONE | Alias `@` ditambahkan di `vite.config.js` dengan pola ESM-compatible |
| Fase 0.3 - Buat `jsconfig.json` | DONE | `@/* -> ./src/*` sudah ditambahkan |
| Fase 0.4 - Buat `src/lib/utils.js` | DONE | Helper `cn()` sudah ditambahkan |
| Fase 0.5 - Tambah `src/styles/design-tokens.css` | DONE | Token design system sudah disalin ke source app |
| Fase 0.6 - Import design tokens di entry point | DONE | `src/main.jsx` sudah memuat `./styles/design-tokens.css` |
| Fase 0.7 - Sinkronkan `tailwind.config.js` | DONE | Token baru aktif, plugin baru aktif, palette lama tetap dipertahankan untuk transisi |
| Fase 0.8 - Bridge `src/index.css` | DONE | Legacy CSS variables tetap hidup tapi sekarang memetakan ke token baru |
| Fase 0.9 - Verifikasi foundation | DONE | `npm run lint` dan `npm run build` lulus; ada warning bundle size existing dan dynamic import existing, tapi bukan error migrasi |
| Fase 1.1 - Copy component primitives | DONE | `avatar`, `badge`, `button`, `card`, `hero-banner`, `input`, `list-item`, `nav-item`, `sidebar`, `stat-card`, `token-usage`, dan `index.js` sudah dibuat di `src/components/ui/` |
| Fase 1.2 - Buat `Alert` | DONE | `src/components/ui/alert.jsx` sudah dibuat |
| Fase 1.3 - Buat `Tabs` | DONE | `src/components/ui/tabs.jsx` sudah dibuat |
| Fase 1.4 - Buat `Modal` | DONE | `src/components/ui/modal.jsx` sudah dibuat |
| Fase 1.5 - Buat `EmptyState` | DONE | `src/components/ui/empty-state.jsx` sudah dibuat |
| Fase 1.6 - Buat `ProgressBar` | DONE | `src/components/ui/progress-bar.jsx` sudah dibuat |
| Fase 1.7 - Update barrel export | DONE | `src/components/ui/index.js` sudah mengekspor primitives baru dan existing UI files |
| Fase 1.8 - Verifikasi component library | DONE | `npm run lint` dan `npm run build` tetap lulus setelah seluruh UI primitives ditambahkan |
| Fase 1 - Component library primitives | DONE | 11 komponen sumber + 5 komponen baru + barrel export sudah siap dipakai |
| Fase 2.1 - Refactor `src/components/layout/Sidebar.jsx` | DONE | Main nav sudah memakai `NavItem`, palette pindah ke `primary-*` dan `neutral-*`, logic session/auth tetap dipertahankan |
| Fase 2.2 - Update `src/App.jsx` layout wrapper | DONE | Wrapper utama sudah pakai offset sidebar 270/72 dan container `rounded-xl bg-white shadow-sm` |
| Fase 2.3 - Verifikasi layout migration | IN PROGRESS | `npm run lint` dan `npm run build` lulus; visual browser untuk active state, collapse, dan mobile sidebar masih perlu cek manual |
| Fase 2 - Layout migration | IN PROGRESS | Refactor file selesai, tinggal verifikasi visual interaksi layout |
| Fase 3.1 - Migrate `LoginPage.jsx` | DONE | Login button, page card, feature cards, dan status badge sudah pindah ke primitives design system |
| Fase 3.2 - Migrate `TokenMonitorPage.jsx` | DONE | Summary cards, refresh action, alert, empty state, badges, dan execution log wrapper sudah pindah ke primitives design system |
| Fase 3.3 - Migrate `EmailPage.jsx` | DONE | Tab bar, search input, refresh action, dan error state sudah pindah ke primitives design system |
| Fase 3.4 - Migrate `SupervisorChat.jsx` | DONE | Header action, alert error, dan palette page shell sudah pindah ke primitives design system |
| Fase 3.5 - Migrate `FileWorkspace.jsx` | DONE | Tab switcher, CTA actions, alert, empty state, detail cards, dan upload modal sudah pindah ke primitives design system |
| Fase 3.6 - Migrate `CalendarPage.jsx` | DONE | Header, AI summary, daftar event, detail event, attendees, quick actions, custom request, error state, dan empty state sudah dipindah ke `Card`, `Button`, `Badge`, `Avatar`, `Alert`, `Input`, dan `EmptyState` |
| Fase 3.8 - Migrate `Dashboard.jsx` | DONE | Layout dipecah ulang menjadi topbar, hero, dan 4 kartu utama; data dashboard kini menggabungkan briefing cache, raw Jira, raw Calendar, raw Email, dan token usage log agar lebih sesuai dengan struktur UI target |
| Fase 3 - Page-by-page migration | IN PROGRESS | Tujuh halaman sudah selesai di level file, sisa fokus utama ada di Jira page dan sub-component migration |
| Fase 4 - Sub-component refactor | TODO | Menunggu page migration berjalan |
| Fase 5 - Cleanup dan verification final | TODO | Dilakukan setelah semua page pindah |

---

# Design System Migration Plan

> **AI Team Assistant — Executive Canvas Dashboard**
> Migration Plan v1.0 | Author: AI Assistant | Date: June 2025
> Target: Restrukturisasi UI agar modular, reusable, dan zero-redundancy

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Kondisi Saat Ini (AS-IS)](#2-kondisi-saat-ini-as-is)
3. [Target Akhir (TO-BE)](#3-target-akhir-to-be)
4. [Fase 0 — Foundation Setup](#4-fase-0--foundation-setup)
5. [Fase 1 — Component Library](#5-fase-1--component-library)
6. [Fase 2 — Layout Migration](#6-fase-2--layout-migration)
7. [Fase 3 — Page-by-Page Migration](#7-fase-3--page-by-page-migration)
8. [Fase 4 — Sub-Component Refactor](#8-fase-4--sub-component-refactor)
9. [Fase 5 — Cleanup & Verification](#9-fase-5--cleanup--verification)
10. [Komponen Baru yang Perlu Dibuat](#10-komponen-baru-yang-perlu-dibuat)
11. [Mapping Warna Lama → Baru](#11-mapping-warna-lama--baru)
12. [Checklist per Halaman](#12-checklist-per-halaman)
13. [Testing & QA](#13-testing--qa)
14. [Risiko & Mitigasi](#14-risiko--mitigasi)

---

## 1. Ringkasan Eksekutif

### Apa yang dilakukan?
Migrasi seluruh UI dari inline/hardcoded styling ke **design system terpusat** berbasis shadcn/ui pattern. Semua komponen akan reusable, modular, dan menggunakan design tokens yang konsisten.

### Kenapa?
- **11 komponen** sudah siap di `design-system/` tapi belum terintegrasi
- **Hanya 3 file** di `src/components/ui/` (dan bukan primitives)
- **5+ implementasi berbeda** untuk button, badge, stat card, error alert
- **3 color palette** tercampur (`brand-*` blue, `gray-*`, hardcoded hex)
- Setiap page re-implement UI dari nol → maintenance nightmare

### Hasil akhir?
- Satu sumber kebenaran: `src/components/ui/`
- Import bersih: `import { Button, Card, Badge } from "@/components/ui"`
- Warna konsisten: Orange-Red `#E84322` sebagai primary
- Zero redundansi antar halaman

### Estimasi effort?
| Fase | Effort | Risiko |
|------|--------|--------|
| Fase 0 (Foundation) | 1-2 jam | Rendah |
| Fase 1 (Components) | 2-3 jam | Rendah |
| Fase 2 (Layout) | 2-3 jam | Medium |
| Fase 3 (Pages) | 6-10 jam | Medium |
| Fase 4 (Sub-components) | 3-4 jam | Rendah |
| Fase 5 (Cleanup) | 1-2 jam | Rendah |
| **Total** | **15-24 jam** | — |

---

## 2. Kondisi Saat Ini (AS-IS)

### 2.1. Tech Stack
| Layer | Technology |
|-------|-----------|
| Build | Vite 5.2 |
| Frontend | React 18.3 (JSX, no TypeScript) |
| Routing | React Router DOM 6.23 |
| State | Zustand 4.5 |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |

### 2.2. File Structure (Current)
```
src/
├── components/
│   ├── ui/                     # HANYA 3 FILE (bukan primitives)
│   │   ├── AgentCard.jsx       # Domain-specific
│   │   ├── SettingsModal.jsx   # Domain-specific
│   │   └── SkeletonLoader.jsx  # Satu-satunya primitive (jarang diimport)
│   ├── layout/
│   │   ├── Sidebar.jsx         # 497 baris, inline styling
│   │   └── MobileHeader.jsx
│   ├── chat/
│   ├── dashboard/
│   ├── email/
│   ├── files/
│   └── integrations/
├── pages/                      # 10 halaman, semua inline styling
├── index.css                   # Global styles + old tokens
└── main.jsx
```

### 2.3. Masalah Redundansi

| Pattern | Jumlah Implementasi | File |
|---------|-------------------|------|
| **Stat/Metric Card** | 3+ | Dashboard (`MetricTile`), JiraPage (`MetricCard`), TokenMonitor (inline) |
| **Button** | 5+ warna berbeda | Semua halaman |
| **Error Alert** | 5+ varian | Dashboard, TokenMonitor, JiraPage, EmailPage, SupervisorChat, CalendarPage |
| **Badge/Pill** | 4+ | Dashboard, JiraPage, CalendarPage, BriefingCard |
| **Tab Bar** | 3 implementasi | EmailPage, JiraPage, FileWorkspace |
| **Skeleton Loader** | Komponen ada tapi jarang diimport | Semua halaman pakai raw CSS class |
| **Modal** | 2 hand-rolled | SettingsModal, FileWorkspace |
| **Empty State** | 5+ | Dashboard, TokenMonitor, JiraPage, CalendarPage, FileWorkspace |

### 2.4. Inkonsistensi Warna

| Palette | Dipakai di |
|---------|-----------|
| `brand-*` (blue #006184) | Dashboard, Sidebar, FileWorkspace |
| `gray-*` | EmailPage, AgentCard, SettingsModal, BriefingCard |
| `slate-*` | TokenMonitor, JiraIntegration, CalendarPage |
| `blue-600` (raw) | EmailPage, AgentCard |
| `cyan-700` (raw) | CalendarPage |
| Hardcoded hex (`#ff623d`) | JiraPage |

### 2.5. Missing Dependencies
Package yang dibutuhkan design system tapi **belum terinstall**:
- `class-variance-authority` — CVA untuk variant management
- `clsx` — Conditional class merging
- `tailwind-merge` — Intelligent Tailwind class deduplication
- `@radix-ui/react-slot` — Polymorphic component support
- `tailwindcss-animate` — Animation utilities

### 2.6. Missing Configuration
- **Tidak ada path alias** (`@/`) di `vite.config.js`
- **Tidak ada `jsconfig.json`** untuk IDE support
- **Tidak ada `src/lib/utils.js`** (cn helper)
- **Tidak ada `src/styles/design-tokens.css`**

---

## 3. Target Akhir (TO-BE)

### 3.1. File Structure (Target)
```
src/
├── components/
│   ├── ui/                         # DESIGN SYSTEM PRIMITIVES
│   │   ├── alert.jsx               # NEW — Error/Warning/Info/Success alerts
│   │   ├── avatar.jsx              # FROM design-system/
│   │   ├── badge.jsx               # FROM design-system/
│   │   ├── button.jsx              # FROM design-system/
│   │   ├── card.jsx                # FROM design-system/
│   │   ├── empty-state.jsx         # NEW — Reusable empty state
│   │   ├── hero-banner.jsx         # FROM design-system/
│   │   ├── input.jsx               # FROM design-system/
│   │   ├── list-item.jsx           # FROM design-system/
│   │   ├── modal.jsx               # NEW — Reusable modal/dialog
│   │   ├── nav-item.jsx            # FROM design-system/
│   │   ├── progress-bar.jsx        # NEW — Reusable progress bar
│   │   ├── sidebar.jsx             # FROM design-system/ (reference)
│   │   ├── skeleton-loader.jsx     # REFACTORED
│   │   ├── stat-card.jsx           # FROM design-system/
│   │   ├── tabs.jsx                # NEW — Reusable tab bar
│   │   ├── token-usage.jsx         # FROM design-system/
│   │   ├── AgentCard.jsx           # REFACTORED — pakai primitives
│   │   ├── SettingsModal.jsx       # REFACTORED — pakai Modal, Button, Input
│   │   └── index.js                # BARREL EXPORT
│   ├── layout/
│   │   ├── Sidebar.jsx             # REFACTORED — pakai NavItem, Avatar
│   │   └── MobileHeader.jsx        # REFACTORED
│   ├── chat/                       # REFACTORED — pakai primitives
│   ├── dashboard/                  # REFACTORED
│   ├── email/                      # REFACTORED
│   ├── files/                      # REFACTORED
│   └── integrations/               # REFACTORED
├── lib/
│   └── utils.js                    # cn() helper — NEW
├── styles/
│   └── design-tokens.css           # CSS custom properties — NEW
├── pages/                          # ALL REFACTORED
├── index.css                       # CLEANED UP (hapus old tokens)
└── main.jsx                        # + import design-tokens.css
```

### 3.2. Import Pattern (Target)
```jsx
// SEBELUM (scattered, relative, inconsistent)
// Tidak ada shared components, semua inline

// SESUDAH (clean, centralized)
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input } from "@/components/ui";
import { Alert } from "@/components/ui";
import { StatCard } from "@/components/ui";
```

### 3.3. Color Palette (Target)
| Token | Hex | Usage |
|-------|-----|-------|
| `primary-500` | `#E84322` | CTA, active nav, links |
| `primary-600` | `#C73415` | Hover state |
| `primary-700` | `#A0250E` | Active/pressed |
| `primary-50` | `#FFF2EF` | Subtle backgrounds |
| `neutral-900` | `#111111` | Headings |
| `neutral-700` | `#333333` | Body text |
| `neutral-500` | `#666666` | Secondary text |
| `neutral-200` | `#E5E5E5` | Borders |
| `neutral-100` | `#F2F2F2` | Input backgrounds |

---

## 4. Fase 0 — Foundation Setup

> **Goal:** Menyiapkan infrastruktur tanpa mengubah tampilan apapun.
> **Effort:** 1-2 jam | **Risiko:** Rendah

### Step 0.1 — Install Dependencies

```bash
npm install class-variance-authority clsx tailwind-merge @radix-ui/react-slot tailwindcss-animate
```

**Verifikasi:** `package.json` harus memiliki 5 package baru di `dependencies`.

### Step 0.2 — Setup Path Alias di Vite

Edit `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
})
```

### Step 0.3 — Buat `jsconfig.json` di Root

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**Fungsi:** IDE autocomplete dan path resolution untuk `@/` imports.

### Step 0.4 — Buat `src/lib/utils.js`

```js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes intelligently.
 * Digunakan oleh semua komponen design system.
 * @param {...(string|undefined|null|boolean)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Step 0.5 — Buat `src/styles/design-tokens.css`

Copy **seluruh isi** dari `design-system/design-tokens.css` ke `src/styles/design-tokens.css`.

> **PENTING:** Jangan hapus file asli di `design-system/` — itu tetap jadi referensi.

### Step 0.6 — Import Design Tokens di Entry Point

Edit `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ensureProdEnvironmentOnStartup } from './services/api'
import './styles/design-tokens.css'  // ← TAMBAH INI (sebelum index.css)
import './index.css'

ensureProdEnvironmentOnStartup()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 0.7 — Replace `tailwind.config.js`

Ganti **seluruh isi** `tailwind.config.js` di root project dengan versi design system, tapi **sesuaikan content paths** untuk Vite:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50:  "#FFF2EF",
          100: "#FFD9CE",
          200: "#FFB4A0",
          300: "#FF8A6B",
          400: "#FF5F3F",
          500: "#E84322",
          600: "#C73415",
          700: "#A0250E",
          800: "#6B1508",
          900: "#3A0802",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neutral: {
          0:   "#FFFFFF",
          50:  "#F9F9F9",
          100: "#F2F2F2",
          200: "#E5E5E5",
          300: "#CCCCCC",
          400: "#999999",
          500: "#666666",
          600: "#4D4D4D",
          700: "#333333",
          800: "#1F1F1F",
          900: "#111111",
        },
        success: { DEFAULT: "#22C55E", bg: "#DCFCE7" },
        warning: { DEFAULT: "#F59E0B", bg: "#FEF3C7" },
        error:   { DEFAULT: "#EF4444", bg: "#FEE2E2" },
        info:    { DEFAULT: "#3B82F6", bg: "#DBEAFE" },
        urgent:  { bg: "#FEE2E2", text: "#E84322" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      fontSize: {
        xs:   ["0.75rem", { lineHeight: "1.4" }],
        sm:   ["0.8125rem", { lineHeight: "1.5" }],
        base: ["0.875rem", { lineHeight: "1.6" }],
        md:   ["1rem", { lineHeight: "1.6" }],
        lg:   ["1.25rem", { lineHeight: "1.4" }],
        xl:   ["1.5rem", { lineHeight: "1.3" }],
        "2xl":["2rem", { lineHeight: "1.2" }],
        "3xl":["2.5rem", { lineHeight: "1.1" }],
      },
      spacing: {
        sidebar: "270px",
        topbar:  "64px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        xs:    "0 1px 2px rgba(0, 0, 0, 0.04)",
        sm:    "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        md:    "0 4px 12px rgba(0, 0, 0, 0.08)",
        lg:    "0 8px 24px rgba(0, 0, 0, 0.12)",
        xl:    "0 16px 48px rgba(0, 0, 0, 0.16)",
        stat:  "0 4px 16px rgba(232, 67, 34, 0.25)",
        focus: "0 0 0 3px rgba(232, 67, 34, 0.2)",
      },
      backgroundImage: {
        "gradient-hero":  "linear-gradient(90deg, #E84322 0%, #1F1F1F 100%)",
        "gradient-stat":  "linear-gradient(135deg, #FF5F3F 0%, #C73415 100%)",
        "gradient-token": "linear-gradient(135deg, #E84322 0%, #1F1F1F 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.25s ease-out",
        shimmer:          "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
```

### Step 0.8 — Update `src/index.css`

Hapus CSS variables lama yang akan diganti oleh `design-tokens.css`. Pertahankan utility classes yang masih berguna:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Layout sizing (tetap dipakai oleh Sidebar context) */
    --sidebar-width: 270px;
    --sidebar-width-collapsed: 72px;
    --header-height: 64px;
  }

  @media (max-width: 768px) {
    :root {
      --sidebar-width: 0px;
    }
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html, body {
    font-family: 'Inter', system-ui, sans-serif;
  }

  body {
    background: var(--surface-page);
    color: var(--text-secondary);
    margin: 0;
    min-height: 100dvh;
  }

  #root {
    min-height: 100dvh;
    display: flex;
  }
}

@layer components {
  /* Utility classes yang tetap dipertahankan */
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-neutral-300);
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-neutral-500);
  }

  .sidebar-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .sidebar-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-neutral-300);
    border-radius: 9999px;
  }

  .skeleton {
    background: linear-gradient(90deg, var(--color-neutral-200) 0%, var(--color-neutral-100) 50%, var(--color-neutral-200) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
}
```

### Step 0.9 — Verifikasi Foundation

```bash
# 1. Pastikan dev server berjalan tanpa error
npm run dev:client

# 2. Buka browser, pastikan halaman masih tampil (mungkin warna berubah — itu expected)
# 3. Cek console — tidak boleh ada error import atau module not found
```

**Checklist Fase 0:**
- [ ] Dependencies terinstall (`npm ls class-variance-authority clsx tailwind-merge`)
- [ ] `vite.config.js` punya `resolve.alias`
- [ ] `jsconfig.json` ada di root
- [ ] `src/lib/utils.js` ada dan export `cn()`
- [ ] `src/styles/design-tokens.css` ada
- [ ] `src/main.jsx` import `design-tokens.css`
- [ ] `tailwind.config.js` sudah versi baru
- [ ] `src/index.css` sudah di-cleanup
- [ ] Dev server berjalan tanpa error

---

## 5. Fase 1 — Component Library

> **Goal:** Semua primitives tersedia di `src/components/ui/`.
> **Effort:** 2-3 jam | **Risiko:** Rendah (hanya menambah file baru)

### Step 1.1 — Copy Komponen dari Design System

Copy file-file berikut dari `design-system/` ke `src/components/ui/`:

| Source | Target | Catatan |
|--------|--------|---------|
| `design-system/button.jsx` | `src/components/ui/button.jsx` | Tidak perlu modifikasi |
| `design-system/badge.jsx` | `src/components/ui/badge.jsx` | Tidak perlu modifikasi |
| `design-system/card.jsx` | `src/components/ui/card.jsx` | Tidak perlu modifikasi |
| `design-system/input.jsx` | `src/components/ui/input.jsx` | Tidak perlu modifikasi |
| `design-system/avatar.jsx` | `src/components/ui/avatar.jsx` | Tidak perlu modifikasi |
| `design-system/stat-card.jsx` | `src/components/ui/stat-card.jsx` | Tidak perlu modifikasi |
| `design-system/list-item.jsx` | `src/components/ui/list-item.jsx` | Tidak perlu modifikasi |
| `design-system/nav-item.jsx` | `src/components/ui/nav-item.jsx` | Tidak perlu modifikasi |
| `design-system/sidebar.jsx` | `src/components/ui/sidebar.jsx` | Sebagai referensi layout |
| `design-system/hero-banner.jsx` | `src/components/ui/hero-banner.jsx` | Tidak perlu modifikasi |
| `design-system/token-usage.jsx` | `src/components/ui/token-usage.jsx` | Tidak perlu modifikasi |

> **PENTING:** Semua komponen ini sudah menggunakan `import { cn } from "@/lib/utils"` — pastikan Fase 0 sudah selesai.

### Step 1.2 — Buat Komponen Baru: `alert.jsx`

Buat `src/components/ui/alert.jsx`:

```jsx
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

/**
 * Alert — Reusable alert/banner untuk error, warning, success, info
 * Menggantikan semua inline error alerts di seluruh halaman
 */
const alertVariants = cva(
  "flex items-start gap-3 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        error:   "border-error/30 bg-error-bg text-error",
        warning: "border-warning/30 bg-warning-bg text-warning",
        success: "border-success/30 bg-success-bg text-success",
        info:    "border-info/30 bg-info-bg text-info",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  }
);

const alertIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

function Alert({ className, variant = "error", icon, title, children, onDismiss, ...props }) {
  const Icon = icon || alertIcons[variant];

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      {Icon && <Icon className="h-4 w-4 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export { Alert, alertVariants };
```

### Step 1.3 — Buat Komponen Baru: `tabs.jsx`

Buat `src/components/ui/tabs.jsx`:

```jsx
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Tabs — Reusable tab bar
 * Menggantikan 3 implementasi tab berbeda di EmailPage, JiraPage, FileWorkspace
 *
 * Usage:
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsList>
 *     <TabsTrigger value="inbox" icon={<Mail />}>Inbox</TabsTrigger>
 *     <TabsTrigger value="drafts" icon={<Edit />}>Drafts</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 */
function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

function TabsList({ children, value, onValueChange, className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-neutral-200",
        className
      )}
      role="tablist"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isActive: child.props.value === value,
            onClick: () => onValueChange?.(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsTrigger({ children, icon, isActive, onClick, className, value, ...props }) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
        isActive
          ? "border-primary-500 text-primary-500"
          : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export { Tabs, TabsList, TabsTrigger };
```

### Step 1.4 — Buat Komponen Baru: `modal.jsx`

Buat `src/components/ui/modal.jsx`:

```jsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * Modal — Reusable modal/dialog
 * Menggantikan hand-rolled modals di SettingsModal dan FileWorkspace
 *
 * Usage:
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Settings">
 *   <ModalBody>...</ModalBody>
 *   <ModalFooter>...</ModalFooter>
 * </Modal>
 */
function Modal({ open, onClose, title, description, children, className, size = "md" }) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={cn(
          "relative w-full rounded-xl bg-white shadow-xl animate-fade-in",
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-bold text-neutral-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-neutral-500 mt-1">{description}</p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function ModalBody({ children, className }) {
  return <div className={cn("px-6 pb-4", className)}>{children}</div>;
}

function ModalFooter({ children, className }) {
  return (
    <div className={cn("flex items-center justify-end gap-3 px-6 pb-6 pt-2", className)}>
      {children}
    </div>
  );
}

export { Modal, ModalBody, ModalFooter };
```

### Step 1.5 — Buat Komponen Baru: `empty-state.jsx`

Buat `src/components/ui/empty-state.jsx`:

```jsx
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — Placeholder saat data kosong
 * Menggantikan 5+ inline empty states di berbagai halaman
 *
 * Usage:
 * <EmptyState
 *   icon={<Inbox className="h-12 w-12" />}
 *   title="No emails yet"
 *   description="Your inbox is empty"
 *   action={<Button>Refresh</Button>}
 * />
 */
function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {icon && (
        <div className="mb-4 text-neutral-300">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-neutral-700 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-neutral-500 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}

export { EmptyState };
```

### Step 1.6 — Buat Komponen Baru: `progress-bar.jsx`

Buat `src/components/ui/progress-bar.jsx`:

```jsx
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ProgressBar — Reusable progress indicator
 *
 * Usage:
 * <ProgressBar value={75} max={100} variant="primary" />
 * <ProgressBar value={842000} max={1000000} variant="gradient" label="842k / 1M" />
 */
function ProgressBar({ value = 0, max = 100, variant = "primary", label, showPercentage, className }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const barVariants = {
    primary: "bg-primary-500",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    gradient: "bg-gradient-stat",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-neutral-500">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-medium text-neutral-700">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barVariants[variant])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
```

### Step 1.7 — Update Barrel Export `index.js`

Buat/replace `src/components/ui/index.js`:

```js
/**
 * AI Team Assistant — Component Library Index
 * Import bersih: import { Button, Card, Badge } from "@/components/ui"
 */

// Atoms
export { Button, buttonVariants } from "./button";
export { Badge, badgeVariants } from "./badge";
export { Input } from "./input";
export { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from "./avatar";

// Molecules
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
export { StatCard } from "./stat-card";
export { ListItem } from "./list-item";
export { NavItem } from "./nav-item";

// Organisms
export { Sidebar } from "./sidebar";
export { HeroBanner } from "./hero-banner";
export { TokenUsage } from "./token-usage";

// Utilities / Feedback
export { Alert, alertVariants } from "./alert";
export { Tabs, TabsList, TabsTrigger } from "./tabs";
export { Modal, ModalBody, ModalFooter } from "./modal";
export { EmptyState } from "./empty-state";
export { ProgressBar } from "./progress-bar";
```

### Step 1.8 — Verifikasi Fase 1

```bash
# Dev server harus berjalan tanpa error
npm run dev:client

# Test import di console atau temporary file:
# import { Button, Card, Badge, Alert, Tabs } from "@/components/ui"
# → Tidak boleh ada error
```

**Checklist Fase 1:**
- [ ] 11 komponen dari design-system/ sudah di `src/components/ui/`
- [ ] 5 komponen baru (Alert, Tabs, Modal, EmptyState, ProgressBar) sudah dibuat
- [ ] `index.js` barrel export lengkap
- [ ] Semua import `@/lib/utils` resolve tanpa error
- [ ] Dev server berjalan normal

---

## 6. Fase 2 — Layout Migration

> **Goal:** Sidebar dan layout utama menggunakan design system.
> **Effort:** 2-3 jam | **Risiko:** Medium (Sidebar dipakai di semua halaman)

### Step 2.1 — Refactor `src/components/layout/Sidebar.jsx`

**Prinsip refactor:**
1. Import `NavItem` dari `@/components/ui`
2. Ganti semua `brand-*` (blue) → `primary-*` (orange-red)
3. Ganti `slateui-*` → `neutral-*`
4. Pertahankan semua logic (session list, collapse, auth) — hanya ubah styling

**Mapping warna di Sidebar:**
| Lama | Baru |
|------|------|
| `bg-brand-600` | `bg-primary-500` |
| `text-brand-600` | `text-primary-500` |
| `bg-brand-50` | `bg-primary-50` |
| `hover:bg-brand-50` | `hover:bg-primary-50` |
| `text-slateui-900` | `text-neutral-900` |
| `text-slateui-500` | `text-neutral-500` |
| `text-slateui-700` | `text-neutral-700` |
| `border-brand-600` | `border-primary-500` |

**Contoh refactor NavLink item:**
```jsx
// SEBELUM
<NavLink
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
    ${isActive
      ? 'bg-brand-600 text-white shadow-md'
      : 'text-slateui-700 hover:bg-brand-50 hover:text-brand-600'
    }`
  }
>

// SESUDAH — gunakan NavItem dari design system
<NavItem
  icon={<LayoutDashboard className="h-5 w-5" />}
  label="Dashboard"
  active={isActive}
  onClick={() => navigate("/")}
/>
```

### Step 2.2 — Update `src/App.jsx` Layout Wrapper

Ganti hardcoded styling di Layout component:

```jsx
// SEBELUM
<div className="min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-2.5rem)] overflow-hidden rounded-[1.25rem] bg-white/70 backdrop-blur-md shadow-[0_20px_40px_rgba(25,28,29,0.05)]">

// SESUDAH — pakai design tokens
<div className="min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-2.5rem)] overflow-hidden rounded-xl bg-white shadow-sm">
```

### Step 2.3 — Verifikasi

- [ ] Sidebar tampil dengan warna orange-red
- [ ] NavItem active state benar (background primary-500, text putih)
- [ ] Collapse/expand masih berfungsi
- [ ] Mobile sidebar masih berfungsi
- [ ] Semua navigasi masih bekerja

---

## 7. Fase 3 — Page-by-Page Migration

> **Goal:** Setiap halaman menggunakan komponen dari library.
> **Effort:** 6-10 jam | **Risiko:** Medium
> **Urutan:** Dari yang paling sederhana ke paling kompleks.

### Aturan Umum Refactor Halaman

1. **Import dari library:**
   ```jsx
   import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert, EmptyState } from "@/components/ui";
   ```

2. **Hapus inline sub-components** yang sudah ada di library (MetricTile, MetricCard, HeaderBadge, dll)

3. **Ganti semua warna:**
   | Lama | Baru |
   |------|------|
   | `bg-brand-600` | `bg-primary-500` |
   | `bg-blue-600` | `bg-primary-500` |
   | `bg-slate-900` | `bg-primary-500` atau `bg-neutral-900` |
   | `bg-cyan-700` | `bg-primary-500` |
   | `text-gray-*` | `text-neutral-*` |
   | `border-gray-*` | `border-neutral-*` |
   | `bg-gray-*` | `bg-neutral-*` |
   | `text-slate-*` | `text-neutral-*` |
   | `bg-rose-50` | Gunakan `<Alert variant="error">` |
   | `bg-red-50` | Gunakan `<Alert variant="error">` |

4. **Ganti inline error alerts:**
   ```jsx
   // SEBELUM (5+ varian berbeda di berbagai file)
   <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-xl p-4 text-sm">
     <p className="font-medium">Error</p>
     <p>{error}</p>
   </div>

   // SESUDAH (satu komponen, konsisten)
   <Alert variant="error" title="Error">{error}</Alert>
   ```

5. **Ganti inline buttons:**
   ```jsx
   // SEBELUM
   <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
     Refresh
   </button>

   // SESUDAH
   <Button variant="primary" size="md">Refresh</Button>
   ```

6. **Ganti inline skeleton:**
   ```jsx
   // SEBELUM
   <div className="skeleton h-24 rounded-xl" />

   // SESUDAH — tetap boleh pakai class .skeleton untuk simple cases
   // ATAU import SkeletonLoader untuk complex layouts
   ```

---

### 3.1 — LoginPage.jsx (115 baris)

**Komponen yang dipakai:** `Button`, `Card`, `Badge`

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Login button | Inline gradient button | `<Button variant="primary" size="lg">` |
| Feature cards | Inline div styling | `<Card>` + `<CardContent>` |
| Status badge | Inline span | `<Badge variant="success">` |
| Page card | Inline rounded div | `<Card className="max-w-md mx-auto">` |

---

### 3.2 — TokenMonitorPage.jsx (236 baris)

**Komponen yang dipakai:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, `StatCard`, `Badge`, `Button`, `Alert`, `EmptyState`

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Summary stat cards (4) | Inline card rendering | `<StatCard label="..." value={...} caption="..." />` |
| Refresh button | Inline styled button | `<Button variant="outline" size="sm">` + loading icon |
| Error alert | `bg-rose-50 border-rose-200` div | `<Alert variant="error">{error}</Alert>` |
| Execution log rows | Inline table rows | `<Card>` wrapper + styled rows |
| Badges (workflow, model) | Inline spans | `<Badge variant="info">` / `<Badge variant="outline">` |
| Empty state | Inline div | `<EmptyState icon={...} title="..." />` |
| Skeleton | Raw `.skeleton` class | Tetap boleh pakai `.skeleton` class |

---

### 3.3 — EmailPage.jsx (286 baris)

**Komponen yang dipakai:** `Tabs`, `TabsList`, `TabsTrigger`, `Input`, `Button`, `Alert`

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Tab bar (4 tabs) | 4x inline button with border-b logic | `<Tabs>` + `<TabsList>` + `<TabsTrigger>` |
| Search input | Inline input with icon | `<Input icon={<Search />} placeholder="Search..." />` |
| Refresh button | Inline button | `<Button variant="ghost" size="icon">` |
| Error alert | `bg-red-50 border-red-200` | `<Alert variant="error">` |
| All `gray-*` classes | `text-gray-600`, `bg-gray-100` | `text-neutral-500`, `bg-neutral-100` |

---

### 3.4 — SupervisorChat.jsx (341 baris)

**Komponen yang dipakai:** `Button`, `Alert`, `Avatar`

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Clear history button | Inline button | `<Button variant="ghost" size="sm">` |
| Error alert | `bg-red-50 border-red-200` | `<Alert variant="error">` |
| Header buttons | Inline icon buttons | `<Button variant="ghost" size="icon">` |
| `brand-*` colors | `text-brand-600` | `text-primary-500` |
| `slateui-*` colors | `text-slateui-900` | `text-neutral-900` |

---

### 3.5 — FileWorkspace.jsx (519 baris)

**Komponen yang dipakai:** `Card`, `Tabs`, `TabsList`, `TabsTrigger`, `Button`, `Badge`, `Modal`, `ModalBody`, `ModalFooter`, `EmptyState`

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Tab switcher | Pill/segment tabs | `<Tabs>` (bisa custom className untuk pill style) |
| Upload modal | Hand-rolled backdrop + card | `<Modal open={...} onClose={...} title="Upload">` |
| Document cards | Inline styled divs | `<Card>` + selection ring |
| Badges (type, category) | Inline spans | `<Badge variant="info">` / `<Badge variant="outline">` |
| Action buttons | Mixed colors | `<Button variant="primary">` / `<Button variant="outline">` |
| Empty state | Inline div | `<EmptyState icon={...} title="..." />` |
| Detail sidebar | Inline panel | `<Card>` with custom layout |

---

### 3.6 — CalendarPage.jsx (674 baris)

**Komponen yang dipakai:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, `Badge`, `Avatar`, `AvatarGroup`, `Alert`, `EmptyState`

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Event cards | Inline styled divs | `<Card>` with click handler |
| Status badges | Inline pills | `<Badge variant="success/warning/info">` |
| Attendee avatars | Inline img circles | `<Avatar>` + `<AvatarGroup>` |
| Quick action buttons | Repeated inline buttons | `<Button variant="outline" size="sm">` |
| AI Summary card | Duplicated desktop/mobile | Extract to `<AISummaryCard>` local component, render once |
| Error alert | `border-rose-200 bg-rose-50` | `<Alert variant="error">` |
| Empty state | Inline div | `<EmptyState icon={...} title="..." />` |
| Refresh button | Inline button | `<Button variant="ghost" size="icon">` |
| `cyan-*` colors | `bg-cyan-700`, `text-cyan-600` | `bg-primary-500`, `text-primary-500` |

---

### 3.7 — JiraPage.jsx (781 baris)

**Komponen yang dipakai:** `HeroBanner`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `StatCard`, `Button`, `Badge`, `Tabs`, `TabsList`, `TabsTrigger`, `Alert`, `EmptyState`, `ProgressBar`

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Hero banner gradient | Inline gradient div | `<HeroBanner title="..." description="..." />` |
| `MetricCard` (inline) | Local component | `<StatCard label="..." value={...} caption="..." />` |
| Tab bar | Inline border-b tabs | `<Tabs>` + `<TabsList>` + `<TabsTrigger>` |
| Kanban lane cards | Inline styled divs | `<Card>` per lane |
| Issue cards | Inline styled divs | `<Card>` per issue |
| Priority badges | Inline colored spans | `<Badge variant="error/warning/info">` |
| Status badges | Inline colored spans | `<Badge variant="success/warning/info">` |
| Progress bar | Inline div | `<ProgressBar value={...} max={...} />` |
| Error alert | `border-rose-200 bg-rose-50` | `<Alert variant="error">` |
| Hardcoded hex colors | `#ff6a45`, `#2563ff`, etc. | Design system tokens |
| `shadow-[0_12px_35px_...]` | Repeated custom shadow | `shadow-sm` atau `shadow-md` |

**Hapus:** Local `MetricCard` component, `getLaneTheme()` hardcoded colors.

---

### 3.8 — Dashboard.jsx (818 baris, paling kompleks)

**Komponen yang dipakai:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `StatCard`, `Button`, `Badge`, `Alert`, `EmptyState`, `ListItem`, `Avatar`, `ProgressBar`

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| `MetricTile` (inline) | Local component | `<StatCard label="..." value={...} />` |
| `CardHeader` (inline) | Local component | `<CardHeader>` dari design system |
| `HeaderBadge` (inline) | Local component | `<Badge variant="default/urgent">` |
| `ActionLink` (inline) | Local component | `<Button variant="link" size="sm">` |
| `SummaryBulletList` (inline) | Local component | Bisa tetap inline atau extract ke local |
| Section cards (4) | Inline article elements | `<Card>` + sub-components |
| Error alert | `border-rose-200 bg-rose-50` | `<Alert variant="error">` |
| Skeleton loaders | Raw `.skeleton` class | Tetap boleh pakai `.skeleton` |
| `brand-*` colors | `text-brand-600`, `bg-brand-50` | `text-primary-500`, `bg-primary-50` |
| `slateui-*` colors | `text-slateui-900` | `text-neutral-900` |

**Hapus:** Local `MetricTile`, `CardHeader`, `HeaderBadge`, `ActionLink` components.

---

## 8. Fase 4 — Sub-Component Refactor

> **Goal:** Komponen feature-specific juga menggunakan primitives.
> **Effort:** 3-4 jam | **Risiko:** Rendah

### 4.1 — `src/components/ui/AgentCard.jsx`

| Refactor | Detail |
|----------|--------|
| Buttons | Ganti inline buttons → `<Button>` |
| Input | Ganti inline input → `<Input>` |
| Badges | Ganti inline spans → `<Badge>` |
| Colors | `gray-*` → `neutral-*`, `blue-600` → `primary-500` |

### 4.2 — `src/components/ui/SettingsModal.jsx`

| Refactor | Detail |
|----------|--------|
| Modal wrapper | Ganti hand-rolled modal → `<Modal>` + `<ModalBody>` + `<ModalFooter>` |
| Buttons | Ganti inline buttons → `<Button>` |
| Inputs | Ganti inline inputs → `<Input>` |
| Colors | `gray-*` → `neutral-*`, `brand-600` → `primary-500` |

### 4.3 — `src/components/dashboard/BriefingCard.jsx`

| Refactor | Detail |
|----------|--------|
| Card wrapper | → `<Card>` + `<CardHeader>` + `<CardContent>` |
| Priority badge | → `<Badge variant="...">` |
| Action button | → `<Button>` |
| Colors | `gray-*` → `neutral-*`, `blue-*` → `primary-*` |

### 4.4 — `src/components/integrations/JiraIntegrationCard.jsx`

| Refactor | Detail |
|----------|--------|
| Card wrapper | → `<Card>` |
| Form inputs | → `<Input>` |
| Buttons | → `<Button variant="primary">` / `<Button variant="destructive">` |
| Status badge | → `<Badge variant="success">Active</Badge>` |
| Error alert | → `<Alert variant="error">` |
| Colors | `slate-900` → `primary-500`, `slate-*` → `neutral-*` |

### 4.5 — Email Components (`src/components/email/`)

| File | Refactor |
|------|----------|
| `EmailList.jsx` | Gunakan `<ListItem>` untuk email rows, `<Badge>` untuk labels |
| `EmailDetail.jsx` | Gunakan `<Card>`, `<Button>`, `<Avatar>`, `<Badge>` |
| `Top5EmailSummary.jsx` | Gunakan `<Card>`, `<Badge>`, `<Button>` |
| `DraftsList.jsx` | Gunakan `<Card>`, `<Badge>`, `<Button>` |
| `DraftRevisionChat.jsx` | Gunakan `<Card>`, `<Button>`, `<Input>` |

### 4.6 — Chat Components (`src/components/chat/`)

| File | Refactor |
|------|----------|
| `ChatBubble.jsx` | Gunakan `<Avatar>` untuk sender avatar |
| `MessageInput.jsx` | Gunakan `<Input>` atau custom (chat input biasanya custom) |
| `AgentStatusIndicator.jsx` | Gunakan `<Badge>` untuk status |

### 4.7 — File Components (`src/components/files/`)

| File | Refactor |
|------|----------|
| `FolderTree.jsx` | Gunakan `<Button variant="ghost">` untuk tree items |
| `UploadZone.jsx` | Gunakan `<Card>`, `<Button>` |
| `FilePreviewModal.jsx` | Gunakan `<Modal>`, `<Button>` |

---

## 9. Fase 5 — Cleanup & Verification

> **Goal:** Pastikan tidak ada sisa inkonsistensi.
> **Effort:** 1-2 jam | **Risiko:** Rendah

### 5.1 — Audit Warna

Jalankan search di seluruh `src/`:

```bash
# Cari sisa warna lama yang harus diganti
grep -rn "brand-" src/
grep -rn "slateui-" src/
grep -rn "gray-" src/          # Harus 0 hasil (semua jadi neutral-*)
grep -rn "cyan-" src/          # Harus 0 hasil
grep -rn "blue-600" src/       # Harus 0 hasil
grep -rn "#006184" src/        # Harus 0 hasil
grep -rn "#007ba7" src/        # Harus 0 hasil
grep -rn "#ff623d" src/        # Harus 0 hasil
grep -rn "bg-rose-" src/       # Harus 0 (diganti Alert)
grep -rn "bg-red-50" src/      # Harus 0 (diganti Alert)
```

### 5.2 — Audit Inline Components

Pastikan tidak ada lagi local sub-components yang seharusnya pakai library:

```bash
# Cari definisi komponen inline yang seharusnya sudah dihapus
grep -rn "function MetricTile" src/
grep -rn "function MetricCard" src/
grep -rn "function HeaderBadge" src/
grep -rn "function ActionLink" src/
```

Semua harus return 0 hasil.

### 5.3 — Audit Exports

Pastikan semua komponen di `src/components/ui/` diekspor dari `index.js`:

```bash
# List semua .jsx files di ui/
ls src/components/ui/*.jsx

# Bandingkan dengan exports di index.js
cat src/components/ui/index.js
```

### 5.4 — Hapus CSS Variables Lama

Pastikan `src/index.css` tidak lagi mendefinisikan:
- `--primary: #006184`
- `--primary-soft: #c4e7ff`
- `--app-bg: #f8f9fa`
- `--surface-0`, `--surface-1`, `--surface-2`
- `--line-soft`
- `--text-strong`, `--text-muted`

Semua sudah diganti oleh `design-tokens.css`.

### 5.5 — Visual Testing

Buka setiap halaman dan verifikasi:

| Halaman | Checklist |
|---------|-----------|
| `/login` | [ ] Warna primary orange-red, button benar |
| `/` (Dashboard) | [ ] Cards konsisten, stat cards gradient merah, badges benar |
| `/chat/supervisor` | [ ] Chat berfungsi, warna konsisten |
| `/workspace/email` | [ ] Tabs berfungsi, search input benar |
| `/workspace/files` | [ ] Upload modal berfungsi, tabs benar |
| `/workspace/calendar` | [ ] Avatars benar, badges benar |
| `/workspace/jira` | [ ] Hero banner, stat cards, kanban board |
| `/monitoring/tokens` | [ ] Stat cards, execution log |
| `/settings/integrations` | [ ] Form inputs, buttons |

### 5.6 — Build Test

```bash
# Pastikan production build berhasil
npm run build

# Tidak boleh ada error atau warning terkait import
```

### 5.7 — (Opsional) Pindahkan `design-system/` ke `docs/`

Setelah semua terintegrasi, folder `design-system/` bisa dipindah ke `docs/design-system/` sebagai referensi dokumentasi, atau tetap di root sebagai "source of truth" untuk design tokens.

---

## 10. Komponen Baru yang Perlu Dibuat

Komponen ini **tidak ada** di `design-system/` tapi dibutuhkan berdasarkan analisis halaman:

| Komponen | File | Alasan |
|----------|------|--------|
| **Alert** | `alert.jsx` | 5+ inline error alert variants → 1 komponen |
| **Tabs** | `tabs.jsx` | 3 inline tab implementations → 1 komponen |
| **Modal** | `modal.jsx` | 2 hand-rolled modals → 1 komponen |
| **EmptyState** | `empty-state.jsx` | 5+ inline empty states → 1 komponen |
| **ProgressBar** | `progress-bar.jsx` | Inline progress bars di JiraPage, TokenMonitor |

Kode lengkap untuk masing-masing ada di [Fase 1](#5-fase-1--component-library).

---

## 11. Mapping Warna Lama → Baru

### Tailwind Classes

| Lama (Hapus) | Baru (Ganti) | Context |
|--------------|-------------|---------|
| `bg-brand-50` | `bg-primary-50` | Hover backgrounds |
| `bg-brand-100` | `bg-primary-100` | Light backgrounds |
| `bg-brand-400` | `bg-primary-400` | — |
| `bg-brand-500` | `bg-primary-500` | — |
| `bg-brand-600` | `bg-primary-500` | Primary buttons, active nav |
| `bg-brand-700` | `bg-primary-600` | Hover state |
| `bg-brand-800` | `bg-primary-700` | Active/pressed |
| `bg-brand-900` | `bg-primary-800` | — |
| `text-brand-600` | `text-primary-500` | Links, active text |
| `text-brand-700` | `text-primary-600` | — |
| `border-brand-600` | `border-primary-500` | Active borders |
| `ring-brand-600` | `ring-primary-500` | Focus rings |
| `text-slateui-500` | `text-neutral-500` | Muted text |
| `text-slateui-700` | `text-neutral-700` | Body text |
| `text-slateui-900` | `text-neutral-900` | Headings |
| `text-gray-*` | `text-neutral-*` | All gray text |
| `bg-gray-*` | `bg-neutral-*` | All gray backgrounds |
| `border-gray-*` | `border-neutral-*` | All gray borders |
| `text-slate-*` | `text-neutral-*` | All slate text |
| `bg-slate-*` | `bg-neutral-*` | All slate backgrounds |
| `border-slate-*` | `border-neutral-*` | All slate borders |
| `bg-blue-600` | `bg-primary-500` | Primary buttons |
| `text-blue-600` | `text-primary-500` | Links |
| `bg-cyan-700` | `bg-primary-500` | Primary buttons |
| `text-cyan-600` | `text-primary-500` | Links |

### CSS Variables

| Lama (Hapus dari index.css) | Baru (dari design-tokens.css) |
|-----------------------------|-------------------------------|
| `--primary: #006184` | `--color-primary-500: #E84322` |
| `--primary-soft: #c4e7ff` | `--color-primary-100: #FFD9CE` |
| `--app-bg: #f8f9fa` | `--surface-page: #F5F5F5` |
| `--surface-0: #ffffff` | `--surface-card: #FFFFFF` |
| `--surface-1: #f3f4f5` | `--color-neutral-50: #F9F9F9` |
| `--surface-2: #e7e8e9` | `--color-neutral-200: #E5E5E5` |
| `--line-soft: #bfc8cf` | `--border-default: #E5E5E5` |
| `--text-strong: #191c1d` | `--text-primary: #111111` |
| `--text-muted: #545e76` | `--text-secondary: #4D4D4D` |

---

## 12. Checklist per Halaman

Gunakan checklist ini saat mengerjakan setiap halaman:

### Template Checklist

```
## [NamaHalaman].jsx

### Imports
- [ ] Import komponen dari `@/components/ui`
- [ ] Hapus import yang tidak dipakai lagi

### Warna
- [ ] Tidak ada `brand-*` classes
- [ ] Tidak ada `gray-*` classes
- [ ] Tidak ada `slate-*` classes (kecuali di Tailwind prose)
- [ ] Tidak ada `blue-600`, `cyan-700` classes
- [ ] Tidak ada hardcoded hex colors
- [ ] Semua primary actions pakai `primary-*`
- [ ] Semua text pakai `neutral-*`

### Komponen
- [ ] Semua buttons pakai `<Button>` dari library
- [ ] Semua badges pakai `<Badge>` dari library
- [ ] Semua cards pakai `<Card>` dari library
- [ ] Semua error alerts pakai `<Alert>` dari library
- [ ] Semua empty states pakai `<EmptyState>` dari library
- [ ] Tabs pakai `<Tabs>` dari library (jika ada)
- [ ] Modals pakai `<Modal>` dari library (jika ada)

### Cleanup
- [ ] Tidak ada inline sub-components yang duplikat library
- [ ] Tidak ada `className` yang bisa diganti dengan variant prop
- [ ] Semua interactive elements punya focus state

### Testing
- [ ] Halaman render tanpa error
- [ ] Semua interaksi berfungsi (click, hover, focus)
- [ ] Responsive (mobile + desktop)
- [ ] Loading states benar
- [ ] Error states benar
- [ ] Empty states benar
```

---

## 13. Testing & QA

### 13.1. Automated Checks

```bash
# 1. Lint — pastikan tidak ada error
npm run lint

# 2. Build — pastikan production build berhasil
npm run build

# 3. Audit warna (lihat Fase 5.1)
grep -rn "brand-\|slateui-\|gray-\|cyan-\|blue-600" src/
# Target: 0 hasil
```

### 13.2. Manual Visual Testing

Untuk setiap halaman, verifikasi:

1. **Color consistency** — Semua primary actions orange-red, semua text neutral
2. **Component consistency** — Buttons, badges, cards terlihat sama di semua halaman
3. **Hover states** — Semua interactive elements punya hover effect
4. **Focus states** — Tab navigation menunjukkan focus ring
5. **Loading states** — Skeleton/spinner tampil saat loading
6. **Error states** — Alert tampil saat error
7. **Empty states** — EmptyState tampil saat data kosong
8. **Responsive** — Layout benar di mobile (< 768px) dan desktop

### 13.3. Regression Testing

Pastikan fitur-fitur ini masih berfungsi setelah migrasi:

| Fitur | Test |
|-------|------|
| Login/Logout | Google OAuth flow |
| Sidebar navigation | Semua route accessible |
| Sidebar collapse | Toggle collapse/expand |
| Dashboard refresh | Data refresh tanpa error |
| Email tabs | Switch antar tab |
| File upload | Upload modal berfungsi |
| Jira sync | Refresh Jira data |
| Calendar events | Select event, lihat detail |
| Chat | Kirim pesan, terima response |
| Token monitor | Data tampil benar |
| Settings modal | Buka, edit, save |

---

## 14. Risiko & Mitigasi

| # | Risiko | Dampak | Probabilitas | Mitigasi |
|---|--------|--------|-------------|----------|
| 1 | Perubahan warna besar (blue → orange-red) membuat UI terlihat "aneh" sementara | Medium | Tinggi | Migrasi bertahap, commit per fase. Bisa rollback per fase. |
| 2 | Breaking existing functionality | Tinggi | Rendah | Hanya ubah styling/markup, TIDAK ubah logic/state/API calls |
| 3 | Missing edge cases di komponen baru | Medium | Medium | Komponen sudah di-spec di DESIGN-SYSTEM.md. Test manual per halaman. |
| 4 | Tailwind class conflicts (old + new config) | Medium | Medium | Replace config sekaligus di Fase 0. Jangan merge partial. |
| 5 | Path alias `@/` break existing imports | Rendah | Rendah | Alias hanya menambah, tidak menghapus relative path support |
| 6 | Dependencies baru (CVA, Radix) menambah bundle size | Rendah | Rendah | CVA ~3KB, Radix Slot ~1KB. Negligible. |
| 7 | Tim tidak familiar dengan CVA/shadcn pattern | Medium | Medium | Baca DESIGN-SYSTEM.md section 8. Pattern sederhana: variant + size props. |

### Rollback Strategy

Setiap fase harus di-commit terpisah:
```
git commit -m "feat(design-system): fase 0 - foundation setup"
git commit -m "feat(design-system): fase 1 - component library"
git commit -m "feat(design-system): fase 2 - layout migration"
git commit -m "feat(design-system): fase 3.1 - migrate LoginPage"
git commit -m "feat(design-system): fase 3.2 - migrate TokenMonitorPage"
...
```

Jika ada masalah, bisa `git revert` per fase tanpa mempengaruhi fase lain.

---

## Appendix A — Quick Reference: Component API

### Button
```jsx
<Button variant="primary|outline|ghost|destructive|link" size="sm|md|lg|icon" asChild>
  Label
</Button>
```

### Badge
```jsx
<Badge variant="default|urgent|success|warning|error|info|outline">
  Label
</Badge>
```

### Card
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

### Input
```jsx
<Input icon={<Search />} placeholder="Search..." className="max-w-md" />
<Input placeholder="Email" type="email" />
```

### Avatar
```jsx
<Avatar size="xs|sm|md|lg">
  <AvatarImage src="/photo.jpg" alt="Name" />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>

<AvatarGroup max={3}>
  <Avatar size="sm">...</Avatar>
  <Avatar size="sm">...</Avatar>
</AvatarGroup>
```

### StatCard
```jsx
<StatCard label="Open Project" value={12} caption="Lorem ipsum" trendIcon={<TrendingUp />} />
```

### ListItem
```jsx
<ListItem
  sender="Budiman Sujatmiko"
  avatarUrl="/avatar.jpg"
  title="Penugasan 2 Website"
  body="Lorem ipsum..."
  badge={{ label: "Urgent", variant: "urgent" }}
/>
```

### Alert
```jsx
<Alert variant="error|warning|success|info" title="Error" onDismiss={() => {}}>
  Something went wrong.
</Alert>
```

### Tabs
```jsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="inbox" icon={<Mail />}>Inbox</TabsTrigger>
    <TabsTrigger value="drafts" icon={<Edit />}>Drafts</TabsTrigger>
  </TabsList>
</Tabs>
```

### Modal
```jsx
<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Settings" size="md|lg">
  <ModalBody>...</ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary">Save</Button>
  </ModalFooter>
</Modal>
```

### EmptyState
```jsx
<EmptyState
  icon={<Inbox className="h-12 w-12" />}
  title="No data"
  description="Nothing to show here"
  action={<Button>Refresh</Button>}
/>
```

### ProgressBar
```jsx
<ProgressBar value={75} max={100} variant="primary|gradient" label="75%" showPercentage />
```

### HeroBanner
```jsx
<HeroBanner title="Morning, Admin" description="Welcome back" backgroundImage="/hero.jpg" />
```

### TokenUsage
```jsx
<TokenUsage used="842k" limit="1M Limit" />
```

### NavItem
```jsx
<NavItem icon={<LayoutDashboard />} label="Dashboard" active onClick={() => {}} />
```

---

## Appendix B — File Dependency Graph

```
src/lib/utils.js (cn helper)
  ↑ imported by ALL components in src/components/ui/

src/styles/design-tokens.css
  ↑ imported by src/main.jsx (global CSS variables)

src/components/ui/index.js (barrel)
  ↑ imported by ALL pages and feature components

tailwind.config.js
  ↑ references design tokens (colors, spacing, shadows, etc.)
```

---

## Appendix C — Dependency Versions

```json
{
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.3.0",
  "@radix-ui/react-slot": "^1.0.2",
  "tailwindcss-animate": "^1.0.7"
}
```

---

**End of Plan**

> Jika ada pertanyaan atau butuh klarifikasi, hubungi lead developer.
> Setiap fase harus di-review dan di-commit terpisah sebelum lanjut ke fase berikutnya.
