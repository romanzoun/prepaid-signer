import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { type Locale, useI18n } from '../i18n'
import './MarkdownPage.css'

interface DocConfig {
  title: string
  description: string
  breadcrumbs: Array<{ label: string; href?: string }>
  related: Array<{ slug: string; label: string }>
}

type DocSlug = 'how-it-works' | 'pricing' | 'getting-started' | 'faq' | 'security' | 'privacy' | 'terms'

const DOC_CONFIG: Record<Locale, Record<DocSlug, DocConfig>> = {
  de: {
    'how-it-works': {
      title: 'Wie funktioniert justSign? | Prepaid digitale Signatur Schweiz',
      description: 'PDF hochladen, Unterzeichner per E-Mail einladen, einmalig bezahlen. Qualifizierte elektronische Signatur ohne Abo - erklärt in 4 Schritten.',
      breadcrumbs: [{ label: 'Startseite', href: '/' }, { label: 'Dokumentation' }, { label: 'Wie es funktioniert' }],
      related: [
        { slug: 'getting-started', label: 'Getting Started - erste Signatur in 5 Min.' },
        { slug: 'pricing', label: 'Preise & Konditionen' },
        { slug: 'security', label: 'Sicherheit & Datenschutz' },
      ],
    },
    pricing: {
      title: 'Preise | justSign - CHF 3.40 pro Signatur inkl. MwSt',
      description: 'Transparente Preise für qualifizierte digitale Signaturen. CHF 3.40 pro Signatur inkl. 8.1% MwSt. Prepaid, kein Abo, keine Grundgebühr.',
      breadcrumbs: [{ label: 'Startseite', href: '/' }, { label: 'Preise' }],
      related: [
        { slug: 'how-it-works', label: 'Wie es funktioniert' },
        { slug: 'getting-started', label: 'Getting Started' },
        { slug: 'faq', label: 'Häufige Fragen' },
      ],
    },
    'getting-started': {
      title: 'Getting Started | justSign - Erste digitale Signatur in 5 Minuten',
      description: 'Schritt-für-Schritt Anleitung: PDF hochladen, Unterzeichner konfigurieren, bezahlen. Kein Konto, keine Installation. Jetzt starten.',
      breadcrumbs: [{ label: 'Startseite', href: '/' }, { label: 'Dokumentation' }, { label: 'Getting Started' }],
      related: [
        { slug: 'how-it-works', label: 'Wie es funktioniert' },
        { slug: 'pricing', label: 'Preise & Konditionen' },
        { slug: 'faq', label: 'Häufige Fragen' },
      ],
    },
    faq: {
      title: 'FAQ | justSign - Häufige Fragen zur digitalen Signatur',
      description: 'Antworten zu Kosten, Sicherheit, Dateiformaten, Unterzeichner-Prozess und rechtlicher Gültigkeit der qualifizierten elektronischen Signatur.',
      breadcrumbs: [{ label: 'Startseite', href: '/' }, { label: 'Dokumentation' }, { label: 'FAQ' }],
      related: [
        { slug: 'getting-started', label: 'Getting Started' },
        { slug: 'security', label: 'Sicherheit' },
        { slug: 'pricing', label: 'Preise' },
      ],
    },
    security: {
      title: 'Sicherheit | justSign - DSGVO- und nDSG-konforme Signaturplattform',
      description: 'TLS, Swisscom Sign und Stripe PCI-DSS. DSGVO- und nDSG-konforme Prozesse.',
      breadcrumbs: [{ label: 'Startseite', href: '/' }, { label: 'Dokumentation' }, { label: 'Sicherheit' }],
      related: [
        { slug: 'privacy', label: 'Datenschutzerklärung' },
        { slug: 'faq', label: 'FAQ' },
        { slug: 'how-it-works', label: 'Wie es funktioniert' },
      ],
    },
    privacy: {
      title: 'Datenschutz | justSign - DSGVO & nDSG',
      description: 'Datenschutzerklärung von justSign: Erhobene Daten, Speicherdauer und Rechte nach DSGVO und nDSG.',
      breadcrumbs: [{ label: 'Startseite', href: '/' }, { label: 'Rechtliches' }, { label: 'Datenschutz' }],
      related: [
        { slug: 'security', label: 'Sicherheit' },
        { slug: 'terms', label: 'AGB' },
      ],
    },
    terms: {
      title: 'AGB | justSign - Allgemeine Geschäftsbedingungen',
      description: 'Allgemeine Geschäftsbedingungen der justSign Plattform: Leistungsumfang, Preise, Haftungsausschluss und anwendbares Schweizer Recht.',
      breadcrumbs: [{ label: 'Startseite', href: '/' }, { label: 'Rechtliches' }, { label: 'AGB' }],
      related: [
        { slug: 'privacy', label: 'Datenschutz' },
        { slug: 'pricing', label: 'Preise' },
      ],
    },
  },
  en: {
    'how-it-works': {
      title: 'How justSign works | Prepaid digital signatures Switzerland',
      description: 'Upload PDF, invite signers by email, pay once. Qualified electronic signatures without subscription.',
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Documentation' }, { label: 'How it works' }],
      related: [
        { slug: 'getting-started', label: 'Getting started' },
        { slug: 'pricing', label: 'Pricing' },
        { slug: 'security', label: 'Security & Privacy' },
      ],
    },
    pricing: {
      title: 'Pricing | justSign - CHF 3.40 per signature incl. VAT',
      description: 'Transparent pricing for digital signatures. CHF 3.40 per signature incl. VAT. Prepaid, no subscription.',
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Pricing' }],
      related: [
        { slug: 'how-it-works', label: 'How it works' },
        { slug: 'getting-started', label: 'Getting started' },
        { slug: 'faq', label: 'FAQ' },
      ],
    },
    'getting-started': {
      title: 'Getting started | First digital signature in 5 minutes',
      description: 'Step-by-step guide: upload PDF, configure signers, pay once and send invitations.',
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Documentation' }, { label: 'Getting started' }],
      related: [
        { slug: 'how-it-works', label: 'How it works' },
        { slug: 'pricing', label: 'Pricing' },
        { slug: 'faq', label: 'FAQ' },
      ],
    },
    faq: {
      title: 'FAQ | justSign digital signatures',
      description: 'Answers about pricing, security, file formats, signer process and legal validity.',
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Documentation' }, { label: 'FAQ' }],
      related: [
        { slug: 'getting-started', label: 'Getting started' },
        { slug: 'security', label: 'Security' },
        { slug: 'pricing', label: 'Pricing' },
      ],
    },
    security: {
      title: 'Security | justSign',
      description: 'Security overview including encryption, payment security and compliance alignment.',
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Documentation' }, { label: 'Security' }],
      related: [
        { slug: 'privacy', label: 'Privacy policy' },
        { slug: 'faq', label: 'FAQ' },
        { slug: 'how-it-works', label: 'How it works' },
      ],
    },
    privacy: {
      title: 'Privacy policy | justSign',
      description: 'How justSign processes and protects personal data.',
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Legal' }, { label: 'Privacy' }],
      related: [
        { slug: 'security', label: 'Security' },
        { slug: 'terms', label: 'Terms' },
      ],
    },
    terms: {
      title: 'Terms & Conditions | justSign',
      description: 'Terms governing use of justSign services.',
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Legal' }, { label: 'Terms' }],
      related: [
        { slug: 'privacy', label: 'Privacy policy' },
        { slug: 'pricing', label: 'Pricing' },
      ],
    },
  },
  fr: {
    'how-it-works': {
      title: 'Fonctionnement de justSign | Signature numerique prepaid',
      description: 'Importez un PDF, invitez des signataires, payez une fois. Signature electronique sans abonnement.',
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Documentation' }, { label: 'Fonctionnement' }],
      related: [
        { slug: 'getting-started', label: 'Demarrage' },
        { slug: 'pricing', label: 'Tarifs' },
        { slug: 'security', label: 'Securite & Confidentialite' },
      ],
    },
    pricing: {
      title: 'Tarifs | justSign - CHF 3.40 par signature TTC',
      description: 'Tarifs transparents pour les signatures numeriques. Prepaid sans abonnement.',
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Tarifs' }],
      related: [
        { slug: 'how-it-works', label: 'Fonctionnement' },
        { slug: 'getting-started', label: 'Demarrage' },
        { slug: 'faq', label: 'FAQ' },
      ],
    },
    'getting-started': {
      title: 'Demarrage | Premiere signature numerique en 5 minutes',
      description: 'Guide pas a pas: importer un PDF, configurer les signataires et payer.',
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Documentation' }, { label: 'Demarrage' }],
      related: [
        { slug: 'how-it-works', label: 'Fonctionnement' },
        { slug: 'pricing', label: 'Tarifs' },
        { slug: 'faq', label: 'FAQ' },
      ],
    },
    faq: {
      title: 'FAQ | justSign signature numerique',
      description: 'Reponses sur les tarifs, la securite, les formats de fichier et la validite legale.',
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Documentation' }, { label: 'FAQ' }],
      related: [
        { slug: 'getting-started', label: 'Demarrage' },
        { slug: 'security', label: 'Securite' },
        { slug: 'pricing', label: 'Tarifs' },
      ],
    },
    security: {
      title: 'Securite | justSign',
      description: 'Vue d ensemble des mesures de securite, du paiement et de la conformite.',
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Documentation' }, { label: 'Securite' }],
      related: [
        { slug: 'privacy', label: 'Confidentialite' },
        { slug: 'faq', label: 'FAQ' },
        { slug: 'how-it-works', label: 'Fonctionnement' },
      ],
    },
    privacy: {
      title: 'Politique de confidentialite | justSign',
      description: 'Comment justSign traite et protege les donnees personnelles.',
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Mentions legales' }, { label: 'Confidentialite' }],
      related: [
        { slug: 'security', label: 'Securite' },
        { slug: 'terms', label: 'Conditions generales' },
      ],
    },
    terms: {
      title: 'Conditions generales | justSign',
      description: 'Conditions d utilisation des services justSign.',
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Mentions legales' }, { label: 'Conditions' }],
      related: [
        { slug: 'privacy', label: 'Confidentialite' },
        { slug: 'pricing', label: 'Tarifs' },
      ],
    },
  },
}

