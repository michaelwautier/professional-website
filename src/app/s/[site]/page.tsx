import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteView } from "@/components/site/site-view";
import { getPublicSite } from "@/lib/sites";

// Les sites clients sont rendus à la demande à partir de données en cache (voir getPublicSite) :
// pas de coquille statique, ce qui permet aussi de renvoyer un vrai 404 pour une adresse inconnue.
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/s/[site]">): Promise<Metadata> {
  const site = await getPublicSite((await params).site);
  if (!site) return { title: "Site introuvable" };

  const { businessName, tagline, about, images } = site.content;
  const description = (tagline || about).slice(0, 160);
  return {
    title: tagline ? `${businessName} · ${tagline}` : businessName,
    description,
    openGraph: {
      title: businessName,
      description,
      images: images.cover ? [images.cover] : undefined,
      type: "website",
      locale: "fr_FR",
    },
    icons: images.logo ? { icon: images.logo } : undefined,
  };
}

export default async function TenantPage({ params }: PageProps<"/s/[site]">) {
  const site = await getPublicSite((await params).site);
  if (!site) notFound();
  return <SiteView site={site} />;
}
