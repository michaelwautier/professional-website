import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { loginTokens, sessions, users } from "@/db/schema";
import { appUrl, PROTOCOL } from "@/lib/hosts";

const SESSION_COOKIE = "session";
const SESSION_DAYS = 30;
const LOGIN_TOKEN_MINUTES = 30;
const MAX_LINKS_PER_WINDOW = 3;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");

export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({ id: users.id, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    // Comparaison faite par Postgres : pas de `new Date()` pendant le rendu, que Next.js considère instable.
    .where(and(eq(sessions.tokenHash, hash(token)), gt(sessions.expiresAt, sql`now()`)))
    .limit(1);

  return row ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

export function isOwner(user: { email: string } | null) {
  return Boolean(user && process.env.OWNER_EMAIL && user.email === process.env.OWNER_EMAIL.toLowerCase());
}

export async function startSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ tokenHash: hash(token), userId, expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: PROTOCOL === "https",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hash(token)));
  jar.delete(SESSION_COOKIE);
}

export async function findOrCreateUser(email: string) {
  const normalized = email.trim().toLowerCase();
  const [created] = await db
    .insert(users)
    .values({ email: normalized })
    .onConflictDoNothing()
    .returning();
  if (created) return { user: created, created: true };

  const [existing] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  return { user: existing, created: false };
}

/** Crée un lien de connexion à usage unique. Renvoie null si trop de liens ont été demandés récemment. */
export async function createLoginLink(email: string) {
  const normalized = email.trim().toLowerCase();
  const windowStart = new Date(Date.now() - LOGIN_TOKEN_MINUTES * 60 * 1000);

  const [{ recent }] = await db
    .select({ recent: count() })
    .from(loginTokens)
    .where(and(eq(loginTokens.email, normalized), gt(loginTokens.createdAt, windowStart)));
  if (recent >= MAX_LINKS_PER_WINDOW) return null;

  const token = newToken();
  await db.insert(loginTokens).values({
    tokenHash: hash(token),
    email: normalized,
    expiresAt: new Date(Date.now() + LOGIN_TOKEN_MINUTES * 60 * 1000),
  });
  return appUrl(`/connexion/verifier?token=${token}`);
}

/** Consomme le jeton (une seule fois) et renvoie l'utilisateur correspondant. */
export async function consumeLoginToken(token: string) {
  const [row] = await db
    .delete(loginTokens)
    .where(and(eq(loginTokens.tokenHash, hash(token)), gt(loginTokens.expiresAt, new Date())))
    .returning({ email: loginTokens.email });
  if (!row) return null;

  const { user } = await findOrCreateUser(row.email);
  return user;
}