const DOC_MODULES: Record<Locale, Record<DocSlug, () => Promise<{ default: string }>>> = {
  de: {
    'how-it-works': () => import('../content/de/how-it-works.md?raw'),
    pricing: () => import('../content/de/pricing.md?raw'),
    'getting-started': () => import('../content/de/getting-started.md?raw'),
    faq: () => import('../content/de/faq.md?raw'),
    security: () => import('../content/de/security.md?raw'),
    privacy: () => import('../content/de/privacy.md?raw'),
    terms: () => import('../content/de/terms.md?raw'),
  },
  en: {
    'how-it-works': () => import('../content/en/how-it-works.md?raw'),
    pricing: () => import('../content/en/pricing.md?raw'),
    'getting-started': () => import('../content/en/getting-started.md?raw'),
    faq: () => import('../content/en/faq.md?raw'),
    security: () => import('../content/en/security.md?raw'),
    privacy: () => import('../content/en/privacy.md?raw'),
    terms: () => import('../content/en/terms.md?raw'),
  },
  fr: {
    'how-it-works': () => import('../content/fr/how-it-works.md?raw'),
    pricing: () => import('../content/fr/pricing.md?raw'),
    'getting-started': () => import('../content/fr/getting-started.md?raw'),
    faq: () => import('../content/fr/faq.md?raw'),
    security: () => import('../content/fr/security.md?raw'),
    privacy: () => import('../content/fr/privacy.md?raw'),
    terms: () => import('../content/fr/terms.md?raw'),
  },
}

