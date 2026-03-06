import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { usePageMeta } from '../hooks/usePageMeta'
import './HomePage.css'

const HOME_COPY = {
  de: {
    badge: 'Kein Lock-in · Keine Verpflichtungen',
    heroTitleLine1: 'PDF online signieren -',
    heroTitleLine2: 'qualifizierte digitale Signatur Schweiz.',
    heroSubtitleLine1: 'PDF hochladen, Unterzeichner per E-Mail einladen, einmalig bezahlen.',
    heroSubtitleLine2: 'Kein Abo. Kein Konto. Prepaid ab CHF 3.40 pro Signatur.',
    ctaSign: 'Jetzt Dokument signieren',
    ctaHow: 'Wie es funktioniert',
    trustLine: '✦ Powered by Swisscom Sign API · Swiss Quality',
    featuresTitle: 'Warum justSign für digitale Signaturen?',
    features: [
      { icon: '📄', title: 'PDF hochladen & signieren', desc: 'Dokument hochladen und sofort digital signieren lassen - kein Konto, keine Installation.' },
      { icon: '👥', title: 'Unterzeichner per E-Mail einladen', desc: 'Signatureinladung per E-Mail oder SMS - Unterzeichner klicken und signieren.' },
      { icon: '💳', title: 'Prepaid - nur zahlen was du brauchst', desc: 'Ab CHF 1.20 pro Signatur. Keine Abonnements, keine monatlichen Kosten.' },
      { icon: '✅', title: 'Qualifizierte elektronische Signatur (QES)', desc: 'Rechtsgültig in der Schweiz und EU. Powered by Swisscom Sign API (eIDAS & ZertES).' },
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
    heroTitleLine1: 'Sign PDF online -',
    heroTitleLine2: 'qualified digital signature Switzerland.',
    heroSubtitleLine1: 'Upload a PDF, invite signers by email, pay once.',
    heroSubtitleLine2: 'No subscription. No account. Prepaid from CHF 3.40 per signature.',
    ctaSign: 'Sign a document now',
    ctaHow: 'How it works',
    trustLine: '✦ Powered by Swisscom Sign API · Swiss Quality',
    featuresTitle: 'Why justSign for digital signatures?',
    features: [
      { icon: '📄', title: 'Upload PDF & sign online', desc: 'Upload your document and get it signed digitally - no account, no installation.' },
      { icon: '👥', title: 'Invite signers by email', desc: 'Send signature invitations by email or SMS - signers click and sign.' },
      { icon: '💳', title: 'Prepaid - pay only what you need', desc: 'From CHF 1.20 per signature. No subscriptions, no monthly fees.' },
      { icon: '✅', title: 'Qualified electronic signature (QES)', desc: 'Legally valid in Switzerland and the EU. Powered by Swisscom Sign API (eIDAS & ZertES).' },
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
    heroTitleLine1: 'Signer un PDF en ligne -',
    heroTitleLine2: 'signature numerique qualifiee Suisse.',
    heroSubtitleLine1: 'Importez un PDF, invitez les signataires par e-mail, payez une seule fois.',
    heroSubtitleLine2: 'Sans abonnement. Sans compte. Prepaid des CHF 3.40 par signature.',
    ctaSign: 'Signer un document',
    ctaHow: 'Fonctionnement',
    trustLine: '✦ Powered by Swisscom Sign API · Qualite suisse',
    featuresTitle: 'Pourquoi justSign pour la signature numerique?',
    features: [
      { icon: '📄', title: 'Importer un PDF & signer en ligne', desc: 'Importez votre document et faites-le signer numeriquement - sans compte, sans installation.' },
      { icon: '👥', title: 'Inviter les signataires par e-mail', desc: 'Envoyez des invitations par e-mail ou SMS - les signataires cliquent et signent.' },
      { icon: '💳', title: 'Prepaid - payer uniquement le necessaire', desc: 'Des CHF 1.20 par signature. Sans abonnement, sans frais mensuels.' },
      { icon: '✅', title: 'Signature electronique qualifiee (QES)', desc: 'Valable en Suisse et dans l UE. Powered by Swisscom Sign API (eIDAS & ZertES).' },
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

const PAGE_META = {
  de: {
    title: 'justSign - Digitale Signatur Schweiz | PDF online signieren ohne Abo',
    description: 'PDF hochladen, Unterzeichner einladen, einmalig bezahlen. Qualifizierte elektronische Signatur (QES) ab CHF 3.40 inkl. MwSt. Prepaid, kein Abo, kein Konto. Powered by Swisscom Sign API.',
  },
  en: {
    title: 'justSign - Digital Signatures Switzerland | Sign PDF Online',
    description: 'Upload PDF, invite signers, pay once. Qualified electronic signature (QES) from CHF 3.40 incl. VAT. Prepaid, no subscription, no account. Powered by Swisscom Sign API.',
  },
  fr: {
    title: 'justSign - Signature numerique Suisse | Signer un PDF en ligne',
    description: 'Importez un PDF, invitez les signataires, payez une seule fois. Signature electronique qualifiee (QES) des CHF 3.40 TTC. Prepaid, sans abonnement.',
  },
} as const

export default function HomePage() {
  const { locale } = useI18n()
  const copy = HOME_COPY[locale]
  usePageMeta(PAGE_META[locale].title, PAGE_META[locale].description)

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
