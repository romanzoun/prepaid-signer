import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import './MarkdownPage.css'

interface DocConfig {
  title: string
  description: string
  breadcrumbs: Array<{ label: string; href?: string }>
  related: Array<{ slug: string; label: string }>
}

const docConfig: Record<string, DocConfig> = {
  'how-it-works': {
    title: 'Wie funktioniert justSign? | Prepaid digitale Signatur Schweiz',
    description: 'PDF hochladen, Unterzeichner per E-Mail einladen, einmalig bezahlen. Qualifizierte elektronische Signatur ohne Abo – erklärt in 4 Schritten.',
    breadcrumbs: [
      { label: 'Startseite', href: '/' },
      { label: 'Dokumentation' },
      { label: 'Wie es funktioniert' },
    ],
    related: [
      { slug: 'getting-started', label: 'Getting Started – erste Signatur in 5 Min.' },
      { slug: 'pricing', label: 'Preise & Pakete' },
      { slug: 'security', label: 'Sicherheit & Datenschutz' },
    ],
  },
  'pricing': {
    title: 'Preise | justSign – CHF 3.40 pro Signatur inkl. MwSt',
    description: 'Transparente Preise für qualifizierte digitale Signaturen. CHF 3.40 pro Signatur inkl. 8.1% MwSt. Prepaid, kein Abo, keine Grundgebühr.',
    breadcrumbs: [
      { label: 'Startseite', href: '/' },
      { label: 'Preise' },
    ],
    related: [
      { slug: 'how-it-works', label: 'Wie es funktioniert' },
      { slug: 'getting-started', label: 'Getting Started' },
      { slug: 'faq', label: 'Häufige Fragen' },
    ],
  },
  'getting-started': {
    title: 'Getting Started | justSign – Erste digitale Signatur in 5 Minuten',
    description: 'Schritt-für-Schritt Anleitung: PDF hochladen, Unterzeichner konfigurieren, bezahlen. Kein Konto, keine Installation. Jetzt starten.',
    breadcrumbs: [
      { label: 'Startseite', href: '/' },
      { label: 'Dokumentation' },
      { label: 'Getting Started' },
    ],
    related: [
      { slug: 'how-it-works', label: 'Wie es funktioniert' },
      { slug: 'pricing', label: 'Preise & Pakete' },
      { slug: 'faq', label: 'Häufige Fragen' },
    ],
  },
  'faq': {
    title: 'FAQ | justSign – Häufige Fragen zur digitalen Signatur',
    description: 'Antworten zu Kosten, Sicherheit, Dateiformaten, Unterzeichner-Prozess und rechtlicher Gültigkeit der qualifizierten elektronischen Signatur.',
    breadcrumbs: [
      { label: 'Startseite', href: '/' },
      { label: 'Dokumentation' },
      { label: 'FAQ' },
    ],
    related: [
      { slug: 'getting-started', label: 'Getting Started' },
      { slug: 'security', label: 'Sicherheit' },
      { slug: 'pricing', label: 'Preise' },
    ],
  },
  'security': {
    title: 'Sicherheit | justSign – DSGVO-konforme Signaturplattform',
    description: 'TLS 1.3, AES-256, Swisscom QES, Stripe PCI-DSS. DSGVO & revDSG konform. Alle Daten werden in der Schweiz gehosted.',
    breadcrumbs: [
      { label: 'Startseite', href: '/' },
      { label: 'Dokumentation' },
      { label: 'Sicherheit' },
    ],
    related: [
      { slug: 'privacy', label: 'Datenschutzerklärung' },
      { slug: 'faq', label: 'FAQ' },
      { slug: 'how-it-works', label: 'Wie es funktioniert' },
    ],
  },
  'privacy': {
    title: 'Datenschutz | justSign – DSGVO & revDSG',
    description: 'Datenschutzerklärung von justSign: Erhobene Daten, Speicherdauer, Ihre Rechte nach DSGVO und revDSG. Transparenz ohne Kompromisse.',
    breadcrumbs: [
      { label: 'Startseite', href: '/' },
      { label: 'Rechtliches' },
      { label: 'Datenschutz' },
    ],
    related: [
      { slug: 'security', label: 'Sicherheit' },
      { slug: 'terms', label: 'AGB' },
    ],
  },
  'terms': {
    title: 'AGB | justSign – Allgemeine Geschäftsbedingungen',
    description: 'Allgemeine Geschäftsbedingungen der justSign Plattform: Leistungsumfang, Preise, Haftungsausschluss und anwendbares Schweizer Recht.',
    breadcrumbs: [
      { label: 'Startseite', href: '/' },
      { label: 'Rechtliches' },
      { label: 'AGB' },
    ],
    related: [
      { slug: 'privacy', label: 'Datenschutz' },
      { slug: 'pricing', label: 'Preise' },
    ],
  },
}

