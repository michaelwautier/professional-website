import { ArrowRight, CalendarCheck, Check, Store, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/content/profile";
import { siteUrl } from "@/lib/hosts";
import { TYPE_META } from "@/lib/presets";
import type { SiteType } from "@/lib/site-schema";

export const metadata: Metadata = {
  title: "Créer mon site gratuitement",
  description: "Créez le site de votre activité en quelques minutes : site vitrine, prise de rendez-vous ou restaurant. Gratuit, sans compétence technique.",
};

const TYPES: { type: SiteType; icon: typeof Store; demo: string }[] = [
  { type: "vitrine", icon: Store, demo: "demo-artisan" },
  { type: "rendezvous", icon: CalendarCheck, demo: "demo-coiffure" },
  { type: "restaurant", icon: UtensilsCrossed, demo: "demo-restaurant" },
];

export default function ChooseTypePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">{profile.builderName}</p>
        <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
          Quel site voulez-vous <span className="font-display font-normal italic">créer</span> ?
        </h1>
        <p className="mt-5 text-lg text-muted">
          Choisissez le modèle le plus proche de votre activité. Tout reste modifiable, et votre site est en ligne dès la
          dernière étape.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {TYPES.map(({ type, icon: Icon, demo }) => {
          const meta = TYPE_META[type];
          return (
            <div key={type} className="group relative flex flex-col rounded-3xl border border-line bg-white p-8 transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-white">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight">{meta.label}</h2>
              <p className="mt-2 leading-relaxed text-muted">{meta.pitch}</p>
              <p className="mt-4 text-sm text-ink-soft">
                <span className="font-medium">Idéal pour :</span> {meta.examples.toLowerCase()}
              </p>
              <div className="mt-auto pt-8">
                <Link href={`/creer/${type}`} className="flex items-center justify-between rounded-full bg-ink px-5 py-3 font-medium text-white transition after:absolute after:inset-0 group-hover:bg-accent">
                  Commencer <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </Link>
                <a href={siteUrl(demo)} target="_blank" rel="noopener noreferrer" className="relative z-10 mt-3 block text-center text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                  Voir un exemple
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <ul className="mx-auto mt-14 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-ink-soft">
        {["Gratuit, sans carte bancaire", "Aucune compétence technique", "Modifiable à tout moment", "Votre nom de domaine en option"].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check className="size-4 text-success" /> {item}
          </li>
        ))}
      </ul>
    </main>
  );
}
