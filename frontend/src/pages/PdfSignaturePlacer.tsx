import { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import type { Signatory, SignatoryPlacement } from '../services/api'
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'
import './PdfSignaturePlacer.css'

// Bind pdf.js worker through Vite's worker pipeline to avoid runtime fetch/mime issues.
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfJsWorker()

const COLORS = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00897b', '#c62828', '#1565c0']
const BOX_W_PT = 150   // signature box width in PDF points
const BOX_H_PT = 45    // signature box height in PDF points
const DEFAULT_ZOOM = 1.5
const MIN_ZOOM = 0.6
const MAX_ZOOM = 3
const ZOOM_STEP = 0.2

interface Props {
  file: File
  signatories: Signatory[]
  placements: SignatoryPlacement[]
  onChange: (placements: SignatoryPlacement[]) => void
}

interface PageInfo {
  page: PDFPageProxy
  viewport: PageViewport
  widthPt: number
  heightPt: number
}

// Active pointer-drag state (ref to avoid re-render on every pixel)
interface DragState {
  signatoryId: string
  page: number
  startPointerX: number  // clientX at drag start
  startPointerY: number  // clientY at drag start
  startPdfX: number
  startPdfY: number
}

export default function PdfSignaturePlacer({ file, signatories, placements, onChange }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const wrapperRef   = useRef<HTMLDivElement>(null)
  const renderTask   = useRef<ReturnType<PDFPageProxy['render']> | null>(null)
  const dragState    = useRef<DragState | null>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)

  const [pdfDoc,      setPdfDoc]      = useState<PDFDocumentProxy | null>(null)
  const [pageInfo,    setPageInfo]    = useState<PageInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom,        setZoom]        = useState(DEFAULT_ZOOM)
  const [isDragOver,  setIsDragOver]  = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [loadError,   setLoadError]   = useState<string | null>(null)
  // Live position of a box being dragged (for smooth preview)
  const [livePos,     setLivePos]     = useState<{ signatoryId: string; x: number; y: number } | null>(null)

  // ── Load PDF from File object ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    setLoadError(null)
    setPdfDoc(null)
    setPageInfo(null)
    setCurrentPage(1)
    setZoom(DEFAULT_ZOOM)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const doc = await pdfjsLib.getDocument({ data }).promise
        setPdfDoc(doc)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'PDF konnte nicht geladen werden.'
        setLoadError(`PDF konnte nicht geladen werden: ${msg}`)
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setLoadError('Datei konnte nicht gelesen werden.')
      setLoading(false)
    }
    reader.readAsArrayBuffer(file)
    return () => { reader.abort() }
  }, [file])

  // ── Render current page onto canvas ───────────────────────────────────────
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    let cancelled = false
    if (renderTask.current) { renderTask.current.cancel() }

    pdfDoc.getPage(currentPage).then((page) => {
      if (cancelled) return

      const vp  = page.getViewport({ scale: zoom })
      const uvp = page.getViewport({ scale: 1 })

      const canvas  = canvasRef.current!
      canvas.width  = vp.width
      canvas.height = vp.height

      setPageInfo({ page, viewport: vp, widthPt: uvp.width, heightPt: uvp.height })

      const ctx  = canvas.getContext('2d')!
      renderTask.current = page.render({ canvasContext: ctx, viewport: vp })
      renderTask.current.promise
        .then(() => setLoading(false))
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Unbekannter Render-Fehler'
          if (!cancelled) {
            setLoadError(`PDF konnte nicht gerendert werden: ${msg}`)
            setLoading(false)
          }
        })
    })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unbekannter Seiten-Fehler'
        if (!cancelled) {
          setLoadError(`PDF-Seite konnte nicht geladen werden: ${msg}`)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [pdfDoc, currentPage, zoom])

  // ── Helpers: coordinate conversion ────────────────────────────────────────

  /** Canvas pixel → PDF point (bottom-left origin) */
  function canvasToPdf(cx: number, cy: number): [number, number] {
    if (!pageInfo) return [0, 0]
    const [px, py] = pageInfo.viewport.convertToPdfPoint(cx, cy)
    return [px, py]
  }

  /** PDF point → canvas pixel (for absolute CSS positioning) */
  function pdfToCanvas(pdfX: number, pdfY: number): { cx: number; cy: number } {
    if (!pageInfo) return { cx: 0, cy: 0 }
    const [cx, cy] = pageInfo.viewport.convertToViewportPoint(pdfX, pdfY)
    return { cx, cy }
  }

  /** Clamp box origin so it doesn't exceed page bounds */
  function clampBox(pdfX: number, pdfY: number): [number, number] {
    if (!pageInfo) return [pdfX, pdfY]
    const x = Math.max(0, Math.min(pdfX, pageInfo.widthPt  - BOX_W_PT))
    const y = Math.max(0, Math.min(pdfY, pageInfo.heightPt - BOX_H_PT))
    return [Math.round(x), Math.round(y)]
  }

  // ── Drop from sidebar chip ─────────────────────────────────────────────────

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)

    const signatoryId = e.dataTransfer.getData('signatoryId')
    if (!signatoryId || !canvasRef.current) return

    const rect     = canvasRef.current.getBoundingClientRect()
    const dropCx   = e.clientX - rect.left
    const dropCy   = e.clientY - rect.top
    const scale = pageInfo?.viewport.scale ?? zoom
    const boxWpx   = BOX_W_PT * scale
    const boxHpx   = BOX_H_PT * scale

    // Bottom-left of a centered box (PDF Y-axis: bottom-left origin)
    const [pdfX, pdfY] = canvasToPdf(dropCx - boxWpx / 2, dropCy + boxHpx / 2)
    const [cx, cy]     = clampBox(pdfX, pdfY)

    upsertPlacement({ signatoryId, page: currentPage, x: cx, y: cy, width: BOX_W_PT, height: BOX_H_PT })
  }

  function upsertPlacement(p: SignatoryPlacement) {
    // One placement per signatory (across all pages – replace any previous)
    const updated = placements.filter(pl => pl.signatoryId !== p.signatoryId)
    onChange([...updated, p])
  }

  function removePlacement(signatoryId: string) {
    onChange(placements.filter(p => p.signatoryId !== signatoryId))
  }

  // ── Pointer drag on placed boxes ──────────────────────────────────────────

  function handleBoxPointerDown(e: React.PointerEvent<HTMLDivElement>, p: SignatoryPlacement) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState.current = {
      signatoryId: p.signatoryId,
      page: p.page,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startPdfX: p.x,
      startPdfY: p.y,
    }
    setLivePos({ signatoryId: p.signatoryId, x: p.x, y: p.y })
  }

  const handleBoxPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current
    if (!ds || !pageInfo) return

    const dCx  = e.clientX - ds.startPointerX  // canvas pixel delta
    const dCy  = e.clientY - ds.startPointerY

    const scale = pageInfo.viewport.scale
    const dPdfX = dCx / scale            // PDF point delta X
    const dPdfY = -dCy / scale           // PDF Y is inverted vs canvas

    const [nx, ny] = clampBox(ds.startPdfX + dPdfX, ds.startPdfY + dPdfY)
    setLivePos({ signatoryId: ds.signatoryId, x: nx, y: ny })
  }, [pageInfo]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleBoxPointerUp() {
    const ds = dragState.current
    if (!ds || !livePos) { dragState.current = null; return }

    onChange(placements.map(p =>
      p.signatoryId === ds.signatoryId
        ? { ...p, x: livePos.x, y: livePos.y, page: currentPage }
        : p
    ))
    dragState.current = null
    setLivePos(null)
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const pagePlacements  = placements.filter(p => p.page === currentPage)
  const placedIds       = new Set(placements.map(p => p.signatoryId))
  const allPlaced       = signatories.length > 0 && signatories.every(s => placedIds.has(s.id))
  const zoomPercent     = Math.round(zoom * 100)

  function clampZoom(nextZoom: number): number {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(nextZoom.toFixed(2))))
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="placer-layout">

      {/* ── Sidebar ── */}
      <aside className="placer-sidebar">
        <p className="placer-sidebar-title">Unterzeichner</p>
        <p className="placer-sidebar-hint">Ziehe jeden auf das PDF</p>

        <div className="placer-chips">
          {signatories.map((s, i) => {
            const color   = COLORS[i % COLORS.length]
            const placement = placements.find(p => p.signatoryId === s.id)
            const placed  = Boolean(placement)
            const onPage  = placement?.page
            const label   = signatoryLabel(s, i)
            const initial = label.charAt(0).toUpperCase()
            return (
              <div
                key={s.id}
                className={`signer-chip ${placed ? 'chip-placed' : 'chip-unplaced'}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('signatoryId', s.id)}
                style={{ '--chip-color': color } as React.CSSProperties}
              >
                <span className="chip-avatar" style={{ background: color }}>
                  {initial}
                </span>
                <div className="chip-meta">
                  <strong className="chip-name">{label}</strong>
                  <span className="chip-status">
                    {placed ? `✓ Seite ${onPage}` : '→ Ziehe auf PDF'}
                  </span>
                  {placement && (
                    <span className="chip-coords">
                      X {placement.x} · Y {placement.y}
                    </span>
                  )}
                </div>
                {placed && (
                  <button
                    className="chip-remove"
                    title="Platzierung entfernen"
                    onClick={() => removePlacement(s.id)}
                  >×</button>
                )}
              </div>
            )
          })}
        </div>

        {!allPlaced && (
          <p className="placer-warning">
            ⚠ Alle Unterzeichner müssen platziert werden
          </p>
        )}
        {allPlaced && (
          <p className="placer-ok">
            ✓ Alle platziert
          </p>
        )}
      </aside>

      {/* ── PDF Viewer ── */}
      <div className="placer-viewer">

        {/* Page navigation */}
        {pdfDoc && (
          <div className="placer-nav">
            <button
              className="nav-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >‹</button>
            <span className="nav-label">Seite {currentPage} / {pdfDoc.numPages}</span>
            <button
              className="nav-btn"
              disabled={currentPage >= pdfDoc.numPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >›</button>

            <div className="zoom-controls">
              <button
                className="nav-btn zoom-btn"
                disabled={zoom <= MIN_ZOOM}
                onClick={() => setZoom(z => clampZoom(z - ZOOM_STEP))}
                title="Zoom reduzieren"
              >−</button>
              <input
                className="zoom-slider"
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(clampZoom(Number(e.target.value)))}
                aria-label="Zoom"
              />
              <button
                className="nav-btn zoom-btn"
                disabled={zoom >= MAX_ZOOM}
                onClick={() => setZoom(z => clampZoom(z + ZOOM_STEP))}
                title="Zoom erhöhen"
              >+</button>
              <button
                className="zoom-reset"
                onClick={() => setZoom(DEFAULT_ZOOM)}
                disabled={Math.abs(zoom - DEFAULT_ZOOM) < 0.01}
                title="Zoom zurücksetzen"
              >
                100%
              </button>
              <span className="zoom-value">{zoomPercent}%</span>
            </div>
          </div>
        )}

        {/* Canvas + overlay drop zone */}
        <div className="placer-scroll">
          <div
            ref={wrapperRef}
            className={`placer-canvas-wrapper ${isDragOver ? 'drop-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={(e) => {
              // Only clear if leaving the wrapper entirely
              if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
                setIsDragOver(false)
              }
            }}
            onDrop={handleDrop}
          >
            {loading && <div className="placer-loading">PDF wird geladen…</div>}
            {loadError && (
              <div className="placer-load-error" role="alert">
                {loadError}
              </div>
            )}
            <canvas ref={canvasRef} className="placer-canvas" />

            {/* Overlay: placed signature boxes */}
            <div ref={overlayRef} className="placer-overlay">
              {pageInfo && pagePlacements.map(p => {
                const sigIdx   = signatories.findIndex(s => s.id === p.signatoryId)
                const sig      = signatories[sigIdx]
                const paletteIndex = sigIdx >= 0 ? sigIdx : 0
                const color    = COLORS[paletteIndex % COLORS.length]
                const sigLabel = sig ? signatoryLabel(sig, paletteIndex) : `Unterzeichner ${paletteIndex + 1}`
                const isLive   = livePos?.signatoryId === p.signatoryId
                const displayX = isLive ? livePos!.x : p.x
                const displayY = isLive ? livePos!.y : p.y

                const { cx, cy } = pdfToCanvas(displayX, displayY)
                const scale      = pageInfo.viewport.scale
                const boxWpx     = p.width  * scale
                const boxHpx     = p.height * scale

                return (
                  <div
                    key={p.signatoryId}
                    className={`placed-box ${isLive ? 'box-dragging' : ''}`}
                    style={{
                      left:        cx,
                      top:         cy - boxHpx,  // cy = canvas bottom of box; CSS top = top of box
                      width:       boxWpx,
                      height:      boxHpx,
                      borderColor: color,
                      background:  `${color}20`,
                    } as React.CSSProperties}
                    onPointerDown={(e) => handleBoxPointerDown(e, p)}
                    onPointerMove={handleBoxPointerMove}
                    onPointerUp={handleBoxPointerUp}
                  >
                    <span className="box-label" style={{ color }}>
                      {sigLabel}
                    </span>
                    <span className="box-hint">Signatur</span>
                    <button
                      className="box-remove"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => removePlacement(p.signatoryId)}
                    >×</button>
                  </div>
                )
              })}
            </div>

            {/* Drop hint overlay */}
            {isDragOver && (
              <div className="drop-hint">
                <span>Hier ablegen</span>
              </div>
            )}
          </div>
        </div>

        <p className="placer-tip">
          💡 Tipp: Ziehe einen Unterzeichner aus der linken Liste auf die gewünschte Stelle im Dokument. Platzierte Felder können verschoben werden.
        </p>
      </div>
    </div>
  )
}

function signatoryLabel(s: Signatory, index: number): string {
  const full = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim()
  return full || `Unterzeichner ${index + 1}`
}
