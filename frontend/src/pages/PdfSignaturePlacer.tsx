import { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import type { Signatory, SignatoryPlacement } from '../services/api'
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'
import { useI18n } from '../i18n'
import './PdfSignaturePlacer.css'

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfJsWorker()

const COLORS = [
  'var(--sdx-signatory-1)',
  'var(--sdx-signatory-2)',
  'var(--sdx-signatory-3)',
  'var(--sdx-signatory-4)',
  'var(--sdx-signatory-5)',
  'var(--sdx-signatory-6)',
  'var(--sdx-signatory-7)',
  'var(--sdx-signatory-8)',
]
const BOX_W_PT = 150
const BOX_H_PT = 45
const DEFAULT_ZOOM = 1.5
const MIN_ZOOM = 0.6
const MAX_ZOOM = 3
const ZOOM_STEP = 0.2

const PLACER_COPY = {
  de: {
    loadPdfFailed: 'PDF konnte nicht geladen werden.',
    loadPdfPrefix: 'PDF konnte nicht geladen werden:',
    fileReadFailed: 'Datei konnte nicht gelesen werden.',
    renderFailed: 'PDF konnte nicht gerendert werden:',
    unknownRenderError: 'Unbekannter Render-Fehler',
    pageLoadFailed: 'PDF-Seite konnte nicht geladen werden:',
    unknownPageError: 'Unbekannter Seiten-Fehler',
    signerTitle: 'Unterzeichner',
    signerHint: 'Ziehe jeden auf das PDF',
    signerPlaced: '✓ Seite {{page}}',
    signerDragHint: '→ Ziehe auf PDF',
    removePlacementTitle: 'Platzierung entfernen',
    allMustBePlaced: '⚠ Alle Unterzeichner müssen platziert werden',
    allPlaced: '✓ Alle platziert',
    pageLabel: 'Seite {{current}} / {{total}}',
    zoomOut: 'Zoom reduzieren',
    zoomIn: 'Zoom erhöhen',
    zoomReset: 'Zoom zurücksetzen',
    zoomAria: 'Zoom',
    loadingPdf: 'PDF wird geladen…',
    signature: 'Signatur',
    dropHere: 'Hier ablegen',
    tip: '💡 Tipp: Ziehe einen Unterzeichner aus der linken Liste auf die gewünschte Stelle im Dokument. Platzierte Felder können verschoben werden.',
    fallbackSigner: 'Unterzeichner {{index}}',
  },
  en: {
    loadPdfFailed: 'Failed to load PDF.',
    loadPdfPrefix: 'Failed to load PDF:',
    fileReadFailed: 'File could not be read.',
    renderFailed: 'Failed to render PDF:',
    unknownRenderError: 'Unknown render error',
    pageLoadFailed: 'Failed to load PDF page:',
    unknownPageError: 'Unknown page error',
    signerTitle: 'Signers',
    signerHint: 'Drag each one onto the PDF',
    signerPlaced: '✓ Page {{page}}',
    signerDragHint: '→ Drag onto PDF',
    removePlacementTitle: 'Remove placement',
    allMustBePlaced: '⚠ All signers must be placed',
    allPlaced: '✓ All placed',
    pageLabel: 'Page {{current}} / {{total}}',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    zoomReset: 'Reset zoom',
    zoomAria: 'Zoom',
    loadingPdf: 'Loading PDF…',
    signature: 'Signature',
    dropHere: 'Drop here',
    tip: '💡 Tip: Drag a signer from the left list to the desired spot in the document. Placed fields can be moved.',
    fallbackSigner: 'Signer {{index}}',
  },
  fr: {
    loadPdfFailed: 'Impossible de charger le PDF.',
    loadPdfPrefix: 'Impossible de charger le PDF :',
    fileReadFailed: 'Le fichier ne peut pas etre lu.',
    renderFailed: 'Impossible de rendre le PDF :',
    unknownRenderError: 'Erreur de rendu inconnue',
    pageLoadFailed: 'Impossible de charger la page PDF :',
    unknownPageError: 'Erreur de page inconnue',
    signerTitle: 'Signataires',
    signerHint: 'Glissez chacun sur le PDF',
    signerPlaced: '✓ Page {{page}}',
    signerDragHint: '→ Glisser sur le PDF',
    removePlacementTitle: 'Supprimer le placement',
    allMustBePlaced: '⚠ Tous les signataires doivent etre places',
    allPlaced: '✓ Tous places',
    pageLabel: 'Page {{current}} / {{total}}',
    zoomOut: 'Reduire le zoom',
    zoomIn: 'Augmenter le zoom',
    zoomReset: 'Reinitialiser le zoom',
    zoomAria: 'Zoom',
    loadingPdf: 'Chargement du PDF…',
    signature: 'Signature',
    dropHere: 'Deposer ici',
    tip: '💡 Astuce : glissez un signataire depuis la liste de gauche vers la position souhaitee dans le document. Les champs places peuvent etre deplaces.',
    fallbackSigner: 'Signataire {{index}}',
  },
} as const

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

interface DragState {
  signatoryId: string
  page: number
  startPointerX: number
  startPointerY: number
  startPdfX: number
  startPdfY: number
}

function alphaBackground(color: string): string {
  return `color-mix(in srgb, ${color} 18%, transparent)`
}

export default function PdfSignaturePlacer({ file, signatories, placements, onChange }: Props) {
  const { locale } = useI18n()
  const copy = PLACER_COPY[locale]

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const renderTask = useRef<ReturnType<PDFPageProxy['render']> | null>(null)
  const dragState = useRef<DragState | null>(null)

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [isDragOver, setIsDragOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [livePos, setLivePos] = useState<{ signatoryId: string; x: number; y: number } | null>(null)
  const [viewerWidth, setViewerWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      setViewerWidth(scrollRef.current?.clientWidth ?? 0)
    }

    updateWidth()
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && scrollRef.current) {
      resizeObserver = new ResizeObserver(() => updateWidth())
      resizeObserver.observe(scrollRef.current)
    }
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('resize', updateWidth)
      resizeObserver?.disconnect()
    }
  }, [])

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
        const msg = err instanceof Error ? err.message : copy.loadPdfFailed
        setLoadError(`${copy.loadPdfPrefix} ${msg}`)
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setLoadError(copy.fileReadFailed)
      setLoading(false)
    }
    reader.readAsArrayBuffer(file)
    return () => {
      reader.abort()
    }
  }, [file, copy])

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    let cancelled = false
    if (renderTask.current) {
      renderTask.current.cancel()
    }

    pdfDoc.getPage(currentPage).then((page) => {
      if (cancelled) return

      const unscaled = page.getViewport({ scale: 1 })
      const fitScale = viewerWidth > 0 ? (viewerWidth - 8) / unscaled.width : zoom
      const shouldFitToWidth = viewerWidth > 0 && viewerWidth < 900
      const renderScale = shouldFitToWidth ? Math.max(0.25, Math.min(zoom, fitScale)) : zoom
      const viewport = page.getViewport({ scale: renderScale })

      const canvas = canvasRef.current!
      canvas.width = viewport.width
      canvas.height = viewport.height

      setPageInfo({ page, viewport, widthPt: unscaled.width, heightPt: unscaled.height })

      const ctx = canvas.getContext('2d')!
      renderTask.current = page.render({ canvasContext: ctx, viewport })
      renderTask.current.promise
        .then(() => setLoading(false))
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : copy.unknownRenderError
          if (!cancelled) {
            setLoadError(`${copy.renderFailed} ${msg}`)
            setLoading(false)
          }
        })
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : copy.unknownPageError
      if (!cancelled) {
        setLoadError(`${copy.pageLoadFailed} ${msg}`)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, currentPage, zoom, copy, viewerWidth])

  function canvasToPdf(cx: number, cy: number): [number, number] {
    if (!pageInfo) return [0, 0]
    const [px, py] = pageInfo.viewport.convertToPdfPoint(cx, cy)
    return [px, py]
  }

  function pdfToCanvas(pdfX: number, pdfY: number): { cx: number; cy: number } {
    if (!pageInfo) return { cx: 0, cy: 0 }
    const [cx, cy] = pageInfo.viewport.convertToViewportPoint(pdfX, pdfY)
    return { cx, cy }
  }

  function clampBox(pdfX: number, pdfY: number): [number, number] {
    if (!pageInfo) return [pdfX, pdfY]
    const x = Math.max(0, Math.min(pdfX, pageInfo.widthPt - BOX_W_PT))
    const y = Math.max(0, Math.min(pdfY, pageInfo.heightPt - BOX_H_PT))
    return [Math.round(x), Math.round(y)]
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)

    const signatoryId = e.dataTransfer.getData('signatoryId')
    if (!signatoryId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const dropCx = e.clientX - rect.left
    const dropCy = e.clientY - rect.top
    const scale = pageInfo?.viewport.scale ?? zoom
    const boxWpx = BOX_W_PT * scale
    const boxHpx = BOX_H_PT * scale

    const [pdfX, pdfY] = canvasToPdf(dropCx - boxWpx / 2, dropCy + boxHpx / 2)
    const [x, y] = clampBox(pdfX, pdfY)

    upsertPlacement({ signatoryId, page: currentPage, x, y, width: BOX_W_PT, height: BOX_H_PT })
  }

  function upsertPlacement(next: SignatoryPlacement) {
    const updated = placements.filter((placement) => placement.signatoryId !== next.signatoryId)
    onChange([...updated, next])
  }

  function removePlacement(signatoryId: string) {
    onChange(placements.filter((placement) => placement.signatoryId !== signatoryId))
  }

  function handleBoxPointerDown(e: React.PointerEvent<HTMLDivElement>, placement: SignatoryPlacement) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState.current = {
      signatoryId: placement.signatoryId,
      page: placement.page,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startPdfX: placement.x,
      startPdfY: placement.y,
    }
    setLivePos({ signatoryId: placement.signatoryId, x: placement.x, y: placement.y })
  }

  const handleBoxPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current
    if (!ds || !pageInfo) return

    const dCx = e.clientX - ds.startPointerX
    const dCy = e.clientY - ds.startPointerY

    const scale = pageInfo.viewport.scale
    const dPdfX = dCx / scale
    const dPdfY = -dCy / scale

    const [x, y] = clampBox(ds.startPdfX + dPdfX, ds.startPdfY + dPdfY)
    setLivePos({ signatoryId: ds.signatoryId, x, y })
  }, [pageInfo])

  function handleBoxPointerUp() {
    const ds = dragState.current
    if (!ds || !livePos) {
      dragState.current = null
      return
    }

    onChange(placements.map((placement) => (
      placement.signatoryId === ds.signatoryId
        ? { ...placement, x: livePos.x, y: livePos.y, page: currentPage }
        : placement
    )))

    dragState.current = null
    setLivePos(null)
  }

  const pagePlacements = placements.filter((placement) => placement.page === currentPage)
  const placedIds = new Set(placements.map((placement) => placement.signatoryId))
  const allPlaced = signatories.length > 0 && signatories.every((signer) => placedIds.has(signer.id))
  const effectiveZoom = pageInfo?.viewport.scale ?? zoom
  const zoomPercent = Math.round(effectiveZoom * 100)

  function clampZoom(nextZoom: number): number {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(nextZoom.toFixed(2))))
  }

  return (
    <div className="placer-layout">
      <aside className="placer-sidebar">
        <p className="placer-sidebar-title">{copy.signerTitle}</p>
        <p className="placer-sidebar-hint">{copy.signerHint}</p>

        <div className="placer-chips">
          {signatories.map((signer, index) => {
            const color = COLORS[index % COLORS.length]
            const placement = placements.find((p) => p.signatoryId === signer.id)
            const placed = Boolean(placement)
            const label = signatoryLabel(signer, index, copy.fallbackSigner)
            const initial = label.charAt(0).toUpperCase()
            return (
              <div
                key={signer.id}
                className={`signer-chip ${placed ? 'chip-placed' : 'chip-unplaced'}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('signatoryId', signer.id)}
                style={{ '--chip-color': color } as React.CSSProperties}
              >
                <span className="chip-avatar" style={{ background: color }}>{initial}</span>
                <div className="chip-meta">
                  <strong className="chip-name">{label}</strong>
                  <span className="chip-status">
                    {placed
                      ? copy.signerPlaced.replace('{{page}}', String(placement?.page ?? 1))
                      : copy.signerDragHint}
                  </span>
                  {placement && <span className="chip-coords">X {placement.x} · Y {placement.y}</span>}
                </div>
                {placed && (
                  <button
                    className="chip-remove"
                    title={copy.removePlacementTitle}
                    onClick={() => removePlacement(signer.id)}
                  >×</button>
                )}
              </div>
            )
          })}
        </div>

        {!allPlaced && <p className="placer-warning">{copy.allMustBePlaced}</p>}
        {allPlaced && <p className="placer-ok">{copy.allPlaced}</p>}
      </aside>

      <div className="placer-viewer">
        {pdfDoc && (
          <div className="placer-nav">
            <button className="nav-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
            <span className="nav-label">
              {copy.pageLabel
                .replace('{{current}}', String(currentPage))
                .replace('{{total}}', String(pdfDoc.numPages))}
            </span>
            <button className="nav-btn" disabled={currentPage >= pdfDoc.numPages} onClick={() => setCurrentPage((p) => p + 1)}>›</button>

            <div className="zoom-controls">
              <button
                className="nav-btn zoom-btn"
                disabled={zoom <= MIN_ZOOM}
                onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
                title={copy.zoomOut}
              >−</button>
              <input
                className="zoom-slider"
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(clampZoom(Number(e.target.value)))}
                aria-label={copy.zoomAria}
              />
              <button
                className="nav-btn zoom-btn"
                disabled={zoom >= MAX_ZOOM}
                onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
                title={copy.zoomIn}
              >+</button>
              <button
                className="zoom-reset"
                onClick={() => setZoom(DEFAULT_ZOOM)}
                disabled={Math.abs(zoom - DEFAULT_ZOOM) < 0.01}
                title={copy.zoomReset}
              >
                100%
              </button>
              <span className="zoom-value">{zoomPercent}%</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="placer-scroll">
          <div
            ref={wrapperRef}
            className={`placer-canvas-wrapper ${isDragOver ? 'drop-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={(e) => {
              if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
                setIsDragOver(false)
              }
            }}
            onDrop={handleDrop}
          >
            {loading && <div className="placer-loading">{copy.loadingPdf}</div>}
            {loadError && <div className="placer-load-error" role="alert">{loadError}</div>}
            <canvas ref={canvasRef} className="placer-canvas" />

            <div className="placer-overlay">
              {pageInfo && pagePlacements.map((placement) => {
                const signerIndex = signatories.findIndex((s) => s.id === placement.signatoryId)
                const signer = signatories[signerIndex]
                const paletteIndex = signerIndex >= 0 ? signerIndex : 0
                const color = COLORS[paletteIndex % COLORS.length]
                const signerLabel = signer
                  ? signatoryLabel(signer, paletteIndex, copy.fallbackSigner)
                  : copy.fallbackSigner.replace('{{index}}', String(paletteIndex + 1))

                const isLive = livePos?.signatoryId === placement.signatoryId
                const displayX = isLive ? livePos!.x : placement.x
                const displayY = isLive ? livePos!.y : placement.y
                const { cx, cy } = pdfToCanvas(displayX, displayY)

                const scale = pageInfo.viewport.scale
                const boxWpx = placement.width * scale
                const boxHpx = placement.height * scale

                return (
                  <div
                    key={placement.signatoryId}
                    className={`placed-box ${isLive ? 'box-dragging' : ''}`}
                    style={{
                      left: cx,
                      top: cy - boxHpx,
                      width: boxWpx,
                      height: boxHpx,
                      borderColor: color,
                      background: alphaBackground(color),
                    } as React.CSSProperties}
                    onPointerDown={(e) => handleBoxPointerDown(e, placement)}
                    onPointerMove={handleBoxPointerMove}
                    onPointerUp={handleBoxPointerUp}
                  >
                    <span className="box-label" style={{ color }}>{signerLabel}</span>
                    <span className="box-hint">{copy.signature}</span>
                    <button
                      className="box-remove"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => removePlacement(placement.signatoryId)}
                    >×</button>
                  </div>
                )
              })}
            </div>

            {isDragOver && (
              <div className="drop-hint">
                <span>{copy.dropHere}</span>
              </div>
            )}
          </div>
        </div>

        <p className="placer-tip">{copy.tip}</p>
      </div>
    </div>
  )
}

function signatoryLabel(signer: Signatory, index: number, fallbackTemplate: string): string {
  const full = `${signer.firstName ?? ''} ${signer.lastName ?? ''}`.trim()
  return full || fallbackTemplate.replace('{{index}}', String(index + 1))
}
