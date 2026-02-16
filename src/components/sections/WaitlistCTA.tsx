import { Check } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
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
  const [email, setEmail] = useState('')
  const [savedEmails, setSavedEmails] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { ref, isVisible } = useReveal<HTMLElement>(0.2)

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalized = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(normalized)) {
      setError(copy.errorInvalidEmail)
      setMessage(null)
      return
    }

    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const data = await joinWaitlist(normalized)
      setSavedEmails(data.emails)
      setEmail('')
      setMessage(copy.success)
    } catch {
      setError(copy.errorNetwork)
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

        {message ? <p className="mt-4 text-sm text-[var(--accent)]">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-[#ffb7ad]">{error}</p> : null}

        <p className={cn('reveal reveal-right mt-4 text-sm text-white/63', isVisible && 'reveal-visible')}>{copy.privacy}</p>
      </div>
    </section>
  )
}
