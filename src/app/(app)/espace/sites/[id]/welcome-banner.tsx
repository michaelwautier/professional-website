"use client";

import { Check, Copy, PartyPopper, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function WelcomeBanner({ url, siteId }: { url: string; siteId: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-accent/20 bg-accent-soft px-5 py-3 text-sm">
      <PartyPopper className="size-5 text-accent" />
      <p className="text-ink">
        <strong>Félicitations, votre site est en ligne !</strong> Partagez-le à vos clients et sur vos réseaux.
      </p>
      <div className="ml-auto flex items-center gap-2">
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-accent underline-offset-4 hover:underline">
          {url.replace(/^https?:\/\//, "")}
        </a>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-ink shadow-sm"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          {copied ? "Copié" : "Copier le lien"}
        </button>
        <Link href={`/espace/sites/${siteId}`} aria-label="Fermer" className="grid size-7 place-items-center rounded-full text-muted hover:bg-white">
          <X className="size-4" />
        </Link>
      </div>
    </div>
  );
}
