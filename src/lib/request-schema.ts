import { z } from "zod";
import type { SiteType } from "@/lib/site-schema";

export const REQUEST_KIND = {
  vitrine: "contact",
  rendezvous: "rendezvous",
  restaurant: "reservation",
} as const satisfies Record<SiteType, string>;

export type RequestKind = (typeof REQUEST_KIND)[SiteType];

const field = (max: number) => z.string().trim().max(max).default("");

export const requestSchema = z
  .object({
    siteId: z.uuid(),
    kind: z.enum(["contact", "rendezvous", "reservation"]),
    name: z.string().trim().min(2, "Indiquez votre nom").max(100),
    email: z.union([z.literal(""), z.email("Adresse e-mail invalide")]).default(""),
    phone: field(30),
    message: field(3000),
    service: field(100),
    date: z.union([z.literal(""), z.iso.date("Date invalide")]).default(""),
    time: field(30),
    guests: field(20),
    // Champ invisible : seul un robot le remplit.
    website: field(200),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Laissez un téléphone ou un e-mail pour être recontacté" });
    }
    if (data.kind === "contact" && data.message.length < 5) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "Décrivez votre demande en quelques mots" });
    }
    if (data.kind !== "contact" && !data.date) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Choisissez une date" });
    }
    if (data.kind === "reservation" && !data.time) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Choisissez une heure" });
    }
  });

export type RequestInput = z.input<typeof requestSchema>;

export const DETAIL_LABELS: Record<string, string> = {
  service: "Prestation",
  date: "Date souhaitée",
  time: "Heure / créneau",
  guests: "Couverts",
};
