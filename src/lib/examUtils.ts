/**
 * Normalizes a form URL for iframe embedding (EX-03)
 * E.g., Google Forms are automatically converted to ?embedded=true
 */
export function normalizeFormUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()

  try {
    const parsed = new URL(trimmed)
    
    // Google Forms
    if (parsed.hostname.includes('docs.google.com') && parsed.pathname.includes('/forms/')) {
      parsed.searchParams.set('embedded', 'true')
      return parsed.toString()
    }

    return trimmed
  } catch {
    return trimmed
  }
}

/**
 * Basic SHA-256 string hash helper using Web Crypto API
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token.trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate random 6-character exam code (EX-01)
 */
export function generateExamCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

