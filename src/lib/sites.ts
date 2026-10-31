import "server-only";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { requests, sites, type Site } from "@/db/schema";

export const siteTag = (id: string) => `site:${id}`;
export const siteKeyTag = (key: string) => `site-key:${key}`;

/** Tous les tags à invalider quand un site change (contenu, adresse ou domaine). */
export function tagsForSite(site: Pick<Site, "id" | "slug" | "customDomain">) {
  const tags = [siteTag(site.id), siteKeyTag(site.slug)];
  if (site.customDomain) tags.push(siteKeyTag(site.customDomain));
  return tags;
}

export type PublicSite = Pick<
  Site,
  "id" | "slug" | "type" | "content" | "plan" | "customDomain" | "domainStatus"
>;

/**
 * Site publié servi à une adresse donnée (sous-domaine ou domaine perso).
 * Mis en cache jusqu'à la prochaine modification : les sites clients sont servis sans requête SQL.
 */
export async function getPublicSite(key: string): Promise<PublicSite | null> {
  "use cache";
  cacheLife("max");
  cacheTag(siteKeyTag(key));

  const where = key.includes(".")
    ? and(eq(sites.customDomain, key), eq(sites.plan, "pro"), eq(sites.domainStatus, "active"))
    : eq(sites.slug, key);

  const [site] = await db
    .select({
      id: sites.id,
      slug: sites.slug,
      type: sites.type,
      content: sites.content,
      plan: sites.plan,
      customDomain: sites.customDomain,
      domainStatus: sites.domainStatus,
      published: sites.published,
    })
    .from(sites)
    .where(where)
    .limit(1);

  if (!site) return null;
  cacheTag(siteTag(site.id));

  const { published, ...publicSite } = site;
  return published ? publicSite : null;
}

export async function isSlugTaken(slug: string) {
  const [row] = await db.select({ id: sites.id }).from(sites).where(eq(sites.slug, slug)).limit(1);
  return Boolean(row);
}

export async function getUserSites(userId: string) {
  const unread = db
    .select({ siteId: requests.siteId, unread: count().as("unread") })
    .from(requests)
    .where(isNull(requests.readAt))
    .groupBy(requests.siteId)
    .as("unread");

  return db
    .select({ site: sites, unread: unread.unread })
    .from(sites)
    .leftJoin(unread, eq(unread.siteId, sites.id))
    .where(eq(sites.userId, userId))
    .orderBy(desc(sites.createdAt));
}

/** Renvoie le site seulement s'il appartient à l'utilisateur : à utiliser dans toute action de l'espace client. */
export const getOwnedSite = cache(async (userId: string, siteId: string) => {
  if (!/^[0-9a-f-]{36}$/.test(siteId)) return null;
  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
    .limit(1);
  return site ?? null;
});

export async function getSiteRequests(siteId: string) {
  return db.select().from(requests).where(eq(requests.siteId, siteId)).orderBy(desc(requests.createdAt)).limit(200);
}

export async function countUnreadRequests(siteId: string) {
  const [row] = await db
    .select({ unread: count() })
    .from(requests)
    .where(and(eq(requests.siteId, siteId), isNull(requests.readAt)));
  return row.unread;
}
