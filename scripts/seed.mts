// Crée trois sites de démonstration (un par type) rattachés à OWNER_EMAIL : `npm run db:seed`.
import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sites, users } from "../src/db/schema";
import { initialContent, presetTexts } from "../src/lib/presets";
import type { SiteContent, SiteType } from "../src/lib/site-schema";

nextEnv.loadEnvConfig(process.cwd());

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { casing: "snake_case" });

const demos: { slug: string; type: SiteType; preset: string; name: string; city: string; extra: Partial<SiteContent> }[] = [
  {
    slug: "demo-artisan",
    type: "vitrine",
    preset: "artisan",
    name: "Martin Rénovation",
    city: "Nantes",
    extra: { contact: { phone: "06 12 34 56 78", email: "contact@martin-renovation.fr", address: "12 rue de la Paix\n44000 Nantes", instagram: "", facebook: "", siret: "" } },
  },
  {
    slug: "demo-coiffure",
    type: "rendezvous",
    preset: "coiffure",
    name: "Atelier Léa Coiffure",
    city: "Lyon",
    extra: { contact: { phone: "04 78 00 00 00", email: "", address: "8 place Bellecour\n69002 Lyon", instagram: "@atelierlea", facebook: "", siret: "" } },
  },
  {
    slug: "demo-restaurant",
    type: "restaurant",
    preset: "restaurant",
    name: "La Table de Jeanne",
    city: "Bordeaux",
    extra: { contact: { phone: "05 56 00 00 00", email: "", address: "3 quai des Chartrons\n33000 Bordeaux", instagram: "@tabledejeanne", facebook: "", siret: "" } },
  },
];

const email = (process.env.OWNER_EMAIL ?? "demo@exemple.fr").toLowerCase();
const [owner] = await db
  .insert(users)
  .values({ email })
  .onConflictDoUpdate({ target: users.email, set: { email } })
  .returning();

for (const demo of demos) {
  const content: SiteContent = {
    ...initialContent(demo.type, demo.preset),
    ...presetTexts(demo.type, demo.preset, { name: demo.name, city: demo.city }),
    businessName: demo.name,
    city: demo.city,
    ...demo.extra,
  };
  await db
    .insert(sites)
    .values({ userId: owner.id, slug: demo.slug, type: demo.type, content })
    .onConflictDoUpdate({ target: sites.slug, set: { content, type: demo.type } });
  console.log(`✓ ${demo.slug}`);
}

await client.end();
