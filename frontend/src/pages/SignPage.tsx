import { useEffect, useRef, useState } from 'react'
import { calculatePrice } from '../services/mockStripe'
import * as api from '../services/api'
import type { InitiatorSelection, InviteResponse, Signatory, SignatoryPlacement, SignatureLevel } from '../services/api'
import PdfSignaturePlacer from './PdfSignaturePlacer'
import './SignPage.css'

type Step = 'upload' | 'signatories' | 'placement' | 'initiator' | 'pricing' | 'payment' | 'done'

let signatoryCounter = 0

function normalizeSignatureLevel(level?: string): SignatureLevel {
  if (level === 'SIMPLE') return 'SIMPLE'
  return level === 'AES' ? 'AES' : 'QES'
}

function createSignatory(): Signatory {
  signatoryCounter++
  return { id: `sig_${signatoryCounter}`, firstName: '', lastName: '', email: '', phone: '' }
}

function createDefaultInitiator(signatories: Signatory[]): InitiatorSelection {
  return {
    mode: 'SIGNER',
    signerId: signatories[0]?.id ?? '',
  }
}

export default function SignPage() {
  const [step,        setStep]        = useState<Step>('upload')
  const [file,        setFile]        = useState<File | null>(null)
  const [signatories, setSignatories] = useState<Signatory[]>(() => [createSignatory()])
  const [documentSignatureLevel, setDocumentSignatureLevel] = useState<SignatureLevel>('QES')
  const [placements,  setPlacements]  = useState<SignatoryPlacement[]>([])
  const [initiator,   setInitiator]   = useState<InitiatorSelection>({ mode: 'SIGNER', signerId: '' })
  const [loading,     setLoading]     = useState(false)
  const [session,     setSession]     = useState<InviteResponse | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Client-side price preview (mirrors backend calculation)
  const price = calculatePrice(signatories.length)

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setError(null)
    } else if (f) {
      setError('Bitte nur PDF-Dateien hochladen.')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setError(null)
    } else {
      setError('Bitte nur PDF-Dateien hochladen.')
    }
  }

  async function handleUploadNext() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      await api.uploadDocument(file)
      setStep('signatories')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignatoriesNext() {
    setLoading(true)
    setError(null)
    try {
      await api.setSignatories(signatories, documentSignatureLevel)
      // Reset placements when signatories change
      setPlacements([])
      setInitiator(createDefaultInitiator(signatories))
      setStep('placement')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern der Unterzeichner.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePlacementNext() {
    setLoading(true)
    setError(null)
    try {
      await api.savePlacements(placements)
      setStep('initiator')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern der Platzierungen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleInitiatorNext() {
    setLoading(true)
    setError(null)
    try {
      await api.setInitiator(initiator)
      setStep('pricing')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern des Initiators.')
    } finally {
      setLoading(false)
    }
  }

  function addSignatory() {
    setSignatories((prev) => [...prev, createSignatory()])
  }

  function removeSignatory(id: string) {
    setSignatories((prev) => prev.filter((s) => s.id !== id))
    setPlacements((prev) => prev.filter((p) => p.signatoryId !== id))
  }

  function updateSignatory<K extends keyof Signatory>(id: string, field: K, value: Signatory[K]) {
    setSignatories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  function isSignatoriesValid() {
    return signatories.every((s) => s.firstName.trim() && s.lastName.trim() && (s.email.trim() || s.phone.trim()))
  }

  const placedIds = new Set(placements.map((p) => p.signatoryId))
  const placedCount = signatories.filter((s) => placedIds.has(s.id)).length
  const allPlaced = signatories.length > 0 && placedCount === signatories.length
  const placedPrice = calculatePrice(placedCount)
  const selectedInitiatorSigner = signatories.find((s) => s.id === initiator.signerId)
  const thirdPersonEmail = (initiator.email ?? '').trim()
  const thirdPersonEmailValid = !!thirdPersonEmail && thirdPersonEmail.includes('@')
  const initiatorValid =
    initiator.mode === 'SIGNER'
      ? !!selectedInitiatorSigner && !!selectedInitiatorSigner.email?.trim()
      : thirdPersonEmailValid

  useEffect(() => {
    setInitiator((prev) => {
      if (prev.mode === 'THIRD_PERSON') return prev
      const signerExists = prev.signerId && signatories.some((s) => s.id === prev.signerId)
      if (signerExists) return prev
      return createDefaultInitiator(signatories)
    })
  }, [signatories])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripeState = params.get('stripe')
    const sessionId = params.get('session_id')
    if (!stripeState) {
      return
    }

    let cancelled = false
    const clearStripeQuery = () => {
      const cleanUrl = `${window.location.pathname}${window.location.hash}`
      window.history.replaceState({}, '', cleanUrl)
    }

    if (stripeState === 'cancel') {
      setStep('payment')
      setError('Zahlung wurde bei Stripe abgebrochen.')
      clearStripeQuery()
      return
    }

    if (stripeState !== 'success' || !sessionId) {
      setError('Ungültige Rückkehr von Stripe.')
      clearStripeQuery()
      return
    }

    const finalizePayment = async () => {
      setLoading(true)
      setError(null)
      setStep('payment')
      try {
        const currentState = await api.getSigningState().catch(() => null)
        if (currentState?.signatories?.length) {
          setSignatories(currentState.signatories)
        }
        if (currentState?.placements) {
          setPlacements(currentState.placements)
        }
        if (currentState?.initiator) {
          setInitiator(currentState.initiator)
        }
        if (currentState?.signatureLevel) {
          setDocumentSignatureLevel(normalizeSignatureLevel(currentState.signatureLevel))
        } else if (currentState?.signatories?.[0]?.signatureLevel) {
          setDocumentSignatureLevel(normalizeSignatureLevel(currentState.signatories[0].signatureLevel))
        }

        const payment = await api.confirmPayment(sessionId)
        if (cancelled) return

        if (payment.status === 'success') {
          if (payment.invitations?.length) {
            setSession({
              sessionId: payment.sessionId,
              documentName: payment.documentName ?? (currentState?.documentName ?? file?.name ?? 'Dokument'),
              invitations: payment.invitations,
            })
            setStep('done')
          } else {
            const result = await api.sendInvitations()
            if (cancelled) return
            setSession(result)
            setStep('done')
          }
        } else if (payment.status === 'cancelled') {
          setError('Zahlung wurde nicht abgeschlossen.')
        } else {
          setError('Zahlung ist noch ausstehend. Bitte kurz warten und erneut versuchen.')
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Zahlungsprüfung fehlgeschlagen.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
        clearStripeQuery()
      }
    }

    void finalizePayment()
    return () => {
      cancelled = true
    }
  }, [])

  async function handlePay() {
    setLoading(true)
    setError(null)
    try {
      const payment = await api.processPayment()
      if (payment.status === 'success') {
        if (payment.invitations?.length) {
          setSession({
            sessionId: payment.sessionId,
            documentName: payment.documentName ?? file?.name ?? 'Dokument',
            invitations: payment.invitations,
          })
        } else {
          const result = await api.sendInvitations()
          setSession(result)
        }
        setStep('done')
        return
      }
      if (payment.status === 'pending' && payment.checkoutUrl) {
        window.location.assign(payment.checkoutUrl)
        return
      }
      if (payment.status === 'cancelled') {
        setError('Zahlung wurde abgebrochen.')
        return
      }
      setError('Stripe Checkout URL fehlt.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Zahlung fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="sign-page">
      <div className="container">
        <div className="sign-header">
          <h1>Dokument digital signieren</h1>
          <p>Kein Konto erforderlich. Bezahle nur was du brauchst.</p>
        </div>

        <div className="sign-stepper">
          {(['upload', 'signatories', 'placement', 'initiator', 'pricing', 'payment', 'done'] as Step[]).map((s, i) => (
            <div key={s} className={`stepper-item ${step === s ? 'active' : ''} ${isStepDone(step, s) ? 'done' : ''}`}>
              <div className="stepper-dot">{isStepDone(step, s) ? '✓' : i + 1}</div>
              <span>{stepLabel(s)}</span>
            </div>
          ))}
        </div>

        {error && <div className="sign-error" role="alert">{error}</div>}

        {/* ── Step 1: Upload ── */}
        {step === 'upload' && (
          <div className="sign-step card">
            <h2>Dokument hochladen</h2>
            <div
              className={`dropzone ${file ? 'dropzone-filled' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="PDF hochladen"
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                data-testid="file-input"
              />
              {file ? (
                <>
                  <span className="dropzone-icon">📄</span>
                  <p className="dropzone-filename">{file.name}</p>
                  <p className="dropzone-hint">Andere Datei auswählen</p>
                </>
              ) : (
                <>
                  <span className="dropzone-icon">📂</span>
                  <p>PDF hier ablegen oder klicken</p>
                  <p className="dropzone-hint">Nur PDF-Dateien · Max. 20 MB</p>
                </>
              )}
            </div>
            <div className="step-actions">
              <button
                className="btn btn-primary"
                disabled={!file || loading}
                onClick={handleUploadNext}
              >
                {loading ? 'Hochladen…' : 'Weiter: Unterzeichner hinzufügen →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Signatories ── */}
        {step === 'signatories' && (
          <div className="sign-step card">
            <h2>Unterzeichner konfigurieren</h2>
            <p className="step-desc">Gib Vorname, Nachname und E-Mail oder Telefon der Unterzeichner ein.</p>
            <div className="signature-level-help">
              <strong>Signaturlevel für dieses Dokument:</strong> Wähle einmal aus, gilt dann für alle Unterzeichner.
            </div>
            <div className="document-level-select" role="radiogroup" aria-label="Signaturlevel für dieses Dokument">
              <label className="document-level-option">
                <input
                  type="radio"
                  name="document-signature-level"
                  checked={documentSignatureLevel === 'SIMPLE'}
                  onChange={() => setDocumentSignatureLevel('SIMPLE')}
                />
                <span>
                  <strong>SIMPLE</strong>
                  <small>Einfache elektronische Signatur (niedrigste Hürde)</small>
                </span>
              </label>
              <label className="document-level-option">
                <input
                  type="radio"
                  name="document-signature-level"
                  checked={documentSignatureLevel === 'AES'}
                  onChange={() => setDocumentSignatureLevel('AES')}
                />
                <span>
                  <strong>AES</strong>
                  <small>Fortgeschrittene elektronische Signatur</small>
                </span>
              </label>
              <label className="document-level-option">
                <input
                  type="radio"
                  name="document-signature-level"
                  checked={documentSignatureLevel === 'QES'}
                  onChange={() => setDocumentSignatureLevel('QES')}
                />
                <span>
                  <strong>QES</strong>
                  <small>Qualifizierte Signatur (höchste Beweiskraft)</small>
                </span>
              </label>
            </div>
            <div className="signatories-list">
              {signatories.map((s, i) => (
                <div key={s.id} className="signatory-row">
                  <div className="signatory-num">{i + 1}</div>
                  <div className="signatory-fields">
                    <input
                      type="text"
                      placeholder="Vorname"
                      value={s.firstName}
                      onChange={(e) => updateSignatory(s.id, 'firstName', e.target.value)}
                      aria-label={`Vorname Unterzeichner ${i + 1}`}
                    />
                    <input
                      type="text"
                      placeholder="Nachname"
                      value={s.lastName}
                      onChange={(e) => updateSignatory(s.id, 'lastName', e.target.value)}
                      aria-label={`Nachname Unterzeichner ${i + 1}`}
                    />
                    <input
                      type="email"
                      placeholder="E-Mail"
                      value={s.email}
                      onChange={(e) => updateSignatory(s.id, 'email', e.target.value)}
                      aria-label={`E-Mail Unterzeichner ${i + 1}`}
                    />
                    <input
                      type="tel"
                      placeholder="Telefon (optional)"
                      value={s.phone}
                      onChange={(e) => updateSignatory(s.id, 'phone', e.target.value)}
                      aria-label={`Telefon Unterzeichner ${i + 1}`}
                    />
                  </div>
                  {signatories.length > 1 && (
                    <button
                      className="btn btn-ghost signatory-remove"
                      onClick={() => removeSignatory(s.id)}
                      aria-label={`Unterzeichner ${i + 1} entfernen`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-ghost add-signatory" onClick={addSignatory}>
              + Weiteren Unterzeichner hinzufügen
            </button>
            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('upload')}>← Zurück</button>
              <button
                className="btn btn-primary"
                disabled={!isSignatoriesValid() || loading}
                onClick={handleSignatoriesNext}
              >
                {loading ? 'Speichern…' : 'Weiter: Signaturfelder platzieren →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Placement ── */}
        {step === 'placement' && file && (
          <div className="sign-step card placement-card">
            <h2>Signaturfelder platzieren</h2>
            <p className="step-desc">
              Ziehe jeden Unterzeichner auf die gewünschte Stelle im Dokument.
            </p>
            <div className="placement-layout">
              <div className="placement-workspace">
                <PdfSignaturePlacer
                  file={file}
                  signatories={signatories}
                  placements={placements}
                  onChange={setPlacements}
                />
                <div className="placement-summary">
                  <h3>Koordinaten pro Unterzeichner</h3>
                  {signatories.map((s, index) => {
                    const p = placements.find((pl) => pl.signatoryId === s.id)
                    const label = signatoryLabel(s, index)
                    return (
                      <div key={s.id} className="placement-row">
                        <span className="placement-name">{label}</span>
                        <span className="placement-values">
                          {p ? `Seite ${p.page} · X ${p.x} · Y ${p.y}` : 'Noch nicht platziert'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <aside className="placement-price-panel card">
                <h3>Live Preis</h3>
                <p className="placement-price-hint">Aktualisiert sich mit jeder platzierten Signatur.</p>

                <div className="price-breakdown placement-price-breakdown">
                  <div className="price-row">
                    <span>Platziert ({placedCount} × CHF {placedPrice.perSignature.toFixed(2)})</span>
                    <span>CHF {placedPrice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span>MwSt (8.1%)</span>
                    <span>CHF {placedPrice.tax.toFixed(2)}</span>
                  </div>
                  <div className="price-row price-total">
                    <span>Aktuell</span>
                    <span>CHF {placedPrice.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="placement-price-meta">
                  <div className="placement-price-meta-row">
                    <span>Dokument</span>
                    <strong>{file.name}</strong>
                  </div>
                  <div className="placement-price-meta-row">
                    <span>Gesamt (alle Signer)</span>
                    <strong>CHF {price.total.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="placement-review-list">
                  {signatories.map((s, index) => {
                    const isPlaced = placedIds.has(s.id)
                    const label = signatoryLabel(s, index)
                    return (
                      <div key={s.id} className="placement-review-row">
                        <span>{isPlaced ? '✓' : '○'} {label}</span>
                        <span>{isPlaced ? 'platziert' : 'offen'}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="step-actions placement-actions">
                  <button className="btn btn-ghost" onClick={() => setStep('signatories')}>← Zurück</button>
                  <button
                    className="btn btn-primary"
                    disabled={!allPlaced || loading}
                    onClick={handlePlacementNext}
                    title={!allPlaced ? 'Alle Unterzeichner müssen platziert sein' : undefined}
                  >
                    {loading ? 'Speichern…' : 'Weiter: Überprüfen →'}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* ── Step 4: Initiator ── */}
        {step === 'initiator' && (
          <div className="sign-step card">
            <h2>Initiator festlegen</h2>
            <p className="step-desc">
              Der Initiator ist die Person, die den Signaturprozess startet und alle E-Mail-Benachrichtigungen
              (Einladung, Abschluss, Status) zum Prozess erhaelt.
            </p>

            <div className="signature-level-help">
              <strong>Hinweis:</strong> Der Initiator kann einer der Unterzeichner sein oder eine dritte Person.
            </div>

            <div className="document-level-select" role="radiogroup" aria-label="Initiator-Typ">
              <label className="document-level-option">
                <input
                  type="radio"
                  name="initiator-mode"
                  checked={initiator.mode === 'SIGNER'}
                  onChange={() => setInitiator((prev) => ({ ...prev, mode: 'SIGNER', signerId: prev.signerId || signatories[0]?.id || '' }))}
                />
                <span>
                  <strong>Unterzeichner als Initiator</strong>
                  <small>Eine bereits eingetragene Signer-Person wird Initiator.</small>
                </span>
              </label>
              <label className="document-level-option">
                <input
                  type="radio"
                  name="initiator-mode"
                  checked={initiator.mode === 'THIRD_PERSON'}
                  onChange={() => setInitiator((prev) => ({ ...prev, mode: 'THIRD_PERSON' }))}
                />
                <span>
                  <strong>Dritte Person</strong>
                  <small>Jemand ausserhalb der Signer-Liste erhaelt die Prozess-E-Mails.</small>
                </span>
              </label>
            </div>

            {initiator.mode === 'SIGNER' ? (
              <div className="signatories-list">
                <div className="signatory-row">
                  <div className="signatory-num">i</div>
                  <div className="signatory-fields">
                    <select
                      value={initiator.signerId ?? ''}
                      onChange={(e) => setInitiator((prev) => ({ ...prev, signerId: e.target.value }))}
                      aria-label="Initiator Signer"
                    >
                      {signatories.map((s, index) => (
                        <option key={s.id} value={s.id}>
                          {signatoryLabel(s, index)}{s.email ? ` (${s.email})` : ' (keine E-Mail)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedInitiatorSigner && !selectedInitiatorSigner.email?.trim() && (
                  <div className="sign-error" role="alert">
                    Der ausgewaehlte Initiator hat keine E-Mail-Adresse. Bitte beim Unterzeichner eine E-Mail eintragen
                    oder "Dritte Person" waehlen.
                  </div>
                )}
              </div>
            ) : (
              <div className="signatories-list">
                <div className="signatory-row">
                  <div className="signatory-num">i</div>
                  <div className="signatory-fields">
                    <input
                      type="text"
                      placeholder="Vorname (optional)"
                      value={initiator.firstName ?? ''}
                      onChange={(e) => setInitiator((prev) => ({ ...prev, firstName: e.target.value }))}
                      aria-label="Initiator Vorname"
                    />
                    <input
                      type="text"
                      placeholder="Nachname (optional)"
                      value={initiator.lastName ?? ''}
                      onChange={(e) => setInitiator((prev) => ({ ...prev, lastName: e.target.value }))}
                      aria-label="Initiator Nachname"
                    />
                    <input
                      type="email"
                      placeholder="E-Mail (erforderlich)"
                      value={initiator.email ?? ''}
                      onChange={(e) => setInitiator((prev) => ({ ...prev, email: e.target.value }))}
                      aria-label="Initiator E-Mail"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('placement')}>← Zurück</button>
              <button
                className="btn btn-primary"
                disabled={!initiatorValid || loading}
                onClick={handleInitiatorNext}
              >
                {loading ? 'Speichern…' : 'Weiter: Preis prüfen →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Pricing ── */}
        {step === 'pricing' && (
          <div className="sign-step card">
            <h2>Preisübersicht</h2>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Signaturen ({price.count} × CHF {price.perSignature.toFixed(2)})</span>
                <span>CHF {price.subtotal.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>MwSt (8.1%)</span>
                <span>CHF {price.tax.toFixed(2)}</span>
              </div>
              <div className="price-row price-total">
                <span>Total</span>
                <span>CHF {price.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="price-doc">
              <span>📄 {file?.name}</span>
            </div>
            <div className="price-signatories">
              {signatories.map((s, index) => (
                <div key={s.id} className="price-signatory">
                  <span>👤 {signatoryLabel(s, index)}</span>
                  <span>{s.email || s.phone}</span>
                </div>
              ))}
            </div>
            <div className="price-doc">
              <span>Signaturlevel: <strong>{documentSignatureLevel}</strong></span>
            </div>
            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('initiator')}>← Zurück</button>
              <button className="btn btn-primary" onClick={() => setStep('payment')}>
                Weiter: Bezahlen →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 6: Payment ── */}
        {step === 'payment' && (
          <div className="sign-step card">
            <h2>Bezahlung</h2>
            <div className="payment-mock-notice">
              <span>🔒</span>
              <div>
                <strong>Sicher bezahlen mit Stripe</strong>
                <p>Nach Klick auf "Jetzt bezahlen" wirst du zur sicheren Stripe-Checkout-Seite weitergeleitet.</p>
              </div>
            </div>
            <div className="payment-summary">
              <span>Total</span>
              <span className="payment-total">CHF {price.total.toFixed(2)}</span>
            </div>
            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('pricing')}>← Zurück</button>
              <button
                className="btn btn-primary"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? 'Verarbeitung…' : '💳 Jetzt bezahlen'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 7: Done ── */}
        {step === 'done' && session && (
          <div className="sign-step card sign-done">
            <div className="done-icon">✅</div>
            <h2>Einladungen verschickt!</h2>
            <p>Alle Unterzeichner wurden per E-Mail/SMS benachrichtigt.</p>
            <div className="done-invitations">
              {session.invitations.map((inv, index) => (
                <div key={inv.signatory.id} className="done-invite">
                  <div>
                    <strong>{signatoryLabel(inv.signatory, index)}</strong>
                    <span>{inv.signatory.email || inv.signatory.phone}</span>
                  </div>
                  <a href={inv.inviteLink} className="invite-link" target="_blank" rel="noreferrer">
                    Mock-Link →
                  </a>
                </div>
              ))}
            </div>
            <button
              className="btn btn-outline"
              onClick={() => {
                const initialSignatories = [createSignatory()]
                setStep('upload')
                setFile(null)
                setSignatories(initialSignatories)
                setDocumentSignatureLevel('QES')
                setPlacements([])
                setInitiator(createDefaultInitiator(initialSignatories))
                setSession(null)
              }}
            >
              Weiteres Dokument signieren
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

function isStepDone(current: Step, check: Step): boolean {
  const order: Step[] = ['upload', 'signatories', 'placement', 'initiator', 'pricing', 'payment', 'done']
  return order.indexOf(current) > order.indexOf(check)
}

function stepLabel(s: Step): string {
  const labels: Record<Step, string> = {
    upload:      'Upload',
    signatories: 'Unterzeichner',
    placement:   'Platzierung',
    initiator:   'Initiator',
    pricing:     'Preis',
    payment:     'Zahlung',
    done:        'Fertig',
  }
  return labels[s]
}

function signatoryLabel(s: Signatory, index: number): string {
  const full = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim()
  return full || `Unterzeichner ${index + 1}`
}
