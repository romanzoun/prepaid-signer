import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as api from '../services/api'
import { useI18n } from '../i18n'
import './StatusPage.css'

const STATUS_COPY = {
  de: {
    title: 'Status Checker',
    subtitle: 'Process-ID eingeben und den Signaturstatus direkt aus der Swisscom Sign API abrufen.',
    inputLabel: 'Process ID',
    inputPlaceholder: 'z. B. 5f1d4a2b-...',
    checkNow: 'Jetzt prüfen',
    resultTitle: 'Aktueller Status',
    checkedAt: 'Geprüft',
    updatedAt: 'Letzte Änderung',
    provider: 'Quelle',
    completedTitle: 'Prozess abgeschlossen',
    completedInfo: 'Alle Personen, die signiert haben, haben eine unterschriebene Kopie erhalten.',
    archiveInfo: 'Wenn du archivieren willst, lass dir das signierte Dokument weiterleiten.',
    supportInfo: 'Bei Fragen kontaktiere den Swisscom Sign Support.',
    errorEmpty: 'Bitte eine Process-ID eingeben.',
    openSign: 'Zurück zu Signieren',
  },
  en: {
    title: 'Status Checker',
    subtitle: 'Enter a process ID and poll signing status directly from the Swisscom Sign API.',
    inputLabel: 'Process ID',
    inputPlaceholder: 'e.g. 5f1d4a2b-...',
    checkNow: 'Check now',
    resultTitle: 'Current status',
    checkedAt: 'Checked',
    updatedAt: 'Last update',
    provider: 'Source',
    completedTitle: 'Process completed',
    completedInfo: 'All signers have received a signed copy.',
    archiveInfo: 'If you need archiving, ask to have the signed document forwarded to you.',
    supportInfo: 'If you have questions, contact Swisscom Sign support.',
    errorEmpty: 'Please enter a process ID.',
    openSign: 'Back to signing',
  },
  fr: {
    title: 'Status Checker',
    subtitle: 'Entrez un process ID et interrogez le statut de signature directement via l API Swisscom Sign.',
    inputLabel: 'Process ID',
    inputPlaceholder: 'ex. 5f1d4a2b-...',
    checkNow: 'Verifier',
    resultTitle: 'Statut actuel',
    checkedAt: 'Verifie le',
    updatedAt: 'Derniere modification',
    provider: 'Source',
    completedTitle: 'Processus termine',
    completedInfo: 'Tous les signataires ont recu une copie signee.',
    archiveInfo: 'Pour l archivage, faites-vous transferer le document signe.',
    supportInfo: 'En cas de questions, contactez le support Swisscom Sign.',
    errorEmpty: 'Veuillez saisir un process ID.',
    openSign: 'Retour a la signature',
  },
} as const

export default function StatusPage() {
  const { locale } = useI18n()
  const copy = STATUS_COPY[locale]
  const [searchParams, setSearchParams] = useSearchParams()

  const initialProcessId = useMemo(() => searchParams.get('processId') ?? '', [searchParams])
  const [processId, setProcessId] = useState(initialProcessId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<api.ProcessStatusResponse | null>(null)

  useEffect(() => {
    setProcessId(initialProcessId)
  }, [initialProcessId])

  async function fetchStatus() {
    const id = processId.trim()
    if (!id) {
      setError(copy.errorEmpty)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const result = await api.getProcessStatus(id)
      setStatus(result)
      setSearchParams({ processId: id }, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Status query failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="status-page">
      <div className="container">
        <section className="status-card card">
          <h1>{copy.title}</h1>
          <p className="status-subtitle">{copy.subtitle}</p>

          <label className="status-label" htmlFor="process-id-input">{copy.inputLabel}</label>
          <div className="status-controls">
            <input
              id="process-id-input"
              type="text"
              placeholder={copy.inputPlaceholder}
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => void fetchStatus()} disabled={loading}>
              {loading ? '...' : copy.checkNow}
            </button>
          </div>

          {error && <div className="sign-error" role="alert">{error}</div>}

          {status && (
            <div className="status-result">
              <h2>{copy.resultTitle}</h2>
              <div className="status-result-grid">
                <div>
                  <span>Process ID</span>
                  <strong>{status.processId}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong className={`status-pill ${statusClass(status.status)}`}>{status.status}</strong>
                </div>
                {status.checkedAt && (
                  <div>
                    <span>{copy.checkedAt}</span>
                    <strong>{status.checkedAt}</strong>
                  </div>
                )}
                {status.updatedAt && (
                  <div>
                    <span>{copy.updatedAt}</span>
                    <strong>{status.updatedAt}</strong>
                  </div>
                )}
                {status.provider && (
                  <div>
                    <span>{copy.provider}</span>
                    <strong>{status.provider}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {status && isCompletedStatus(status.status) && (
            <div className="status-completed">
              <h3>{copy.completedTitle}</h3>
              <p>{copy.completedInfo}</p>
              <p>{copy.archiveInfo}</p>
              <p className="status-support">{copy.supportInfo}</p>
            </div>
          )}

          <div className="status-links">
            <Link to="/sign">{copy.openSign}</Link>
          </div>
        </section>
      </div>
    </main>
  )
}

function statusClass(status: string): string {
  const normalized = status.toUpperCase()
  if (normalized.includes('COMPLETE') || normalized.includes('SUCCESS') || normalized.includes('DONE')) {
    return 'status-success'
  }
  if (normalized.includes('FAIL') || normalized.includes('ERROR') || normalized.includes('CANCEL')) {
    return 'status-failed'
  }
  return 'status-pending'
}

function isCompletedStatus(status: string): boolean {
  const normalized = status.toUpperCase()
  return normalized.includes('COMPLETE') || normalized.includes('SUCCESS') || normalized.includes('DONE')
}
