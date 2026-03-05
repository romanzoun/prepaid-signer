import type { PriceBreakdown } from './api'

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

export interface PaymentResult {
  sessionId: string
  status: 'success' | 'cancelled'
}

const TAX_RATE = 0.081 // Swiss MwSt 8.1% (seit 01.01.2024)
const GROSS_PRICE_BY_LEVEL = {
  QES: 3.40,
  AES: 1.90,
  SIMPLE: 1.20,
} as const
const ANALYSIS_GROSS_ADDON = 1.00

export function calculatePrice(
  signatoryCount: number,
  signatureLevel: 'SIMPLE' | 'AES' | 'QES' = 'QES',
  includeAnalysis = false,
): PriceBreakdown {
  const perSignatureGross = GROSS_PRICE_BY_LEVEL[signatureLevel] ?? GROSS_PRICE_BY_LEVEL.QES
  const perSignature = Math.round((perSignatureGross / (1 + TAX_RATE)) * 100) / 100
  const analysisGross = includeAnalysis ? ANALYSIS_GROSS_ADDON : 0
  const analysisNet = includeAnalysis ? Math.round((analysisGross / (1 + TAX_RATE)) * 100) / 100 : 0
  const subtotal = Math.round(((signatoryCount * perSignature) + analysisNet) * 100) / 100
  const total = Math.round(((signatoryCount * perSignatureGross) + analysisGross) * 100) / 100
  const tax = Math.round((total - subtotal) * 100) / 100
  return {
    perSignature,
    perSignatureGross,
    count: signatoryCount,
    analysisRequested: includeAnalysis,
    analysisGross,
    analysisNet,
    subtotal,
    tax,
    total,
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
