import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { siteHost } from "@/lib/hosts";
import { DNS_RECORDS, getStripe, PRO_PRICE_LABEL } from "@/lib/integrations";
import { getOwnedSite } from "@/lib/sites";
import { DomainPanel } from "./domain-panel";

export const instant = false;
export const metadata: Metadata = { title: "Nom de domaine" };

export default async function DomainPage({ params, searchParams }: PageProps<"/espace/sites/[id]/domaine">) {
  const { id } = await params;
  const user = await requireUser();
  const site = await getOwnedSite(user.id, id);
  if (!site) notFound();
  const justPaid = (await searchParams).paiement === "ok";

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Nom de domaine</h1>
      <p className="mt-1 text-muted">
        Votre site est accessible gratuitement sur <span className="font-mono text-ink">{siteHost(site.slug)}</span>. Avec
        la formule Pro, il peut aussi l&apos;être sur votre propre adresse, comme <span className="font-mono text-ink">mon-entreprise.fr</span>.
      </p>
      <DomainPanel
        key={site.customDomain ?? "aucun"}
        siteId={site.id}
        plan={site.plan}
        domain={site.customDomain}
        domainStatus={site.domainStatus}
        hasBilling={Boolean(site.stripeCustomerId && getStripe())}
        stripeEnabled={Boolean(getStripe())}
        isDev={process.env.NODE_ENV === "development"}
        justPaid={justPaid}
        price={PRO_PRICE_LABEL}
        records={DNS_RECORDS}
      />
    </main>
  );
}
