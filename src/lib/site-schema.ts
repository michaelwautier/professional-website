import { z } from "zod";

export const SITE_TYPES = ["vitrine", "rendezvous", "restaurant"] as const;
export type SiteType = (typeof SITE_TYPES)[number];

export const SITE_STYLES = ["moderne", "elegant", "chaleureux"] as const;
export type SiteStyle = (typeof SITE_STYLES)[number];

// Les images sont toujours servies par notre propre route, jamais par une URL externe.
const mediaUrl = z.string().regex(/^\/api\/media\/[0-9a-f-]{36}$/);

const text = (max: number) => z.string().trim().max(max).default("");

const service = z.object({
  name: z.string().trim().min(1, "Donnez un nom à cette prestation").max(80),
  description: text(300),
  price: text(30),
  duration: text(30),
});

const menuItem = z.object({
  name: z.string().trim().min(1, "Donnez un nom à ce plat").max(80),
  description: text(200),
  price: text(20),
});

const menuCategory = z.object({
  name: z.string().trim().min(1, "Donnez un nom à cette catégorie").max(60),
  items: z.array(menuItem).max(40),
});

const day = z.object({
  closed: z.boolean(),
  hours: text(60),
});

const optionalEmail = z.union([z.literal(""), z.email("Adresse e-mail invalide")]);

export const siteContentSchema = z.object({
  businessName: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères").max(80),
  sector: z.string().max(40),
  tagline: text(140),
  city: text(80),
  about: text(2000),
  services: z.array(service).max(20),
  menu: z.array(menuCategory).max(12),
  hours: z.array(day).length(7),
  contact: z.object({
    phone: text(30),
    email: optionalEmail.default(""),
    address: text(200),
    instagram: text(200),
    facebook: text(200),
    siret: text(20),
  }),
  images: z.object({
    logo: mediaUrl.nullable(),
    cover: mediaUrl.nullable(),
    gallery: z.array(mediaUrl).max(8),
  }),
  theme: z.object({
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    style: z.enum(SITE_STYLES),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type Service = SiteContent["services"][number];
export type MenuCategory = SiteContent["menu"][number];

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Sous-domaines interdits : ils sont réservés à la plateforme ou prêtent à confusion.
const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "mail", "email", "smtp", "ftp", "blog", "espace", "creer",
  "connexion", "static", "assets", "cdn", "dev", "staging", "preview", "test", "demo",
  "support", "aide", "help", "status", "docs", "s", "m", "shop", "boutique", "stripe", "vercel",
]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "L'adresse doit faire au moins 3 caractères")
  .max(40, "L'adresse doit faire au plus 40 caractères")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Uniquement des lettres, chiffres et tirets")
  .refine((slug) => !slug.includes("--"), "Évitez les doubles tirets")
  .refine((slug) => !RESERVED_SLUGS.has(slug), "Cette adresse est réservée");

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "-et-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 40)
    .replace(/-+$/, "");
}

export function isSiteType(value: string): value is SiteType {
  return (SITE_TYPES as readonly string[]).includes(value);
}