const PAGE_COPY = {
  de: {
    breadcrumbAria: 'Breadcrumb',
    relatedAria: 'Weiter lesen',
    relatedTitle: 'Weiter lesen',
    notFoundTitle: 'Seite nicht gefunden',
    notFoundDesc: 'Diese Dokumentation existiert nicht.',
    backHome: 'Zurück zur Startseite',
    loading: 'Laden…',
    defaultTitle: 'justSign - Prepaid digitale Signatur',
  },
  en: {
    breadcrumbAria: 'Breadcrumb',
    relatedAria: 'Read more',
    relatedTitle: 'Read more',
    notFoundTitle: 'Page not found',
    notFoundDesc: 'This documentation page does not exist.',
    backHome: 'Back to home',
    loading: 'Loading…',
    defaultTitle: 'justSign - Prepaid digital signatures',
  },
  fr: {
    breadcrumbAria: 'Fil d Ariane',
    relatedAria: 'Lire aussi',
    relatedTitle: 'Lire aussi',
    notFoundTitle: 'Page introuvable',
    notFoundDesc: 'Cette page de documentation n existe pas.',
    backHome: 'Retour a l accueil',
    loading: 'Chargement…',
    defaultTitle: 'justSign - Signature numerique prepaid',
  },
} as const

const mdComponents: Components = {
  a({ href, children }) {
    if (href?.startsWith('/')) {
      return <Link to={href}>{String(children)}</Link>
    }
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  },
}

