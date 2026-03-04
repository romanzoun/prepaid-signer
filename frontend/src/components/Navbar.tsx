import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-cross">✦</span>
          <span className="brand-name">justSign</span>
        </Link>
        <ul className="navbar-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/sign">Signieren</NavLink></li>
          <li><NavLink to="/docs/how-it-works">Wie es funktioniert</NavLink></li>
          <li><NavLink to="/docs/pricing">Preise</NavLink></li>
          <li>
            <Link to="/sign" className="btn btn-primary navbar-cta">
              Jetzt signieren
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
