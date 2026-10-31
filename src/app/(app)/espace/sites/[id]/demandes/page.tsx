import { CalendarDays, Mail, MessageSquare, Phone, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { markRequestsRead } from "@/lib/actions/leads";
import { requireUser } from "@/lib/auth";
import { DETAIL_LABELS } from "@/lib/request-schema";
import { getOwnedSite, getSiteRequests } from "@/lib/sites";

export const instant = false;
export const metadata: Metadata = { title: "Demandes reçues" };

const KIND = {
  contact: { label: "Contact", icon: MessageSquare },
  rendezvous: { label: "Rendez-vous", icon: CalendarDays },
  reservation: { label: "Réservation", icon: UtensilsCrossed },
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" });

function formatDetail(key: string, value: string) {
  if (key === "date" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(value));
  }
  return value;
}

export default async function RequestsPage({ params }: PageProps<"/espace/sites/[id]/demandes">) {
  const { id } = await params;
  const user = await requireUser();
  const site = await getOwnedSite(user.id, id);
  if (!site) notFound();
  const items = await getSiteRequests(site.id);
  const hasUnread = items.some((r) => !r.readAt);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Demandes reçues</h1>
          <p className="mt-1 text-sm text-muted">Chaque demande vous est aussi envoyée par e-mail à {user.email}.</p>
        </div>
        {hasUnread && (
          <form action={markRequestsRead.bind(null, site.id, undefined)}>
            <Button type="submit" variant="secondary" size="sm">Tout marquer comme lu</Button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <p className="font-semibold">Aucune demande pour l&apos;instant</p>
          <p className="mt-2 text-sm text-muted">
            Partagez l&apos;adresse de votre site sur vos réseaux, votre fiche Google et vos cartes de visite pour en recevoir.
          </p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => {
            const kind = KIND[item.kind];
            return (
              <li key={item.id}>
                <Card className={`p-5 ${item.readAt ? "" : "border-accent/40 ring-1 ring-accent/20"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-paper text-ink-soft">
                        <kind.icon className="size-4" />
                      </span>
                      <div>
                        <p className="flex items-center gap-2 font-semibold">
                          {item.name}
                          {!item.readAt && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white uppercase">Nouveau</span>}
                        </p>
                        <p className="text-xs text-muted">{kind.label} · {dateFormat.format(item.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {item.phone && (
                        <a href={`tel:${item.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm hover:border-ink/30">
                          <Phone className="size-3.5" /> {item.phone}
                        </a>
                      )}
                      {item.email && (
                        <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm hover:border-ink/30">
                          <Mail className="size-3.5" /> Répondre
                        </a>
                      )}
                    </div>
                  </div>
                  {Object.keys(item.details).length > 0 && (
                    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-paper px-4 py-3 text-sm">
                      {Object.entries(item.details).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs text-muted">{DETAIL_LABELS[key] ?? key}</dt>
                          <dd className="font-medium first-letter:uppercase">{formatDetail(key, value)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {item.message && <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">{item.message}</p>}
                  {!item.readAt && (
                    <form action={markRequestsRead.bind(null, site.id, item.id)} className="mt-3">
                      <button type="submit" className="text-sm font-medium text-accent hover:underline">Marquer comme lu</button>
                    </form>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
