"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { leads, sites } from "@/db/schema";
import { profile } from "@/content/profile";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { appUrl, DOMAIN_REGEX, normalizeDomain, ROOT_DOMAIN } from "@/lib/hosts";
import {
  addDomainToProject,
  getStripe,
  isDomainConfigured,
  isVercelConfigured,
  removeDomainFromProject,
} from "@/lib/integrations";
import { getOwnedSite, siteKeyTag, tagsForSite } from "@/lib/sites";
import type { ActionResult } from "./sites";

async function requireOwnedSite(siteId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const site = await getOwnedSite(user.id, siteId);
  if (!site) redirect("/espace");
  return { user, site };
}

/** Passage à la formule Pro : paiement Stripe si configuré, sinon demande transmise au développeur. */
export async function startProCheckout(siteId: string): Promise<ActionResult> {
  const { user, site } = await requireOwnedSite(siteId);
  if (site.plan === "pro") return { ok: true };

  const stripe = getStripe();
  if (!stripe) {
    await db.insert(leads).values({
      name: site.content.businessName,
      email: user.email,
      topic: "Formule Pro / domaine personnalisé",
      message: `Demande de passage à la formule Pro pour le site ${site.slug}.${ROOT_DOMAIN}.`,
      siteId: site.id,
    });
    if (process.env.OWNER_EMAIL) {
      await sendEmail({
        to: process.env.OWNER_EMAIL,
        subject: `Demande de formule Pro : ${site.content.businessName}`,
        text: `${user.email} souhaite passer le site ${site.slug}.${ROOT_DOMAIN} en formule Pro (domaine personnalisé).`,
        replyTo: user.email,
      });
    }
    return { ok: false, error: `Demande envoyée : ${profile.firstName} vous recontacte très vite pour activer votre domaine.` };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer: site.stripeCustomerId ?? undefined,
    customer_email: site.stripeCustomerId ? undefined : user.email,
    client_reference_id: site.id,
    metadata: { siteId: site.id },
    subscription_data: { metadata: { siteId: site.id } },
    locale: "fr",
    allow_promotion_codes: true,
    success_url: appUrl(`/espace/sites/${site.id}/domaine?paiement=ok`),
    cancel_url: appUrl(`/espace/sites/${site.id}/domaine`),
  });
  redirect(session.url!);
}

export async function openBillingPortal(siteId: string) {
  const { site } = await requireOwnedSite(siteId);
  const stripe = getStripe();
  if (!stripe || !site.stripeCustomerId) redirect(`/espace/sites/${site.id}/domaine`);
  const portal = await stripe.billingPortal.sessions.create({
    customer: site.stripeCustomerId,
    return_url: appUrl(`/espace/sites/${site.id}/domaine`),
  });
  redirect(portal.url);
}

/** Développement uniquement : simule un paiement réussi pour tester le parcours domaine sans Stripe. */
export async function devActivatePro(siteId: string): Promise<ActionResult> {
  if (process.env.NODE_ENV !== "development") return { ok: false, error: "Indisponible." };
  const { site } = await requireOwnedSite(siteId);
  await db.update(sites).set({ plan: "pro" }).where(eq(sites.id, site.id));
  tagsForSite(site).forEach(updateTag);
  refresh();
  return { ok: true };
}

export async function setCustomDomain(siteId: string, input: string): Promise<ActionResult> {
  const { site } = await requireOwnedSite(siteId);
  if (site.plan !== "pro") return { ok: false, error: "Le domaine personnalisé est inclus dans la formule Pro." };

  const domain = normalizeDomain(input);
  if (!DOMAIN_REGEX.test(domain)) return { ok: false, error: "Ce nom de domaine ne semble pas valide (ex. mon-entreprise.fr)." };
  if (domain === ROOT_DOMAIN.split(":")[0] || domain.endsWith(`.${ROOT_DOMAIN.split(":")[0]}`)) {
    return { ok: false, error: "Ce domaine appartient à la plateforme." };
  }
  if (domain === site.customDomain) return { ok: true };

  const [taken] = await db.select({ id: sites.id }).from(sites).where(eq(sites.customDomain, domain)).limit(1);
  if (taken) return { ok: false, error: "Ce domaine est déjà relié à un autre site." };

  const added = await addDomainToProject(domain);
  if (!added.ok) return { ok: false, error: added.error };
  if (site.customDomain) await removeDomainFromProject(site.customDomain);

  await db.update(sites).set({ customDomain: domain, domainStatus: "pending" }).where(eq(sites.id, site.id));
  [...tagsForSite(site), siteKeyTag(domain)].forEach(updateTag);
  refresh();
  return { ok: true };
}

export async function verifyCustomDomain(siteId: string): Promise<ActionResult> {
  const { site } = await requireOwnedSite(siteId);
  if (!site.customDomain) return { ok: false, error: "Aucun domaine à vérifier." };

  // En local, aucun DNS ne peut pointer vers la machine : on active directement pour tester le parcours.
  const configured =
    process.env.NODE_ENV === "development" && !isVercelConfigured() ? true : await isDomainConfigured(site.customDomain);
  if (!configured) {
    return {
      ok: false,
      error: "Le domaine ne pointe pas encore vers votre site. Les changements DNS peuvent prendre jusqu'à 24 h.",
    };
  }

  await db.update(sites).set({ domainStatus: "active" }).where(eq(sites.id, site.id));
  tagsForSite(site).forEach(updateTag);
  refresh();
  return { ok: true };
}

export async function removeCustomDomain(siteId: string): Promise<ActionResult> {
  const { site } = await requireOwnedSite(siteId);
  if (!site.customDomain) return { ok: true };
  await removeDomainFromProject(site.customDomain);
  await db.update(sites).set({ customDomain: null, domainStatus: null }).where(eq(sites.id, site.id));
  tagsForSite(site).forEach(updateTag);
  refresh();
  return { ok: true };
}