function Breadcrumbs({ items, ariaLabel }: { items: DocConfig['breadcrumbs']; ariaLabel: string }) {
  return (
    <nav className="md-breadcrumbs" aria-label={ariaLabel}>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="breadcrumb-item">
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

function RelatedArticles({ items, ariaLabel, title }: { items: DocConfig['related']; ariaLabel: string; title: string }) {
  if (!items.length) return null
  return (
    <aside className="md-related" aria-label={ariaLabel}>
      <h3>{title}</h3>
      <div className="md-related-grid">
        {items.map((related) => (
          <Link key={related.slug} to={`/docs/${related.slug}`} className="md-related-link">
            {related.label} →
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
  const { locale } = useI18n()
  const pageCopy = PAGE_COPY[locale]

  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const typedSlug = (slug as DocSlug | undefined)
  const config = typedSlug ? DOC_CONFIG[locale][typedSlug] : undefined
  const moduleLoader = typedSlug ? DOC_MODULES[locale][typedSlug] : undefined

  useEffect(() => {
    if (!typedSlug || !moduleLoader || !config) {
      setError(true)
      return
    }

    setContent(null)
    setError(false)

    moduleLoader()
      .then((module) => setContent(module.default))
      .catch(() => setError(true))
  }, [typedSlug, moduleLoader, config])

  useEffect(() => {
    if (config) {
      document.title = config.title
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', config.description)
    }
    return () => {
      document.title = pageCopy.defaultTitle
    }
  }, [config, pageCopy.defaultTitle])

  if (error) {
    return (
      <main className="md-page container">
        <div className="md-not-found">
          <h1>{pageCopy.notFoundTitle}</h1>
          <p>{pageCopy.notFoundDesc}</p>
          <button className="btn btn-outline" onClick={() => navigate('/')}>{pageCopy.backHome}</button>
        </div>
      </main>
    )
  }

  if (!content || !config) {
    return (
      <main className="md-page container">
        <div className="md-loading">{pageCopy.loading}</div>
      </main>
    )
  }

  return (
    <main className="md-page">
      <JsonLdBreadcrumb items={config.breadcrumbs} />
      <div className="container">
        <Breadcrumbs items={config.breadcrumbs} ariaLabel={pageCopy.breadcrumbAria} />
        <article className="md-article">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        </article>
        <RelatedArticles items={config.related} ariaLabel={pageCopy.relatedAria} title={pageCopy.relatedTitle} />
      </div>
    </main>
  )
}
