const EMPTY_RESPONSE_TEXT = '_(Respons kosong)_'
const INVALID_FORMAT_TEXT = 'Format balasan dari server tidak sesuai dugaan.'

const hasText = (value) => typeof value === 'string' && value.trim().length > 0

const resolveTextFromObject = (payload, keys) => {
  for (const key of keys) {
    if (hasText(payload?.[key])) {
      return payload[key].trim()
    }
  }

  return null
}

export const getReplyContent = (payload, keys = ['reply', 'myField']) => {
  if (!payload) return EMPTY_RESPONSE_TEXT

  if (typeof payload === 'string') {
    return payload.trim() || EMPTY_RESPONSE_TEXT
  }

  if (Array.isArray(payload)) {
    return getReplyContent(payload[0], keys)
  }

  return resolveTextFromObject(payload, keys) ?? INVALID_FORMAT_TEXT
}

export const normalizeResponsePayload = (payload) =>
  Array.isArray(payload) ? (payload[0] ?? {}) : (payload ?? {})
