import { type FooterProps } from '../../types/landing';

export function Footer({ copy }: FooterProps) {
  return (
    <footer className="border-t-2 border-[var(--text)] bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <img src="/logo.png" alt={copy.logo} className="h-8 w-auto" />

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a
            href={copy.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring rounded-full border-2 border-[var(--text)] px-4 py-2 font-medium text-[var(--text)] transition-colors hover:bg-[var(--text)] hover:text-white"
          >
            {copy.telegramHandle}
          </a>
          <a
            href={`mailto:${copy.email}`}
            className="focus-ring rounded-full border-2 border-[var(--text)] px-4 py-2 font-medium text-[var(--text)] transition-colors hover:bg-[var(--text)] hover:text-white"
          >
            {copy.email}
          </a>
        </div>

        <p className="text-sm text-[var(--muted)]">{copy.copyright}</p>
      </div>
    </footer>
  );
}
