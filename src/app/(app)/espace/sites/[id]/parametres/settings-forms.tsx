"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { changeSiteSlug, deleteSite, setSitePublished, type ActionResult } from "@/lib/actions/sites";
import { ROOT_DOMAIN } from "@/lib/hosts";

function useAction() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => setResult(await action()));
  return { pending, result, run };
}

export function PublishToggle({ siteId, published }: { siteId: string; published: boolean }) {
  const { pending, result, run } = useAction();
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="font-semibold">Site en ligne</p>
        <p className="mt-1 text-sm text-muted">
          {published
            ? "Votre site est visible par tout le monde."
            : "Votre site est masqué : les visiteurs voient une page introuvable."}
        </p>
        {result && !result.ok && <p className="mt-2 text-sm text-danger">{result.error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={published}
        aria-label="Mettre le site en ligne"
        disabled={pending}
        onClick={() => run(() => setSitePublished(siteId, !published))}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${published ? "bg-success" : "bg-line"} disabled:opacity-60`}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${published ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

export function SlugForm({ siteId, slug }: { siteId: string; slug: string }) {
  const { pending, result, run } = useAction();
  const [value, setValue] = useState(slug);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (window.confirm("L'ancienne adresse ne fonctionnera plus. Continuer ?")) run(() => changeSiteSlug(siteId, value));
      }}
    >
      <p className="font-semibold">Adresse du site</p>
      <p className="mt-1 text-sm text-muted">Attention : les liens déjà partagés vers l&apos;ancienne adresse ne fonctionneront plus.</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-stretch overflow-hidden rounded-xl border border-line bg-white focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            className="min-w-0 flex-1 px-3.5 py-2.5 outline-none"
            aria-label="Sous-domaine"
            maxLength={40}
          />
          <span className="flex items-center border-l border-line bg-paper px-3 font-mono text-sm text-muted">.{ROOT_DOMAIN}</span>
        </div>
        <Button type="submit" variant="secondary" disabled={pending || value === slug}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          Changer
        </Button>
      </div>
      {result && !result.ok && <p className="mt-2 text-sm text-danger">{result.error}</p>}
      {result?.ok && <p className="mt-2 text-sm text-success">Adresse mise à jour.</p>}
    </form>
  );
}

export function DeleteSite({ siteId, businessName }: { siteId: string; businessName: string }) {
  const { pending, result, run } = useAction();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-danger">Supprimer le site</p>
        <p className="mt-1 text-sm text-muted">Le site et toutes ses demandes seront définitivement effacés.</p>
        {result && !result.ok && <p className="mt-2 text-sm text-danger">{result.error}</p>}
      </div>
      <Button
        variant="danger"
        disabled={pending}
        onClick={() => {
          const answer = window.prompt(`Pour confirmer, tapez le nom du site : ${businessName}`);
          if (answer?.trim() === businessName) run(() => deleteSite(siteId));
        }}
      >
        Supprimer
      </Button>
    </div>
  );
}
