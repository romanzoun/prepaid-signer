import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

describe('Navbar', () => {
  it('renders brand name', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByText('justSign')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Signieren' })).toBeInTheDocument()
  })

  it('renders CTA button linking to /sign', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    const cta = screen.getByRole('link', { name: 'Jetzt signieren' })
    expect(cta).toHaveAttribute('href', '/sign')
  })
})
