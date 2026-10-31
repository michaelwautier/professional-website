import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { SiteContent } from "@/lib/site-schema";

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

export const siteTypeEnum = pgEnum("site_type", ["vitrine", "rendezvous", "restaurant"]);
export const planEnum = pgEnum("plan", ["free", "pro"]);
export const domainStatusEnum = pgEnum("domain_status", ["pending", "active"]);
export const requestKindEnum = pgEnum("request_kind", ["contact", "rendezvous", "reservation"]);

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// On ne stocke que l'empreinte SHA-256 des jetons : une fuite de la base ne donne accès à aucun compte.
export const sessions = pgTable("sessions", {
  tokenHash: text().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
});

export const loginTokens = pgTable(
  "login_tokens",
  {
    tokenHash: text().primaryKey(),
    email: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.email, t.createdAt)],
);

export const sites = pgTable(
  "sites",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text().notNull().unique(),
    type: siteTypeEnum().notNull(),
    published: boolean().notNull().default(true),
    content: jsonb().$type<SiteContent>().notNull(),
    plan: planEnum().notNull().default("free"),
    stripeCustomerId: text(),
    stripeSubscriptionId: text(),
    customDomain: text().unique(),
    domainStatus: domainStatusEnum(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.userId)],
);

// Demandes envoyées depuis les formulaires des sites clients.
export const requests = pgTable(
  "requests",
  {
    id: uuid().primaryKey().defaultRandom(),
    siteId: uuid()
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    kind: requestKindEnum().notNull(),
    name: text().notNull(),
    email: text().notNull().default(""),
    phone: text().notNull().default(""),
    message: text().notNull().default(""),
    details: jsonb().$type<Record<string, string>>().notNull().default({}),
    readAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.siteId, t.createdAt)],
);

// Prospects : formulaire de contact du portfolio et « faire appel à un développeur ».
export const leads = pgTable("leads", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text().notNull().default(""),
  topic: text().notNull(),
  message: text().notNull(),
  siteId: uuid().references(() => sites.id, { onDelete: "set null" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// Images stockées en base (redimensionnées côté navigateur avant envoi) : aucune dépendance de stockage en V1.
export const media = pgTable("media", {
  id: uuid().primaryKey().defaultRandom(),
  mime: text().notNull(),
  size: integer().notNull(),
  data: bytea().notNull(),
  createdAt: timestamp({ withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type User = typeof users.$inferSelect;
export type Site = typeof sites.$inferSelect;
export type SiteRequest = typeof requests.$inferSelect;
