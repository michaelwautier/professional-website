"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { REQUEST_KIND } from "@/lib/request-schema";
import type { Service, SiteType } from "@/lib/site-schema";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string; fields: Record<string, string> };

const SLOTS = ["Matin", "Midi", "Après-midi", "Fin de journée", "Peu importe"];

export function RequestForm({
  siteId,
  type,
  services,
  businessName,
  preview,
}: {
  siteId?: string;
  type: SiteType;
  services: Service[];
  businessName: string;
  preview: boolean;
}) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const fieldErrors = status.state === "error" ? status.fields : {};

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || !siteId) return;

    setStatus({ state: "sending" });
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, siteId, kind: REQUEST_KIND[type] }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return setStatus({ state: "sent" });
      setStatus({
        state: "error",
        message: data.error ?? "L'envoi a échoué, réessayez dans un instant.",
        fields: data.fields ?? {},
      });
    } catch {
      setStatus({ state: "error", message: "Connexion impossible, vérifiez votre réseau.", fields: {} });
    }
  }

  if (status.state === "sent") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-site border border-site-border bg-site-bg p-8">
        <CheckCircle2 className="size-10 text-site-brand" />
        <p className="site-heading text-2xl">Merci, c&apos;est envoyé !</p>
        <p className="text-site-muted">
          {businessName} a bien reçu votre demande et vous recontacte rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-site border border-site-border bg-site-bg p-6 @3xl:grid-cols-2 @3xl:p-8" noValidate>
      {type === "rendezvous" && services.length > 0 && (
        <Field label="Prestation" className="@3xl:col-span-2" error={fieldErrors.service}>
          <select name="service" className={inputClass} defaultValue={services[0]?.name}>
            {services.map((s, i) => (
              <option key={i} value={s.name}>
                {s.name}
                {s.price ? ` · ${s.price}` : ""}
              </option>
            ))}
            <option value="Autre">Autre / je ne sais pas</option>
          </select>
        </Field>
      )}

      {type !== "vitrine" && (
        <>
          <Field label="Date souhaitée" error={fieldErrors.date}>
            <input type="date" name="date" required className={inputClass} />
          </Field>
          {type === "rendezvous" ? (
            <Field label="Créneau" error={fieldErrors.time}>
              <select name="time" className={inputClass} defaultValue="Peu importe">
                {SLOTS.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Heure" error={fieldErrors.time}>
              <input type="time" name="time" required step={900} className={inputClass} />
            </Field>
          )}
        </>
      )}

      {type === "restaurant" && (
        <Field label="Nombre de couverts" className="@3xl:col-span-2" error={fieldErrors.guests}>
          <select name="guests" className={inputClass} defaultValue="2">
            {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => (
              <option key={n} value={n}>
                {n} {n === "1" ? "personne" : "personnes"}
              </option>
            ))}
            <option value="Plus de 12">Plus de 12 personnes</option>
          </select>
        </Field>
      )}

      <Field label="Nom" error={fieldErrors.name}>
        <input name="name" required autoComplete="name" className={inputClass} />
      </Field>
      <Field label="Téléphone" error={fieldErrors.phone}>
        <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </Field>
      <Field label="E-mail" className="@3xl:col-span-2" error={fieldErrors.email}>
        <input name="email" type="email" autoComplete="email" className={inputClass} />
      </Field>
      <Field
        label={type === "vitrine" ? "Votre demande" : "Message (facultatif)"}
        className="@3xl:col-span-2"
        error={fieldErrors.message}
      >
        <textarea name="message" rows={type === "vitrine" ? 5 : 3} className={`${inputClass} resize-y`} />
      </Field>

      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Ne pas remplir
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-3 @3xl:col-span-2">
        {status.state === "error" && <p className="text-sm text-red-700">{status.message}</p>}
        <button
          type="submit"
          disabled={preview || status.state === "sending"}
          className="inline-flex items-center justify-center gap-2 rounded-site bg-site-brand px-6 py-3.5 font-medium text-site-brand-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.state === "sending" && <LoaderCircle className="size-4 animate-spin" />}
          Envoyer la demande
        </button>
        {preview && <p className="text-center text-xs text-site-muted">Aperçu : le formulaire sera actif une fois le site créé.</p>}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-site border border-site-border bg-site-bg px-4 py-3 text-site-text outline-none transition placeholder:text-site-muted/60 focus:border-site-brand focus:ring-2 focus:ring-site-brand/20";

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium ${className}`}>
      {label}
      {children}
      {error && <span className="text-xs font-normal text-red-700">{error}</span>}
    </label>
  );
}
