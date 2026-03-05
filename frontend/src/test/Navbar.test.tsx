import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { I18nProvider } from '../i18n'

describe('Navbar', () => {
  it('renders brand name', () => {
    render(
      <I18nProvider initialLocale="de">
        <MemoryRouter><Navbar /></MemoryRouter>
      </I18nProvider>,
    )
    expect(screen.getByText('justSign')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <I18nProvider initialLocale="de">
        <MemoryRouter><Navbar /></MemoryRouter>
      </I18nProvider>,
    )
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Signieren' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Status' })).toBeInTheDocument()
  })

  it('renders CTA button linking to /sign', () => {
    render(
      <I18nProvider initialLocale="de">
        <MemoryRouter><Navbar /></MemoryRouter>
      </I18nProvider>,
    )
    const cta = screen.getByRole('link', { name: 'Jetzt signieren' })
    expect(cta).toHaveAttribute('href', '/sign')
  })
})
