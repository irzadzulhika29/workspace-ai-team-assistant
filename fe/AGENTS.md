# Frontend (`fe/`)

## Package Identity
React 18 SPA with Vite 5, Tailwind CSS, Zustand state management, and React Router 6. Pure JavaScript (no TypeScript), `@/` path alias for absolute imports.

## Setup & Run

```bash
cd fe
npm install          # From root: npm install (workspaces)
npm run dev          # Vite dev server on port 5173
npm run build        # Production build → fe/dist/
npm run lint         # ESLint --max-warnings 0 on *.js,*.jsx
npm run preview      # Preview production build locally
```

From root workspace:
```bash
npm run dev:fe       # Start frontend dev server
npm run build        # Build frontend for production
```

## Patterns & Conventions

### File Organization
```
fe/src/
├── components/      # React components grouped by domain
│   ├── auth/        # Auth guards
│   ├── chat/        # Chat UI (bubbles, input, source citations)
│   ├── dashboard/   # Dashboard widgets (BriefingCard)
│   ├── documents/   # Document workspace components
│   ├── email/       # Gmail list, detail, drafts, Magic Reply
│   ├── files/       # File upload, preview, folder tree
│   ├── integrations/# Integration setup cards (Jira)
│   ├── layout/      # App shell (Sidebar, MobileHeader)
│   └── ui/          # Shared UI primitives (button, card, modal, tabs, etc.)
├── context/         # React context providers (AuthContext, SidebarContext)
├── hooks/           # Custom hooks (useAutoScroll)
├── pages/           # Page-level components (one per route)
├── services/        # API/service modules (one per domain)
├── store/           # Zustand stores (chat, email, integration)
├── styles/          # Design tokens CSS
└── utils/           # Shared utilities
```

### Imports
- DO: Use `@/` alias for internal imports → `import { Button } from '@/components/ui'`
- DO: Import React in files using hooks/JSX (even though JSX transform doesn't require it)
- DO: Use barrel exports from `@/components/ui` and `@/services/api`
- DON'T: Use relative paths across the tree (e.g., `../../components/ui/button`)

### State Management
- Zustand stores in `fe/src/store/` — see [fe/src/store/chatStore.js](src/store/chatStore.js) for canonical pattern
- Stores use `persist` middleware for localStorage persistence where appropriate
- Chat messages persist to `sessionStorage` (per-tab, not localStorage)
- Session UUIDs are per-tab via `sessionStorage`
- Key stores: `chatStore.js` (messages, sessions, auto-send), `emailStore.js` (inbox, filters, compose), `integrationStore.js` (OAuth/Jira status)

### Service Layer
- Barrel module at [fe/src/services/api.js](src/services/api.js) — webhook URL builder, mode management, re-exports all services
- Each service module exports a named API object: `chatApi`, `sessionApi`, `fileApi`, `emailApi`, `jiraApi`, `tokenUsageApi`, `integrationApi`, `briefingApi`, `emailDraftApi`, `emailWebhookApi`
- HTTP calls use Axios with `withCredentials: true` for session cookies
- DO: Pattern from [fe/src/services/chatService.js](src/services/chatService.js) — `export const chatApi = { methodName: async (params) => { ... } }`
- DO: Pattern from [fe/src/services/sessionService.js](src/services/sessionService.js) — session CRUD with history filtering

### Components
- Use functional components only, `export default function` for pages, named exports for reusable
- Tailwind utility classes for styling, no CSS modules
- Motion library (`motion/react`) for animations — see `AnimatedList` in `components/ui/animated-list.jsx`
- Chat history filtering: `sessionService.ambilRiwayatChat()` strips n8n/LangChain internal messages (tool calls, empty messages, JSON blobs) and injects PDF document URLs
- React Router Link/useNavigate for navigation, optional state passing (e.g., email context for Magic Reply)

### New Page Checklist
When adding a new page/route:
1. Create page component in `fe/src/pages/` following existing patterns (see `Dashboard.jsx`, `EmailPage.jsx`)
2. Add route in `fe/src/App.jsx` inside the `<Layout>` component's `<Routes>` block
3. Add sidebar link in `fe/src/components/layout/Sidebar.jsx` if needed
4. Create service module in `fe/src/services/` if backend communication needed
5. Create Zustand store in `fe/src/store/` if state management needed

## Key Files

| File | Purpose |
|---|---|
| `src/App.jsx` | Route definitions, layout wrapper, auth guard |
| `src/main.jsx` | React entry point, renders App |
| `src/services/api.js` | Webhook URL builder, session ID, Axios config, barrel exports |
| `src/services/chatService.js` | Send messages to Supervisor/Knowledge agents |
| `src/services/sessionService.js` | Chat session CRUD + history filtering |
| `src/services/briefingService.js` | AI briefing dashboard data + n8n refresh trigger |
| `src/store/chatStore.js` | Chat messages, active session, auto-send flags |
| `src/components/layout/Sidebar.jsx` | App navigation sidebar |
| `src/components/layout/MobileHeader.jsx` | Mobile top bar with hamburger menu |
| `src/context/AuthContext.jsx` | Google OAuth session state |
| `vite.config.js` | Vite config (plugins, path aliases, proxy) |

## JIT Index Hints

```bash
# Find page components
rg -n "export default function" fe/src/pages

# Find Zustand stores and their fields
rg -n "create\(" fe/src/store
rg -n "set\(" fe/src/store

# Find service API method definitions
rg -n "export const \w+Api" fe/src/services

# Find component imports from ui/
rg -n "from '@/components/ui'" fe/src

# Find React Router route definitions
rg -n "<Route" fe/src/App.jsx

# Find Tailwind class usage
rg -n "className=" fe/src/components
```

## Common Gotchas
- Frontend uses `VITE_SUPABASE_ANON_KEY` (read-only), never the service role key — Supabase calls go through Express endpoints (`/api/sessions/*`)
- n8n webhook mode (`publish`/`test`) is stored in `localStorage`, not `sessionStorage`
- `VITE_N8N_URL` overrides the default `https://workflow.jagr.id` for n8n connections
- File uploads to n8n use multipart/form-data, not JSON
- Settings modal (n8n env/mode config) is in `components/ui/SettingsModal.jsx`, accessed via sidebar gear icon

## Pre-PR Checks
```bash
npm run lint --workspace fe && npm run build --workspace fe
```
