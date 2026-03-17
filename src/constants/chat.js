// Agent status labels
export const AGENT_STATUS_LABELS = {
  supervisor: 'Supervisor Agent',
  pm: 'Project Manager Agent',
  knowledge: 'Knowledge Agent',
  reporting: 'Reporting Agent',
}

// Context filter options for Knowledge Agent
export const CONTEXT_OPTIONS = [
  { value: null, label: 'Semua Dokumen' },
  { value: 'input', label: 'Folder: Input (SOP)' },
  { value: 'output', label: 'Folder: Output' },
]

// Error messages
export const ERROR_MESSAGES = {
  TIMEOUT: 'Request timeout. Backend n8n tidak merespons dalam 120 detik.',
  CONNECTION: 'Tidak dapat terhubung ke n8n. Periksa URL webhook di Settings.',
  KNOWLEDGE_TIMEOUT: 'Request timeout setelah 120 detik. Coba lagi atau periksa koneksi ke n8n.',
  KNOWLEDGE_CONNECTION: 'Tidak dapat terhubung ke Knowledge Agent. Periksa URL webhook di Settings.',
}
