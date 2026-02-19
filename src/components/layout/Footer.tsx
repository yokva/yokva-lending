import { Facebook, Instagram, Mail, Send } from 'lucide-react';
import { type FooterProps } from '../../types/landing';

export function Footer({ copy }: FooterProps) {
  const links = [
    { label: copy.telegramHandle, href: copy.telegramUrl, Icon: Send },
    { label: copy.instagramHandle, href: copy.instagramUrl, Icon: Instagram },
    { label: copy.facebookHandle, href: copy.facebookUrl, Icon: Facebook },
    { label: copy.email, href: `mailto:${copy.email}`, Icon: Mail },
  ];

  return (
    <footer className="border-t-2 border-[var(--text)] bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <img src="/logo.png" alt={copy.logo} className="h-8 w-auto" />

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {links.map(({ label, href, Icon }) => {
            const isExternal = !href.startsWith('mailto:');

            return (
              <a
                key={label}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                className="focus-ring inline-flex items-center gap-2 rounded-full border-2 border-[var(--text)] px-4 py-2 font-medium text-[var(--text)] transition-colors hover:bg-[var(--text)] hover:text-white"
              >
                <Icon size={14} />
                <span>{label}</span>
              </a>
            );
          })}
        </div>

        <p className="text-sm text-[var(--muted)]">{copy.copyright}</p>
      </div>
    </footer>
  );
}
