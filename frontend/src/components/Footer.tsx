import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import './Footer.css'

const FOOTER_COPY = {
  de: {
    tagline: 'Kein Lock-in. Nur digitale Signatur.',
    product: 'Produkt',
    sign: 'Signieren',
    pricing: 'Preise',
    howItWorks: 'Wie es funktioniert',
    docs: 'Dokumentation',
    gettingStarted: 'Getting Started',
    faq: 'FAQ',
    security: 'Sicherheit',
    legal: 'Rechtliches',
    privacy: 'Datenschutz',
    terms: 'AGB',
    bottom: (year: number) => `© ${year} justSign · Powered by Swisscom Sign API · Keine Verpflichtungen`,
  },
  en: {
    tagline: 'No lock-in. Just digital signing.',
    product: 'Product',
    sign: 'Sign',
    pricing: 'Pricing',
    howItWorks: 'How it works',
    docs: 'Documentation',
    gettingStarted: 'Getting started',
    faq: 'FAQ',
    security: 'Security',
    legal: 'Legal',
    privacy: 'Privacy',
    terms: 'Terms',
    bottom: (year: number) => `© ${year} justSign · Powered by Swisscom Sign API · No commitment`,
  },
  fr: {
    tagline: 'Sans engagement. Signature numerique uniquement.',
    product: 'Produit',
    sign: 'Signer',
    pricing: 'Tarifs',
    howItWorks: 'Fonctionnement',
    docs: 'Documentation',
    gettingStarted: 'Demarrage',
    faq: 'FAQ',
    security: 'Securite',
    legal: 'Mentions legales',
    privacy: 'Confidentialite',
    terms: 'Conditions',
    bottom: (year: number) => `© ${year} justSign · Powered by Swisscom Sign API · Sans engagement`,
  },
} as const

export default function Footer() {
  const { locale } = useI18n()
  const copy = FOOTER_COPY[locale]

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-cross">✦</span>
          <strong>justSign</strong>
          <p>{copy.tagline}</p>
        </div>
        <div className="footer-links">
          <h4>{copy.product}</h4>
          <ul>
            <li><Link to="/sign">{copy.sign}</Link></li>
            <li><Link to="/docs/pricing">{copy.pricing}</Link></li>
            <li><Link to="/docs/how-it-works">{copy.howItWorks}</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>{copy.docs}</h4>
          <ul>
            <li><Link to="/docs/getting-started">{copy.gettingStarted}</Link></li>
            <li><Link to="/docs/faq">{copy.faq}</Link></li>
            <li><Link to="/docs/security">{copy.security}</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>{copy.legal}</h4>
          <ul>
            <li><Link to="/docs/privacy">{copy.privacy}</Link></li>
            <li><Link to="/docs/terms">{copy.terms}</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>{copy.bottom(new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  )
}
