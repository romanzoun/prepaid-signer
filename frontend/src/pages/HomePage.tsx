import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import './HomePage.css'

const HOME_COPY = {
  de: {
    badge: 'Kein Lock-in · Keine Verpflichtungen',
    heroTitleLine1: 'Digitale Signaturen,',
    heroTitleLine2: 'so einfach wie möglich.',
    heroSubtitleLine1: 'Lade ein PDF hoch, lade Unterzeichner ein, bezahle einmalig.',
    heroSubtitleLine2: 'Keine Abonnements. Nur Digitalisierung.',
    ctaSign: 'Jetzt Dokument signieren',
    ctaHow: 'Wie es funktioniert',
    trustLine: '✦ Powered by Swisscom Sign API · Swiss Quality',
    featuresTitle: 'Was macht justSign anders?',
    features: [
      { icon: '📄', title: 'PDF hochladen', desc: 'Lade dein Dokument hoch - kein Konto erforderlich.' },
      { icon: '👥', title: 'Unterzeichner einladen', desc: 'Per E-Mail oder Telefon - einfach, schnell, sicher.' },
      { icon: '💳', title: 'Nur zahlen was du brauchst', desc: 'Prepaid - keine Abonnements, keine Verpflichtungen.' },
      { icon: '✅', title: 'Qualifizierte Signatur', desc: 'Powered by Swisscom Sign API - rechtsgueltig in der Schweiz und EU.' },
    ],
    stepsTitle: 'In 4 Schritten zum signierten Dokument',
    steps: [
      { num: '01', title: 'Dokument hochladen', desc: 'PDF auswählen und Unterzeichner konfigurieren.' },
      { num: '02', title: 'Signaturlevel wählen', desc: 'QES, AES oder SIMPLE pro Unterzeichner festlegen.' },
      { num: '03', title: 'Bezahlen', desc: 'Einmalig per Kreditkarte, Apple Pay oder Google Pay via Stripe.' },
      { num: '04', title: 'Einladungen verschicken', desc: 'Alle Unterzeichner erhalten einen signierbaren Link.' },
    ],
    ctaStart: 'Jetzt starten - kostenlos testen',
    pricingTitle: 'Transparente Preise',
    pricingLead: 'Zahle pro Signatur. Keine Pakete. Kein Abo.',
    pricingUnit: '/ Signatur inkl. MwSt',
    pricingNote: 'QES: CHF 3.40 · AES: CHF 1.90 · SIMPLE: CHF 1.20 pro Signatur (inkl. MwSt).',
    pricingCta: 'Alle Preise ansehen',
    trustCards: [
      { icon: '🔒', title: 'DSGVO-konform & nDSG-konform', desc: 'Daten werden nur zur Signierung verwendet.' },
      { icon: '⚡', title: 'Sofort einsatzbereit', desc: 'Kein Onboarding, keine Wartezeit.' },
      { icon: '📜', title: 'Rechtsgültig', desc: 'Qualifizierte elektronische Signatur gemäss eIDAS & ZertES.' },
    ],
  },
  en: {
    badge: 'No lock-in · No commitment',
    heroTitleLine1: 'Digital signatures,',
    heroTitleLine2: 'as simple as possible.',
    heroSubtitleLine1: 'Upload a PDF, invite signers, pay once.',
    heroSubtitleLine2: 'No subscriptions. Just digitization.',
    ctaSign: 'Sign a document now',
    ctaHow: 'How it works',
    trustLine: '✦ Powered by Swisscom Sign API · Swiss Quality',
    featuresTitle: 'Why justSign is different',
    features: [
      { icon: '📄', title: 'Upload PDF', desc: 'Upload your document - no account required.' },
      { icon: '👥', title: 'Invite signers', desc: 'By email or phone - simple, fast, secure.' },
      { icon: '💳', title: 'Pay only what you need', desc: 'Prepaid - no subscriptions, no commitment.' },
      { icon: '✅', title: 'Qualified signature', desc: 'Powered by Swisscom Sign API - legally valid in Switzerland and the EU.' },
    ],
    stepsTitle: 'Signed document in 4 steps',
    steps: [
      { num: '01', title: 'Upload document', desc: 'Select a PDF and configure signers.' },
      { num: '02', title: 'Choose signature level', desc: 'Set QES, AES or SIMPLE for the document.' },
      { num: '03', title: 'Pay', desc: 'One-time payment by card, Apple Pay or Google Pay via Stripe.' },
      { num: '04', title: 'Send invitations', desc: 'All signers receive a signature link.' },
    ],
    ctaStart: 'Start now - test for free',
    pricingTitle: 'Transparent pricing',
    pricingLead: 'Pay per signature. No packages. No subscription.',
    pricingUnit: '/ signature incl. VAT',
    pricingNote: 'QES: CHF 3.40 · AES: CHF 1.90 · SIMPLE: CHF 1.20 per signature (incl. VAT).',
    pricingCta: 'See all pricing',
    trustCards: [
      { icon: '🔒', title: 'GDPR & nFADP compliant', desc: 'Data is used only for signing.' },
      { icon: '⚡', title: 'Ready immediately', desc: 'No onboarding, no waiting time.' },
      { icon: '📜', title: 'Legally valid', desc: 'Qualified electronic signature under eIDAS & ZertES.' },
    ],
  },
  fr: {
    badge: 'Sans lock-in · Sans engagement',
    heroTitleLine1: 'Signatures numeriques,',
    heroTitleLine2: 'aussi simples que possible.',
    heroSubtitleLine1: 'Importez un PDF, invitez les signataires, payez une seule fois.',
    heroSubtitleLine2: 'Pas d abonnement. Seulement la digitalisation.',
    ctaSign: 'Signer un document',
    ctaHow: 'Fonctionnement',
    trustLine: '✦ Powered by Swisscom Sign API · Qualite suisse',
    featuresTitle: 'Pourquoi justSign est different',
    features: [
      { icon: '📄', title: 'Importer un PDF', desc: 'Importez votre document - aucun compte requis.' },
      { icon: '👥', title: 'Inviter les signataires', desc: 'Par e-mail ou telephone - simple, rapide, securise.' },
      { icon: '💳', title: 'Payer uniquement le necessaire', desc: 'Prepaid - sans abonnement, sans engagement.' },
      { icon: '✅', title: 'Signature qualifiee', desc: 'Powered by Swisscom Sign API - valable en Suisse et dans l UE.' },
    ],
    stepsTitle: 'Document signe en 4 etapes',
    steps: [
      { num: '01', title: 'Importer le document', desc: 'Selectionnez un PDF et configurez les signataires.' },
      { num: '02', title: 'Choisir le niveau de signature', desc: 'Definissez QES, AES ou SIMPLE pour le document.' },
      { num: '03', title: 'Payer', desc: 'Paiement unique par carte, Apple Pay ou Google Pay via Stripe.' },
      { num: '04', title: 'Envoyer les invitations', desc: 'Tous les signataires recoivent un lien de signature.' },
    ],
    ctaStart: 'Commencer maintenant - essai gratuit',
    pricingTitle: 'Tarification transparente',
    pricingLead: 'Payez par signature. Sans packs. Sans abonnement.',
    pricingUnit: '/ signature TTC',
    pricingNote: 'QES: CHF 3.40 · AES: CHF 1.90 · SIMPLE: CHF 1.20 par signature (TTC).',
    pricingCta: 'Voir tous les tarifs',
    trustCards: [
      { icon: '🔒', title: 'Conforme RGPD & nLPD', desc: 'Les donnees sont utilisees uniquement pour la signature.' },
      { icon: '⚡', title: 'Pret immediatement', desc: 'Pas d onboarding, pas d attente.' },
      { icon: '📜', title: 'Valeur legale', desc: 'Signature electronique qualifiee selon eIDAS et ZertES.' },
    ],
  },
} as const

