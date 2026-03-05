import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import StatusPage from '../pages/StatusPage'
import { I18nProvider } from '../i18n'

const { getProcessStatus } = vi.hoisted(() => ({
  getProcessStatus: vi.fn(),
}))
const { getAnalysisStatus } = vi.hoisted(() => ({
  getAnalysisStatus: vi.fn(),
}))

vi.mock('../services/api', () => ({
  getProcessStatus,
  getAnalysisStatus,
}))

function renderStatusPage() {
  return render(
    <I18nProvider initialLocale="de">
      <MemoryRouter>
        <StatusPage />
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('StatusPage', () => {
  it('renders the status checker title', () => {
    renderStatusPage()
    expect(screen.getByText('Status Checker')).toBeInTheDocument()
  })

  it('fetches and displays process status', async () => {
    getProcessStatus.mockResolvedValueOnce({
      processId: 'mock-process-123',
      status: 'COMPLETED',
      provider: 'mock',
      checkedAt: '2026-03-05T10:00:00Z',
    })

    renderStatusPage()

    await userEvent.type(screen.getByLabelText('Process ID'), 'mock-process-123')
    await userEvent.click(screen.getByRole('button', { name: 'Jetzt prüfen' }))

    expect(await screen.findByText('COMPLETED')).toBeInTheDocument()
    expect(screen.getByText('mock-process-123')).toBeInTheDocument()
    expect(screen.getByText('Prozess abgeschlossen')).toBeInTheDocument()
    expect(screen.getByText(/Swisscom Sign Support/i)).toBeInTheDocument()
    expect(getProcessStatus).toHaveBeenCalledWith('mock-process-123')
  })

  it('fetches and displays analysis status and download link', async () => {
    getAnalysisStatus.mockResolvedValueOnce({
      analyticProcessID: 'analysis-abc-123',
      analysisStatus: 'COMPLETED',
      analysisStepKey: 'COMPLETED',
      analysisStepIndex: 6,
      analysisStepTotal: 6,
      analysisCompletedAt: '2026-03-05T10:05:00Z',
    })

    renderStatusPage()

    await userEvent.type(screen.getByLabelText('analyticProcessID'), 'analysis-abc-123')
    await userEvent.click(screen.getByRole('button', { name: 'Analyse prüfen' }))

    expect(await screen.findByText('COMPLETED')).toBeInTheDocument()
    expect(screen.getByText(/Schritt 6 von 6/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Analysebericht herunterladen' })).toBeInTheDocument()
    expect(getAnalysisStatus).toHaveBeenCalledWith('analysis-abc-123')
  })
})
