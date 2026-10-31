"use server";

import { count, eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { createLoginLink, findOrCreateUser, getCurrentUser, startSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { appUrl, siteUrl } from "@/lib/hosts";
import { SITE_TYPES, siteContentSchema, slugSchema } from "@/lib/site-schema";
import { getOwnedSite, isSlugTaken, siteKeyTag, tagsForSite } from "@/lib/sites";

export type ActionResult = { ok: true } | { ok: false; error: string; step?: number };

const MAX_SITES_PER_USER = 5;

// Étape de l'assistant où se trouve chaque champ, pour y ramener l'utilisateur en cas d'erreur.
const STEP_OF: Record<string, number> = {
  businessName: 0, sector: 0, city: 0, tagline: 0,
  about: 1, services: 1, menu: 1,
  hours: 2, contact: 2,
  images: 3, theme: 3,
  slug: 4, email: 4, acceptTerms: 4,
};

function firstIssue(error: z.ZodError, offset = 0) {
  const issue = error.issues[0];
  const key = String(issue.path[offset] ?? "");
  // Les messages par défaut de zod sont en anglais : on ne garde que les nôtres.
  const isDefault = /^(Invalid|Too (small|big)|Expected|Required|Unrecognized)/.test(issue.message);
  const message = isDefault ? "Une information est incomplète ou invalide." : issue.message;
  return { ok: false as const, error: message, step: STEP_OF[key] };
}

function isUniqueViolation(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

export async function checkSlug(slug: string): Promise<{ available: boolean; error?: string }> {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return { available: false, error: parsed.error.issues[0].message };
  if (await isSlugTaken(parsed.data)) return { available: false, error: "Cette adresse est déjà prise" };
  return { available: true };
}

const createSchema = z.object({
  type: z.enum(SITE_TYPES),
  content: siteContentSchema,
  slug: slugSchema,
  email: z.email("Adresse e-mail invalide"),
  acceptTerms: z.literal(true, "Veuillez accepter les conditions d'utilisation"),
});

export async function createSite(input: z.input<typeof createSchema>): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return firstIssue(parsed.error, parsed.error.issues[0].path[0] === "content" ? 1 : 0);
  const { type, content, slug } = parsed.data;

  // Déjà connecté : le site est rattaché au compte, quelle que soit l'adresse saisie.
  const current = await getCurrentUser();
  const { user, created } = current
    ? { user: current, created: false }
    : await findOrCreateUser(parsed.data.email);

  const [{ total }] = await db.select({ total: count() }).from(sites).where(eq(sites.userId, user.id));
  if (total >= MAX_SITES_PER_USER) {
    return { ok: false, error: `Vous avez atteint la limite de ${MAX_SITES_PER_USER} sites par compte.`, step: 4 };
  }

  let siteId: string;
  try {
    const [site] = await db.insert(sites).values({ userId: user.id, slug, type, content }).returning({ id: sites.id });
    siteId = site.id;
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "Cette adresse vient d'être prise, choisissez-en une autre.", step: 4 };
    throw error;
  }
  updateTag(siteKeyTag(slug));

  if (current || created) {
    // Nouveau compte : on connecte directement. Un compte existant devra passer par le lien e-mail,
    // sinon n'importe qui pourrait accéder à l'espace d'un autre en saisissant son adresse.
    if (created) await startSession(user.id);
    await sendEmail({
      to: user.email,
      subject: `Votre site ${content.businessName} est en ligne 🎉`,
      text: `Bonjour,\n\nVotre site est en ligne à cette adresse :\n${siteUrl(slug)}\n\nVous pouvez le modifier à tout moment depuis votre espace :\n${appUrl("/espace")}\n\nÀ très vite !`,
    });
    redirect(`/espace/sites/${siteId}?nouveau=1`);
  }

  const link = await createLoginLink(user.email);
  await sendEmail({
    to: user.email,
    subject: `Votre site ${content.businessName} est en ligne 🎉`,
    text: `Bonjour,\n\nVotre site est en ligne à cette adresse :\n${siteUrl(slug)}\n\n${
      link ? `Pour le modifier, connectez-vous à votre espace avec ce lien (valable 30 minutes) :\n${link}` : `Pour le modifier, connectez-vous à votre espace : ${appUrl("/connexion")}`
    }\n\nÀ très vite !`,
  });
  redirect(`/creer/merci?site=${slug}`);
}

async function ownedSiteOrError(siteId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Votre session a expiré, reconnectez-vous." };
  const site = await getOwnedSite(user.id, siteId);
  if (!site) return { ok: false as const, error: "Site introuvable." };
  return { ok: true as const, site };
}

export async function updateSiteContent(siteId: string, content: unknown): Promise<ActionResult> {
  const result = await ownedSiteOrError(siteId);
  if (!result.ok) return result;

  const parsed = siteContentSchema.safeParse(content);
  if (!parsed.success) return firstIssue(parsed.error);

  await db.update(sites).set({ content: parsed.data }).where(eq(sites.id, siteId));
  tagsForSite(result.site).forEach(updateTag);
  refresh();
  return { ok: true };
}

export async function setSitePublished(siteId: string, published: boolean): Promise<ActionResult> {
  const result = await ownedSiteOrError(siteId);
  if (!result.ok) return result;

  await db.update(sites).set({ published }).where(eq(sites.id, siteId));
  tagsForSite(result.site).forEach(updateTag);
  refresh();
  return { ok: true };
}

export async function changeSiteSlug(siteId: string, slug: string): Promise<ActionResult> {
  const result = await ownedSiteOrError(siteId);
  if (!result.ok) return result;

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (parsed.data === result.site.slug) return { ok: true };

  try {
    await db.update(sites).set({ slug: parsed.data }).where(eq(sites.id, siteId));
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "Cette adresse est déjà prise." };
    throw error;
  }
  [...tagsForSite(result.site), siteKeyTag(parsed.data)].forEach(updateTag);
  refresh();
  return { ok: true };
}

export async function deleteSite(siteId: string): Promise<ActionResult> {
  const result = await ownedSiteOrError(siteId);
  if (!result.ok) return result;
  if (result.site.stripeSubscriptionId) {
    return { ok: false, error: "Résiliez d'abord la formule Pro avant de supprimer ce site." };
  }

  await db.delete(sites).where(eq(sites.id, siteId));
  tagsForSite(result.site).forEach(updateTag);
  redirect("/espace");
}
