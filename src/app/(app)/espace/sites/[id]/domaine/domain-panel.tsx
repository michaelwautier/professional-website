"use client";

import { Check, CircleAlert, ExternalLink, Globe, LoaderCircle, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Button, Card, inputClass } from "@/components/ui";
import {
  devActivatePro,
  openBillingPortal,
  removeCustomDomain,
  setCustomDomain,
  startProCheckout,
  verifyCustomDomain,
} from "@/lib/actions/billing";
import type { ActionResult } from "@/lib/actions/sites";

type Records = { apex: { type: string; name: string; value: string }; subdomain: { type: string; name: string; value: string } };

export function DomainPanel(props: {
  siteId: string;
  plan: "free" | "pro";
  domain: string | null;
  domainStatus: "pending" | "active" | null;
  hasBilling: boolean;
  stripeEnabled: boolean;
  isDev: boolean;
  justPaid: boolean;
  price: string;
  records: Records;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [domainInput, setDomainInput] = useState(props.domain ?? "");

  function run(action: () => Promise<ActionResult | void>, success?: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result && !result.ok) {
        // Sans Stripe, la demande est transmise : ce n'est pas une erreur pour l'utilisateur.
        setMessage({ tone: result.error.startsWith("Demande envoyée") ? "info" : "error", text: result.error });
      } else if (success) {
        setMessage({ tone: "info", text: success });
      }
    });
  }

  const feedback = message && (
    <p className={`mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${message.tone === "error" ? "bg-danger/5 text-danger" : "bg-accent-soft text-ink"}`}>
      {message.tone === "error" ? <CircleAlert className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0 text-success" />}
      {message.text}
    </p>
  );

  if (props.plan === "free") {
    return (
      <Card className="mt-8 overflow-hidden">
        <div className="bg-ink p-7 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" /> Formule Pro
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight">{props.price}</p>
          <p className="mt-1 text-white/70">Sans engagement, résiliable à tout moment.</p>
        </div>
        <div className="p-7">
          <ul className="space-y-3 text-[15px]">
            {[
              "Votre propre nom de domaine (mon-entreprise.fr)",
              "Certificat HTTPS sécurisé inclus",
              "Sans la mention « Site créé avec » en bas de page",
              "Aide prioritaire pour la mise en place",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <Check className="size-4 text-success" /> {feature}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">
            Le nom de domaine s&apos;achète chez un registraire (OVH, Gandi, IONOS…, environ 10 € par an). Vous n&apos;en avez
            pas encore ? Pas de souci, on vous guide.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="accent" disabled={pending} onClick={() => run(() => startProCheckout(props.siteId))}>
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              {props.stripeEnabled ? "Passer à la formule Pro" : "Je veux mon nom de domaine"}
            </Button>
            {props.isDev && !props.stripeEnabled && (
              <Button variant="secondary" disabled={pending} onClick={() => run(() => devActivatePro(props.siteId))}>
                Simuler le paiement (dev)
              </Button>
            )}
          </div>
          {feedback}
        </div>
      </Card>
    );
  }

  const isApex = (props.domain ?? "").split(".").length === 2;
  const record = isApex ? props.records.apex : props.records.subdomain;

  return (
    <div className="mt-8 space-y-5">
      {props.justPaid && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check className="size-4" /> Paiement confirmé, merci ! Reliez maintenant votre nom de domaine.
        </p>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent">
            <Globe className="size-5" />
          </span>
          <div>
            <p className="font-semibold">Votre nom de domaine</p>
            <p className="text-sm text-muted">Saisissez le domaine que vous avez acheté, sans « www ».</p>
          </div>
        </div>
        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => setCustomDomain(props.siteId, domainInput));
          }}
        >
          <input
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="mon-entreprise.fr"
            className={`${inputClass} font-mono`}
            aria-label="Nom de domaine"
          />
          <Button type="submit" variant="primary" disabled={pending || !domainInput.trim()}>
            {props.domain ? "Modifier" : "Relier ce domaine"}
          </Button>
        </form>
        {feedback}
      </Card>

      {props.domain && props.domainStatus === "pending" && (
        <Card className="p-6">
          <p className="font-semibold">Dernière étape : configurez votre domaine</p>
          <p className="mt-1 text-sm text-muted">
            Chez votre registraire (OVH, Gandi, IONOS…), ouvrez la zone DNS de <strong className="text-ink">{props.domain}</strong> et
            ajoutez cet enregistrement :
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-xs text-muted uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Nom</th>
                  <th className="px-4 py-2 font-medium">Valeur</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr>
                  <td className="px-4 py-3">{record.type}</td>
                  <td className="px-4 py-3">{isApex ? record.name : (props.domain ?? "").split(".")[0]}</td>
                  <td className="px-4 py-3">{record.value}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">La prise en compte peut prendre de quelques minutes à 24 h.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="accent" disabled={pending} onClick={() => run(() => verifyCustomDomain(props.siteId), "Votre domaine est actif !")}>
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              Vérifier la configuration
            </Button>
            <Button variant="ghost" disabled={pending} onClick={() => run(() => removeCustomDomain(props.siteId))}>
              Retirer ce domaine
            </Button>
          </div>
        </Card>
      )}

      {props.domain && props.domainStatus === "active" && (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="flex items-center gap-2 font-semibold text-emerald-700">
              <Check className="size-4" /> Domaine actif
            </p>
            <a href={`https://${props.domain}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm hover:underline">
              https://{props.domain} <ExternalLink className="size-3.5" />
            </a>
          </div>
          <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => removeCustomDomain(props.siteId))}>
            Retirer ce domaine
          </Button>
        </Card>
      )}

      {props.hasBilling && (
        <form action={openBillingPortal.bind(null, props.siteId)}>
          <button type="submit" className="text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
            Gérer mon abonnement et mes factures
          </button>
        </form>
      )}
    </div>
  );
}
