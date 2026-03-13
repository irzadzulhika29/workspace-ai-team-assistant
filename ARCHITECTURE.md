# Project Architecture

## Overview

This project is a Vite + React single-page application for an AI team workspace.
Core capabilities:

- Supervisor chat (task delegation to n8n webhook)
- Knowledge chat (RAG-style chat with document context)
- File workspace (upload + browse documents)
- Knowledge session management via Supabase

The app uses:

- `react-router-dom` for page routing
- `zustand` for client state management (persisted to `sessionStorage`)
- `axios` and `fetch` for HTTP calls
- Supabase REST API (direct calls via anon key)

## Directory Structure

```text
src/
  main.jsx                 # app bootstrap
  App.jsx                  # router + global layout
  index.css                # global styles / Tailwind layers

  pages/                   # route-level pages
    Dashboard.jsx
    SupervisorChat.jsx
    KnowledgeChat.jsx
    FileWorkspace.jsx

  components/
    layout/                # shell/navigation components
      Sidebar.jsx
    chat/                  # chat UI building blocks
      ChatBubble.jsx
      MessageInput.jsx
      AgentStatusIndicator.jsx
      SourceCitation.jsx
    files/                 # file tree/upload/preview components
      FolderTree.jsx
      UploadZone.jsx
      FilePreviewModal.jsx
    ui/                    # shared presentational UI
      AgentCard.jsx
      SkeletonLoader.jsx
      SettingsModal.jsx

  services/                # external API boundary
    api.js                 # endpoint settings + session id helpers
    chatService.js         # n8n chat calls
    fileService.js         # upload + Supabase docs fetch
    sessionService.js      # Supabase session/history CRUD
    supabase.js            # env-based Supabase config

  store/
    chatStore.js           # zustand store (messages, sessions, connection)

  hooks/
    useAutoScroll.js       # shared chat autoscroll behavior

  utils/
    chatResponse.js        # response normalization/parsing helpers
```

## Layered Design

1. **UI Layer** (`pages/`, `components/`)
   - Renders interface, handles user interactions.
   - Calls actions from store and service functions.

2. **State Layer** (`store/chatStore.js`)
   - Holds in-memory session state for chats.
   - Persists selected state to `sessionStorage` using Zustand `persist` middleware.

3. **Service Layer** (`services/`)
   - Encapsulates network calls to n8n and Supabase REST.
   - Keeps endpoint and payload details out of UI components.

4. **Utility/Hook Layer** (`utils/`, `hooks/`)
   - Shared logic reused by multiple UI modules.

## Runtime Flow

### 1) App bootstrap and routing

- `main.jsx` mounts `<App />` under `React.StrictMode`.
- `App.jsx` defines routes and wraps pages with a persistent sidebar layout.

### 2) Chat message flow (Supervisor/Knowledge)

1. User types in `MessageInput`.
2. Page (`SupervisorChat` or `KnowledgeChat`) adds a user message to Zustand store.
3. Page calls `chatApi` (`chatService.js`) to send payload to n8n webhook.
4. Response is normalized via `utils/chatResponse.js`.
5. Page adds AI message (content, metadata, sources, timing) to store.
6. `ChatBubble` renders message list; `useAutoScroll` keeps viewport at latest message.

### 3) Knowledge session flow

1. `Sidebar` detects active knowledge page.
2. `sessionApi` fetches session list from Supabase (`chat_sessions`).
3. On session change, history is fetched from `n8n_chat_histories`.
4. `setKnowledgeMessages` hydrates message list in store.

### 4) File workspace flow

1. `FileWorkspace` loads documents via `fileApi.fetchDokumen()` from Supabase table `dokumen`.
2. Upload uses `fileApi.uploadDocument()` to n8n upload webhook.
3. Folder tree merges Supabase docs with local uploaded state for display.

## State Model (Zustand)

Primary state in `chatStore.js`:

- `supervisorMessages[]`
- `knowledgeMessages[]`
- `knowledgeSessions[]`
- `activeKnowledgeSessionId`
- `isConnected`

Persisted subset (`sessionStorage`):

- `supervisorMessages`
- `knowledgeMessages`
- `activeKnowledgeSessionId`

## Configuration and Environment

Environment variables (from `.env`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Webhook URLs are managed in browser `localStorage` through `services/api.js`:

- supervisor, knowledge, pm, report, status, upload endpoints

## Architectural Conventions

- Keep API calls inside `services/`, not inside deeply nested presentational components.
- Keep reusable cross-page logic in `hooks/` and `utils/`.
- Use Zustand selectors (and `shallow` when relevant) to reduce unnecessary rerenders.
- Keep route-level orchestration in `pages/`; move reusable visuals into `components/`.

## Known Boundaries

- This frontend talks directly to Supabase REST with anon key headers.
- Business workflow orchestration lives in n8n webhooks (external to this repository).
- `dist/` is build output, not source architecture.
