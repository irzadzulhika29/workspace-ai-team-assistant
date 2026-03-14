# Project Architecture

## Overview

This project is a Vite + React single-page application for an AI team workspace.

Main capabilities:

- Supervisor chat (delegates operational requests to n8n webhook)
- Knowledge chat (RAG-style chat with document context)
- Session history management in sidebar (create, switch, delete)
- Document workspace (upload and browse files from n8n + Supabase)
- Google Calendar workspace (read upcoming events)

Technology stack:

- `react-router-dom` for routing
- `zustand` for client state (`sessionStorage` persistence)
- `axios` + `fetch` for network calls
- Supabase REST API (direct call, no `supabase-js` SDK)
- n8n webhooks as backend orchestration layer

## High-Level Architecture

The app uses a simple layered architecture:

1. **UI Layer** (`pages/`, `components/`)
   - Renders screens and handles user interaction.
   - Triggers state actions and service calls.

2. **State Layer** (`store/chatStore.js`)
   - Stores chat messages, selected sessions, and connection status.
   - Persists selected fields to `sessionStorage` via Zustand `persist`.

3. **Service Layer** (`services/`)
   - Encapsulates all external calls: n8n webhooks, Supabase REST, Google Calendar API.
   - Keeps endpoint details and payload formats out of page components.

4. **Utility Layer** (`utils/`, `hooks/`)
   - Shared helpers for response normalization and UX behavior (auto-scroll).

## Source Tree

```text
src/
  main.jsx
  App.jsx
  index.css

  pages/
    Dashboard.jsx
    SupervisorChat.jsx
    KnowledgeChat.jsx
    FileWorkspace.jsx
    CalendarPage.jsx

  components/
    layout/
      Sidebar.jsx
    chat/
      ChatBubble.jsx
      MessageInput.jsx
      AgentStatusIndicator.jsx
      SourceCitation.jsx
    files/
      FolderTree.jsx
      UploadZone.jsx
      FilePreviewModal.jsx
    ui/
      AgentCard.jsx
      SkeletonLoader.jsx
      SettingsModal.jsx

  services/
    api.js
    chatService.js
    sessionService.js
    fileService.js
    calendarService.js
    supabase.js

  store/
    chatStore.js

  hooks/
    useAutoScroll.js

  utils/
    chatResponse.js
```

## Routing and Shell

- Router is defined in `src/App.jsx` using `BrowserRouter`.
- A persistent sidebar layout wraps all routes.
- Route map:
  - `/` -> `Dashboard`
  - `/chat/supervisor` -> `SupervisorChat`
  - `/chat/knowledge` -> `KnowledgeChat`
  - `/workspace/files` -> `FileWorkspace`
  - `/workspace/calendar` -> `CalendarPage`
  - `*` -> `Dashboard`

## State Model (Zustand)

Store file: `src/store/chatStore.js`

Core state:

- `supervisorMessages[]`
- `knowledgeMessages[]`
- `isConnected`
- `knowledgeSessions[]`
- `activeKnowledgeSessionId`
- `supervisorSessions[]`
- `activeSupervisorSessionId`

Main actions:

- Add/clear/set messages for each chat channel
- Set sessions and active session ID for each chat type
- Set backend connection status

Persisted subset (`sessionStorage`, key: `team-workspace-chat`):

- `supervisorMessages`
- `knowledgeMessages`
- `activeKnowledgeSessionId`
- `activeSupervisorSessionId`

## Service Layer Details

### `src/services/api.js`

- Barrel re-export for `chatApi`, `sessionApi`, `fileApi`, and Supabase config.
- Manages webhook URLs in `localStorage` via `urls` object.
- Provides `getSessionId()` (per-tab session UUID in `sessionStorage`).
- Provides `statusApi.checkStatus()` (health check to n8n status endpoint).

### `src/services/chatService.js`

- Sends chat payload to n8n via axios with 60s timeout.
- `sendToSupervisor(message, action, sessionId)` sends `chat_type: general_chat`.
- `sendToKnowledge(message, contextFilter, sessionId)` sends `chat_type: rag_chat`.
- Uses explicit selected session when available, fallback to `getSessionId()`.

### `src/services/sessionService.js`

Supabase REST CRUD for:

- `chat_sessions`
- `n8n_chat_histories`

Functions:

- `buatSesiBaru(judulChat, chatType)`
- `ambilSemuaSesi(chatType)`
- `ambilRiwayatChat(sessionId)` (filters tool traces/internal agent logs)
- `hapusSesiChat(sessionId)` (deletes histories first, then session row)

### `src/services/fileService.js`

- Uploads document to n8n upload webhook with `FormData`.
- Reads document list from Supabase table `dokumen`.

### `src/services/calendarService.js`

- Reads upcoming events from Google Calendar REST API.
- Uses env vars:
  - `VITE_GOOGLE_CALENDAR_API_KEY`
  - `VITE_GOOGLE_CALENDAR_ID`

### `src/services/supabase.js`

- Exposes:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `supabaseHeaders` (apikey + Bearer token + JSON content type)

## Runtime Flows

### 1) Chat send flow (Supervisor and Knowledge)

1. User sends message from `MessageInput`.
2. Page appends user message to Zustand.
3. Page calls `chatApi` service to n8n webhook.
4. Response is normalized by `utils/chatResponse.js`.
5. Page appends AI message (content + optional metadata/sources/actions).
6. `ChatBubble` renders markdown AI response; `useAutoScroll` scrolls to latest.

### 2) Session history flow (Sidebar)

1. When opening `/chat/knowledge` or `/chat/supervisor`, `Sidebar` loads sessions by `chat_type`.
2. If no session exists, sidebar auto-creates a new one.
3. Selecting a session loads chat history from `n8n_chat_histories`.
4. History rows are mapped into UI messages and stored via `setKnowledgeMessages` or `setSupervisorMessages`.
5. Deleting a session from history bubble calls `sessionApi.hapusSesiChat(sessionId)`, then refreshes session list and reselects a valid active session.

### 3) File workspace flow

1. `FileWorkspace` fetches existing docs from Supabase table `dokumen`.
2. UI groups docs by folder (`input` or `output`).
3. `UploadZone` uploads selected files to n8n upload webhook.
4. Uploaded files are merged with fetched docs for display and preview.

### 4) Calendar flow

1. `CalendarPage` calls `calendarApi.fetchCalendarEvents()` on load.
2. Service builds Google Calendar URL with query parameters.
3. Page renders loading, error, empty state, or event list.

## Data Contracts and Persistence

### Supabase tables used by frontend

- `chat_sessions`
  - fields used: `id`, `judul`, `chat_type`, `created_at`
- `n8n_chat_histories`
  - fields used: `id`, `session_id`, `message`, `created_at`
- `dokumen`
  - fields used: `id`, `nama_file`, `kategori`, `file_url`, `created_at`

### Browser persistence

- `sessionStorage`
  - Zustand persisted chat state (`team-workspace-chat`)
  - per-tab generated session id (`session_id`)
- `localStorage`
  - n8n webhook URL settings saved from `SettingsModal`

## Environment Configuration

Required env variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CALENDAR_API_KEY`
- `VITE_GOOGLE_CALENDAR_ID`

Notes:

- n8n webhook endpoints are configurable at runtime from Settings modal and stored in `localStorage`.
- Supabase requests are executed directly from frontend using anon key headers.

## Boundaries and Responsibilities

- This repository contains frontend only.
- n8n handles orchestration/business workflow outside this codebase.
- Supabase enforces data access policy and stores chat/document data.
- Build output (`dist/`) is generated artifact and not part of source architecture.
