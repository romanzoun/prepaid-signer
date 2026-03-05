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
    analysisTitle: 'AI Analyse Status',
    analysisSubtitle: 'analyticProcessID eingeben und den Analysefortschritt abrufen.',
    analysisInputLabel: 'analyticProcessID',
    analysisInputPlaceholder: 'z. B. analysis-4f40a8...',
    analysisCheckNow: 'Analyse prüfen',
    analysisResultTitle: 'Aktueller Analyse-Status',
    analysisStep: 'Analyse-Schritt',
    analysisStepCounter: 'Schritt {{current}} von {{total}}',
    analysisCopyId: 'ID kopieren',
    analysisCopiedId: 'Kopiert',
    analysisDownload: 'Analysebericht herunterladen',
    analysisConfirmation: 'Analyse-Bestätigung herunterladen',
    analysisNotReady: 'Download ist verfügbar, sobald der Status COMPLETED ist.',
    analysisSummary: 'Zusammenfassung',
    analysisConfidence: 'Confidence',
    analysisConsensus: 'Konsens',
    analysisKeyDates: 'Wichtige Daten',
    errorEmptyAnalysis: 'Bitte eine analyticProcessID eingeben.',
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
    analysisTitle: 'AI analysis status',
    analysisSubtitle: 'Enter analyticProcessID to check progress and download when ready.',
    analysisInputLabel: 'analyticProcessID',
    analysisInputPlaceholder: 'e.g. analysis-4f40a8...',
    analysisCheckNow: 'Check analysis',
    analysisResultTitle: 'Current analysis status',
    analysisStep: 'Analysis step',
    analysisStepCounter: 'Step {{current}} of {{total}}',
    analysisCopyId: 'Copy ID',
    analysisCopiedId: 'Copied',
    analysisDownload: 'Download analysis report',
    analysisConfirmation: 'Download analysis confirmation',
    analysisNotReady: 'Download is available once status is COMPLETED.',
    analysisSummary: 'Summary',
    analysisConfidence: 'Confidence',
    analysisConsensus: 'Consensus',
    analysisKeyDates: 'Key dates',
    errorEmptyAnalysis: 'Please enter analyticProcessID.',
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
    analysisTitle: 'Statut analyse IA',
    analysisSubtitle: 'Entrez analyticProcessID pour suivre l analyse et telecharger le rapport.',
    analysisInputLabel: 'analyticProcessID',
    analysisInputPlaceholder: 'ex. analysis-4f40a8...',
    analysisCheckNow: 'Verifier analyse',
    analysisResultTitle: 'Statut actuel de l analyse',
    analysisStep: 'Etape d analyse',
    analysisStepCounter: 'Etape {{current}} sur {{total}}',
    analysisCopyId: 'Copier ID',
    analysisCopiedId: 'Copie',
    analysisDownload: 'Telecharger le rapport d analyse',
    analysisConfirmation: 'Telecharger la confirmation analyse',
    analysisNotReady: 'Le telechargement est disponible des que le statut est COMPLETED.',
    analysisSummary: 'Resume',
    analysisConfidence: 'Confiance',
    analysisConsensus: 'Consensus',
    analysisKeyDates: 'Dates importantes',
    errorEmptyAnalysis: 'Veuillez saisir analyticProcessID.',
    openSign: 'Retour a la signature',
  },
} as const

const ANALYSIS_STEP_LABELS = {
  de: {
    PENDING_PAYMENT: 'Warten auf abgeschlossene Zahlung',
    QUEUED: 'Analyse wurde eingeplant',
    PREPARE_INPUT: 'Texte und Struktur werden extrahiert',
    CONSENSUS_CASE_1: 'Konsens-Fall 1: Strenge Rechts- und Risikoanalyse',
    CONSENSUS_CASE_2: 'Konsens-Fall 2: Pflichten und operative Umsetzung',
    CONSENSUS_CASE_3: 'Konsens-Fall 3: Management- und Business-Sicht',
    SEMANTIC_CONSENSUS: 'Semantische Einigkeit und Zusammenfassung werden berechnet',
    BUILD_RESULT: 'Ergebnis wird aufbereitet',
    COMPLETED: 'Analyse abgeschlossen',
    FAILED: 'Analyse fehlgeschlagen',
  },
  en: {
    PENDING_PAYMENT: 'Waiting for completed payment',
    QUEUED: 'Analysis queued',
    PREPARE_INPUT: 'Extracting text and structure',
    CONSENSUS_CASE_1: 'Consensus case 1: strict legal and risk review',
    CONSENSUS_CASE_2: 'Consensus case 2: obligations and operational execution',
    CONSENSUS_CASE_3: 'Consensus case 3: executive and business perspective',
    SEMANTIC_CONSENSUS: 'Computing semantic agreement and final summary',
    BUILD_RESULT: 'Preparing final output',
    COMPLETED: 'Analysis completed',
    FAILED: 'Analysis failed',
  },
  fr: {
    PENDING_PAYMENT: 'En attente du paiement confirme',
    QUEUED: 'Analyse en file d attente',
    PREPARE_INPUT: 'Extraction du texte et de la structure',
    CONSENSUS_CASE_1: 'Cas consensus 1: revue juridique et risques stricte',
    CONSENSUS_CASE_2: 'Cas consensus 2: obligations et execution operationnelle',
    CONSENSUS_CASE_3: 'Cas consensus 3: perspective direction et business',
    SEMANTIC_CONSENSUS: 'Calcul de l accord semantique et du resume final',
    BUILD_RESULT: 'Preparation du resultat final',
    COMPLETED: 'Analyse terminee',
    FAILED: 'Analyse echouee',
  },
} as const

