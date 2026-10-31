"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteTabs({ siteId, unread }: { siteId: string; unread: number }) {
  const pathname = usePathname();
  const base = `/espace/sites/${siteId}`;
  const tabs = [
    { href: base, label: "Contenu" },
    { href: `${base}/demandes`, label: "Demandes", badge: unread },
    { href: `${base}/domaine`, label: "Domaine" },
    { href: `${base}/parametres`, label: "Paramètres" },
  ];

  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition ${
              active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] leading-5 text-white">{tab.badge}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
