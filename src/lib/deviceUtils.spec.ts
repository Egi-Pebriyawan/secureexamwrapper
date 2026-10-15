import { describe, it, expect, beforeEach } from 'vitest'
import { getOrCreateDeviceId, getUserAgentSummary } from './deviceUtils'

describe('deviceUtils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('generates and persists a device id in localStorage', () => {
    const id1 = getOrCreateDeviceId()
    expect(id1).toMatch(/^dev_/)
    expect(localStorage.getItem('sew_device_id')).toBe(id1)

    // Second call should return the exact same persisted ID
    const id2 = getOrCreateDeviceId()
    expect(id2).toBe(id1)
  })

  it('detects and summarizes user agent correctly', () => {
    const summary = getUserAgentSummary()
    expect(typeof summary).toBe('string')
    expect(summary.length).toBeGreaterThan(0)
  })
})
