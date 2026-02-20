import { Check, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import afterImage from '../../assets/after.png'
import beforeImage from '../../assets/before.png'
import { cn } from '../../lib/cn'
import { type DemoPhase, type DemoPreset, type InteractiveDemoProps } from '../../types/landing'

const ENHANCED_PHASES: DemoPhase[] = ['enhance', 'assemble', 'done']

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
  const showCreativeOverlay = phase === 'assemble' || phase === 'done'

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

  const progressState = useMemo(() => {
    switch (phase) {
      case 'scan':
        return {
          analysis: { value: 46, label: '46%', pulse: true },
          enhancement: { value: 0, label: 'Waiting', pulse: false },
          assembly: { value: 0, label: 'Waiting', pulse: false },
        }
      case 'enhance':
        return {
          analysis: { value: 100, label: 'Done', pulse: false },
          enhancement: { value: 64, label: '64%', pulse: true },
          assembly: { value: 0, label: 'Waiting', pulse: false },
        }
      case 'assemble':
        return {
          analysis: { value: 100, label: 'Done', pulse: false },
          enhancement: { value: 100, label: 'Done', pulse: false },
          assembly: { value: 72, label: '72%', pulse: true },
        }
      case 'done':
        return {
          analysis: { value: 100, label: 'Done', pulse: false },
          enhancement: { value: 100, label: 'Done', pulse: false },
          assembly: { value: 100, label: 'Done', pulse: false },
        }
      default:
        return {
          analysis: { value: 0, label: 'Idle', pulse: false },
          enhancement: { value: 0, label: 'Idle', pulse: false },
          assembly: { value: 0, label: 'Idle', pulse: false },
        }
    }
  }, [phase])

  const contextStatus = useMemo(() => {
    switch (phase) {
      case 'scan':
        return 'Parsing context...'
      case 'enhance':
        return 'Mapping visual intent...'
      case 'assemble':
        return 'Applying layout...'
      case 'done':
        return 'Context locked'
      default:
        return 'Awaiting input'
    }
  }, [phase])

  const buttonLabel = isRunning ? copy.buttonBusy : phase === 'done' ? copy.buttonReplay : copy.buttonStart
  const contextDisplay = phase === 'idle' ? copy.contextPlaceholder : contextDraft || copy.contextPlaceholder

  const overlayByStyle = () => {
    if (!showCreativeOverlay) {
      return null
    }

    const topLeftTag = (
      <div className="hud-enter absolute top-4 left-4 rounded-sm border-2 border-black bg-[#BEFF00] px-3 py-1 text-[10px] font-extrabold tracking-[0.12em] text-black uppercase">
        {activePreset.style === 'story' ? 'STORY BOOST' : activePreset.style === 'highlight' ? 'TOP PICK' : 'JUST LISTED'}
      </div>
    )

    if (isCompact) {
      return (
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
          {topLeftTag}
          <div className="hud-enter absolute top-4 right-4 rounded-full border-2 border-[var(--text)] bg-white px-3 py-1 text-xs font-bold text-[var(--text)]" style={{ animationDelay: '90ms' }}>
            {activePreset.price}
          </div>
          <div className="hud-enter absolute right-3 bottom-3 left-3 rounded-md border-2 border-[var(--text)] bg-[color:rgb(255_255_255_/_0.95)] p-2.5 text-[var(--text)]" style={{ animationDelay: '170ms' }}>
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase">{activePreset.platform}</p>
            <p className="mt-1 font-headline text-sm leading-tight font-bold tracking-[-0.02em]">{activePreset.headline}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--text)] px-2 py-0.5 text-[9px] font-semibold">
                <Check size={10} />
                {copy.badgeVerified}
              </span>
              <span className="rounded-full border border-[var(--text)] bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold">{activePreset.cta}</span>
            </div>
          </div>
        </div>
      )
    }

    if (activePreset.style === 'listing') {
      return (
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 to-transparent" />
          {topLeftTag}
          <div className="hud-enter absolute top-4 right-4 rounded-full border-2 border-[var(--text)] bg-white px-3 py-1 text-sm font-bold text-[var(--text)]" style={{ animationDelay: '80ms' }}>
            {activePreset.price}
          </div>

          <div className="hud-enter absolute right-4 bottom-4 left-4 rounded-lg border-2 border-[var(--text)] bg-[color:rgb(255_255_255_/_0.95)] p-3.5" style={{ animationDelay: '160ms' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">{activePreset.platform}</p>
                <p className="font-headline mt-1 text-[1.28rem] leading-[1.02] font-bold tracking-[-0.02em] text-[var(--text)]">{activePreset.headline}</p>
              </div>
              <span className="rounded-full border border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-[11px] font-bold text-[var(--text)]">{activePreset.cta}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {activePreset.chips.slice(0, 3).map((chip) => (
                <span key={`${activePreset.name}-${chip}`} className="rounded-full border border-[var(--text)] bg-white px-2.5 py-0.5 text-[10px] font-medium text-[var(--text)]">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (activePreset.style === 'story') {
      return (
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          {topLeftTag}
          <div className="hud-enter absolute top-4 right-4 rounded-full border border-white/80 bg-black/70 px-3 py-1 text-sm font-bold text-white" style={{ animationDelay: '80ms' }}>
            {activePreset.price}
          </div>

          <div className="hud-enter absolute top-14 right-4 bottom-4 w-[38%] rounded-xl border-2 border-white/90 bg-[color:rgb(17_17_17_/_0.78)] p-3 text-white" style={{ animationDelay: '160ms' }}>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-white/75 uppercase">{activePreset.platform}</p>
            <p className="font-headline mt-2 text-[1.12rem] leading-[1.02] font-bold tracking-[-0.02em]">{activePreset.headline}</p>
            <div className="mt-3 space-y-1">
              {activePreset.chips.slice(0, 3).map((chip) => (
                <span key={`${activePreset.name}-${chip}`} className="block rounded-full border border-white/75 bg-white/10 px-2 py-0.5 text-[10px]">
                  {chip}
                </span>
              ))}
            </div>
            <span className="mt-3 inline-flex rounded-full border border-white bg-white px-2.5 py-1 text-[10px] font-bold text-[var(--text)]">{activePreset.cta}</span>
          </div>

          <div className="hud-enter absolute right-[42%] bottom-4 left-4 rounded-md border border-[var(--text)] bg-[color:rgb(255_255_255_/_0.9)] px-3 py-2 text-[11px] font-semibold text-[var(--text)]" style={{ animationDelay: '220ms' }}>
            Vertical story template with urgency strip
          </div>
        </div>
      )
    }

    if (activePreset.style === 'highlight') {
      return (
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-transparent to-black/10" />
          {topLeftTag}
          <div className="hud-enter absolute top-4 right-4 rounded-full border-2 border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-sm font-bold text-[var(--text)]" style={{ animationDelay: '80ms' }}>
            {activePreset.price}
          </div>

          <div className="hud-enter absolute top-16 bottom-4 left-4 w-[30%] rounded-lg border-2 border-white/80 bg-[color:rgb(17_17_17_/_0.86)] p-3 text-white" style={{ animationDelay: '150ms' }}>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-white/75 uppercase">{activePreset.platform}</p>
            <p className="font-headline mt-2 text-[1.22rem] leading-[1.03] font-bold tracking-[-0.02em]">{activePreset.headline}</p>
            <div className="mt-3 space-y-1">
              {activePreset.chips.slice(0, 3).map((chip) => (
                <span key={`${activePreset.name}-${chip}`} className="block rounded-full border border-white/70 bg-white/10 px-2 py-0.5 text-[10px]">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="hud-enter absolute right-4 bottom-4 left-[35%] rounded-lg border-2 border-[var(--text)] bg-[color:rgb(255_255_255_/_0.95)] p-3" style={{ animationDelay: '220ms' }}>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">Marketplace push</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--text)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text)]">
                <Check size={10} />
                {copy.badgeVerified}
              </span>
              <span className="rounded-full border border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-[11px] font-bold text-[var(--text)]">{activePreset.cta}</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {topLeftTag}
        <div className="hud-enter absolute top-4 right-4 rounded-full border-2 border-[var(--text)] bg-white px-3 py-1 text-sm font-bold text-[var(--text)]" style={{ animationDelay: '80ms' }}>
          {activePreset.price}
        </div>

        <div className="hud-enter absolute inset-x-[14%] top-[18%] rounded-2xl border-2 border-[var(--text)] bg-[color:rgb(255_255_255_/_0.94)] p-4" style={{ animationDelay: '150ms' }}>
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">{activePreset.format}</p>
          <p className="font-headline mt-2 text-[1.36rem] leading-[1.03] font-bold tracking-[-0.02em] text-[var(--text)]">{activePreset.headline}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activePreset.chips.slice(0, 3).map((chip) => (
              <span key={`${activePreset.name}-${chip}`} className="rounded-full border border-[var(--text)] bg-white px-2.5 py-0.5 text-[10px] font-medium text-[var(--text)]">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="hud-enter absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-full border border-[var(--text)] bg-[color:rgb(247_247_245_/_0.96)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text)]" style={{ animationDelay: '220ms' }}>
          <span className="inline-flex items-center gap-1">
            <Check size={11} />
            {copy.badgeVerified}
          </span>
          <span className="rounded-full border border-[var(--text)] bg-[var(--text)] px-3 py-1 text-[10px] font-bold text-white">{activePreset.cta}</span>
        </div>
      </div>
    )
  }

  return (
    <section className="overflow-x-clip px-4 pb-22 sm:px-6" id="demo">
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
                      <p className={cn('mt-1 font-bold', progressState.analysis.value > 0 ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                        {progressState.analysis.value}%
                      </p>
                    </div>
                    <div className="rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2 text-center">
                      <p className="font-semibold uppercase">{copy.steps.enhancement}</p>
                      <p className={cn('mt-1 font-bold', progressState.enhancement.value > 0 ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                        {progressState.enhancement.value}%
                      </p>
                    </div>
                    <div className="rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2 text-center">
                      <p className="font-semibold uppercase">{copy.steps.layoutAssembly}</p>
                      <p className={cn('mt-1 font-bold', progressState.assembly.value > 0 ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                        {progressState.assembly.value}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {isCompact ? (
                <div className="mt-4 rounded-md border border-[var(--text)] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">{copy.contextLabel}</p>
                    <span className="rounded-full border border-[var(--text)] bg-[var(--bg)] px-2 py-0.5 text-[9px] font-semibold tracking-[0.08em] uppercase text-[var(--muted)]">
                      {contextStatus}
                    </span>
                  </div>
                  <div className="mt-2 min-h-16 rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2">
                    <p className={cn('font-mono text-[10px] leading-relaxed', phase === 'idle' ? 'text-[var(--muted)]' : 'text-[var(--text)]')}>
                      <span className="text-[var(--muted)]">&gt; </span>
                      {contextDisplay}
                      {phase === 'scan' || phase === 'enhance' ? (
                        <span className="ml-0.5 inline-block h-[1em] w-[1px] animate-pulse bg-[var(--text)] align-middle" />
                      ) : null}
                    </p>
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
                              'translate-y-0 opacity-100',
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
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">{copy.contextLabel}</p>
                  <span className="rounded-full border border-[var(--text)] bg-[var(--bg)] px-2 py-0.5 text-[9px] font-semibold tracking-[0.08em] uppercase text-[var(--muted)]">
                    {contextStatus}
                  </span>
                </div>
                <div className="mt-2 min-h-20 rounded-md border border-[var(--text)] bg-[var(--bg)] px-2 py-2">
                  <p className={cn('font-mono text-[11px] leading-relaxed', phase === 'idle' ? 'text-[var(--muted)]' : 'text-[var(--text)]')}>
                    <span className="text-[var(--muted)]">&gt; </span>
                    {contextDisplay}
                    {phase === 'scan' || phase === 'enhance' ? (
                      <span className="ml-0.5 inline-block h-[1em] w-[1px] animate-pulse bg-[var(--text)] align-middle" />
                    ) : null}
                  </p>
                  {phase !== 'idle' ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {activePreset.chips.slice(0, 3).map((chip) => (
                        <span
                          key={`ctx-${activePreset.name}-${chip}`}
                          className="rounded-full border border-[var(--text)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--text)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 space-y-4 border-t border-[var(--text)] pt-4 sm:mt-5 sm:pt-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span>{copy.steps.analysis}</span>
                    <span className={cn(progressState.analysis.value > 0 ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                      {progressState.analysis.label}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full border border-[var(--text)] bg-white">
                    <div
                      className={cn(
                        'h-full rounded-full bg-[var(--accent)] transition-all duration-700',
                        progressState.analysis.pulse && 'animate-pulse',
                      )}
                      style={{ width: `${progressState.analysis.value}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span>{copy.steps.enhancement}</span>
                    <span className={cn(progressState.enhancement.value > 0 ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                      {progressState.enhancement.label}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full border border-[var(--text)] bg-white">
                    <div
                      className={cn(
                        'h-full rounded-full bg-[var(--accent)] transition-all duration-700',
                        progressState.enhancement.pulse && 'animate-pulse',
                      )}
                      style={{ width: `${progressState.enhancement.value}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span>{copy.steps.layoutAssembly}</span>
                    <span className={cn(progressState.assembly.value > 0 ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                      {progressState.assembly.label}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full border border-[var(--text)] bg-white">
                    <div
                      className={cn(
                        'h-full rounded-full bg-[var(--accent)] transition-all duration-700',
                        progressState.assembly.pulse && 'animate-pulse',
                      )}
                      style={{ width: `${progressState.assembly.value}%` }}
                    />
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
