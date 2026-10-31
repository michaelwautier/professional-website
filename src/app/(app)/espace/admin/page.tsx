import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { db } from "@/db";
import { leads, sites, users } from "@/db/schema";
import { isOwner, requireUser } from "@/lib/auth";
import { publicSiteUrl } from "@/lib/hosts";
import { TYPE_META } from "@/lib/presets";

export const instant = false;
export const metadata: Metadata = { title: "Administration", robots: { index: false } };

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });

// Réservé à OWNER_EMAIL : prospects reçus et vue d'ensemble des sites créés.
export default async function AdminPage() {
  const user = await requireUser();
  if (!isOwner(user)) notFound();

  const [allLeads, allSites] = await Promise.all([
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(100),
    db
      .select({ site: sites, owner: users.email })
      .from(sites)
      .innerJoin(users, eq(users.id, sites.userId))
      .orderBy(desc(sites.createdAt))
      .limit(200),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Administration</h1>

      <section>
        <h2 className="text-lg font-semibold">Prospects ({allLeads.length})</h2>
        <div className="mt-4 space-y-3">
          {allLeads.length === 0 && <p className="text-muted">Aucun message pour l&apos;instant.</p>}
          {allLeads.map((lead) => (
            <Card key={lead.id} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {lead.name}{" "}
                  <a href={`mailto:${lead.email}`} className="font-normal text-accent hover:underline">{lead.email}</a>
                  {lead.phone && <span className="font-normal text-muted"> · {lead.phone}</span>}
                </p>
                <p className="text-xs text-muted">{dateFormat.format(lead.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm font-medium text-ink-soft">{lead.topic}</p>
              <p className="mt-2 text-sm whitespace-pre-line text-ink-soft">{lead.message}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Sites ({allSites.length})</h2>
        <Card className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs text-muted uppercase">
              <tr>
                {["Site", "Type", "Client", "Formule", "Domaine", "Créé le"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {allSites.map(({ site, owner }) => (
                <tr key={site.id}>
                  <td className="px-4 py-3">
                    <a href={publicSiteUrl(site)} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      {site.content.businessName}
                    </a>
                    <p className="font-mono text-xs text-muted">{site.slug}</p>
                  </td>
                  <td className="px-4 py-3">{TYPE_META[site.type].label}</td>
                  <td className="px-4 py-3">{owner}</td>
                  <td className="px-4 py-3">{site.plan === "pro" ? "Pro" : "Gratuit"}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {site.customDomain ? `${site.customDomain} (${site.domainStatus === "active" ? "actif" : "en attente"})` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{dateFormat.format(site.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </main>
  );
}
