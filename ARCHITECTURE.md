# Team Assistant Workspace - Architecture Overview

## Project Summary

**Team Assistant Workspace** adalah aplikasi React + Vite yang berfungsi sebagai platform terpadu untuk delegasi tugas operasional, akses knowledge base internal, dan manajemen dokumen SOP. Aplikasi ini terintegrasi dengan n8n workflow automation (backend) dan Supabase (database).

---

## Tech Stack

| Layer        | Technology                |
|--------------|---------------------------|
| Frontend     | React 18.3 + Vite 5.2     |
| Routing      | React Router DOM 6.23     |
| State Mgmt   | Zustand 4.5.2             |
| Styling      | Tailwind CSS 3.4.4        |
| HTTP Client  | Axios 1.6.8               |
| Backend      | n8n (via webhooks)        |
| Database     | Supabase (PostgreSQL)     |
| Markdown     | react-markdown 9.1.0      |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 React Application                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │  Pages   │  │Components│  │  Hooks   │              │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘              │   │
│  │       │             │             │                     │   │
│  │  ┌────┴─────────────┴─────────────┴─────┐               │   │
│  │  │         State Management (Zustand)   │               │   │
│  │  └──────────────────────────────────────┘               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   n8n Webhooks  │  │   Supabase DB   │  │  LocalStorage   │
│  (Backend AI)   │  │  (PostgreSQL)   │  │  (User Config)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Directory Structure

```
src/
├── main.jsx                  # Entry point aplikasi
├── App.jsx                   # Root component dengan routing
├── index.css                 # Global styles + Tailwind
│
├── pages/                    # Page-level components
│   ├── Dashboard.jsx         # Halaman utama
│   ├── SupervisorChat.jsx    # Chat dengan Supervisor Agent
│   ├── KnowledgeChat.jsx     # Chat dengan Knowledge Agent (RAG)
│   ├── FileWorkspace.jsx     # Manajemen dokumen
│   └── CalendarPage.jsx      # Integrasi Google Calendar
│
├── components/
│   ├── layout/
│   │   └── Sidebar.jsx       # Navigasi utama + session management
│   ├── chat/
│   │   ├── ChatBubble.jsx    # Komponen pesan chat
│   │   ├── MessageInput.jsx  # Input field untuk chat
│   │   ├── AgentStatusIndicator.jsx
│   │   └── SourceCitation.jsx
│   ├── files/
│   │   ├── UploadZone.jsx    # Drag-drop upload area
│   │   ├── FolderTree.jsx    # File explorer component
│   │   └── FilePreviewModal.jsx
│   └── ui/
│       ├── AgentCard.jsx
│       ├── SkeletonLoader.jsx
│       └── SettingsModal.jsx # Konfigurasi webhook URLs
│
├── services/                 # API layer & external integrations
│   ├── api.js                # Core API utilities + URL management
│   ├── chatService.js        # Chat API (Supervisor + Knowledge)
│   ├── sessionService.js     # Session CRUD (Supabase)
│   ├── fileService.js        # File upload & document API
│   ├── calendarService.js    # Google Calendar integration
│   └── supabase.js           # Supabase config & headers
│
├── store/
│   └── chatStore.js          # Zustand global state
│
└── hooks/
    └── useAutoScroll.js      # Auto-scroll hook untuk chat
```

---

## Core Modules

### 1. Routing (App.jsx)

Aplikasi menggunakan React Router dengan 5 route utama:

| Path                   | Component      | Deskripsi                          |
|------------------------|----------------|------------------------------------|
| `/`                    | Dashboard      | Halaman utama dengan quick access  |
| `/chat/supervisor`     | SupervisorChat | Delegasi tugas operasional         |
| `/chat/knowledge`      | KnowledgeChat  | RAG chat dengan dokumen SOP        |
| `/workspace/files`     | FileWorkspace  | Upload & manajemen dokumen         |
| `/workspace/calendar`  | CalendarPage   | Integrasi Google Calendar          |

