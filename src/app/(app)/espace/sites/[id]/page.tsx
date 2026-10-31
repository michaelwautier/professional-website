import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteBuilder } from "@/components/builder/site-builder";
import { requireUser } from "@/lib/auth";
import { publicSiteUrl } from "@/lib/hosts";
import { getOwnedSite } from "@/lib/sites";
import { WelcomeBanner } from "./welcome-banner";

export const instant = false;
export const metadata: Metadata = { title: "Modifier mon site" };

export default async function EditSitePage({ params, searchParams }: PageProps<"/espace/sites/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const site = await getOwnedSite(user.id, id);
  if (!site) notFound();
  const isNew = (await searchParams).nouveau === "1";

  return (
    <div className="flex h-full flex-col">
      {isNew && <WelcomeBanner url={publicSiteUrl(site)} siteId={site.id} />}
      <div className="min-h-0 flex-1">
        <SiteBuilder
          mode="edit"
          type={site.type}
          siteId={site.id}
          slug={site.slug}
          plan={site.plan}
          initialContent={site.content}
        />
      </div>
    </div>
  );
}
