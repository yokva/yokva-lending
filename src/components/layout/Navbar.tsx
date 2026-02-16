import { cn } from '../../lib/cn'
import { type NavbarProps } from '../../types/landing'

export function Navbar({ copy, isScrolled }: NavbarProps) {
  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'border-b-2 border-[var(--text)] bg-[color:rgb(247_247_245_/_0.92)] backdrop-blur'
          : 'bg-transparent',
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-18 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6"
      >
        <a href="#top" className="font-headline text-2xl font-extrabold tracking-[-0.02em] text-[var(--text)]">
          <img src="/logo.png" alt={copy.logo} className="h-7 w-auto sm:h-8" />
        </a>

        <a
          href="#waitlist"
          className="focus-ring inline-flex items-center rounded-full border-2 border-[var(--text)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--accent-strong)] sm:px-5"
        >
          <span className="sm:hidden">Join</span>
          <span className="hidden sm:inline">{copy.cta}</span>
        </a>
      </nav>
    </header>
  )
}
