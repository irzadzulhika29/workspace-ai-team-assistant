# n8n Workflows (`n8n/`)

## Package Identity
n8n workflow definitions for AI orchestration. The production n8n instance runs at `https://workflow.jagr.id`. Workflows are exported as JSON files from n8n for version control. Three core workflows handle chat, document ingestion, and dashboard briefings.

## Workflow Inventory

| Workflow File | n8n Name | Purpose | Key Webhook Paths |
|---|---|---|---|
| `workflow/Agents Orchestrator.json` | AI Assistant Team | Main chat agent + multi-agent delegation + document generation + email draft/send + token logging | `chat`, `upload-document` |
| `workflow/Ingest Documents.json` | (document ingestion) | Upload docs → Supabase storage + Pinecone vector indexing | (upload endpoints) |
| `workflow/Workspace.json` | (workspace) | General workspace operations | (various) |
| `workflow/Dashboard Summary.json` | Get Summary Activity | AI briefing generation for Dashboard (Jira, Calendar, Email) | `briefings` |

## Webhook Entry Points (Agents Orchestrator)

| Path | Method | Consumer | Purpose |
|---|---|---|---|
| `chat` | POST | Frontend (SupervisorChat, KnowledgeChat) | Main chat: receives JSON or multipart (file). Routes to Supervisor Agent |
| `upload-document` | POST | Frontend (FileWorkspace) | Document upload: stores in Supabase, indexes in Pinecone |

## Agent Architecture

### Supervisor Agent
Central orchestrator. Decides direct answer vs delegation to specialist agents. Connected to 6 specialist agents:
- **Knowledge Agent** — RAG-based SOP/knowledge Q&A using Pinecone vector store
- **Scheduler Agent** — Google Calendar: create/list/delete events, Google Meet
- **Task Agent** — Jira issue reading (read-only)
- **Communication Agent** — Email draft/send JSON output
- **Document Agent** — PDF reports and slide presentations
- **Report Agent** — Summarize/restructure data from prompt (no external fetch)

### Specialist Agent Skills
Agent skill instructions are in `workflow/skills/`:
- `create_email.md` — Email draft/send JSON format specification
- `create_ppt.md` — PowerPoint slide format specification
- `create_report.md` — Report format specification

### File Processing Pipeline
When a file is attached to a chat message:
1. Route by MIME type: `image/*` (Tesseract OCR), `application/pdf` (text extraction), `text/csv` (CSV parsing)
2. Combine extracted text with user prompt
3. Send to Supervisor Agent

### Output Routing
The `Route Output Type` node decides final pipeline based on output markers:
- Contains `"action":"draft"` → Draft email → `Format Draft Email` → respond
- Contains `"action":"send"` → Send email → HTTP request → respond
- Contains `Unduh Dokumen (PDF)` → PDF report generation pipeline
- Contains `Unduh Presentasi (PDF)` → PPT → PDF conversion pipeline
- Default → Normal chat response → write to Supabase `chat_messages`

### Token Logging
After every response, async sub-workflow logs execution token usage and duration to Supabase `execution_token_usage` table.

## Document Ingestion Pipeline
1. Receive file via `upload-document` webhook
2. Upload to Supabase Storage
3. Create row in Supabase `dokumen` table
4. Load via LangChain document loader
5. Split text with Character Text Splitter
6. Generate embeddings (HuggingFace Inference)
7. Store vectors in Pinecone

## Dashboard Briefing Workflow (Get Summary Activity)
1. Webhook receives `user_id`, `google_access_token`, `jira_credentials`
2. Parallel data collection: Calendar (today's events), Gmail (unread, last 7 days), Jira (active issues)
3. Each domain data sent to AI for summarization: priority, headline, summary_points, source_metrics
4. Results upserted to Supabase `dashboard_summary_snapshots` via backend `/api/dashboard/briefings/upsert`

## Working with Workflow Files
- Workflow files are n8n JSON exports — manually export from n8n to update
- Never manually edit the JSON without testing in n8n first
- Webhook paths in `fe/src/services/api.js` must match deployed n8n paths
- Frontend uses `VITE_N8N_URL` and mode (`publish`/`test`) to construct webhook URLs

## JIT Index Hints
```bash
# Find webhook node definitions in workflows
rg -n '"Webhook"' n8n/workflow --include "*.json"

# Find agent tool configurations
rg -n '"toolDescription"' n8n/workflow --include "*.json"

# Find HTTP request node URLs
rg -n '"url"' n8n/workflow --include "*.json"

# Search skill files for keyword
rg -n "keyword" n8n/workflow/skills
```
