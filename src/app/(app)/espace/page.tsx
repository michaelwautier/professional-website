import { ArrowUpRight, Inbox, Plus, Shield } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass, Card } from "@/components/ui";
import { profile } from "@/content/profile";
import { isOwner, requireUser } from "@/lib/auth";
import { publicSiteUrl } from "@/lib/hosts";
import { TYPE_META } from "@/lib/presets";
import { getUserSites } from "@/lib/sites";
import { contrastText } from "@/lib/themes";

export const instant = false;
export const metadata: Metadata = { title: "Mes sites" };

export default async function DashboardPage() {
  const user = await requireUser();
  const rows = await getUserSites(user.id);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mes sites</h1>
          <p className="mt-1 text-muted">Modifiez vos sites et retrouvez les demandes de vos clients.</p>
        </div>
        <div className="flex gap-2">
          {isOwner(user) && (
            <Link href="/espace/admin" className={buttonClass("secondary")}>
              <Shield className="size-4" /> Administration
            </Link>
          )}
          <Link href="/creer" className={buttonClass("primary")}>
            <Plus className="size-4" /> Nouveau site
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card className="mt-10 p-10 text-center">
          <p className="text-lg font-semibold">Vous n&apos;avez pas encore de site</p>
          <p className="mt-2 text-muted">Il ne faut que quelques minutes pour le créer, et c&apos;est gratuit.</p>
          <Link href="/creer" className={buttonClass("accent", "md", "mt-6")}>
            Créer mon premier site
          </Link>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {rows.map(({ site, unread }) => {
            const url = publicSiteUrl(site);
            const { color } = site.content.theme;
            return (
              <Card key={site.id} className="group overflow-hidden transition hover:shadow-lg hover:shadow-ink/5">
                <Link href={`/espace/sites/${site.id}`} className="block">
                  <div className="relative h-28 overflow-hidden" style={{ background: color }}>
                    <div className="absolute -right-8 -bottom-12 size-40 rounded-full bg-white/10" />
                    <div className="absolute top-4 left-5 flex items-center gap-2 text-sm font-medium" style={{ color: contrastText(color) }}>
                      <span className={`size-2 rounded-full ${site.published ? "bg-emerald-400" : "bg-zinc-400"}`} />
                      {site.published ? "En ligne" : "Hors ligne"}
                    </div>
                    {Number(unread) > 0 && (
                      <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink">
                        <Inbox className="size-3.5" /> {unread} nouvelle{Number(unread) > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium tracking-wide text-muted uppercase">{TYPE_META[site.type].label}</p>
                    <p className="mt-1 text-lg font-semibold">{site.content.businessName}</p>
                    <p className="mt-1 truncate font-mono text-sm text-muted">{url.replace(/^https?:\/\//, "")}</p>
                  </div>
                </Link>
                <div className="flex gap-2 border-t border-line px-5 py-3">
                  <Link href={`/espace/sites/${site.id}`} className={buttonClass("secondary", "sm")}>Modifier</Link>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "sm")}>
                    Voir le site <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-ink p-7 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold">Besoin d&apos;aller plus loin ?</p>
          <p className="mt-1 text-white/70">
            Boutique en ligne, réservation avec paiement, design sur-mesure : {profile.firstName} peut s&apos;en charger.
          </p>
        </div>
        <Link href="/#contact" className={buttonClass("secondary", "md", "shrink-0")}>
          Demander un devis
        </Link>
      </div>
    </main>
  );
}