const docModules: Record<string, () => Promise<{ default: string }>> = {
  'how-it-works':    () => import('../content/how-it-works.md?raw'),
  'pricing':         () => import('../content/pricing.md?raw'),
  'getting-started': () => import('../content/getting-started.md?raw'),
  'faq':             () => import('../content/faq.md?raw'),
  'security':        () => import('../content/security.md?raw'),
  'privacy':         () => import('../content/privacy.md?raw'),
  'terms':           () => import('../content/terms.md?raw'),
}

// Internal links use React Router (no page reload); external links open in new tab
const mdComponents: Components = {
  a({ href, children }) {
    if (href?.startsWith('/')) {
      return <Link to={href}>{String(children)}</Link>
    }
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  },
}

function Breadcrumbs({ items }: { items: DocConfig['breadcrumbs'] }) {
  return (
    <nav className="md-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="breadcrumb-item">
          {i > 0 && <span className="breadcrumb-sep" aria-hidden="true">›</span>}
          {item.href
            ? <Link to={item.href}>{item.label}</Link>
            : <span className={i === items.length - 1 ? 'breadcrumb-current' : ''}>{item.label}</span>
          }
        </span>
      ))}
    </nav>
  )
}

function RelatedArticles({ items }: { items: DocConfig['related'] }) {
  if (!items.length) return null
  return (
    <aside className="md-related" aria-label="Weiter lesen">
      <h3>Weiter lesen</h3>
      <div className="md-related-grid">
        {items.map((r) => (
          <Link key={r.slug} to={`/docs/${r.slug}`} className="md-related-link">
            {r.label} →
          </Link>
        ))}
      </div>
    </aside>
  )
}

function JsonLdBreadcrumb({ items }: { items: DocConfig['breadcrumbs'] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://swisssigner.ch${item.href}` } : {}),
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function MarkdownPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const config = slug ? docConfig[slug] : undefined

  useEffect(() => {
    if (!slug || !docModules[slug]) {
      setError(true)
      return
    }
    setContent(null)
    setError(false)
    docModules[slug]()
      .then((m) => setContent(m.default))
      .catch(() => setError(true))
  }, [slug])

  // Set <title> and <meta description> per page
  useEffect(() => {
    if (config) {
      document.title = config.title
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', config.description)
    }
    return () => {
      document.title = 'justSign – Prepaid digitale Signatur'
    }
  }, [config])

  if (error) {
    return (
      <main className="md-page container">
        <div className="md-not-found">
          <h1>Seite nicht gefunden</h1>
          <p>Diese Dokumentation existiert nicht.</p>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Zurück zur Startseite</button>
        </div>
      </main>
    )
  }

  if (!content || !config) {
    return (
      <main className="md-page container">
        <div className="md-loading">Laden…</div>
      </main>
    )
  }

  return (
    <main className="md-page">
      <JsonLdBreadcrumb items={config.breadcrumbs} />
      <div className="container">
        <Breadcrumbs items={config.breadcrumbs} />
        <article className="md-article">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        </article>
        <RelatedArticles items={config.related} />
      </div>
    </main>
  )
}
