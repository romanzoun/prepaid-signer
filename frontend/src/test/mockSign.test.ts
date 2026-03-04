import { describe, it, expect } from 'vitest'
import { sendInvitations } from '../services/mockSign'

const order = {
  documentName: 'contract.pdf',
  signatories: [
    { id: 'sig_1', firstName: 'Alice', lastName: 'Tester', email: 'alice@example.com', phone: '' },
    { id: 'sig_2', firstName: 'Bob', lastName: 'Tester', email: '', phone: '+41791234567' },
  ],
}

describe('sendInvitations', () => {
  it('returns a session with correct document name', async () => {
    const session = await sendInvitations(order, 'mock_session_123')
    expect(session.documentName).toBe('contract.pdf')
    expect(session.sessionId).toBe('mock_session_123')
  })

  it('creates one invitation per signatory', async () => {
    const session = await sendInvitations(order, 'mock_session_123')
    expect(session.invitations).toHaveLength(2)
  })

  it('invitation contains signatory data', async () => {
    const session = await sendInvitations(order, 'mock_session_123')
    expect(session.invitations[0].signatory.firstName).toBe('Alice')
    expect(session.invitations[1].signatory.phone).toBe('+41791234567')
  })

  it('invitation link contains session id', async () => {
    const session = await sendInvitations(order, 'mock_session_abc')
    expect(session.invitations[0].inviteLink).toContain('mock_session_abc')
  })

  it('invitation has sentAt timestamp', async () => {
    const session = await sendInvitations(order, 'mock_session_123')
    expect(session.invitations[0].sentAt).toBeTruthy()
    expect(new Date(session.invitations[0].sentAt).getTime()).toBeLessThanOrEqual(Date.now())
  })
})
