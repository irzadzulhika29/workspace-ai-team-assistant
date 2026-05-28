/**
 * Document utility functions for file handling and formatting
 */

// File type constants
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
export const PDF_EXTENSIONS = ['pdf'];
export const OFFICE_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

/**
 * Normalize file URL to use Supabase storage URL
 * @param {string} url - Original file URL
 * @returns {string} Normalized URL
 */
export function normalizeFileUrl(url) {
  if (!url) return '';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return url;
  
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
    const pathMatch = url.match(/\/storage\/v1\/object\/public\/(.+)/);
    if (pathMatch) {
      return `${supabaseUrl}/storage/v1/object/public/${pathMatch[1]}`;
    }
  }
  return url;
}

/**
 * Format date label for document grouping
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date label
 */
export function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return 'Last 7 days';
  if (diffDays <= 30) return 'Last 30 days';

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension in lowercase
 */
export function getFileExtension(filename) {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
}

/**
 * Get appropriate icon component for file type
 * @param {string} filename - File name
 * @returns {string} Icon name for lucide-react
 */
export function getFileIcon(filename) {
  const ext = getFileExtension(filename);
  
  if (IMAGE_EXTENSIONS.includes(ext)) return 'Image';
  if (PDF_EXTENSIONS.includes(ext)) return 'FileText';
  if (OFFICE_EXTENSIONS.includes(ext)) {
    if (ext.includes('doc')) return 'FileText';
    if (ext.includes('xls')) return 'Sheet';
    if (ext.includes('ppt')) return 'Presentation';
  }
  return 'File';
}

/**
 * Check if file is an image
 * @param {string} filename - File name
 * @returns {boolean} True if file is an image
 */
export function isImageFile(filename) {
  return IMAGE_EXTENSIONS.includes(getFileExtension(filename));
}

/**
 * Check if file is a PDF
 * @param {string} filename - File name
 * @returns {boolean} True if file is a PDF
 */
export function isPdfFile(filename) {
  return PDF_EXTENSIONS.includes(getFileExtension(filename));
}

/**
 * Check if file is an Office document
 * @param {string} filename - File name
 * @returns {boolean} True if file is an Office document
 */
export function isOfficeFile(filename) {
  return OFFICE_EXTENSIONS.includes(getFileExtension(filename));
}

/**
 * Group documents by date
 * @param {Array} documents - Array of document objects
 * @returns {Object} Documents grouped by date label
 */
export function groupDocumentsByDate(documents) {
  const grouped = {};
  
  documents.forEach(doc => {
    const label = formatDateLabel(doc.created_at);
    if (!grouped[label]) {
      grouped[label] = [];
    }
    grouped[label].push(doc);
  });
  
  return grouped;
}
