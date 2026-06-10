import Link from "next/link";
import { Github, Twitter } from "lucide-react";

const columns = [
  {
    title: "Produit",
    links: [
      { l: "Outils", h: "/#outils" },
      { l: "Transfert", h: "/#transfert" },
      { l: "Confidentialité", h: "/#confidentialite" },
      { l: "Tableau de bord", h: "/dashboard" },
    ],
  },
  {
    title: "Légal",
    links: [
      { l: "Confidentialité", h: "/legal/privacy" },
      { l: "CGU", h: "/legal/terms" },
      { l: "Cookies", h: "/legal/cookies" },
      { l: "Plan du site", h: "/sitemap" },
    ],
  },
  {
    title: "Contact",
    links: [
      { l: "Nous contacter", h: "/contact" },
      { l: "Support email", h: "mailto:support@metaconvert.app" },
      { l: "Carrières", h: "/careers" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-ink text-paper/70">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-20">
        <div className="grid grid-cols-1 gap-14 border-b border-paper/10 pb-16 lg:grid-cols-[1.4fr_1fr]">
          <div className="max-w-sm">
            <span className="font-display text-3xl font-semibold tracking-tight text-paper">
              MetaConvert
            </span>
            <p className="mt-4 text-[15px] leading-relaxed text-paper/55">
              Dix outils pour convertir, transférer et ranger n&apos;importe quel
              fichier. Traités dans le navigateur, jamais conservés.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/45">
                  {col.title}
                </h4>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.l}>
                      <Link
                        href={link.h}
                        className="text-[15px] text-paper/65 transition-colors hover:text-paper"
                      >
                        {link.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 pt-8 sm:flex-row">
          <p className="text-[13px] text-paper/45">© 2026 MetaConvert — développé par Arthur</p>
          <div className="flex items-center gap-3">
            <SocialLink href="https://twitter.com" label="Twitter" icon={Twitter} />
            <SocialLink href="https://github.com" label="GitHub" icon={Github} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Github;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-paper/15 text-paper/55 transition-colors hover:border-paper/40 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/40"
    >
      <Icon size={16} />
    </a>
  );
}
