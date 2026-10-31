// Utilisable partout : proxy, serveur et navigateur.

export const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3100").toLowerCase();

const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(ROOT_DOMAIN) || ROOT_DOMAIN.includes(".localhost");

export const PROTOCOL = isLocal ? "http" : "https";

export function appUrl(path = "/") {
  return `${PROTOCOL}://${ROOT_DOMAIN}${path}`;
}

export function siteHost(slug: string) {
  return `${slug}.${ROOT_DOMAIN}`;
}

export function siteUrl(slug: string) {
  return `${PROTOCOL}://${siteHost(slug)}`;
}

/** Domaine public d'un site : son domaine perso actif s'il en a un, sinon son sous-domaine. */
export function publicSiteUrl(site: {
  slug: string;
  plan: string;
  customDomain: string | null;
  domainStatus: string | null;
}) {
  if (site.plan === "pro" && site.customDomain && site.domainStatus === "active") {
    return `https://${site.customDomain}`;
  }
  return siteUrl(site.slug);
}

/**
 * Détermine quel site client sert une requête à partir de son en-tête Host.
 * - `null` : c'est l'application principale (portfolio, création, espace client).
 * - une valeur sans point : un sous-domaine (`boulangerie-dupont`).
 * - une valeur avec un point : un domaine personnalisé (`boulangerie-dupont.fr`).
 */
export function tenantFromHost(rawHost: string | null): string | null {
  if (!rawHost || rawHost.startsWith("[")) return null;
  // Le port est ignoré : en local, le serveur peut tourner sur un autre port que celui du domaine racine.
  const hostname = rawHost.toLowerCase().split(":")[0].replace(/\.$/, "");
  const root = ROOT_DOMAIN.split(":")[0];

  if (hostname === root || hostname === `www.${root}`) return null;

  if (hostname.endsWith(`.${root}`)) {
    const sub = hostname.slice(0, -(root.length + 1));
    if (sub === "www") return null;
    // Un sous-sous-domaine ne correspond à aucun site : on le laisse finir en 404.
    return sub.includes(".") ? `invalid.${sub}` : sub;
  }

  if (
    hostname === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    hostname.endsWith(".vercel.app")
  ) {
    return null;
  }

  return hostname.replace(/^www\./, "");
}

export function normalizeDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "")
    .replace(/\.$/, "");
}

export const DOMAIN_REGEX = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
