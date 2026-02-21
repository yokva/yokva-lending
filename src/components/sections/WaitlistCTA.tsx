import { Check } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { captureEvent, identifyUser } from '../../lib/analytics'
import { fetchWaitlist, joinWaitlist } from '../../lib/waitlistApi'
import { cn } from '../../lib/cn'
import { type WaitlistProps } from '../../types/landing'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PLACEHOLDER_INITIALS = ['M', 'A', 'K', 'L']

function getInitial(email: string) {
  const first = email.trim().charAt(0)
  return first ? first.toUpperCase() : '?'
}

export function WaitlistCTA({ copy }: WaitlistProps) {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || ''
  const turnstileEnabled = Boolean(turnstileSiteKey) && (import.meta.env.PROD || import.meta.env.VITE_TURNSTILE_IN_DEV === 'true')
  const [email, setEmail] = useState('')
  const [savedEmails, setSavedEmails] = useState<string[]>([])
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileApiReady, setTurnstileApiReady] = useState(!turnstileEnabled)
  const [turnstileReady, setTurnstileReady] = useState(false)
  const { ref, isVisible } = useReveal<HTMLElement>(0.2)
  const [widgetContainer, setWidgetContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        const data = await fetchWaitlist()
        if (!alive) return
        setSavedEmails(data.emails)
      } catch {
        if (!alive) return
        setSavedEmails([])
      }
    }

    void load()

    return () => {
      alive = false
    }
  }, [])

  const visibleEmails = useMemo(() => savedEmails.slice(-5).reverse(), [savedEmails])

  const visibleInitials = useMemo(() => {
    const dynamic = visibleEmails.map(getInitial)
    const missing = Math.max(0, 5 - dynamic.length)
    return [...dynamic, ...PLACEHOLDER_INITIALS.slice(0, missing)]
  }, [visibleEmails])

  useEffect(() => {
    if (!turnstileEnabled || typeof window === 'undefined') {
      setTurnstileApiReady(false)
      setTurnstileReady(false)
      setTurnstileToken('')
      return
    }

    if (window.turnstile) {
      setTurnstileApiReady(true)
      return
    }

    let disposed = false
    let script = document.querySelector<HTMLScriptElement>('script[data-turnstile-script="true"]')
    const markReady = () => {
      if (!disposed) {
        setTurnstileApiReady(true)
      }
    }

    const markFailed = () => {
      if (!disposed) {
        setTurnstileApiReady(false)
      }
    }

    if (!script) {
      script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.dataset.turnstileScript = 'true'
      script.addEventListener('load', markReady)
      script.addEventListener('error', markFailed)
      document.head.appendChild(script)
    } else {
      script.addEventListener('load', markReady)
      script.addEventListener('error', markFailed)
    }

    return () => {
      disposed = true
      script?.removeEventListener('load', markReady)
      script?.removeEventListener('error', markFailed)
    }
  }, [turnstileEnabled])

  useEffect(() => {
    if (!turnstileEnabled || !turnstileApiReady || !widgetContainer || typeof window === 'undefined') {
      setTurnstileReady(false)
      setTurnstileToken('')
      if (widgetContainer) {
        widgetContainer.dataset.rendered = 'false'
      }
      return
    }

    let canceled = false
    let attempts = 0
    let timerId: number | null = null

    const tryRender = () => {
      if (canceled) return

      const turnstile = window.turnstile
      if (!turnstile) {
        if (attempts < 80) {
          attempts += 1
          timerId = window.setTimeout(tryRender, 120)
        }
        return
      }

      if (widgetContainer.dataset.rendered === 'true') {
        setTurnstileReady(true)
        return
      }

      turnstile.render(widgetContainer, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        callback: (token: string) => {
          setTurnstileToken(token)
          setError(null)
        },
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      })

      widgetContainer.dataset.rendered = 'true'
      setTurnstileReady(true)
    }

    tryRender()

    return () => {
      canceled = true
      if (timerId !== null) {
        window.clearTimeout(timerId)
      }
    }
  }, [turnstileEnabled, turnstileApiReady, turnstileSiteKey, widgetContainer])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalized = email.trim().toLowerCase()
    const alreadyOnList = savedEmails.includes(normalized)

    captureEvent('waitlist_submit_attempt', {
      source: 'waitlist_form',
      turnstile_enabled: turnstileEnabled,
    })

    if (!EMAIL_REGEX.test(normalized)) {
      setError(copy.errorInvalidEmail)
      setMessage(null)
      captureEvent('waitlist_submit_failed', {
        source: 'waitlist_form',
        reason: 'invalid_email',
      })
      return
    }

    if (!agreed) {
      setError(copy.errorConsentRequired)
      setMessage(null)
      captureEvent('waitlist_submit_failed', {
        source: 'waitlist_form',
        reason: 'consent_missing',
      })
      return
    }

    if (turnstileEnabled && !turnstileToken) {
      setError(copy.errorTurnstileRequired)
      setMessage(null)
      captureEvent('waitlist_submit_failed', {
        source: 'waitlist_form',
        reason: 'turnstile_missing',
      })
      return
    }

    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const data = await joinWaitlist(normalized, turnstileToken)
      setSavedEmails(data.emails)
      setEmail('')
      setMessage(copy.success)
      setTurnstileToken('')

      identifyUser(normalized, { email: normalized, source: 'waitlist_form' })
      captureEvent('waitlist_joined', {
        source: 'waitlist_form',
        turnstile_enabled: turnstileEnabled,
        already_on_list: alreadyOnList,
      })

      if (turnstileEnabled && widgetContainer && window.turnstile) {
        window.turnstile.reset(widgetContainer)
      }
    } catch {
      setError(copy.errorNetwork)
      captureEvent('waitlist_submit_failed', {
        source: 'waitlist_form',
        reason: 'network_or_server',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section ref={ref} id="waitlist" className="px-4 py-22 sm:px-6">
      <div className="mx-auto w-full max-w-[1280px] rounded-lg border-[3px] border-[var(--text)] bg-[var(--text)] px-6 py-10 text-white md:px-10 md:py-14">
        <h2
          className={cn(
            'reveal reveal-left max-w-4xl font-headline text-[clamp(2rem,4.5vw,3.9rem)] leading-[0.92] font-extrabold tracking-[-0.028em]',
            isVisible && 'reveal-visible',
          )}
        >
          {copy.title}
        </h2>

        <p className={cn('reveal reveal-right mt-4 max-w-2xl text-base leading-relaxed text-white/78 md:text-lg', isVisible && 'reveal-visible')}>
          {copy.subtitle}
        </p>

        <div className={cn('reveal reveal-pop mt-7 flex flex-wrap items-center gap-3', isVisible && 'reveal-visible')}>
          <div className="flex -space-x-2">
            {visibleInitials.map((initial, index) => (
              <span
                key={`${initial}-${index}`}
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold',
                  index === 0 ? 'bg-[var(--accent)] text-[var(--text)]' : 'bg-[color:rgb(255_255_255_/_0.22)] text-white',
                )}
              >
                {initial}
              </span>
            ))}
            <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-black text-xs font-semibold text-white">
              +
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn('reveal reveal-left mt-8 flex flex-col gap-3 md:max-w-3xl md:flex-row', isVisible && 'reveal-visible')}
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.placeholder}
            required
            className="focus-ring min-h-12 w-full rounded-full border-2 border-white bg-white px-5 text-[var(--text)] placeholder:text-[var(--muted)]"
          />
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--text)] px-7 text-sm font-semibold text-[var(--text)] transition-colors',
              submitting ? 'cursor-not-allowed bg-[#d7d7d0]' : 'bg-[var(--accent)] hover:bg-[var(--accent-strong)]',
            )}
          >
            {message ? <Check size={16} /> : null}
            {submitting ? 'Saving...' : copy.button}
          </button>
        </form>

        <label
          className={cn(
            'reveal reveal-right mt-4 inline-flex items-start gap-2 text-sm text-white/82',
            isVisible && 'reveal-visible',
          )}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="focus-ring mt-0.5 size-4 rounded border border-white accent-[var(--accent)]"
          />
          <span>{copy.consentLabel}</span>
        </label>

        {turnstileEnabled ? (
          <div
            className={cn('reveal reveal-left mt-4 min-h-[68px] max-w-[320px]', isVisible && 'reveal-visible')}
            aria-live="polite"
          >
            <div ref={setWidgetContainer} />
            {!turnstileApiReady || !turnstileReady ? <p className="mt-2 text-xs text-white/60">Loading security check...</p> : null}
          </div>
        ) : null}

        {message ? <p className="mt-4 text-sm text-[var(--accent)]">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-[#ffb7ad]">{error}</p> : null}

        <p className={cn('reveal reveal-right mt-4 text-sm text-white/63', isVisible && 'reveal-visible')}>{copy.privacy}</p>

        <div className={cn('reveal reveal-left mt-5 rounded-lg border border-white/25 bg-white/5 p-4', isVisible && 'reveal-visible')}>
          <p className="text-xs font-semibold tracking-[0.12em] text-white/75 uppercase">{copy.privacyTitle}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-white/78">
            {copy.privacyPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
