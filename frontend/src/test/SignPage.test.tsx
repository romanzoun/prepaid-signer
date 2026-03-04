import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SignPage from '../pages/SignPage'

// Mock the backend API – tests run fully offline
vi.mock('../services/api', () => ({
  uploadDocument: vi.fn().mockResolvedValue({ documentName: 'test.pdf' }),
  setSignatories: vi.fn().mockResolvedValue({
    price: { count: 1, subtotal: 3.15, tax: 0.26, total: 3.41, perSignature: 3.15, currency: 'CHF' },
  }),
  savePlacements: vi.fn().mockResolvedValue({
    placements: [{ signatoryId: 'sig_1', page: 1, x: 100, y: 100, width: 150, height: 45 }],
  }),
  confirmPayment: vi.fn().mockResolvedValue({ sessionId: 'mock_stripe_abc', status: 'success' }),
  getSigningState: vi.fn().mockResolvedValue({
    signatories: [{ id: 'sig_1', firstName: 'Alice', lastName: 'Tester', email: 'alice@test.com', phone: '' }],
    placements: [{ signatoryId: 'sig_1', page: 1, x: 100, y: 100, width: 150, height: 45 }],
  }),
  processPayment: vi.fn().mockResolvedValue({ sessionId: 'mock_stripe_abc', status: 'success' }),
  sendInvitations: vi.fn().mockResolvedValue({
    sessionId: 'mock_stripe_abc',
    documentName: 'test.pdf',
    invitations: [{
      signatory: { id: 'sig_1', firstName: 'Alice', lastName: 'Tester', email: 'alice@test.com', phone: '' },
      inviteLink: 'https://sign.swisscom.com/mock/mock_stripe_abc/sig_1',
      sentAt: new Date().toISOString(),
    }],
  }),
}))

vi.mock('../pages/PdfSignaturePlacer', () => ({
  default: ({ signatories, onChange }: {
    signatories: Array<{ id: string }>
    onChange: (placements: Array<{ signatoryId: string; page: number; x: number; y: number; width: number; height: number }>) => void
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onChange(signatories.map((s, i) => ({
          signatoryId: s.id,
          page: 1,
          x: 100 + (i * 20),
          y: 100,
          width: 150,
          height: 45,
        })))}
      >
        Mock Place All
      </button>
    </div>
  ),
}))

function renderSignPage() {
  return render(
    <MemoryRouter>
      <SignPage />
    </MemoryRouter>
  )
}

describe('SignPage', () => {
  it('renders upload step initially', () => {
    renderSignPage()
    expect(screen.getByText('Dokument hochladen')).toBeInTheDocument()
    expect(screen.getByText(/PDF hier ablegen/i)).toBeInTheDocument()
  })

  it('next button is disabled without file', () => {
    renderSignPage()
    const btn = screen.getByRole('button', { name: /Unterzeichner hinzufügen/i })
    expect(btn).toBeDisabled()
  })

  it('shows error for non-PDF file', async () => {
    renderSignPage()
    const input = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/nur PDF/i)
  })

  it('advances to signatories step after PDF upload', async () => {
    renderSignPage()
    const input = screen.getByTestId('file-input')
    const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    await userEvent.click(screen.getByRole('button', { name: /Unterzeichner hinzufügen/i }))
    expect(await screen.findByText('Unterzeichner konfigurieren')).toBeInTheDocument()
  })

  it('shows signatory form with one row initially', async () => {
    renderSignPage()
    const input = screen.getByTestId('file-input')
    const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    await userEvent.click(screen.getByRole('button', { name: /Unterzeichner hinzufügen/i }))
    await screen.findByText('Unterzeichner konfigurieren')
    expect(screen.getAllByPlaceholderText('Vorname')).toHaveLength(1)
    expect(screen.getAllByPlaceholderText('Nachname')).toHaveLength(1)
  })

  it('can add more signatories', async () => {
    renderSignPage()
    const input = screen.getByTestId('file-input')
    const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    await userEvent.click(screen.getByRole('button', { name: /Unterzeichner hinzufügen/i }))
    await screen.findByText('Unterzeichner konfigurieren')
    await userEvent.click(screen.getByText(/Weiteren Unterzeichner/i))
    expect(screen.getAllByPlaceholderText('Vorname')).toHaveLength(2)
    expect(screen.getAllByPlaceholderText('Nachname')).toHaveLength(2)
  })

  it('shows stepper with all 6 steps', () => {
    renderSignPage()
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Unterzeichner')).toBeInTheDocument()
    expect(screen.getByText('Platzierung')).toBeInTheDocument()
    expect(screen.getByText('Preis')).toBeInTheDocument()
    expect(screen.getByText('Zahlung')).toBeInTheDocument()
    expect(screen.getByText('Fertig')).toBeInTheDocument()
  })

  it('completes full flow and shows done screen', async () => {
    renderSignPage()

    // Step 1: upload PDF
    const input = screen.getByTestId('file-input')
    const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /Unterzeichner hinzufügen/i }))

    // Step 2: fill signatory and advance (calls api.setSignatories)
    await screen.findByText('Unterzeichner konfigurieren')
    await userEvent.type(screen.getByPlaceholderText('Vorname'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('Nachname'), 'Tester')
    await userEvent.type(screen.getByPlaceholderText('E-Mail'), 'alice@test.com')
    await userEvent.click(screen.getByRole('button', { name: /Signaturfelder platzieren/i }))

    // Step 3: place signatures -> next
    await screen.findByText('Signaturfelder platzieren')
    await userEvent.click(screen.getByRole('button', { name: /Mock Place All/i }))
    await userEvent.click(screen.getByRole('button', { name: /Überprüfen/i }))

    // Step 4: pricing -> next
    await screen.findByText('Preisübersicht')
    await userEvent.click(screen.getByRole('button', { name: /Bezahlen/i }))

    // Step 5: payment
    await screen.findByText('Bezahlung')
    await userEvent.click(screen.getByRole('button', { name: /Jetzt bezahlen/i }))

    // Done screen
    await waitFor(() => {
      expect(screen.getByText('Einladungen verschickt!')).toBeInTheDocument()
    })
    expect(screen.getByText('Alice Tester')).toBeInTheDocument()
  })
})
