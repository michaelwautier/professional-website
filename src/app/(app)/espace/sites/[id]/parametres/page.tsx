import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { profile } from "@/content/profile";
import { requireUser } from "@/lib/auth";
import { getOwnedSite } from "@/lib/sites";
import { DeleteSite, PublishToggle, SlugForm } from "./settings-forms";

export const instant = false;
export const metadata: Metadata = { title: "Paramètres du site" };

export default async function SettingsPage({ params }: PageProps<"/espace/sites/[id]/parametres">) {
  const { id } = await params;
  const user = await requireUser();
  const site = await getOwnedSite(user.id, id);
  if (!site) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>

      <Card className="p-6">
        <PublishToggle siteId={site.id} published={site.published} />
      </Card>

      <Card className="p-6">
        <SlugForm siteId={site.id} slug={site.slug} />
      </Card>

      <Card id="aide" className="p-6">
        <p className="font-semibold">Confiez votre site à un développeur</p>
        <p className="mt-1 mb-5 text-sm text-muted">
          Une fonctionnalité sur-mesure, un design unique, du référencement ? Décrivez votre besoin, {profile.firstName} vous
          répond sous 24 h avec une proposition.
        </p>
        <LeadForm
          siteId={site.id}
          defaultEmail={user.email}
          defaultName={site.content.businessName}
          topics={["Faire évoluer mon site", "Ajouter une boutique en ligne", "Paiement des réservations", "Référencement Google", "Autre demande"]}
          submitLabel="Envoyer ma demande"
          messagePlaceholder="Ex. : j'aimerais que mes clients puissent payer un acompte au moment de réserver…"
        />
      </Card>

      <Card className="border-danger/20 p-6">
        <DeleteSite siteId={site.id} businessName={site.content.businessName} />
      </Card>
    </main>
  );
}
