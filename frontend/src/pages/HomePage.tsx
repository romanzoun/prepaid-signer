import { Link } from 'react-router-dom'
import './HomePage.css'

const features = [
  {
    icon: '📄',
    title: 'PDF hochladen',
    desc: 'Lade dein Dokument hoch – kein Konto erforderlich.',
  },
  {
    icon: '👥',
    title: 'Unterzeichner einladen',
    desc: 'Per E-Mail oder Telefon – einfach, schnell, sicher.',
  },
  {
    icon: '💳',
    title: 'Nur zahlen was du brauchst',
    desc: 'Prepaid – keine Abonnements, keine Verpflichtungen.',
  },
  {
    icon: '✅',
    title: 'Qualifizierte Signatur',
    desc: 'Powered by Swisscom Sign API – rechtsgültig in der Schweiz und EU.',
  },
]

const steps = [
  { num: '01', title: 'Dokument hochladen', desc: 'PDF auswählen und Unterzeichner konfigurieren.' },
  { num: '02', title: 'Preis berechnen', desc: 'Anzahl Signaturen wählen, Preis sofort sehen.' },
  { num: '03', title: 'Bezahlen', desc: 'Einmalig per Kreditkarte oder TWINT via Stripe.' },
  { num: '04', title: 'Einladungen verschicken', desc: 'Alle Unterzeichner erhalten einen signierbaren Link.' },
]

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">Kein Lock-in · Keine Verpflichtungen</div>
          <h1>
            Digitale Signaturen,<br />
            <span className="hero-highlight">so einfach wie möglich.</span>
          </h1>
          <p className="hero-subtitle">
            Lade ein PDF hoch, lade Unterzeichner ein, bezahle einmalig.<br />
            Keine Abonnements. Nur Digitalisierung.
          </p>
          <div className="hero-actions">
            <Link to="/sign" className="btn btn-primary">Jetzt Dokument signieren</Link>
            <Link to="/docs/how-it-works" className="btn btn-outline">Wie es funktioniert</Link>
          </div>
          <p className="hero-trust">
            ✦ Powered by Swisscom Sign API &nbsp;·&nbsp; 🇨🇭 Swiss Quality
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Was macht justSign anders?</h2>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card card">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">In 4 Schritten zum signierten Dokument</h2>
          <div className="steps-grid">
            {steps.map((s) => (
              <div key={s.num} className="step">
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="how-cta">
            <Link to="/sign" className="btn btn-primary">Jetzt starten – kostenlos testen</Link>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="pricing-teaser">
        <div className="container">
          <div className="pricing-card card">
            <h2>Transparente Preise</h2>
            <p>Zahle pro Signatur. Kein Abo. Kein Risiko.</p>
            <div className="pricing-example">
              <span className="price-amount">CHF 3.40</span>
              <span className="price-unit">/ Signatur inkl. MwSt</span>
            </div>
            <p className="price-note">CHF 3.15 zzgl. 8.1% MwSt. Mindestbestellung: 1 Signatur. Abrechnung direkt über Stripe.</p>
            <Link to="/docs/pricing" className="btn btn-outline">Alle Preise ansehen</Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="trust">
        <div className="container trust-content">
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <h4>DSGVO-konform</h4>
            <p>Daten werden nur zur Signierung verwendet.</p>
          </div>
          <div className="trust-item">
            <span className="trust-icon">⚡</span>
            <h4>Sofort einsatzbereit</h4>
            <p>Kein Onboarding, keine Wartezeit.</p>
          </div>
          <div className="trust-item">
            <span className="trust-icon">📜</span>
            <h4>Rechtsgültig</h4>
            <p>Qualifizierte elektronische Signatur gemäss eIDAS & ZertES.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