export default function StatusPage() {
  const { locale } = useI18n()
  const copy = STATUS_COPY[locale]
  const [searchParams, setSearchParams] = useSearchParams()

  const initialProcessId = useMemo(() => searchParams.get('processId') ?? '', [searchParams])
  const initialAnalysisId = useMemo(() => searchParams.get('analyticProcessID') ?? '', [searchParams])
  const [processId, setProcessId] = useState(initialProcessId)
  const [analysisId, setAnalysisId] = useState(initialAnalysisId)
  const [loading, setLoading] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [status, setStatus] = useState<api.ProcessStatusResponse | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState<api.AnalysisStatusResponse | null>(null)
  const [analysisIdCopied, setAnalysisIdCopied] = useState(false)

  useEffect(() => {
    setProcessId(initialProcessId)
  }, [initialProcessId])

  useEffect(() => {
    setAnalysisId(initialAnalysisId)
  }, [initialAnalysisId])

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
      const next = new URLSearchParams(searchParams)
      next.set('processId', id)
      setSearchParams(next, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Status query failed.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchAnalysisStatus() {
    const id = analysisId.trim()
    if (!id) {
      setAnalysisError(copy.errorEmptyAnalysis)
      return
    }
    setAnalysisError(null)
    setAnalysisLoading(true)
    try {
      const result = await api.getAnalysisStatus(id)
      setAnalysisStatus(result)
      const next = new URLSearchParams(searchParams)
      next.set('analyticProcessID', id)
      setSearchParams(next, { replace: true })
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : 'Analysis status query failed.')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const analysisStatusValue = (analysisStatus?.analysisStatus ?? analysisStatus?.status ?? '').toUpperCase()
  const effectiveAnalysisId = (analysisStatus?.analyticProcessID ?? analysisId).trim()
  const canDownloadAnalysis = analysisStatusValue === 'COMPLETED' && Boolean(effectiveAnalysisId)
  const completedAnalysis = (analysisStatus?.analysis && typeof analysisStatus.analysis === 'object')
    ? analysisStatus.analysis as Record<string, unknown>
    : null

  async function copyAnalysisProcessId(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setAnalysisIdCopied(true)
      window.setTimeout(() => setAnalysisIdCopied(false), 1400)
    } catch {
      setAnalysisIdCopied(false)
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

          <hr className="status-divider" />

          <h2 className="status-section-title">{copy.analysisTitle}</h2>
          <p className="status-subtitle">{copy.analysisSubtitle}</p>

          <label className="status-label" htmlFor="analysis-id-input">{copy.analysisInputLabel}</label>
          <div className="status-controls">
            <input
              id="analysis-id-input"
              type="text"
              placeholder={copy.analysisInputPlaceholder}
              value={analysisId}
              onChange={(e) => setAnalysisId(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => void fetchAnalysisStatus()} disabled={analysisLoading}>
              {analysisLoading ? '...' : copy.analysisCheckNow}
            </button>
          </div>

          {analysisError && <div className="sign-error" role="alert">{analysisError}</div>}

          {analysisStatus && (
            <div className="status-result">
              <h2>{copy.analysisResultTitle}</h2>
              <div className="status-result-grid">
                <div>
                  <span>{copy.analysisInputLabel}</span>
                  <strong>{analysisStatus.analyticProcessID ?? analysisId}</strong>
                  <button
                    className="btn btn-ghost status-copy-btn"
                    type="button"
                    onClick={() => void copyAnalysisProcessId(effectiveAnalysisId)}
                  >
                    📋 {analysisIdCopied ? copy.analysisCopiedId : copy.analysisCopyId}
                  </button>
                </div>
                <div>
                  <span>Status</span>
                  <strong className={`status-pill ${statusClass(analysisStatusValue)}`}>{analysisStatusValue || 'UNKNOWN'}</strong>
                </div>
                {typeof analysisStatus.analysisStepIndex === 'number' && typeof analysisStatus.analysisStepTotal === 'number' && (
                  <div>
                    <span>{copy.analysisStep}</span>
                    <strong>
                      {replaceStepCounter(copy.analysisStepCounter, analysisStatus.analysisStepIndex, analysisStatus.analysisStepTotal)}
                      {' · '}
                      {analysisStepLabel(locale, analysisStatus.analysisStepKey)}
                    </strong>
                  </div>
                )}
                {analysisStatus.analysisStartedAt && (
                  <div>
                    <span>{copy.checkedAt}</span>
                    <strong>{analysisStatus.analysisStartedAt}</strong>
                  </div>
                )}
                {analysisStatus.analysisCompletedAt && (
                  <div>
                    <span>{copy.updatedAt}</span>
                    <strong>{analysisStatus.analysisCompletedAt}</strong>
                  </div>
                )}
                {analysisStatus.analysisError && (
                  <div>
                    <span>Error</span>
                    <strong>{analysisStatus.analysisError}</strong>
                  </div>
                )}
              </div>
              <div className="status-analysis-actions">
                <a
                  className="status-download status-download-secondary"
                  href={`/api/sign/analysis/confirmation?analyticProcessID=${encodeURIComponent(effectiveAnalysisId)}&lang=${encodeURIComponent(locale)}`}
                >
                  {copy.analysisConfirmation}
                </a>
                {canDownloadAnalysis ? (
                  <a
                    className="status-download"
                    href={`/api/sign/analysis/report?analyticProcessID=${encodeURIComponent(effectiveAnalysisId)}&lang=${encodeURIComponent(locale)}`}
                  >
                    {copy.analysisDownload}
                  </a>
                ) : (
                  <p>{copy.analysisNotReady}</p>
                )}
              </div>
              {completedAnalysis && (
                <div className="status-analysis-result-block">
                  <h3>{copy.analysisSummary}</h3>
                  <p>{analysisSummaryText(completedAnalysis)}</p>
                  <p><strong>{copy.analysisConfidence}:</strong> {confidenceText(completedAnalysis)}</p>
                  <p><strong>{copy.analysisConsensus}:</strong> {consensusText(completedAnalysis)}</p>
                  {asArray(completedAnalysis.key_dates).length > 0 && (
                    <>
                      <h4>{copy.analysisKeyDates}</h4>
                      <ul>
                        {asArray(completedAnalysis.key_dates).slice(0, 5).map((item, index) => (
                          <li key={`analysis-date-${index}`}>
                            {String(item.date ?? 'n/a')} - {String(item.label ?? item.description ?? '')}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
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

function replaceStepCounter(template: string, current: number, total: number): string {
  return template
    .replace('{{current}}', String(current))
    .replace('{{total}}', String(total))
}

function analysisStepLabel(locale: keyof typeof ANALYSIS_STEP_LABELS, stepKey?: string): string {
  if (!stepKey) return ANALYSIS_STEP_LABELS[locale].PENDING_PAYMENT
  return ANALYSIS_STEP_LABELS[locale][stepKey as keyof (typeof ANALYSIS_STEP_LABELS)[typeof locale]] ?? stepKey
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null) : []
}

function analysisSummaryText(analysis: Record<string, unknown>): string {
  const summary = analysis.summary
  if (typeof summary === 'string' && summary.trim()) return summary
  if (summary && typeof summary === 'object') {
    const candidate = (summary as Record<string, unknown>).executive ?? (summary as Record<string, unknown>).plain_language
    if (typeof candidate === 'string' && candidate.trim()) return candidate
  }
  return 'n/a'
}

function confidenceText(analysis: Record<string, unknown>): string {
  const confidence = analysis.confidence
  if (confidence && typeof confidence === 'object') {
    const score = (confidence as Record<string, unknown>).overall_score ?? (confidence as Record<string, unknown>).score
    if (typeof score === 'number' || typeof score === 'string') return `${score}/100`
  }
  return 'n/a'
}

function consensusText(analysis: Record<string, unknown>): string {
  const consensus = analysis.consensus
  if (consensus && typeof consensus === 'object') {
    const agreement = (consensus as Record<string, unknown>).agreement_score
      ?? (consensus as Record<string, unknown>).critical_claims_agreement
    if (typeof agreement === 'number') {
      const percent = agreement <= 1 ? Math.round(agreement * 100) : Math.round(agreement)
      return `${percent}%`
    }
    if (typeof agreement === 'string' && agreement.trim()) return agreement
    const label = (consensus as Record<string, unknown>).agreement_label
    if (typeof label === 'string' && label.trim()) return label
  }
  return 'n/a'
}
