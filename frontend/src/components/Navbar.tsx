import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LOCALES, LOCALE_LABELS, useI18n } from '../i18n'
import './Navbar.css'

const NAV_COPY = {
  de: {
    menu: 'Menue',
    home: 'Home',
    sign: 'Signieren',
    howItWorks: 'Wie es funktioniert',
    pricing: 'Preise',
    status: 'Status',
    cta: 'Jetzt signieren',
    localeLabel: 'Sprache',
  },
  en: {
    menu: 'Menu',
    home: 'Home',
    sign: 'Sign',
    howItWorks: 'How it works',
    pricing: 'Pricing',
    status: 'Status',
    cta: 'Sign now',
    localeLabel: 'Language',
  },
  fr: {
    menu: 'Menu',
    home: 'Accueil',
    sign: 'Signer',
    howItWorks: 'Fonctionnement',
    pricing: 'Tarifs',
    status: 'Statut',
    cta: 'Signer maintenant',
    localeLabel: 'Langue',
  },
} as const

const LOCALE_FLAGS = {
  de: '🇩🇪',
  en: '🇬🇧',
  fr: '🇫🇷',
} as const

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { locale, setLocale } = useI18n()
  const copy = NAV_COPY[locale]

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-cross">✦</span>
          <span className="brand-name">justSign</span>
        </Link>
        <button
          className="navbar-toggle btn btn-ghost"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-nav-links"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {copy.menu}
        </button>
        <div className="navbar-locale" aria-label={copy.localeLabel}>
          <div className="navbar-locale-switch" role="group" aria-label={copy.localeLabel}>
            {LOCALES.map((code) => {
              const active = code === locale
              return (
                <button
                  key={code}
                  type="button"
                  className={`locale-pill ${active ? 'active' : ''}`}
                  onClick={() => setLocale(code)}
                  aria-pressed={active}
                  aria-label={`${LOCALE_LABELS[code]} (${code.toUpperCase()})`}
                >
                  <span className="locale-flag" aria-hidden="true">{LOCALE_FLAGS[code]}</span>
                  <span className="locale-code">{code.toUpperCase()}</span>
                </button>
              )
            })}
          </div>
        </div>
        <ul id="main-nav-links" className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><NavLink to="/" end onClick={closeMenu}>{copy.home}</NavLink></li>
          <li><NavLink to="/sign" onClick={closeMenu}>{copy.sign}</NavLink></li>
          <li><NavLink to="/docs/how-it-works" onClick={closeMenu}>{copy.howItWorks}</NavLink></li>
          <li><NavLink to="/docs/pricing" onClick={closeMenu}>{copy.pricing}</NavLink></li>
          <li><NavLink to="/status" onClick={closeMenu}>{copy.status}</NavLink></li>
          <li>
            <Link to="/sign" className="btn btn-primary navbar-cta" onClick={closeMenu}>
              {copy.cta}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
