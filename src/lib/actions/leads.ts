"use server";

import { and, eq, isNull } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { leads, requests } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getOwnedSite } from "@/lib/sites";

export type LeadState = { status: "idle" } | { status: "sent" } | { status: "error"; message: string };

const leadSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom").max(100),
  email: z.email("Adresse e-mail invalide"),
  phone: z.string().trim().max(30).default(""),
  topic: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10, "Décrivez votre projet en quelques mots").max(5000),
  siteId: z.union([z.literal(""), z.uuid()]).default(""),
  company: z.string().max(200).default(""),
});

/** Formulaire de contact du portfolio et bouton « faire appel à un développeur » de l'espace client. */
export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const { company, siteId, ...lead } = parsed.data;
  // Champ piège invisible : rempli uniquement par les robots.
  if (company) return { status: "sent" };

  // Un site n'est rattaché à la demande que s'il appartient bien à la personne connectée.
  let ownedSiteId: string | null = null;
  if (siteId) {
    const user = await getCurrentUser();
    ownedSiteId = user ? ((await getOwnedSite(user.id, siteId))?.id ?? null) : null;
  }

  await db.insert(leads).values({ ...lead, siteId: ownedSiteId });

  if (process.env.OWNER_EMAIL) {
    await sendEmail({
      to: process.env.OWNER_EMAIL,
      subject: `Nouveau contact : ${lead.topic} (${lead.name})`,
      text: `${lead.name} <${lead.email}>${lead.phone ? ` · ${lead.phone}` : ""}\nSujet : ${lead.topic}\n\n${lead.message}`,
      replyTo: lead.email,
    });
  }
  return { status: "sent" };
}

export async function markRequestsRead(siteId: string, requestId?: string) {
  const user = await getCurrentUser();
  if (!user || !(await getOwnedSite(user.id, siteId))) return;
  await db
    .update(requests)
    .set({ readAt: new Date() })
    .where(and(eq(requests.siteId, siteId), isNull(requests.readAt), requestId ? eq(requests.id, requestId) : undefined));
  refresh();
}
