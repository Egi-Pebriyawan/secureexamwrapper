/**
 * Device fingerprint & ID helper
 */
export function getOrCreateDeviceId(): string {
  const STORAGE_KEY = 'sew_device_id'
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = 'dev_' + crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

export function getUserAgentSummary(): string {
  const ua = navigator.userAgent
  let browser = 'Browser'
  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'

  let os = 'OS'
  if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Linux')) os = 'Linux'

  return `${browser} on ${os}`
}

export function isIosSafari(): boolean {
  const ua = navigator.userAgent
  return (ua.includes('iPhone') || ua.includes('iPad')) && ua.includes('Safari') && !ua.includes('Chrome')
}
