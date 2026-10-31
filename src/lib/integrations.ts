import "server-only";
import { resolve4, resolveCname } from "node:dns/promises";
import Stripe from "stripe";

// Intégrations optionnelles : chaque fonction indique si le service est configuré, pour que l'app
// fonctionne en local sans aucune clé et bascule sur un parcours manuel (demande de contact).

export const PRO_PRICE_LABEL = "7 € / mois";

let stripe: Stripe | null | undefined;

export function getStripe() {
  if (stripe === undefined) {
    const key = process.env.STRIPE_SECRET_KEY;
    stripe = key && process.env.STRIPE_PRICE_ID ? new Stripe(key) : null;
  }
  return stripe;
}

const VERCEL_IP = "76.76.21.21";

function vercelApi(path: string, init?: RequestInit) {
  const { VERCEL_API_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID } = process.env;
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) return null;
  const url = new URL(`https://api.vercel.com${path.replace(":project", VERCEL_PROJECT_ID)}`);
  if (VERCEL_TEAM_ID) url.searchParams.set("teamId", VERCEL_TEAM_ID);
  return fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}`, "Content-Type": "application/json" },
  });
}

export const isVercelConfigured = () => Boolean(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);

/** Déclare le domaine sur le projet Vercel (qui gère ensuite le certificat HTTPS). */
export async function addDomainToProject(domain: string) {
  const res = await vercelApi("/v10/projects/:project/domains", {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });
  if (!res) return { ok: true as const };
  if (res.ok) return { ok: true as const };
  const data = await res.json().catch(() => ({}));
  // Déjà ajouté à ce projet : rien à faire.
  if (data?.error?.code === "domain_already_in_use" || res.status === 409) {
    return { ok: false as const, error: "Ce domaine est déjà utilisé par un autre site." };
  }
  return { ok: false as const, error: "Impossible d'ajouter ce domaine pour le moment. Réessayez plus tard." };
}

export async function removeDomainFromProject(domain: string) {
  await vercelApi(`/v9/projects/:project/domains/${domain}`, { method: "DELETE" });
}

/** Le domaine pointe-t-il bien vers l'hébergement ? Vercel si configuré, sinon lecture DNS directe. */
export async function isDomainConfigured(domain: string) {
  const res = await vercelApi(`/v6/domains/${domain}/config`);
  if (res?.ok) {
    const data = await res.json();
    return data.misconfigured === false;
  }

  const [a, cname] = await Promise.all([
    resolve4(domain).catch(() => [] as string[]),
    resolveCname(domain).catch(() => [] as string[]),
  ]);
  return a.includes(VERCEL_IP) || cname.some((c) => c.endsWith("vercel-dns.com"));
}

export const DNS_RECORDS = {
  apex: { type: "A", name: "@", value: VERCEL_IP },
  subdomain: { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
};
