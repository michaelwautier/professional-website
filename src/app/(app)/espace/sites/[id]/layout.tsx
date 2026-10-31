import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { publicSiteUrl } from "@/lib/hosts";
import { countUnreadRequests, getOwnedSite } from "@/lib/sites";
import { SiteTabs } from "./site-tabs";

export const instant = false;

export default async function SiteLayout({ children, params }: LayoutProps<"/espace/sites/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const site = await getOwnedSite(user.id, id);
  if (!site) notFound();
  const unread = await countUnreadRequests(site.id);
  const url = publicSiteUrl(site);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="shrink-0 border-b border-line bg-white px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
          <Link href="/espace" className="grid size-8 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink" aria-label="Retour à mes sites">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold">
              {site.content.businessName}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${site.published ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}
              >
                {site.published ? "En ligne" : "Hors ligne"}
              </span>
            </p>
            <p className="truncate font-mono text-xs text-muted">{url.replace(/^https?:\/\//, "")}</p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "sm", "ml-auto")}>
            Voir mon site <ArrowUpRight className="size-3.5" />
          </a>
        </div>
        <div className="mt-2">
          <SiteTabs siteId={site.id} unread={unread} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
