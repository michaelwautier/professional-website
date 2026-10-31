"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { requestLoginLink, type LoginState } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLoginLink, { status: "idle" });
  const expired = useSearchParams().get("erreur") === "lien";

  if (state.status === "sent") {
    return (
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
          <MailCheck className="size-6" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">Vérifiez votre boîte mail</h2>
        <p className="mt-2 text-[15px] text-muted">
          Un lien de connexion vient d&apos;être envoyé à <strong className="text-ink">{state.email}</strong>. Il est
          valable 30 minutes.
        </p>
        {state.devLink && (
          <a href={state.devLink} className="mt-6 block rounded-xl border border-dashed border-accent bg-accent-soft/40 p-3 text-sm font-medium text-accent">
            Mode développement : ouvrir le lien de connexion
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {expired && (
        <p className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
          Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.
        </p>
      )}
      <Field label="Adresse e-mail" error={state.status === "error" ? state.message : undefined}>
        <input name="email" type="email" required autoComplete="email" autoFocus placeholder="vous@exemple.fr" className={inputClass} />
      </Field>
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        Recevoir mon lien de connexion
      </Button>
    </form>
  );
}