---

### 2. State Management (chatStore.js)

Zustand store dengan persist ke `sessionStorage`:

```javascript
{
  // Messages
  supervisorMessages: [],
  knowledgeMessages: [],

  // Connection status
  isConnected: null,

  // Knowledge sessions
  knowledgeSessions: [],
  activeKnowledgeSessionId: null,

  // Supervisor sessions
  supervisorSessions: [],
  activeSupervisorSessionId: null
}
```

**Persisted fields:** `supervisorMessages`, `knowledgeMessages`, `activeKnowledgeSessionId`, `activeSupervisorSessionId`

---

### 3. API Layer

#### api.js - Core Configuration

- **URL Management:** Semua webhook URLs disimpan di `localStorage`
- **Environment Modes:** Dev (`/webhook-test`) dan Prod (`/webhook`)
- **Session ID:** Per-tab session menggunakan `crypto.randomUUID()`

**LocalStorage Keys:**
```javascript
{
  SUPERVISOR: "n8n_supervisor_url",
  KNOWLEDGE: "n8n_knowledge_url",
  PM: "n8n_pm_url",
  REPORT: "n8n_report_url",
  STATUS: "n8n_status_url",
  UPLOAD: "n8n_upload_url",
  ENV_MODE: "n8n_env_mode"
}
```

#### chatService.js

```javascript
chatApi.sendToSupervisor(message, action, sessionId, file)
chatApi.sendToKnowledge(message, contextFilter, sessionId)
```

#### sessionService.js

CRUD operasi untuk `chat_sessions` dan `n8n_chat_histories` di Supabase:

- `buatSesiBaru(judul, chatType)` - Create session
- `ambilSemuaSesi(chatType)` - List sessions
- `ambilRiwayatChat(sessionId)` - Get chat history (with filtering)
- `hapusSesiChat(sessionId)` - Delete session + messages

#### fileService.js

```javascript
fileApi.uploadDocument(file, folder, fileName)  // Upload ke n8n
fileApi.fetchDokumen()                          // Fetch dari Supabase
```

---

### 4. Session Management

Session architecture menggunakan hybrid approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    SESSION FLOW                              │
│                                                              │
│  1. Browser tab opens → generates session_id (UUID)         │
│     stored in sessionStorage                                │
│                                                              │
│  2. Chat messages sent to n8n with session_id              │
│                                                              │
│  3. n8n stores messages to Supabase:                        │
│     - chat_sessions (metadata)                              │
│     - n8n_chat_histories (message content)                  │
│                                                              │
│  4. Sidebar loads sessions from Supabase via sessionApi     │
│                                                              │
│  5. User switches session → loads history from Supabase     │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Sidebar Component

`Sidebar.jsx` adalah komponen paling kompleks dengan fitur:

- **Navigation:** 5 menu items dengan active state
- **Session Management:**
  - Auto-load sessions saat masuk halaman chat
  - Create new chat session
  - Switch between sessions
  - Delete session (cascade delete messages)
- **Real-time History Loading:** Fetch chat history dari Supabase
- **Sub-menu System:** Session list muncul sebagai sub-menu saat di halaman chat

---

### 6. Settings Modal

Komponen untuk konfigurasi runtime tanpa rebuild:

- **Environment Toggle:** Dev ↔ Prod (auto-convert webhook URLs)
- **Webhook URL Inputs:**
  - Supervisor Agent
  - Knowledge Agent
  - Upload Dokumen
- **Persistence:** Semua settings disimpan di `localStorage`

---

## Data Flow

### Chat Message Flow (Supervisor Agent)

```
User types message
       │
       ▼
┌──────────────┐
│ MessageInput │
└──────┬───────┘
       │ onSubmit
       ▼
┌─────────────────────────────┐
│ SupervisorChat (page)       │
│  - addSupervisorMessage     │
│  - chatApi.sendToSupervisor │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ n8n Webhook (backend)       │
│  - Process with AI agents   │
│  - Store to Supabase        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Response handler            │
│  - addSupervisorMessage (AI)│
│  - Update chatStore         │
└─────────────────────────────┘
```

