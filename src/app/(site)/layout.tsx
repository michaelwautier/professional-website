import { Menu, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Monogram } from "@/components/brand";
import { GithubIcon, LinkedinIcon } from "@/components/site/icons";
import { buttonClass } from "@/components/ui";
import { profile } from "@/content/profile";
import { appUrl } from "@/lib/hosts";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: `${profile.name} · ${profile.role}`, template: `%s · ${profile.name}` },
  description: profile.intro,
  openGraph: { type: "website", locale: "fr_FR", siteName: profile.name },
};

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#projets", label: "Projets" },
  { href: "/creer", label: "Créer mon site" },
  { href: "/#contact", label: "Contact" },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <Link href="/" className="flex items-center gap-3">
            <Monogram />
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold">{profile.name}</span>
              <span className="hidden text-xs text-muted sm:block">{profile.role}</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/espace" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block">
              Espace client
            </Link>
            <Link href="/#contact" className={buttonClass("primary", "sm", "ml-3")}>
              Me contacter
            </Link>
            {/* Menu mobile sans JavaScript */}
            <details className="group relative md:hidden">
              <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-full border border-line bg-white [&::-webkit-details-marker]:hidden" aria-label="Menu">
                <Menu className="size-4 group-open:hidden" />
                <X className="hidden size-4 group-open:block" />
              </summary>
              <nav className="absolute top-12 right-0 w-56 rounded-2xl border border-line bg-white p-2 shadow-xl shadow-ink/10">
                {[...NAV, { href: "/espace", label: "Espace client" }].map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-paper">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </details>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Monogram />
              <span className="font-semibold">{profile.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{profile.headline}</p>
            <div className="mt-5 flex gap-2">
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid size-9 place-items-center rounded-full border border-line text-ink-soft hover:border-ink/30 hover:text-ink">
                <GithubIcon className="size-4" />
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid size-9 place-items-center rounded-full border border-line text-ink-soft hover:border-ink/30 hover:text-ink">
                <LinkedinIcon className="size-4" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Navigation</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-ink">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">{profile.builderName}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li><Link href="/creer" className="hover:text-ink">Créer un site gratuit</Link></li>
              <li><Link href="/espace" className="hover:text-ink">Espace client</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-ink">Mentions légales & CGU</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-muted">
            © {profile.name} · Site conçu et développé par mes soins.
          </p>
        </div>
      </footer>
    </>
  );
}