export default function HomePage() {
  const { locale } = useI18n()
  const copy = HOME_COPY[locale]

  return (
    <main>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">{copy.badge}</div>
          <h1>
            {copy.heroTitleLine1}
            <br />
            <span className="hero-highlight">{copy.heroTitleLine2}</span>
          </h1>
          <p className="hero-subtitle">
            {copy.heroSubtitleLine1}
            <br />
            {copy.heroSubtitleLine2}
          </p>
          <div className="hero-actions">
            <Link to="/sign" className="btn btn-primary">{copy.ctaSign}</Link>
            <Link to="/docs/how-it-works" className="btn btn-outline">{copy.ctaHow}</Link>
          </div>
          <p className="hero-trust">{copy.trustLine}</p>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">{copy.featuresTitle}</h2>
          <div className="features-grid">
            {copy.features.map((feature) => (
              <div key={feature.title} className="feature-card card">
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">{copy.stepsTitle}</h2>
          <div className="steps-grid">
            {copy.steps.map((step) => (
              <div key={step.num} className="step">
                <div className="step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="how-cta">
            <Link to="/sign" className="btn btn-primary">{copy.ctaStart}</Link>
          </div>
        </div>
      </section>

      <section className="pricing-teaser">
        <div className="container">
          <div className="pricing-card card">
            <h2>{copy.pricingTitle}</h2>
            <p>{copy.pricingLead}</p>
            <div className="pricing-example">
              <span className="price-amount">CHF 3.40</span>
              <span className="price-unit">{copy.pricingUnit}</span>
            </div>
            <p className="price-note">{copy.pricingNote}</p>
            <Link to="/docs/pricing" className="btn btn-outline">{copy.pricingCta}</Link>
          </div>
        </div>
      </section>

      <section className="trust">
        <div className="container trust-content">
          {copy.trustCards.map((card) => (
            <div key={card.title} className="trust-item">
              <span className="trust-icon">{card.icon}</span>
              <h4>{card.title}</h4>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
