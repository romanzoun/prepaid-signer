// All requests go to /api/sign – in Docker they're proxied by Nginx to the Spring Boot backend.
// Cookies (session) are sent automatically by the browser.

const BASE = '/api/sign'

export type SignatureLevel = 'SIMPLE' | 'AES' | 'QES'

export interface Signatory {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  signatureLevel?: SignatureLevel
}

export interface SignatoryPlacement {
  signatoryId: string
  page: number
  x: number
  y: number
  width: number
  height: number
}

export interface PriceBreakdown {
  perSignature: number
  count: number
  subtotal: number
  tax: number
  total: number
  currency: string
}

export interface InvitationResult {
  signatory: Signatory
  inviteLink: string
  sentAt: string
}

export interface InviteResponse {
  sessionId: string
  documentName: string
  invitations: InvitationResult[]
}

export interface PaymentResponse {
  sessionId: string
  status: 'success' | 'pending' | 'cancelled'
  amountChf?: string
  checkoutUrl?: string
  documentName?: string
  invitations?: InvitationResult[]
}

export interface SigningState {
  documentName?: string
  signatories: Signatory[]
  placements: SignatoryPlacement[]
  signatureLevel?: SignatureLevel
  price?: PriceBreakdown
  paymentSessionId?: string
  paymentStatus?: string
  step?: string
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export async function uploadDocument(file: File): Promise<{ documentName: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', credentials: 'include', body: form })
  return handleResponse(res)
}

export async function setSignatories(signatories: Signatory[], signatureLevel: SignatureLevel): Promise<{ price: PriceBreakdown }> {
  const res = await fetch(`${BASE}/signatories`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signatories, signatureLevel }),
  })
  return handleResponse(res)
}

export async function savePlacements(placements: SignatoryPlacement[]): Promise<{ placements: SignatoryPlacement[] }> {
  const res = await fetch(`${BASE}/placements`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placements }),
  })
  return handleResponse(res)
}

export async function processPayment(): Promise<PaymentResponse> {
  const res = await fetch(`${BASE}/pay`, { method: 'POST', credentials: 'include' })
  return handleResponse(res)
}

export async function confirmPayment(sessionId?: string): Promise<PaymentResponse> {
  const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''
  const res = await fetch(`${BASE}/pay/confirm${qs}`, { method: 'GET', credentials: 'include' })
  return handleResponse(res)
}

export async function sendInvitations(): Promise<InviteResponse> {
  const res = await fetch(`${BASE}/invite`, { method: 'POST', credentials: 'include' })
  return handleResponse(res)
}

export async function getSigningState(): Promise<SigningState> {
  const res = await fetch(`${BASE}/state`, { method: 'GET', credentials: 'include' })
  return handleResponse(res)
}
