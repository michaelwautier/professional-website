"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { submitLead, type LeadState } from "@/lib/actions/leads";

export function LeadForm({
  topics,
  siteId,
  defaultEmail = "",
  defaultName = "",
  submitLabel = "Envoyer mon message",
  messagePlaceholder = "Parlez-moi de votre activité et de ce que vous aimeriez faire…",
}: {
  topics: string[];
  siteId?: string;
  defaultEmail?: string;
  defaultName?: string;
  submitLabel?: string;
  messagePlaceholder?: string;
}) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <p className="mt-4 text-lg font-semibold">Message bien reçu, merci !</p>
        <p className="mt-1 text-muted">Je vous réponds sous 24 h ouvrées.</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="siteId" value={siteId ?? ""} />
      <Field label="Nom">
        <input name="name" required defaultValue={defaultName} autoComplete="name" className={inputClass} />
      </Field>
      <Field label="E-mail">
        <input name="email" type="email" required defaultValue={defaultEmail} autoComplete="email" className={inputClass} />
      </Field>
      <Field label="Téléphone (facultatif)">
        <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </Field>
      <Field label="Sujet">
        <select name="topic" className={inputClass} defaultValue={topics[0]}>
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </Field>
      <Field label="Votre message" className="sm:col-span-2">
        <textarea name="message" required rows={5} placeholder={messagePlaceholder} className={`${inputClass} resize-y`} />
      </Field>
      <div aria-hidden className="hidden">
        <input name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        {state.status === "error" ? <p className="text-sm text-danger">{state.message}</p> : <span />}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