---

### File Upload Flow

```
User drops file
       │
       ▼
┌──────────────┐
│ UploadZone   │
└──────┬───────┘
       │ onDrop
       ▼
┌─────────────────────────────┐
│ FileWorkspace (page)        │
│  - fileApi.uploadDocument   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ n8n Upload Webhook          │
│  - Store file to storage    │
│  - Trigger indexing (RAG)   │
│  - Insert to dokumen table  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Success handler             │
│  - Refresh document list    │
└─────────────────────────────┘
```

---

## Database Schema (Supabase)

### chat_sessions
| Column     | Type      | Description                      |
|------------|-----------|----------------------------------|
| id         | UUID      | Primary key                      |
| judul      | TEXT      | Session title                    |
| chat_type  | TEXT      | 'rag_chat' atau 'general_chat'   |
| created_at | TIMESTAMP | Auto-generated                   |

### n8n_chat_histories
| Column     | Type      | Description                      |
|------------|-----------|----------------------------------|
| id         | SERIAL    | Primary key                      |
| session_id | UUID      | FK to chat_sessions              |
| message    | JSONB     | LangChain message structure      |
| created_at | TIMESTAMP | Auto-generated                   |

### dokumen
| Column     | Type      | Description                      |
|------------|-----------|----------------------------------|
| id         | SERIAL    | Primary key                      |
| filename   | TEXT      | Original filename                |
| folder     | TEXT      | 'input' atau 'output'            |
| content    | TEXT      | Extracted text content           |
| created_at | TIMESTAMP | Auto-generated                   |

---

## Key Design Patterns

### 1. Service Layer Pattern

Semua API calls di-abstractkan ke dalam service modules:
```javascript
// Usage example
import { chatApi } from '@/services/api'
await chatApi.sendToKnowledge("What is SOP?")
```

### 2. Custom Store Pattern (Zustand)

State management dengan middleware `persist`:
```javascript
export const useChatStore = create(
  persist(
    (set) => ({ ...actions }),
    { name: 'team-workspace-chat', storage: createJSONStorage(() => sessionStorage) }
  )
)
```

### 3. Barrel Export Pattern

`services/api.js` sebagai barrel module untuk backward compatibility:
```javascript
export { chatApi } from "./chatService"
export { sessionApi } from "./sessionService"
export { fileApi } from "./fileService"
```

---

## Environment Configuration

### Required Environment Variables

| Variable              | Description            |
|-----------------------|------------------------|
| `VITE_SUPABASE_URL`   | Supabase project URL   |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key   |

### Default Webhook URLs

| Agent        | Default URL                                    |
|--------------|------------------------------------------------|
| Supervisor   | `http://localhost:5678/webhook/supervisor`     |
| Knowledge    | ngrok tunnel (dev) / production webhook        |
| Upload       | ngrok tunnel (dev) / production webhook        |

---

## Build & Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Linting
npm run lint
```

**Pre-commit hooks:** Husky + lint-staged (auto-fix ESLint)

---

## File Conventions

- **Components:** PascalCase (e.g., `ChatBubble.jsx`)
- **Services:** camelCase (e.g., `chatService.js`)
- **State exports:** Named export `useChatStore`
- **API exports:** Named exports from barrel module

---

## Notes

1. **Session Persistence:** Chat messages tersimpan di `sessionStorage` (hilang saat tab ditutup)
2. **Session ID:** Unik per tab browser menggunakan `crypto.randomUUID()`
3. **Message Filtering:** `sessionService.ambilRiwayatChat()` melakukan filtering untuk menghapus internal AI logs dan tool messages
4. **Environment Switching:** Dev mode otomatis convert `/webhook` → `/webhook-test` dan sebaliknya
