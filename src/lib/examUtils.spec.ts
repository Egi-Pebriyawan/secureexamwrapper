import { describe, it, expect } from 'vitest'
import { normalizeFormUrl, hashToken, generateExamCode } from './examUtils'

describe('examUtils', () => {
  it('normalizes Google Forms URL with embedded=true', () => {
    const raw = 'https://docs.google.com/forms/d/e/1FAIpQLScxxx/viewform'
    const normalized = normalizeFormUrl(raw)
    expect(normalized).toContain('embedded=true')
    expect(normalized).toBe('https://docs.google.com/forms/d/e/1FAIpQLScxxx/viewform?embedded=true')
  })

  it('preserves existing queries on Google Forms and adds embedded=true', () => {
    const raw = 'https://docs.google.com/forms/d/e/1FAIpQLScxxx/viewform?usp=sf_link'
    const normalized = normalizeFormUrl(raw)
    expect(normalized).toContain('embedded=true')
    expect(normalized).toContain('usp=sf_link')
  })

  it('keeps other form providers as-is', () => {
    const tallyUrl = 'https://tally.so/r/wz1234'
    expect(normalizeFormUrl(tallyUrl)).toBe('https://tally.so/r/wz1234')
  })

  it('generates a 6-character uppercase exam code', () => {
    const code = generateExamCode()
    expect(code).toHaveLength(6)
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('hashes token securely using SHA-256', async () => {
    const token = '123456'
    const hash1 = await hashToken(token)
    const hash2 = await hashToken('123456')
    const hashDiff = await hashToken('654321')

    expect(hash1).toBe(hash2)
    expect(hash1).not.toBe(hashDiff)
    expect(hash1).toHaveLength(64) // SHA-256 hex is 64 chars
  })
})
