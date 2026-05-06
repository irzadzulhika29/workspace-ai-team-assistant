const EMPTY_RESPONSE_TEXT = '_(Respons kosong)_'
const INVALID_FORMAT_TEXT = 'Format balasan dari server tidak sesuai dugaan.'

const hasText = (value) => typeof value === 'string' && value.trim().length > 0

const parseJsonString = (value) => {
  if (!hasText(value) || !/^[{[]/.test(value.trim())) {
    return null
  }

  try {
    return JSON.parse(value.trim())
  } catch {
    return null
  }
}

const normalizeAgentText = (value) => {
  if (!hasText(value)) {
    return value
  }

  const parsed = parseJsonString(value)

  if (Array.isArray(parsed) && hasText(parsed[0]?.output)) {
    return normalizeAgentText(parsed[0].output)
  }

  if (parsed && typeof parsed === 'object' && hasText(parsed.output)) {
    return normalizeAgentText(parsed.output)
  }

  if (parsed?.action === 'clarify' && hasText(parsed.message)) {
    return parsed.message.trim()
  }

  return value.trim()
}

const resolveTextFromObject = (payload, keys) => {
  for (const key of keys) {
    if (hasText(payload?.[key])) {
      return normalizeAgentText(payload[key])
    }
  }

  return null
}

export const getReplyContent = (payload, keys = ['reply', 'myField']) => {
  if (!payload) return EMPTY_RESPONSE_TEXT

  if (typeof payload === 'string') {
    return normalizeAgentText(payload) || EMPTY_RESPONSE_TEXT
  }

  if (Array.isArray(payload)) {
    return getReplyContent(payload[0], keys)
  }

  if (payload.action === 'clarify' && hasText(payload.message)) {
    return payload.message.trim()
  }

  return resolveTextFromObject(payload, keys) ?? INVALID_FORMAT_TEXT
}

export const normalizeResponsePayload = (payload) =>
  Array.isArray(payload) ? (payload[0] ?? {}) : (payload ?? {})
