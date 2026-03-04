import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-cross">✦</span>
          <strong>justSign</strong>
          <p>Kein Lock-in. Nur digitale Signatur.</p>
        </div>
        <div className="footer-links">
          <h4>Produkt</h4>
          <ul>
            <li><Link to="/sign">Signieren</Link></li>
            <li><Link to="/docs/pricing">Preise</Link></li>
            <li><Link to="/docs/how-it-works">Wie es funktioniert</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Dokumentation</h4>
          <ul>
            <li><Link to="/docs/getting-started">Getting Started</Link></li>
            <li><Link to="/docs/faq">FAQ</Link></li>
            <li><Link to="/docs/security">Sicherheit</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Rechtliches</h4>
          <ul>
            <li><Link to="/docs/privacy">Datenschutz</Link></li>
            <li><Link to="/docs/terms">AGB</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} justSign · Powered by Swisscom Sign API · Keine Verpflichtungen</p>
        </div>
      </div>
    </footer>
  )
}
