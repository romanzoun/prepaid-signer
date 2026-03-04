import type { SignatureOrder, Signatory } from './mockStripe'

export type { Signatory }

export interface InvitationResult {
  signatory: Signatory
  inviteLink: string
  sentAt: string
}

export interface SigningSession {
  sessionId: string
  documentName: string
  invitations: InvitationResult[]
}

export async function sendInvitations(order: SignatureOrder, paymentSessionId: string): Promise<SigningSession> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800))

  const invitations: InvitationResult[] = order.signatories.map((s) => ({
    signatory: s,
    inviteLink: `https://sign.swisscom.com/mock/${paymentSessionId}/${s.id}`,
    sentAt: new Date().toISOString(),
  }))

  return {
    sessionId: paymentSessionId,
    documentName: order.documentName,
    invitations,
  }
}
