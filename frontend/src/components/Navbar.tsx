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
        <label className="navbar-locale-label">
          <span>{copy.localeLabel}</span>
          <select
            className="navbar-locale-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}
            aria-label={copy.localeLabel}
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_LABELS[code]}
              </option>
            ))}
          </select>
        </label>
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
