import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import { I18nProvider } from '../i18n'

function renderHomePage() {
  return render(
    <I18nProvider initialLocale="de">
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </I18nProvider>
  )
}

describe('HomePage', () => {
  it('renders hero headline', () => {
    renderHomePage()
    expect(screen.getByText(/PDF online signieren/i)).toBeInTheDocument()
  })

  it('renders CTA link to /sign', () => {
    renderHomePage()
    const links = screen.getAllByRole('link', { name: /signieren/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders 4 feature cards', () => {
    renderHomePage()
    expect(screen.getByText('PDF hochladen & signieren')).toBeInTheDocument()
    expect(screen.getByText('Unterzeichner per E-Mail einladen')).toBeInTheDocument()
    expect(screen.getByText('Prepaid - nur zahlen was du brauchst')).toBeInTheDocument()
    expect(screen.getByText('Qualifizierte elektronische Signatur (QES)')).toBeInTheDocument()
  })

  it('renders step numbers 01-04', () => {
    renderHomePage()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
  })

  it('shows pricing teaser with CHF 3.40', () => {
    renderHomePage()
    expect(screen.getByText('CHF 3.40')).toBeInTheDocument()
  })

  it('renders trust section', () => {
    renderHomePage()
    expect(screen.getByText('DSGVO-konform & nDSG-konform')).toBeInTheDocument()
    expect(screen.getByText('Rechtsgültig')).toBeInTheDocument()
  })
})
