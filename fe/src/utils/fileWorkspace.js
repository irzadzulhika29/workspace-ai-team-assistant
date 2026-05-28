const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])
const PDF_EXTENSIONS = new Set(['pdf'])
const OFFICE_EXTENSIONS = new Set(['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'])
const GENERATED_CATEGORIES = new Set(['generated', 'report', 'presentation', 'output'])

export const normalizeFileUrl = (rawUrl) => {
  if (!rawUrl) return null

  const cleaned = String(rawUrl)
    .trim()
    .replace(/^["'=]+|["']+$/g, '')
    .trim()

  if (!cleaned) return null

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    if (cleaned.startsWith('http://localhost:8000/')) {
      return `${SUPABASE_BASE_URL}${cleaned.replace('http://localhost:8000', '')}`
    }
    return cleaned
  }

  if (cleaned.startsWith('/')) {
    return `${SUPABASE_BASE_URL}${cleaned}`
  }

  console.warn('[normalizeFileUrl] Format URL tidak dikenali:', rawUrl)
  return null
}

export const formatDateLabel = (value) => {
  if (!value) return 'Tanggal tidak tersedia'

  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'Tanggal tidak tersedia'
  }
}

export const getDocumentBadge = (doc) => {
  const type = doc.documentType || 'uncategorized'
  return type.replace(/[_-]/g, ' ')
}

export const normalizeCategoryGroup = (kategori) => {
  const normalized = String(kategori || '').trim().toLowerCase()
  if (GENERATED_CATEGORIES.has(normalized)) return 'generated'
  return 'uploaded'
}

export const isGeneratedDocument = (doc) =>
  normalizeCategoryGroup(doc?.categoryGroup || doc?.kategori) === 'generated'

export const getDocumentTone = (doc) => {
  if (isGeneratedDocument(doc)) {
    return {
      iconWrap: 'bg-cyan-50 text-cyan-700',
    }
  }

  return {
    iconWrap: 'bg-emerald-50 text-emerald-700',
  }
}

export const getDocumentExtension = (doc) => {
  const rawValue = String(doc?.name || doc?.url || '')
  const normalized = rawValue.split('?')[0].trim().toLowerCase()
  const segments = normalized.split('.')
  return segments.length > 1 ? segments.pop() : ''
}

export const getDocumentPreviewKind = (doc) => {
  const extension = getDocumentExtension(doc)

  if (IMAGE_EXTENSIONS.has(extension)) return 'image'
  if (PDF_EXTENSIONS.has(extension)) return 'pdf'
  if (OFFICE_EXTENSIONS.has(extension)) return 'office'
  return 'fallback'
}

export const getOfficePreviewUrl = (url) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`

export const getPdfPreviewUrl = (url) =>
  `${url}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`

export const normalizeDocumentRecord = (doc) => {
  const cleanUrl = normalizeFileUrl(doc.file_url)
  if (!cleanUrl) return null

  return {
    id: doc.id ?? crypto.randomUUID(),
    name: doc.nama_file ?? 'Untitled',
    type: 'file',
    url: cleanUrl,
    downloadUrl: cleanUrl,
    source: 'supabase',
    createdAt: doc.created_at,
    kategori: doc.kategori || 'uploaded',
    categoryGroup: normalizeCategoryGroup(doc.kategori),
    documentType: doc.document_type || 'uncategorized',
    metadata: doc.metadata || {},
  }
}
