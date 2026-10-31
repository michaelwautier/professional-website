import {
  AppWindow,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  Check,
  CreditCard,
  Keyboard,
  LayoutTemplate,
  LifeBuoy,
  Mail,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { buttonClass } from "@/components/ui";
import { methodSteps, profile, projects, services, skills, type Project } from "@/content/profile";
import { ROOT_DOMAIN, siteUrl } from "@/lib/hosts";
import { PRO_PRICE_LABEL } from "@/lib/integrations";
import { TYPE_META } from "@/lib/presets";
import type { SiteType } from "@/lib/site-schema";

const SERVICE_ICONS = { layout: LayoutTemplate, app: AppWindow, mobile: Smartphone, payment: CreditCard, support: LifeBuoy };
const PROJECT_ICONS: Record<Project["icon"], typeof Wallet> = {
  wallet: Wallet,
  calendar: CalendarDays,
  cart: ShoppingCart,
  keyboard: Keyboard,
};
const TYPE_ICONS: Record<SiteType, typeof Store> = { vitrine: Store, rendezvous: CalendarCheck, restaurant: UtensilsCrossed };
const DEMOS: Record<SiteType, string> = { vitrine: "demo-artisan", rendezvous: "demo-coiffure", restaurant: "demo-restaurant" };

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Skills />
      <Services />
      <Projects />
      <Builder />
      <Method />
      <Faq />
      <Contact />
    </main>
  );
}

function SectionHeading({ eyebrow, title, intro, light = false }: { eyebrow: string; title: React.ReactNode; intro?: string; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={`font-mono text-xs tracking-widest uppercase ${light ? "text-white/50" : "text-accent"}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl ${light ? "text-white" : ""}`}>{title}</h2>
      {intro && <p className={`mt-5 text-lg leading-relaxed ${light ? "text-white/65" : "text-muted"}`}>{intro}</p>}
    </div>
  );
}

