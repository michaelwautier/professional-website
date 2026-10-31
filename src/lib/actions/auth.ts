"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { consumeLoginToken, createLoginLink, endSession, startSession } from "@/lib/auth";
import { loginEmail, sendEmail } from "@/lib/email";

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string; devLink?: string }
  | { status: "error"; message: string };

export async function requestLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { status: "error", message: "Cette adresse e-mail ne semble pas valide." };

  const link = await createLoginLink(parsed.data);
  if (!link) return { status: "error", message: "Trop de liens demandés. Réessayez dans quelques minutes." };

  const sent = await sendEmail({ to: parsed.data, ...loginEmail(link) });
  // En local sans service d'e-mail, le lien est affiché directement pour pouvoir tester.
  const devLink = !sent && process.env.NODE_ENV === "development" ? link : undefined;
  return { status: "sent", email: parsed.data, devLink };
}

export async function verifyLogin(formData: FormData) {
  const user = await consumeLoginToken(String(formData.get("token") ?? ""));
  if (!user) redirect("/connexion?erreur=lien");
  await startSession(user.id);
  redirect("/espace");
}

export async function logout() {
  await endSession();
  redirect("/");
}
