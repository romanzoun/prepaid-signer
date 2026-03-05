import { describe, it, expect } from 'vitest'
import { calculatePrice, createMockCheckoutSession } from '../services/mockStripe'

describe('calculatePrice', () => {
  it('calculates correct subtotal for 1 signatory', () => {
    const p = calculatePrice(1)
    expect(p.count).toBe(1)
    expect(p.subtotal).toBe(3.15)
    expect(p.perSignatureGross).toBe(3.4)
    expect(p.currency).toBe('CHF')
  })

  it('calculates correct subtotal for 5 signatories', () => {
    const p = calculatePrice(5)
    expect(p.subtotal).toBe(15.75)
  })

  it('applies VAT correctly for QES gross pricing', () => {
    const p = calculatePrice(1)
    expect(p.tax).toBeCloseTo(0.25, 2)
    expect(p.total).toBe(3.4)
  })

  it('total equals subtotal + tax', () => {
    const p = calculatePrice(3)
    expect(p.total).toBeCloseTo(p.subtotal + p.tax, 2)
  })

  it('returns perSignature net and gross for QES', () => {
    const p = calculatePrice(10)
    expect(p.perSignature).toBe(3.15)
    expect(p.perSignatureGross).toBe(3.4)
  })

  it('supports AES and SIMPLE pricing levels', () => {
    const aes = calculatePrice(1, 'AES')
    const simple = calculatePrice(1, 'SIMPLE')
    expect(aes.total).toBe(1.9)
    expect(simple.total).toBe(1.2)
  })
})

describe('createMockCheckoutSession', () => {
  it('returns success status', async () => {
    const order = { documentName: 'test.pdf', signatories: [] }
    const result = await createMockCheckoutSession(order)
    expect(result.status).toBe('success')
    expect(result.sessionId).toMatch(/^mock_session_/)
  })
})
