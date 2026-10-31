import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/sites";
import { themeVars } from "@/lib/themes";

export const instant = false;

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

// Page générée automatiquement à partir des informations du site : une obligation légale pour tout site professionnel en France.
export default async function TenantLegalPage({ params }: PageProps<"/s/[site]/mentions-legales">) {
  const site = await getPublicSite((await params).site);
  if (!site) notFound();
  const { businessName, contact, city } = site.content;

  return (
    <div className="site-root min-h-screen bg-site-bg font-site-body text-site-text" style={themeVars(site.content.theme)}>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="text-sm text-site-muted hover:text-site-text">← Retour au site</Link>
        <h1 className="site-heading mt-8 text-4xl">Mentions légales</h1>

        <section className="mt-10 space-y-2">
          <h2 className="site-heading text-xl">Éditeur du site</h2>
          <p>{businessName}</p>
          {(contact.address || city) && <p className="whitespace-pre-line text-site-muted">{contact.address || city}</p>}
          {contact.siret && <p className="text-site-muted">SIRET : {contact.siret}</p>}
          {contact.email && <p className="text-site-muted">E-mail : {contact.email}</p>}
          {contact.phone && <p className="text-site-muted">Téléphone : {contact.phone}</p>}
        </section>

        <section className="mt-8 space-y-2">
          <h2 className="site-heading text-xl">Hébergement</h2>
          <p className="text-site-muted">Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
        </section>

        <section className="mt-8 space-y-2">
          <h2 className="site-heading text-xl">Données personnelles</h2>
          <p className="leading-relaxed text-site-muted">
            Les informations envoyées via les formulaires de ce site sont uniquement utilisées par {businessName} pour
            répondre à votre demande. Elles ne sont ni revendues ni cédées. Conformément au RGPD, vous pouvez demander
            leur consultation, rectification ou suppression en contactant directement {businessName}.
          </p>
          <p className="leading-relaxed text-site-muted">Ce site n&apos;utilise aucun cookie publicitaire ni de suivi.</p>
        </section>
      </main>
    </div>
  );
}
