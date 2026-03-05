import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import StatusPage from '../pages/StatusPage'
import { I18nProvider } from '../i18n'

const { getProcessStatus } = vi.hoisted(() => ({
  getProcessStatus: vi.fn(),
}))

vi.mock('../services/api', () => ({
  getProcessStatus,
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
})
