import "server-only";
import { profile } from "@/content/profile";

type Email = { to: string; subject: string; text: string; html?: string; replyTo?: string };

/**
 * Envoie un e-mail via Resend. Sans clé API (en local), l'e-mail est affiché dans la console du serveur.
 * Ne lève jamais d'erreur : un e-mail raté ne doit pas faire échouer l'action de l'utilisateur.
 */
export async function sendEmail(email: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`\n✉️  E-mail (non envoyé, RESEND_API_KEY absente)\nÀ : ${email.to}\nObjet : ${email.subject}\n\n${email.text}\n`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? `${profile.name} <onboarding@resend.dev>`,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html ?? textToHtml(email.text),
        reply_to: email.replyTo,
      }),
    });
    if (!res.ok) console.error("Échec d'envoi de l'e-mail", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("Échec d'envoi de l'e-mail", error);
    return false;
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function textToHtml(text: string) {
  const body = escapeHtml(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, "<br>");
  return `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">${body}</div>`;
}

export function loginEmail(url: string) {
  return {
    subject: "Votre lien de connexion",
    text: `Bonjour,\n\nCliquez sur ce lien pour accéder à votre espace (valable 30 minutes) :\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.\n\n${profile.name}`,
  };
}
