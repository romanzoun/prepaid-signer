import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  it('renders hero headline', () => {
    renderHomePage()
    expect(screen.getByText(/Digitale Signaturen/i)).toBeInTheDocument()
  })

  it('renders CTA link to /sign', () => {
    renderHomePage()
    const links = screen.getAllByRole('link', { name: /signieren/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders 4 feature cards', () => {
    renderHomePage()
    expect(screen.getByText('PDF hochladen')).toBeInTheDocument()
    expect(screen.getByText('Unterzeichner einladen')).toBeInTheDocument()
    expect(screen.getByText('Nur zahlen was du brauchst')).toBeInTheDocument()
    expect(screen.getByText('Qualifizierte Signatur')).toBeInTheDocument()
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
    expect(screen.getByText('DSGVO-konform')).toBeInTheDocument()
    expect(screen.getByText('Rechtsgültig')).toBeInTheDocument()
  })
})