const Serif = ({ children }: { children: React.ReactNode }) => (
  <span className="font-display font-normal tracking-normal italic">{children}</span>
);

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-line)_1px,transparent_0)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[size:28px_28px]" />
      <div aria-hidden className="absolute -top-32 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-20 md:pt-24 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink-soft">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {profile.availability}
          </p>
          <h1 className="mt-7 text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance md:text-7xl">
            Des sites web qui <Serif>travaillent</Serif> pour vous.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">{profile.intro}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/#contact" className={buttonClass("primary", "lg")}>
              Parlons de votre projet <ArrowRight className="size-4" />
            </Link>
            <Link href="/creer" className={buttonClass("secondary", "lg")}>
              <Sparkles className="size-4 text-accent" /> Créer mon site gratuitement
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">{profile.location}</p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/** Composition décorative : trois mini-sites générés par l'outil, empilés. */
function HeroVisual() {
  const cards = [
    { name: "Atelier Léa", type: "Coiffure · Lyon", color: "#9f1239", font: "var(--font-playfair)", lines: ["Coupe femme", "Couleur", "Brushing"], rotate: "-rotate-6", pos: "left-0 top-10" },
    { name: "La Table de Jeanne", type: "Restaurant · Bordeaux", color: "#c2410c", font: "var(--font-fraunces)", lines: ["Velouté du moment", "Poisson du jour", "Mousse au chocolat"], rotate: "rotate-3", pos: "right-0 top-0" },
    { name: "Martin Rénovation", type: "Artisan · Nantes", color: "#1e3a8a", font: "var(--font-geist-sans)", lines: ["Dépannage rapide", "Rénovation", "Devis gratuit"], rotate: "-rotate-1", pos: "left-12 bottom-0" },
  ];
  return (
    <div aria-hidden className="relative mx-auto hidden h-[440px] w-full max-w-[480px] lg:block">
      {cards.map((card) => (
        <div key={card.name} className={`absolute w-72 overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-ink/10 ${card.rotate} ${card.pos}`}>
          <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
            <span className="size-2 rounded-full bg-line" />
            <span className="size-2 rounded-full bg-line" />
            <span className="size-2 rounded-full bg-line" />
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg text-xs font-semibold text-white" style={{ background: card.color }}>
                {card.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <div>
                <p className="text-[15px] leading-tight font-semibold" style={{ fontFamily: card.font }}>{card.name}</p>
                <p className="text-[11px] text-muted">{card.type}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {card.lines.map((line) => (
                <li key={line} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-xs">
                  {line}
                  <span className="h-1.5 w-8 rounded-full" style={{ background: card.color, opacity: 0.3 }} />
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg py-2 text-center text-xs font-medium text-white" style={{ background: card.color }}>
              Réserver
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Skills() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-6">
        <p className="font-mono text-xs tracking-widest text-muted uppercase">Technologies</p>
        {skills.map((skill) => (
          <span key={skill} className="text-sm font-medium text-ink-soft">{skill}</span>
        ))}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <SectionHeading
          eyebrow="Services"
          title={<>Du site vitrine à l&apos;application <Serif>sur-mesure</Serif></>}
          intro="Que vous lanciez votre activité ou que vous cherchiez à automatiser votre quotidien, je vous propose une solution adaptée à votre taille et à votre budget."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = SERVICE_ICONS[service.icon as keyof typeof SERVICE_ICONS];
            return (
              <article key={service.title} className="group rounded-2xl border border-line bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5">
                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{service.description}</p>
              </article>
            );
          })}
          <Link href="/#contact" className="flex flex-col justify-between rounded-2xl bg-ink p-7 text-white transition hover:bg-ink-soft">
            <p className="text-lg font-semibold">Un autre besoin ?</p>
            <p className="mt-2 text-white/65">Chaque projet est unique. Décrivez-moi le vôtre, je vous réponds sous 24 h.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
              Parlons-en <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projets" className="scroll-mt-16 border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <SectionHeading
          eyebrow="Projets"
          title={<>Quelques réalisations <Serif>récentes</Serif></>}
          intro="Applications web, outils métiers, apps mobiles : des produits utilisés au quotidien, conçus de bout en bout."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {projects.map((project) => {
            const Icon = PROJECT_ICONS[project.icon];
            return (
              <article key={project.name} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-paper">
                <div className="relative h-52 overflow-hidden" style={{ background: project.accent }}>
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] bg-[size:18px_18px]" />
                  <div aria-hidden className="absolute -right-10 -bottom-16 size-64 rounded-full bg-white/10 transition duration-500 group-hover:scale-110" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-4 text-white">
                    <span className="grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                      <Icon className="size-7" />
                    </span>
                    <div>
                      <p className="text-2xl font-semibold tracking-tight">{project.name}</p>
                      <p className="text-sm text-white/75">{project.kind}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="leading-relaxed text-ink-soft">{project.description}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-muted">
                        <Check className="size-4 shrink-0" style={{ color: project.accent }} /> {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
                    <div className="flex flex-wrap gap-1.5">
                      {project.stack.map((tech) => (
                        <span key={tech} className="rounded-full border border-line bg-white px-2.5 py-1 font-mono text-[11px] text-ink-soft">{tech}</span>
                      ))}
                    </div>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
                        Voir le projet <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Builder() {
  return (
    <section id="creer" className="relative scroll-mt-16 overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute top-0 right-0 h-[30rem] w-[30rem] translate-x-1/3 -translate-y-1/3 rounded-full bg-accent/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5 py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <SectionHeading
            light
            eyebrow={`${profile.builderName} · création de site en libre-service`}
            title={<>Pas encore de site ? En ligne en <Serif>5 minutes</Serif>.</>}
            intro="Répondez à quelques questions, choisissez vos couleurs : votre site professionnel est en ligne immédiatement, gratuitement, et vous le modifiez quand vous voulez."
          />
          <ul className="space-y-3 text-white/80">
            {[
              "Gratuit, sans carte bancaire",
              `Votre propre nom de domaine pour ${PRO_PRICE_LABEL}`,
              "Formulaires de contact, rendez-vous et réservation",
              "Rapide, adapté au mobile et bien référencé",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10">
                  <Check className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {(Object.keys(TYPE_META) as SiteType[]).map((type) => {
            const Icon = TYPE_ICONS[type];
            const meta = TYPE_META[type];
            return (
              <div key={type} className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-white/25 hover:bg-white/[0.07]">
                <span className="grid size-11 place-items-center rounded-xl bg-white text-ink">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-6 text-xl font-semibold">{meta.label}</h3>
                <p className="mt-2 leading-relaxed text-white/65">{meta.pitch}</p>
                <p className="mt-3 text-sm text-white/45">{meta.examples}</p>
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
                  <Link href={`/creer/${type}`} className={buttonClass("secondary", "md")}>
                    Créer ce site <ArrowRight className="size-4" />
                  </Link>
                  <a href={siteUrl(DEMOS[type])} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
                    Voir un exemple
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-white/55">
          Besoin d&apos;une boutique en ligne ou d&apos;une fonctionnalité sur-mesure ?{" "}
          <Link href="/#contact" className="font-medium text-white underline underline-offset-4">Je m&apos;en occupe pour vous.</Link>
        </p>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading eyebrow="Méthode" title={<>Un projet clair, <Serif>du début à la fin</Serif></>} />
      <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
        {methodSteps.map((step, i) => (
          <li key={step.title} className="bg-white p-7">
            <span className="font-display text-5xl text-accent italic">{i + 1}</span>
            <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const FAQ = [
  {
    q: `Combien coûte un site créé avec ${profile.builderName} ?`,
    a: `Rien : votre site est gratuit et en ligne sur une adresse du type votre-nom.${ROOT_DOMAIN.split(":")[0]}. Si vous voulez votre propre nom de domaine (mon-entreprise.fr) et retirer la mention en bas de page, la formule Pro coûte ${PRO_PRICE_LABEL}, sans engagement.`,
  },
  {
    q: "Je ne suis pas à l'aise avec l'informatique, est-ce pour moi ?",
    a: "Oui, c'est fait pour ça. Les textes et prestations sont préremplis selon votre métier : vous n'avez qu'à les ajuster. Et si vous bloquez, vous pouvez me confier la suite depuis votre espace.",
  },
  {
    q: "Puis-je modifier mon site après sa mise en ligne ?",
    a: "À tout moment, depuis votre espace client : textes, prix, horaires, photos, couleurs. Les changements sont visibles immédiatement.",
  },
  {
    q: "Mon site sera-t-il visible sur Google ?",
    a: "Les sites sont rapides, adaptés au mobile et structurés pour le référencement local. Pour aller plus loin (fiche Google, contenu optimisé), je peux vous accompagner.",
  },
  {
    q: "Et pour un projet sur-mesure, comment ça se passe ?",
    a: "On commence par un échange gratuit pour comprendre votre besoin. Je vous envoie ensuite un devis détaillé avec un planning, puis je développe par étapes en vous montrant l'avancement.",
  },
];

function Faq() {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading eyebrow="Questions fréquentes" title={<>Vous vous <Serif>demandez</Serif> peut-être…</>} />
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pr-12 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title={<>Parlons de votre <Serif>projet</Serif></>}
            intro="Une idée, un besoin, une question ? Écrivez-moi : je réponds personnellement sous 24 h ouvrées, et le premier échange est toujours gratuit."
          />
          <a href={`mailto:${profile.email}`} className="mt-8 inline-flex items-center gap-3 text-lg font-medium hover:text-accent">
            <span className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-line">
              <Mail className="size-5" />
            </span>
            {profile.email}
          </a>
        </div>
        <div className="rounded-3xl border border-line bg-white p-7 shadow-xl shadow-ink/5 md:p-9">
          <LeadForm topics={["Site vitrine", "Application web sur-mesure", "Application mobile", "Boutique en ligne", "Maintenance / évolution", "Autre"]} />
        </div>
      </div>
    </section>
  );
}
