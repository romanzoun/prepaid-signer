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
  perSignatureGross?: number
  count: number
  analysisRequested?: boolean
  analysisNet?: number
  analysisGross?: number
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
  processId?: string
  invitations: InvitationResult[]
  analysisRequested?: boolean
  analysisStatus?: string
  analysisError?: string
  analyticProcessID?: string
  analysisStepKey?: string
  analysisStepIndex?: number
  analysisStepTotal?: number
  analysis?: Record<string, unknown>
}

export interface PaymentResponse {
  sessionId: string
  status: 'success' | 'pending' | 'cancelled'
  amountChf?: string
  checkoutUrl?: string
  documentName?: string
  processId?: string
  invitations?: InvitationResult[]
  analysisRequested?: boolean
  analysisStatus?: string
  analysisError?: string
  analyticProcessID?: string
  analysisStepKey?: string
  analysisStepIndex?: number
  analysisStepTotal?: number
  analysis?: Record<string, unknown>
}

export interface ProcessStatusResponse {
  processId: string
  status: string
  provider?: string
  checkedAt?: string
  updatedAt?: string
}

export interface SigningState {
  documentName?: string
  signatories: Signatory[]
  placements: SignatoryPlacement[]
  signatureLevel?: SignatureLevel
  processId?: string
  price?: PriceBreakdown
  paymentSessionId?: string
  paymentStatus?: string
  contractAnalysisRequested?: boolean
  analysisProcessId?: string
  analysisStatus?: string
  analysisError?: string
  contractAnalysisResult?: Record<string, unknown>
  step?: string
}

export interface AnalysisSelectionResponse {
  analysisRequested: boolean
  analysisStatus?: string
  analysisPriceGross: number
  analysisPriceCurrency: string
  analysisIncludedInInvoice: boolean
  price?: PriceBreakdown
}

export interface AnalysisStatusResponse {
  analysisRequested?: boolean
  analysisStatus: string
  status?: string
  analysisError?: string
  analyticProcessID?: string
  analysisStartedAt?: string
  analysisCompletedAt?: string
  analysisStepKey?: string
  analysisStepIndex?: number
  analysisStepTotal?: number
  analysis?: Record<string, unknown>
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

export async function processPayment(language?: string): Promise<PaymentResponse> {
  const qs = language ? `?lang=${encodeURIComponent(language)}` : ''
  const res = await fetch(`${BASE}/pay${qs}`, { method: 'POST', credentials: 'include' })
  return handleResponse(res)
}

export async function confirmPayment(sessionId?: string, language?: string): Promise<PaymentResponse> {
  const params = new URLSearchParams()
  if (sessionId) params.set('sessionId', sessionId)
  if (language) params.set('lang', language)
  const qs = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${BASE}/pay/confirm${qs}`, { method: 'GET', credentials: 'include' })
  return handleResponse(res)
}

export async function sendInvitations(language?: string): Promise<InviteResponse> {
  const qs = language ? `?lang=${encodeURIComponent(language)}` : ''
  const res = await fetch(`${BASE}/invite${qs}`, { method: 'POST', credentials: 'include' })
  return handleResponse(res)
}

export async function getSigningState(language?: string): Promise<SigningState> {
  const qs = language ? `?lang=${encodeURIComponent(language)}` : ''
  const res = await fetch(`${BASE}/state${qs}`, { method: 'GET', credentials: 'include' })
  return handleResponse(res)
}

export async function getProcessStatus(processId: string): Promise<ProcessStatusResponse> {
  const qs = `?processId=${encodeURIComponent(processId)}`
  const res = await fetch(`${BASE}/status${qs}`, { method: 'GET', credentials: 'include' })
  return handleResponse(res)
}

export async function selectAnalysisAddon(enabled: boolean): Promise<AnalysisSelectionResponse> {
  const qs = `?enabled=${encodeURIComponent(String(enabled))}`
  const res = await fetch(`${BASE}/analysis/select${qs}`, {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function startAnalysis(input: {
  language?: string
  jurisdictionHint?: string
  partyRole?: string
  analysisProfile?: string
}): Promise<AnalysisStatusResponse> {
  const params = new URLSearchParams()
  params.set('language', input.language ?? 'auto')
  if (input.jurisdictionHint) params.set('jurisdiction_hint', input.jurisdictionHint)
  if (input.partyRole) params.set('party_role', input.partyRole)
  params.set('analysis_profile', input.analysisProfile ?? 'standard')

  const res = await fetch(`${BASE}/analysis/start?${params.toString()}`, {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function getAnalysisStatus(analyticProcessID?: string): Promise<AnalysisStatusResponse> {
  const qs = analyticProcessID ? `?analyticProcessID=${encodeURIComponent(analyticProcessID)}` : ''
  const res = await fetch(`${BASE}/analysis/status${qs}`, { method: 'GET', credentials: 'include' })
  return handleResponse(res)
}
