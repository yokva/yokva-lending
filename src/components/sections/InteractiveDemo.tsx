import { Check, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import afterImage from '../../assets/after.png'
import beforeImage from '../../assets/before.png'
import { cn } from '../../lib/cn'
import { type DemoPhase, type DemoPreset, type InteractiveDemoProps } from '../../types/landing'

const ENHANCED_PHASES: DemoPhase[] = ['enhance', 'assemble', 'done']
const ASSEMBLED_PHASES: DemoPhase[] = ['assemble', 'done']

const PRESET_STYLE_CLASSES: Record<DemoPreset['style'], string> = {
  listing: 'bg-white text-[var(--text)]',
  story: 'bg-[color:rgb(190_255_0_/_0.2)] text-[var(--text)]',
  highlight: 'bg-[var(--text)] text-white',
  minimal: 'bg-[#ececd8] text-[var(--text)]',
}

export function InteractiveDemo({ copy }: InteractiveDemoProps) {
  const [phase, setPhase] = useState<DemoPhase>('idle')
  const [presetIndex, setPresetIndex] = useState(0)
  const [splitPosition, setSplitPosition] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [contextDraft, setContextDraft] = useState(copy.contextPlaceholder)
  const timersRef = useRef<number[]>([])
  const contextTimerRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    for (const timerId of timersRef.current) {
      window.clearTimeout(timerId)
    }
    timersRef.current = []
  }, [])

  const clearContextTimer = useCallback(() => {
    if (contextTimerRef.current !== null) {
      window.clearTimeout(contextTimerRef.current)
      contextTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compactQuery = window.matchMedia('(max-width: 767px)')

    const update = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches)
      setIsCompact(compactQuery.matches)
    }

    update()

    const add = (query: MediaQueryList, listener: () => void) => {
      if (query.addEventListener) {
        query.addEventListener('change', listener)
        return () => query.removeEventListener('change', listener)
      }

      query.addListener(listener)
      return () => query.removeListener(listener)
    }

    const removeReduced = add(reducedMotionQuery, update)
    const removeCompact = add(compactQuery, update)

    return () => {
      removeReduced()
      removeCompact()
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
      clearContextTimer()
    }
  }, [clearContextTimer, clearTimers])

  const activePreset = copy.presets[presetIndex % copy.presets.length]

  useEffect(() => {
    clearContextTimer()

    if (phase === 'idle') {
      return
    }

    if (prefersReducedMotion || phase !== 'scan') {
      contextTimerRef.current = window.setTimeout(() => {
        setContextDraft(activePreset.context)
      }, 0)
      return
    }

    contextTimerRef.current = window.setTimeout(() => {
      setContextDraft('')
    }, 0)

    let index = 0
    const typeNext = () => {
      index += 1
      setContextDraft(activePreset.context.slice(0, index))

      if (index < activePreset.context.length) {
        contextTimerRef.current = window.setTimeout(typeNext, 22)
      }
    }

    contextTimerRef.current = window.setTimeout(typeNext, 100)
  }, [activePreset.context, clearContextTimer, phase, prefersReducedMotion])

  const runPipeline = useCallback(() => {
    clearTimers()
    setSplitPosition(8)

    if (prefersReducedMotion) {
      setPhase('done')
      setSplitPosition(100)
      return
    }

    setPhase('scan')
    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('enhance')
        setSplitPosition(47)
      }, 950),
    )

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('assemble')
        setSplitPosition(82)
      }, 2150),
    )

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('done')
        setSplitPosition(100)
      }, 3380),
    )
  }, [clearTimers, prefersReducedMotion])

  const handleAction = () => {
    if (phase !== 'idle' && phase !== 'done') {
      return
    }

    if (phase === 'done') {
      setPhase('idle')
      setSplitPosition(0)
    }

    runPipeline()
  }

  const handlePresetSelect = (index: number) => {
    if (index === presetIndex && phase !== 'idle') {
      return
    }

    clearTimers()
    setPresetIndex(index)
    setPhase('idle')
    setSplitPosition(0)

    if (!prefersReducedMotion) {
      const timerId = window.setTimeout(() => runPipeline(), 160)
      timersRef.current.push(timerId)
    }
  }

  const handleCompareChange = (value: number) => {
    clearTimers()
    setPhase('done')
    setSplitPosition(value)
  }

  const isRunning = phase !== 'idle' && phase !== 'done'
  const isEnhanced = ENHANCED_PHASES.includes(phase)
  const isAssembled = ASSEMBLED_PHASES.includes(phase)

  const outputPack = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, offset) => copy.presets[(presetIndex + offset) % copy.presets.length]),
    [copy.presets, presetIndex],
  )
  const visibleOutputPack = isCompact ? outputPack.slice(0, 2) : outputPack

  const statusText = useMemo(() => {
    switch (phase) {
      case 'scan':
        return copy.statusScan
      case 'enhance':
        return copy.statusEnhance
      case 'assemble':
        return copy.statusAssemble
      case 'done':
        return copy.statusDone
      default:
        return copy.statusScan
    }
  }, [copy.statusAssemble, copy.statusDone, copy.statusEnhance, copy.statusScan, phase])

  const progress = {
    analysis: phase !== 'idle',
    enhancement: ['enhance', 'assemble', 'done'].includes(phase),
    assembly: ['assemble', 'done'].includes(phase),
  }

  const buttonLabel = isRunning ? copy.buttonBusy : phase === 'done' ? copy.buttonReplay : copy.buttonStart
  const contextDisplay = phase === 'idle' ? copy.contextPlaceholder : contextDraft || copy.contextPlaceholder

  const overlayByStyle = () => {
    if (!isAssembled) {
      return null
    }

    if (isCompact) {
      const compactCardClass =
        activePreset.style === 'highlight'
          ? 'bg-[color:rgb(17_17_17_/_0.9)] text-white border-white/70'
          : activePreset.style === 'story'
            ? 'bg-[color:rgb(190_255_0_/_0.85)] text-[var(--text)] border-[var(--text)]'
            : 'bg-[color:rgb(255_255_255_/_0.92)] text-[var(--text)] border-[var(--text)]'

      return (
        <>
          <div className="hud-enter absolute top-3 left-3 rounded-full border border-[var(--text)] bg-[var(--text)] px-2.5 py-1 text-[10px] font-semibold text-white">
            {activePreset.platform}
          </div>

          <div
            className="hud-enter absolute top-3 right-3 rounded-full border border-[var(--text)] bg-white px-2.5 py-1 text-[10px] font-bold text-[var(--text)]"
            style={{ animationDelay: '80ms' }}
          >
            {activePreset.price}
          </div>

          <div
            className={cn(
              'hud-enter absolute right-3 bottom-3 left-3 rounded-lg border p-2.5',
              compactCardClass,
            )}
            style={{ animationDelay: '160ms' }}
          >
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase">{activePreset.format}</p>
            <p className="mt-1 text-xs font-bold leading-tight">{activePreset.headline}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {activePreset.chips.slice(0, 2).map((chip) => (
                <span
                  key={`${activePreset.name}-${chip}`}
                  className="rounded-full border border-current px-1.5 py-0.5 text-[9px] font-medium"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full border border-current px-2 py-0.5 text-[9px] font-semibold">
                <Check size={9} />
                {copy.badgeVerified}
              </span>
              <span className="rounded-full border border-current bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold text-[var(--text)]">
                {activePreset.cta}
              </span>
            </div>
          </div>
        </>
      )
    }

    if (activePreset.style === 'story') {
      return (
        <>
          <div className="hud-enter absolute top-4 left-4 rounded-full border border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold text-[var(--text)]">
            STORY FORMAT
          </div>

          <div className="hud-enter absolute top-14 right-4 bottom-14 w-[36%] rounded-2xl border-2 border-[var(--text)] bg-[color:rgb(255_255_255_/_0.9)] p-3" style={{ animationDelay: '90ms' }}>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">{activePreset.platform}</p>
            <p className="mt-2 font-headline text-[1.2rem] leading-[1.02] font-bold tracking-[-0.02em]">{activePreset.headline}</p>
            <div className="mt-3 space-y-1">
              {activePreset.chips.map((chip) => (
                <span key={`${activePreset.name}-${chip}`} className="block rounded-full border border-[var(--text)] bg-white px-2 py-1 text-[10px] font-semibold">
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-full border border-[var(--text)] bg-[var(--accent)] px-2 py-1 text-[11px] font-bold">
              <span>{activePreset.price}</span>
              <span>{activePreset.cta}</span>
            </div>
          </div>

          <div className="hud-enter absolute right-4 bottom-4 rounded-full border border-[var(--text)] bg-[var(--text)] px-3 py-1 text-[11px] font-semibold text-white" style={{ animationDelay: '190ms' }}>
            Swipe-ready creative
          </div>
        </>
      )
    }

    if (activePreset.style === 'highlight') {
      return (
        <>
          <div className="hud-enter absolute top-4 left-4 rounded-full border border-[var(--text)] bg-[var(--text)] px-3 py-1 text-[11px] font-semibold text-white">
            {copy.platformLabel} {activePreset.platform}
          </div>
          <div className="hud-enter absolute top-4 right-4 rounded-full border border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-[11px] font-bold text-[var(--text)]" style={{ animationDelay: '70ms' }}>
            MARKETPLACE
          </div>

          <div className="hud-enter absolute top-[4.2rem] left-4 rounded-full border-2 border-[var(--text)] bg-white px-3 py-1 text-base font-bold text-[var(--text)]" style={{ animationDelay: '130ms' }}>
            {activePreset.price}
          </div>

          <div className="hud-enter absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-[var(--text)] bg-[var(--accent)] px-2 py-3 text-[10px] font-bold tracking-[0.08em] text-[var(--text)] uppercase [writing-mode:vertical-rl]" style={{ animationDelay: '180ms' }}>
            fast lead capture
          </div>

          <div className="hud-enter absolute right-4 bottom-4 left-4 rounded-xl border-2 border-[var(--text)] bg-[color:rgb(17_17_17_/_0.9)] p-3 text-white" style={{ animationDelay: '240ms' }}>
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase">{activePreset.headline}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {activePreset.chips.map((chip) => (
                <span key={`${activePreset.name}-${chip}`} className="rounded-full border border-white/70 bg-white/10 px-2 py-0.5 text-[10px]">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </>
      )
    }

    if (activePreset.style === 'minimal') {
      return (
        <>
          <div className="hud-enter absolute top-4 left-4 rounded-full border border-[var(--text)] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--text)]">
            {copy.platformLabel} {activePreset.platform}
          </div>

          <div className="hud-enter absolute inset-x-[14%] top-[15%] rounded-2xl border-2 border-[var(--text)] bg-[color:rgb(255_255_255_/_0.92)] p-4" style={{ animationDelay: '110ms' }}>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">{activePreset.format}</p>
            <p className="mt-2 font-headline text-[1.35rem] leading-[1.04] font-bold tracking-[-0.02em] text-[var(--text)]">{activePreset.headline}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {activePreset.chips.map((chip) => (
                <span key={`${activePreset.name}-${chip}`} className="rounded-full border border-[var(--text)] px-2 py-0.5 text-[10px] font-medium text-[var(--text)]">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="hud-enter absolute right-4 top-16 rounded-full border border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-[11px] font-bold text-[var(--text)]" style={{ animationDelay: '180ms' }}>
            {activePreset.cta}
          </div>

          <div className="hud-enter absolute left-4 bottom-4 rounded-full border border-[var(--text)] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--text)]" style={{ animationDelay: '220ms' }}>
            <Check size={12} className="mr-1 inline-block" /> {copy.badgeVerified}
          </div>

          <div className="hud-enter absolute right-4 bottom-4 rounded-full border border-[var(--text)] bg-[var(--text)] px-3 py-1 text-[11px] font-bold text-white" style={{ animationDelay: '260ms' }}>
            {activePreset.price}
          </div>
        </>
      )
    }

    return (
      <>
        <div className="hud-enter absolute top-4 left-4 rounded-full border border-[var(--text)] bg-[var(--text)] px-3 py-1 text-[11px] font-semibold text-white">
          {copy.platformLabel} {activePreset.platform}
        </div>
        <div className="hud-enter absolute top-4 right-4 rounded-full border border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-[11px] font-bold text-[var(--text)]" style={{ animationDelay: '90ms' }}>
          {copy.badgeFeatured}
        </div>

        <div className="hud-enter absolute top-12 left-1/2 -translate-x-1/2 rounded-full border border-[var(--text)] bg-white px-3 py-1 text-[10px] font-semibold tracking-[0.08em] text-[var(--text)] uppercase" style={{ animationDelay: '130ms' }}>
          {activePreset.format}
        </div>

        <div className="hud-enter absolute top-14 right-4 rounded-full border border-[var(--text)] bg-white px-3 py-1 text-sm font-bold text-[var(--text)]" style={{ animationDelay: '170ms' }}>
          {activePreset.price}
        </div>

        <div className="hud-enter absolute left-4 bottom-[5.6rem] max-w-[62%] rounded-lg border border-[var(--text)] bg-[color:rgb(255_255_255_/_0.93)] px-3 py-2" style={{ animationDelay: '220ms' }}>
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase">{activePreset.headline}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {activePreset.chips.map((chip) => (
              <span key={`${activePreset.name}-${chip}`} className="rounded-full border border-[var(--text)] bg-white px-2 py-0.5 text-[10px] font-medium">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <button type="button" className="hud-enter absolute right-4 bottom-[5.6rem] rounded-full border border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold text-[var(--text)]" style={{ animationDelay: '260ms' }}>
          {activePreset.cta}
        </button>

        <div className="hud-enter absolute bottom-4 left-4 flex items-center gap-1 rounded-full border border-[var(--text)] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--text)]" style={{ animationDelay: '320ms' }}>
          <Check size={12} />
          {copy.badgeVerified}
        </div>

        <div className="hud-enter absolute inset-x-4 bottom-4 ml-[8.8rem] rounded-full border border-[var(--text)] bg-[color:rgb(247_247_245_/_0.94)] px-3 py-1 text-center text-[11px] font-semibold text-[var(--text)]" style={{ animationDelay: '360ms' }}>
          {copy.frameLabel} • {copy.creativeText}
        </div>
      </>
    )
  }

  return (
    <section className="overflow-x-hidden px-4 pb-22 sm:px-6" id="demo">
      <div className="mx-auto w-full max-w-[1280px] min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">{copy.subtitle}</p>
        <h2 className="mt-2 max-w-4xl font-headline text-[clamp(1.9rem,4.2vw,3rem)] leading-[0.95] font-bold tracking-[-0.025em] text-[var(--text)]">
          {copy.title}
        </h2>

        <div className="mt-8 overflow-hidden rounded-lg border-[3px] border-[var(--text)] bg-white">
          <div className="flex items-center gap-2 border-b-2 border-[var(--text)] bg-[var(--bg)] px-4 py-3">
            <span className="size-3 rounded-full border border-[var(--text)] bg-[var(--text)]" />
            <span className="size-3 rounded-full border border-[var(--text)] bg-white" />
            <span className="size-3 rounded-full border border-[var(--text)] bg-[var(--accent)]" />
            <span className="ml-2 text-[11px] font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">{copy.windowTitle}</span>
          </div>

          <div className="grid min-w-0 gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-5 lg:p-6">
            <div className="min-w-0 rounded-lg border-2 border-[var(--text)] bg-[var(--bg)] p-2.5 sm:p-3">
              <div
                className={cn(
                  'relative overflow-hidden rounded-[0.45rem] border-2 border-[var(--text)] bg-[#141412]',
                  isCompact ? 'aspect-[3/4]' : 'aspect-[16/10]',
                )}
              >
                <img
                  src={beforeImage}
                  alt="Original dark apartment photo"
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-[filter] duration-700',
                    isEnhanced ? 'brightness-[0.72] saturate-70' : 'brightness-[0.5] saturate-40 blur-[0.9px]',
                  )}
                />

                <img
                  src={afterImage}
                  alt="Enhanced apartment creative"
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-[filter,clip-path] duration-[900ms] ease-out',
                    isEnhanced ? 'brightness-100 saturate-100 contrast-100' : 'brightness-[0.8] saturate-75',
                  )}
                  style={{
                    clipPath: `inset(0 ${100 - splitPosition}% 0 0)`,
                  }}
                />

                {phase === 'scan' && <div className="scan-beam" />}

                {(phase === 'scan' || phase === 'enhance') && (
                  <>
                    <div className="scan-target scan-target-a" />
                    <div className="scan-target scan-target-b" />
                    <div className="scan-target scan-target-c" />
                  </>
                )}

                {overlayByStyle()}

                {splitPosition > 0 && splitPosition < 100 && (
                  <>
                    <div className="pointer-events-none absolute top-0 bottom-0 z-20 w-[2px] bg-[var(--accent)]" style={{ left: `calc(${splitPosition}% - 1px)` }} />
                    <div className="pointer-events-none absolute top-1/2 z-20 size-5 -translate-y-1/2 rounded-full border-2 border-[var(--text)] bg-[var(--accent)]" style={{ left: `calc(${splitPosition}% - 10px)` }} />
                  </>
                )}
              </div>

              <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-[0.45rem] border border-[var(--text)] text-[11px] font-semibold">
                <span className={cn('border-r border-[var(--text)] px-3 py-2', splitPosition <= 5 ? 'bg-[var(--text)] text-white' : 'bg-white text-[var(--muted)]')}>
                  {copy.beforeLabel}
                </span>
                <span className={cn('px-3 py-2', splitPosition >= 95 ? 'bg-[var(--text)] text-white' : 'bg-white text-[var(--muted)]')}>
                  {copy.afterLabel}
                </span>
              </div>

              <label className="mt-4 block text-xs font-medium tracking-[0.06em] text-[var(--muted)] uppercase" htmlFor="compare-slider">
                {copy.sliderLabel}
              </label>
              <input
                id="compare-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(splitPosition)}
                onChange={(event) => handleCompareChange(Number(event.target.value))}
                className="range-slider mt-2 w-full"
                aria-label={copy.sliderLabel}
              />

              {isCompact ? (
                <div className="mt-4 rounded-md border border-[var(--text)] bg-white p-3">
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={handleAction}
                    className={cn(
                      'focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--text)] px-4 py-3 text-sm font-semibold transition-colors',
                      isRunning
                        ? 'cursor-not-allowed bg-[var(--bg)] text-[var(--muted)]'
                        : 'bg-[var(--accent)] text-[var(--text)] hover:bg-[var(--accent-strong)]',
                    )}
                  >
                    <Sparkles size={16} />
                    {buttonLabel}
                  </button>

                  <p aria-live="polite" className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                    {phase === 'idle' ? copy.statusScan : statusText}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--text)] pt-4 text-[10px]">
                    <div className="rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2 text-center">
                      <p className="font-semibold uppercase">{copy.steps.analysis}</p>
                      <p className={cn('mt-1 font-bold', progress.analysis ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                        {progress.analysis ? '100%' : '0%'}
                      </p>
                    </div>
                    <div className="rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2 text-center">
                      <p className="font-semibold uppercase">{copy.steps.enhancement}</p>
                      <p className={cn('mt-1 font-bold', progress.enhancement ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                        {progress.enhancement ? '100%' : '0%'}
                      </p>
                    </div>
                    <div className="rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2 text-center">
                      <p className="font-semibold uppercase">{copy.steps.layoutAssembly}</p>
                      <p className={cn('mt-1 font-bold', progress.assembly ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                        {progress.assembly ? '100%' : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {isCompact ? (
                <div className="mt-4 rounded-md border border-[var(--text)] bg-white p-3">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">{copy.contextLabel}</p>
                  <div className="mt-2 min-h-16 rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2 font-mono text-[10px] leading-relaxed text-[var(--text)]">
                    {contextDisplay}
                    {phase === 'scan' ? <span className="ml-0.5 inline-block h-[1em] w-[1px] animate-pulse bg-[var(--text)] align-middle" /> : null}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-md border border-[var(--text)] bg-white p-3">
                <p className="text-[11px] font-semibold tracking-[0.13em] text-[var(--muted)] uppercase">{copy.presetLabel}</p>
                <div className="mt-2 flex w-full max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                  {copy.presets.map((preset, index) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handlePresetSelect(index)}
                      className={cn(
                        'focus-ring shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                        presetIndex === index
                          ? 'border-[var(--text)] bg-[var(--accent)] text-[var(--text)]'
                          : 'border-[var(--text)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)]',
                      )}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">{copy.outputPackTitle}</p>
                  {isCompact ? (
                    <article
                      className={cn(
                        'mt-3 rounded-md border border-[var(--text)] p-2',
                        PRESET_STYLE_CLASSES[activePreset.style],
                      )}
                    >
                      <p className="text-[10px] font-semibold tracking-[0.08em] uppercase">{activePreset.platform}</p>
                      <p className="mt-1 text-sm font-bold leading-tight">{activePreset.format}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold">
                        <span>{activePreset.price}</span>
                        <span className="rounded-full border border-current px-1.5 py-0.5">{activePreset.name}</span>
                      </div>
                    </article>
                  ) : (
                    <>
                      <p className="mt-1 hidden text-xs text-[var(--muted)] sm:block">{copy.outputPackSubtitle}</p>

                      <div className="mt-3 flex w-full max-w-full gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                        {visibleOutputPack.map((preset, index) => (
                          <article
                            key={`${preset.platform}-${preset.name}`}
                            className={cn(
                              'h-[104px] min-w-[156px] rounded-md border border-[var(--text)] p-2 transition-all duration-500 sm:h-[112px] sm:min-w-0',
                              PRESET_STYLE_CLASSES[preset.style],
                              isAssembled ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-40',
                            )}
                            style={{ transitionDelay: `${index * 120}ms` }}
                          >
                            <div className="flex h-full flex-col justify-between">
                              <div>
                                <p className="text-[10px] font-semibold tracking-[0.08em] uppercase">{preset.platform}</p>
                                <p className="mt-1 text-sm font-bold leading-tight">{preset.format}</p>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[10px] font-semibold">
                                <span>{preset.price}</span>
                                <span className="rounded-full border border-current px-1.5 py-0.5">{preset.name}</span>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden min-w-0 flex-col rounded-lg border-2 border-[var(--text)] bg-[var(--bg)] p-3 sm:p-4 md:flex">
              <button
                type="button"
                disabled={isRunning}
                onClick={handleAction}
                className={cn(
                  'focus-ring inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--text)] px-4 py-3 text-sm font-semibold transition-colors sm:px-5',
                  isRunning
                    ? 'cursor-not-allowed bg-white text-[var(--muted)]'
                    : 'bg-[var(--accent)] text-[var(--text)] hover:bg-[var(--accent-strong)]',
                )}
              >
                <Sparkles size={16} />
                {buttonLabel}
              </button>

              <p aria-live="polite" className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                {phase === 'idle' ? copy.statusScan : statusText}
              </p>

              <div className="mt-4 rounded-md border border-[var(--text)] bg-white p-3 sm:mt-5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">{copy.contextLabel}</p>
                <div className="mt-2 min-h-20 rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2 font-mono text-[11px] leading-relaxed text-[var(--text)]">
                  {contextDisplay}
                  {phase === 'scan' ? <span className="ml-0.5 inline-block h-[1em] w-[1px] animate-pulse bg-[var(--text)] align-middle" /> : null}
                </div>
              </div>

              <div className="mt-4 space-y-4 border-t border-[var(--text)] pt-4 sm:mt-5 sm:pt-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span>{copy.steps.analysis}</span>
                    <span className={cn(progress.analysis ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                      {progress.analysis ? '100%' : '0%'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full border border-[var(--text)] bg-white">
                    <div className={cn('h-full rounded-full bg-[var(--accent)] transition-all duration-500', progress.analysis ? 'w-full' : 'w-0')} />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span>{copy.steps.enhancement}</span>
                    <span className={cn(progress.enhancement ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                      {progress.enhancement ? '100%' : '0%'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full border border-[var(--text)] bg-white">
                    <div className={cn('h-full rounded-full bg-[var(--accent)] transition-all duration-500', progress.enhancement ? 'w-full' : 'w-0')} />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span>{copy.steps.layoutAssembly}</span>
                    <span className={cn(progress.assembly ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                      {progress.assembly ? '100%' : '0%'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full border border-[var(--text)] bg-white">
                    <div className={cn('h-full rounded-full bg-[var(--accent)] transition-all duration-500', progress.assembly ? 'w-full' : 'w-0')} />
                  </div>
                </div>
              </div>

              <div className="mt-5 hidden rounded-md border border-[var(--text)] bg-white p-3 sm:block">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">Active preset</p>
                <p className="mt-2 font-headline text-[1.2rem] leading-tight font-bold tracking-[-0.02em] text-[var(--text)]">
                  {activePreset.name}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{activePreset.format}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
