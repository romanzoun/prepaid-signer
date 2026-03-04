export interface SignatureOrder {
  documentName: string
  signatories: Signatory[]
}

export interface Signatory {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  signatureLevel?: 'SIMPLE' | 'AES' | 'QES'
}

export interface PriceBreakdown {
  perSignature: number
  count: number
  subtotal: number
  tax: number
  total: number
  currency: string
}

export interface PaymentResult {
  sessionId: string
  status: 'success' | 'cancelled'
}

// Cost to us (Swisscom Sign): CHF 2.50 → 20% margin → CHF 3.15 net
const PRICE_PER_SIGNATURE = 3.15
const TAX_RATE = 0.081 // Swiss MwSt 8.1% (seit 01.01.2024)

export function calculatePrice(signatoryCount: number): PriceBreakdown {
  const subtotal = signatoryCount * PRICE_PER_SIGNATURE
  const tax = subtotal * TAX_RATE
  return {
    perSignature: PRICE_PER_SIGNATURE,
    count: signatoryCount,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round((subtotal + tax) * 100) / 100,
    currency: 'CHF',
  }
}

export async function createMockCheckoutSession(_order: SignatureOrder): Promise<PaymentResult> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1200))
  // Mock: always succeeds
  return {
    sessionId: `mock_session_${Date.now()}`,
    status: 'success',
  }
}
