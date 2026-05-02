# 🎨 AI Team Assistant — Design System (JavaScript)

> **Executive Canvas Dashboard**
> Design System v1.0.0 — Capstone Project
> Author: Irza · Last updated: May 2026

Design system ini adalah panduan visual dan teknis lengkap untuk membangun antarmuka **AI Team Assistant**. Tujuannya: membuat seluruh UI **konsisten, modular, reusable, dan accessible** — agar setiap komponen dapat dipakai ulang di halaman manapun tanpa harus mendesain dari nol.

> **📦 Versi JavaScript** — Semua komponen menggunakan `.jsx` (bukan `.ts/.tsx`)

---

## 📑 Daftar Isi

1. [Brand Identity](#1-brand-identity)
2. [Design Tokens](#2-design-tokens)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Sizing](#5-spacing--sizing)
6. [Border & Radius](#6-border--radius)
7. [Shadow & Elevation](#7-shadow--elevation)
8. [Component Library](#8-component-library)
9. [Layout & Grid](#9-layout--grid)
10. [Interaction States](#10-interaction-states)
11. [Accessibility](#11-accessibility)
12. [Setup & Installation](#12-setup--installation)
13. [Usage Examples](#13-usage-examples)
14. [File Structure](#14-file-structure)
15. [Naming Convention](#15-naming-convention)

---

## 1. Brand Identity

| Aspek | Nilai |
|---|---|
| **Nama Produk** | AI Team Assistant — Executive Canvas |
| **Persona Visual** | Professional, Modern, High-contrast, Action-oriented |
| **Style Preset** | Modern (Inter font, radius 8px, layered shadows) |
| **Warna Dominan** | Orange-Red `#E84322` |
| **Tone** | Profesional namun energik — cocok untuk dashboard eksekutif yang butuh urgency |

---

## 2. Design Tokens

Design tokens adalah variabel terpusat yang menyimpan nilai-nilai dasar (warna, ukuran, spacing). Semua komponen **wajib** memakai token, tidak boleh hardcode.

### Format yang tersedia

| Format | File | Untuk |
|---|---|---|
| CSS Variables | `tokens/design-tokens.css` | Project HTML/CSS atau shadcn |
| Tailwind Config | `tokens/tailwind.config.js` | Project Next.js / React + Tailwind |

### Cara pakai

```jsx
// ❌ JANGAN — hardcode value
<div style={{ color: "#E84322", padding: "16px" }} />

// ✅ BENAR — pakai token via Tailwind
<div className="text-primary-500 p-4" />

// ✅ BENAR — pakai CSS variable langsung
<div style={{ color: "var(--color-primary-500)", padding: "var(--space-4)" }} />
```

---

## 3. Color System

### 3.1. Primary Palette (Brand)

Warna utama untuk CTA, sidebar aktif, badge urgent, dan elemen highlight.

| Token | Hex | Use case |
|---|---|---|
| `primary-50` | `#FFF2EF` | Background subtle, hover ringan |
| `primary-100` | `#FFD9CE` | Hover ringan, badge background |
| `primary-200` | `#FFB4A0` | Border aktif |
| `primary-300` | `#FF8A6B` | Disabled state |
| `primary-400` | `#FF5F3F` | Secondary accent |
| **`primary-500`** | **`#E84322`** | **Default — CTA, sidebar active** |
| `primary-600` | `#C73415` | Hover state button |
| `primary-700` | `#A0250E` | Active/Pressed |
| `primary-800` | `#6B1508` | Text di atas background terang |
| `primary-900` | `#3A0802` | Heading dengan accent |

### 3.2. Neutral Palette

Untuk teks, border, background card, dan layout dasar.

| Token | Hex | Use case |
|---|---|---|
| `neutral-0` | `#FFFFFF` | Card background, surface utama |
| `neutral-50` | `#F9F9F9` | Page background alternatif |
| `neutral-100` | `#F2F2F2` | Input background, row alternate |
| `neutral-200` | `#E5E5E5` | Border default |
| `neutral-300` | `#CCCCCC` | Divider |
| `neutral-400` | `#999999` | Placeholder, metadata |
| `neutral-500` | `#666666` | Body text sekunder |
| `neutral-700` | `#333333` | Body text utama |
| `neutral-900` | `#111111` | Heading |

### 3.3. Semantic Colors

| Token | Hex | Background | Use case |
|---|---|---|---|
| `success` | `#22C55E` | `#DCFCE7` | Status sukses, confirmation |
| `warning` | `#F59E0B` | `#FEF3C7` | Status peringatan |
| `error` | `#EF4444` | `#FEE2E2` | Status error, overdue |
| `info` | `#3B82F6` | `#DBEAFE` | Status informasi |
| `urgent` | `#E84322` | `#FEE2E2` | Badge "Urgent" di Comms |

### 3.4. Gradient

| Token | Value | Use case |
|---|---|---|
| `gradient-hero` | `linear-gradient(90deg, #E84322 0%, #1F1F1F 100%)` | Banner "Morning, Admin" |
| `gradient-stat` | `linear-gradient(135deg, #FF5F3F 0%, #C73415 100%)` | Stat card di Jira Sync |
| `gradient-token` | `linear-gradient(135deg, #E84322 0%, #1F1F1F 100%)` | Token Economy widget |

---

## 4. Typography

### 4.1. Font Family

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

**Inter** dipilih karena:
- Highly readable di ukuran kecil (cocok untuk metadata)
- Modern, neutral, profesional
- Dukungan rendering yang baik di semua OS
- Variable font (efisien untuk multi-weight)

### 4.2. Type Scale

| Token | Size | Line Height | Use case |
|---|---|---|---|
| `text-xs` | 12px | 1.4 | Caption, metadata, timestamp |
| `text-sm` | 13px | 1.5 | Label, badge text |
| `text-base` | 14px | 1.6 | Body text default |
| `text-md` | 16px | 1.6 | Input, form label |
| `text-lg` | 20px | 1.4 | Card title |
| `text-xl` | 24px | 1.3 | Section heading |
| `text-2xl` | 32px | 1.2 | Stat angka besar (842k, 12) |
| `text-3xl` | 40px | 1.1 | Hero greeting |

### 4.3. Font Weight

| Token | Weight | Use case |
|---|---|---|
| `font-regular` | 400 | Body, deskripsi |
| `font-medium` | 500 | Nav label, subtitle |
| `font-semibold` | 600 | Card title, event name |
| `font-bold` | 700 | Stat angka, hero, CTA label |

---

## 5. Spacing & Sizing

### 5.1. Spacing Scale (8pt Grid)

Semua jarak/padding **harus** kelipatan 4px (idealnya 8px). Tidak boleh ada nilai arbitrary.

| Token | Value | Use case |
|---|---|---|
| `space-1` | 4px | Gap ikon kecil |
| `space-2` | 8px | Padding badge, gap list item |
| `space-3` | 12px | Padding input, gap icon-text |
| `space-4` | 16px | Padding card dalam |
| `space-5` | 20px | Padding section dalam card |
| `space-6` | 24px | Padding card luar, gap antar card |
| `space-8` | 32px | Padding sidebar item, margin section |
| `space-10` | 40px | Padding hero |
| `space-12` | 48px | Gap layout utama |

### 5.2. Component Sizing

| Token | Value | Use case |
|---|---|---|
| `size-sidebar` | 270px | Lebar sidebar |
| `size-topbar` | 64px | Tinggi top bar |
| `size-button-sm` | 32px | Button kecil |
| `size-button-md` | 40px | Button default |
| `size-button-lg` | 48px | Button besar (CTA hero) |
| `size-input-md` | 40px | Input default |
| `size-avatar-sm` | 32px | Avatar di list item |
| `size-avatar-md` | 40px | Avatar di top bar |

---

## 6. Border & Radius

### 6.1. Radius Scale

| Token | Value | Use case |
|---|---|---|
| `radius-sm` | 4px | Badge, tag kecil |
| `radius-md` | 8px | Input, button, card inner |
| `radius-lg` | 12px | Card utama, modal |
| `radius-xl` | 16px | Card hero, widget besar |
| `radius-full` | 9999px | Avatar, chip bulat, search input |

### 6.2. Border Width

| Token | Value | Use case |
|---|---|---|
| `border-1` | 1px | Border default card, input |
| `border-2` | 1.5px | Border focus, aktif |
| `border-4` | 2px | Outline emphasis |

---

## 7. Shadow & Elevation

| Token | Use case |
|---|---|
| `shadow-xs` | Border halus, surface |
| `shadow-sm` | Card default |
| `shadow-md` | Card hover, dropdown |
| `shadow-lg` | Modal, popover |
| `shadow-xl` | Dialog penting |
| `shadow-stat` | Stat card merah dengan glow primary |
| `shadow-focus` | Focus ring 3px primary 20% opacity |

---

## 8. Component Library

Semua komponen dibangun di atas **shadcn/ui** + custom theming dalam **JavaScript** (`.jsx`).

### 8.1. Atoms

| Komponen | File | Props utama |
|---|---|---|
| **Button** | `button.jsx` | `variant`, `size`, `asChild` |
| **Badge** | `badge.jsx` | `variant` (urgent, success, dll) |
| **Input** | `input.jsx` | `icon`, semua HTML input attrs |
| **Avatar** | `avatar.jsx` | `size`, sub: `AvatarImage`, `AvatarFallback`, `AvatarGroup` |

### 8.2. Molecules

| Komponen | File | Props utama |
|---|---|---|
| **Card** | `card.jsx` | sub: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| **StatCard** | `stat-card.jsx` | `label`, `value`, `caption`, `trendIcon` |
| **ListItem** | `list-item.jsx` | `sender`, `avatarUrl`, `title`, `body`, `badge` |
| **NavItem** | `nav-item.jsx` | `icon`, `label`, `active` |
| **ConfirmationModal** | `confirmation-modal.jsx` | `variant`, `title`, `description`, `onConfirm`, `loading` |

### 8.3. Organisms

| Komponen | File | Props utama |
|---|---|---|
| **Sidebar** | `sidebar.jsx` | `logo`, `brandName`, `brandTagline` |
| **HeroBanner** | `hero-banner.jsx` | `title`, `description`, `backgroundImage` |
| **TokenUsage** | `token-usage.jsx` | `used`, `limit` |

### 8.4. Detail Komponen Utama

#### Button

```jsx
<Button variant="primary" size="md">Lihat Jira</Button>
<Button variant="outline" size="md">Buat Report</Button>
<Button variant="ghost" size="sm">Batal</Button>
```

| Variant | Style |
|---|---|
| `primary` | Background merah `primary-500`, text putih (default) |
| `outline` | Border merah, background putih, text merah |
| `ghost` | Transparan, text neutral, hover background neutral-100 |
| `destructive` | Background merah `error`, text putih |
| `link` | Underline, text merah |

| Size | Height | Padding |
|---|---|---|
| `sm` | 32px | 12px horizontal |
| `md` | 40px | 20px horizontal (default) |
| `lg` | 48px | 24px horizontal |
| `icon` | 40x40px | square |

#### StatCard

```jsx
<StatCard
  label="Open Project"
  value={12}
  caption="Lorem Ipsum Is Simply Dummy Text"
/>
```

Card dengan **gradient merah**, ada ikon trending di pojok kanan atas. Dipakai di section **Jira Sync**.

#### ListItem

```jsx
<ListItem
  sender="Budiman Sujatmiko"
  title="Penugasan 2 Website"
  body="Lorem Ipsum Is Simply Dummy Text..."
  badge={{ label: "Urgent", variant: "urgent" }}
/>
```

Row untuk **Comms** (email) dan **Agenda**. Avatar di kiri, badge di kanan.

#### NavItem

```jsx
<NavItem icon={<Dashboard />} label="Dashboard" active />
<NavItem icon={<MessageCircle />} label="Supervisior Agent" />
```

Saat `active={true}`: background gradient merah, text putih, font-semibold. Default: text neutral, icon merah.

#### ConfirmationModal

```jsx
// Danger variant (delete confirmation)
<ConfirmationModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  variant="danger"
  title="Hapus Dokumen"
  description="Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan."
  confirmLabel="Hapus"
  cancelLabel="Batal"
  loading={isDeleting}
  loadingLabel="Menghapus..."
/>

// Warning variant
<ConfirmationModal
  variant="warning"
  title="Perubahan Belum Disimpan"
  description="Anda memiliki perubahan yang belum disimpan."
  confirmLabel="Keluar Tanpa Menyimpan"
/>

// Info variant
<ConfirmationModal
  variant="info"
  title="Konfirmasi Tindakan"
  description="Apakah Anda yakin ingin melanjutkan?"
/>

// Success variant
<ConfirmationModal
  variant="success"
  title="Selesaikan Tugas"
  description="Tandai tugas ini sebagai selesai?"
/>
```

| Variant | Icon | Color | Use case |
|---|---|---|---|
| `danger` | AlertCircle | Red | Delete, destructive actions |
| `warning` | AlertTriangle | Amber | Unsaved changes, caution |
| `info` | Info | Blue | General confirmation |
| `success` | CheckCircle2 | Green | Completion, positive actions |

| Size | Max Width |
|---|---|
| `sm` | 384px |
| `md` | 448px (default) |
| `lg` | 512px |

**Features:**
- Loading state dengan spinner
- Backdrop click to close (disabled saat loading)
- Optional close button (X) di pojok kanan atas
- Custom icon support
- Rich description dengan JSX
- Keyboard accessible

---

## 9. Layout & Grid

### 9.1. Layout Utama

```
┌─────────────────────────────────────────────────┐
│ Sidebar (270px) │  Top Bar (64px)              │
│                 ├──────────────────────────────┤
│  - Brand        │  Hero Banner (border-radius) │
│  - NavItem      │  ┌──────────┬──────────┐     │
│  - NavItem      │  │ Jira     │ Agenda   │     │
│  - NavItem      │  ├──────────┼──────────┤     │
│  - Setting      │  │ Comms    │ Token    │     │
│                 │  └──────────┴──────────┘     │
└─────────────────┴──────────────────────────────┘
```

### 9.2. Grid Dashboard

| Property | Value |
|---|---|
| Kolom | 2 |
| Gap | 24px (`space-6`) |
| Card min-height | ~280px |
| Breakpoint < lg (1024px) | Stack jadi 1 kolom |

---

## 10. Interaction States

| State | Visual |
|---|---|
| **Hover (button)** | Background `primary-600`, `translateY(-1px)`, `shadow-md` |
| **Active (button)** | Background `primary-700`, `translateY(0)` |
| **Disabled** | Opacity 0.4, cursor `not-allowed`, no hover effect |
| **Focus** | Ring 2px `primary-500/40`, ring-offset 2px |
| **NavItem hover** | Background `primary-50`, text `primary-600` |
| **NavItem active** | Background `primary-500`, text putih, `shadow-stat` |
| **Card hover** | `shadow-md`, transition 200ms |
| **Input focus** | Border `primary-500`, ring 2px `primary-500/20` |

---

## 11. Accessibility

### 11.1. Color Contrast (WCAG AA)

| Kombinasi | Ratio | Status |
|---|---|---|
| `neutral-900` di `neutral-0` | 19.0:1 | ✅ AAA |
| `neutral-700` di `neutral-0` | 12.6:1 | ✅ AAA |
| `primary-500` di `neutral-0` | 4.6:1 | ✅ AA |
| `neutral-0` di `primary-500` | 4.6:1 | ✅ AA |
| `neutral-500` di `neutral-0` | 5.7:1 | ✅ AA |

> **Catatan:** Untuk text kecil (<14px), gunakan `neutral-700` atau lebih gelap.

### 11.2. Touch Target

- Minimum **44x44px** untuk semua tombol interaktif (mobile-friendly)
- Button `sm` (32px) hanya untuk desktop

### 11.3. Focus Indicator

- Selalu ada ring fokus visible (jangan `outline: none` tanpa pengganti)
- Ring color: `primary-500` dengan opacity 40%

### 11.4. Semantic HTML

```jsx
// ✅ Pakai elemen semantic
<aside>...</aside>      // Sidebar
<nav>...</nav>          // Navigation
<main>...</main>        // Konten utama
<header>...</header>    // Top bar
<button aria-current="page">...</button>  // Active nav

// ❌ Hindari div-soup
<div onClick={...}>     // Pakai <button> instead
```

---

## 12. Setup & Installation

### 12.1. Persyaratan

```
Node.js >= 18
React >= 18
Tailwind CSS >= 3.0
```

> **Catatan:** Versi ini menggunakan JavaScript (`.jsx`), tidak perlu TypeScript.

### 12.2. Instalasi

```bash
# 1. Init shadcn (jika project baru)
npx shadcn@latest init

# 2. Install dependency
npm install class-variance-authority clsx tailwind-merge \
  @radix-ui/react-slot lucide-react tailwindcss-animate

# 3. Copy file design system
# - tokens/design-tokens.css → src/styles/
# - tokens/tailwind.config.js → root project
# - components/ → src/components/
# - lib/utils.js → src/lib/

# 4. Import token CSS di entry point
# Di App.jsx atau main.jsx:
import "@/styles/design-tokens.css";

# 5. Pastikan path alias di jsconfig.json (atau vite.config.js):
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### 12.3. Font Setup

Tambahkan Inter di `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Atau via `next/font` (Next.js):

```jsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
```

---

## 13. Usage Examples

### 13.1. Membangun Halaman Dashboard

```jsx
import {
  Sidebar, NavItem, HeroBanner, Card, CardHeader, CardTitle,
  CardContent, CardFooter, StatCard, Button, Badge, Input,
  ListItem, TokenUsage, Avatar, AvatarImage, AvatarGroup
} from "@/components/ui";
import { Search, Bell, LayoutDashboard, MessageCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        brandName="AI Team Asistant"
        brandTagline="Executive Canvas"
        logo={<LayoutDashboard className="h-5 w-5" />}
      >
        <NavItem icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" active />
        <NavItem icon={<MessageCircle className="h-5 w-5" />} label="Supervisior Agent" />
        {/* ...nav items lain */}
      </Sidebar>

      {/* Main */}
      <main className="ml-sidebar p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search" className="max-w-md" />
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="h-5 w-5 text-neutral-600" />
              <Badge variant="urgent" className="absolute -top-1 -right-1">6</Badge>
            </button>
            <Avatar size="md">
              <AvatarImage src="/avatar.jpg" alt="Irza" />
            </Avatar>
          </div>
        </div>

        {/* Hero */}
        <HeroBanner
          title="Morning, Admin"
          description="Menampilkan issue Jira dari hasil refresh, disimpan lokal agar tidak hilang saat reload."
          className="mb-6"
        />

        {/* Grid 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jira Sync */}
          <Card>
            <CardHeader>
              <CardTitle>Jira Sync</CardTitle>
              <Badge>2 Blocks</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Open Project" value={12} caption="Lorem ipsum text" />
                <StatCard label="In Review" value={12} caption="Lorem ipsum text" />
                <StatCard label="Overdue" value={12} caption="Lorem ipsum text" />
              </div>
              <p className="mt-4 text-xs text-neutral-500">
                <strong className="text-neutral-900">Lorem Ipsum Is Simply Dummy</strong> Text Of The Printing And Typesetting Industry.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" className="flex-1">Lihat Jira</Button>
              <Button variant="outline" className="flex-1">Buat Report</Button>
            </CardFooter>
          </Card>

          {/* Token Economy */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Token Economy</CardTitle>
                <p className="text-xs text-neutral-500 mt-1">Current Billing Cycle Resets In 12 Days</p>
              </div>
              <Badge>2 Blocks</Badge>
            </CardHeader>
            <CardContent>
              <TokenUsage used="842k" limit="1M Limit" />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Lihat Detail</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
```

### 13.2. Pakai Komponen Individu

```jsx
// CTA tombol
<Button variant="primary" size="lg">Siapkan Brief</Button>

// Badge urgent
<Badge variant="urgent">Urgent</Badge>

// List email dengan badge
<ListItem
  sender="Budiman Sujatmiko"
  title="Penugasan 2 Website"
  body="Lorem ipsum text..."
  badge={{ label: "Urgent", variant: "urgent" }}
/>

// Avatar group (Agenda peserta)
<AvatarGroup max={3}>
  <Avatar size="sm"><AvatarImage src="/u1.jpg" alt="User 1" /></Avatar>
  <Avatar size="sm"><AvatarImage src="/u2.jpg" alt="User 2" /></Avatar>
  <Avatar size="sm"><AvatarImage src="/u3.jpg" alt="User 3" /></Avatar>
</AvatarGroup>
```

---

## 14. File Structure

```
project-root/
├── src/
│   ├── components/
│   │   ├── ui/                    # Komponen design system (JAVASCRIPT)
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── input.jsx
│   │   │   ├── avatar.jsx
│   │   │   ├── stat-card.jsx
│   │   │   ├── list-item.jsx
│   │   │   ├── nav-item.jsx
│   │   │   ├── sidebar.jsx
│   │   │   ├── hero-banner.jsx
│   │   │   ├── token-usage.jsx
│   │   │   └── index.js           # Export barrel
│   │   └── (feature-specific)/    # Komponen khusus halaman
│   ├── lib/
│   │   └── utils.js               # cn() helper (JAVASCRIPT)
│   ├── styles/
│   │   └── design-tokens.css      # CSS variables
│   └── App.jsx                    # Root component
├── tailwind.config.js             # Tailwind theme
├── jsconfig.json                  # Path aliases (untuk JavaScript)
└── package.json
```

---

## 15. Naming Convention

| Kategori | Format | Contoh |
|---|---|---|
| **Komponen React** | PascalCase | `StatCard`, `ListItem`, `TokenUsage` |
| **File komponen** | kebab-case | `stat-card.jsx`, `list-item.jsx` |
| **Props** | camelCase | `isUrgent`, `blockCount`, `onDraftReply` |
| **CSS class** | kebab-case | `.stat-card`, `.nav-item--active` |
| **Design token** | kebab-case (CSS) / camelCase (JS) | `--color-primary-500`, `colors.primary[500]` |
| **Folder** | kebab-case | `components/ui/`, `lib/utils/` |

---

## 🔄 Versioning

Design system ini mengikuti **Semantic Versioning**:

- **Major (1.x.x)**: Breaking change pada API komponen atau token
- **Minor (x.1.x)**: Penambahan komponen/token baru, backward-compatible
- **Patch (x.x.1)**: Bug fix, polish, tidak ubah API

Versi sekarang: **v1.0.0** (initial release - JavaScript version)

---

## 📞 Kontribusi

Saat menambah komponen baru, pastikan:

- ✅ Menggunakan design token (tidak hardcode warna/spacing)
- ✅ Mendukung semua state (default, hover, active, focus, disabled)
- ✅ Memenuhi WCAG AA (contrast 4.5:1, touch target 44x44px)
- ✅ Memakai semantic HTML
- ✅ Ada JSDoc comment pada props (format JavaScript)
- ✅ Diekspor dari `index.js`
- ✅ Dokumentasi di file README ini

---

## 🚀 Quick Start

```bash
# Clone atau download folder design system
cd your-project

# Install dependencies
npm install

# Copy file ke project
cp -r ai-team-assistant-design-system/components src/
cp -r ai-team-assistant-design-system/tokens/design-tokens.css src/styles/
cp ai-team-assistant-design-system/tokens/tailwind.config.js ./

# Import di App.jsx
import "@/styles/design-tokens.css";

# Mulai pakai komponen
import { Button, Card, StatCard } from "@/components/ui";
```

---

**Made with ❤️ for AI Team Assistant Capstone Project**  
**JavaScript Version** — No TypeScript required
