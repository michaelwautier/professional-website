import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { requests, sites, users } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { appUrl } from "@/lib/hosts";
import { DETAIL_LABELS, requestSchema } from "@/lib/request-schema";

const KIND_LABEL = {
  contact: "demande de contact",
  rendezvous: "demande de rendez-vous",
  reservation: "demande de réservation",
};

// Reçoit les formulaires de tous les sites clients (même origine grâce au proxy, qui laisse passer /api).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.fromEntries(
      Object.entries(z.flattenError(parsed.error).fieldErrors).map(([key, messages]) => [key, messages?.[0] ?? ""]),
    );
    return Response.json({ error: "Certains champs sont à corriger.", fields }, { status: 400 });
  }

  const { siteId, kind, name, email, phone, message, website, ...rest } = parsed.data;
  // Robot détecté : on répond comme si tout allait bien pour ne pas l'aider à s'adapter.
  if (website) return Response.json({ ok: true });

  const [site] = await db
    .select({ published: sites.published, content: sites.content, ownerEmail: users.email })
    .from(sites)
    .innerJoin(users, eq(users.id, sites.userId))
    .where(eq(sites.id, siteId))
    .limit(1);
  if (!site?.published) return Response.json({ error: "Ce site n'accepte pas de demandes." }, { status: 404 });

  const details = Object.fromEntries(Object.entries(rest).filter(([, value]) => value));
  await db.insert(requests).values({ siteId, kind, name, email, phone, message, details });

  const lines = [`Nouvelle ${KIND_LABEL[kind]} sur le site ${site.content.businessName} :`, "", `Nom : ${name}`];
  if (phone) lines.push(`Téléphone : ${phone}`);
  if (email) lines.push(`E-mail : ${email}`);
  for (const [key, value] of Object.entries(details)) lines.push(`${DETAIL_LABELS[key] ?? key} : ${value}`);
  if (message) lines.push("", "Message :", message);
  lines.push("", `Retrouvez toutes vos demandes dans votre espace : ${appUrl(`/espace/sites/${siteId}/demandes`)}`);

  await sendEmail({
    to: site.ownerEmail,
    subject: `Nouvelle ${KIND_LABEL[kind]} de ${name}`,
    text: lines.join("\n"),
    replyTo: email || undefined,
  });

  return Response.json({ ok: true });
}
