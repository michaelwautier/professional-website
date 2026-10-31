// Rendu d'un site client. Sans "use client" : composant serveur pour le site en ligne,
// composant client quand il est importé par l'aperçu en direct de l'assistant.
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { profile } from "@/content/profile";
import { appUrl } from "@/lib/hosts";
import { TYPE_META } from "@/lib/presets";
import { DAYS, type SiteContent, type SiteType } from "@/lib/site-schema";
import { themeVars } from "@/lib/themes";
import { FacebookIcon, InstagramIcon } from "./icons";
import { RequestForm } from "./request-form";

export type SiteViewData = {
  id?: string;
  slug: string;
  type: SiteType;
  content: SiteContent;
  plan: "free" | "pro";
};

const SECTION_IDS: Record<SiteType, { offer: string; form: string; offerLabel: string }> = {
  vitrine: { offer: "services", form: "contact", offerLabel: "Services" },
  rendezvous: { offer: "prestations", form: "rendez-vous", offerLabel: "Prestations" },
  restaurant: { offer: "carte", form: "reservation", offerLabel: "La carte" },
};

export function SiteView({ site, preview = false }: { site: SiteViewData; preview?: boolean }) {
  const { content, type } = site;
  const meta = TYPE_META[type];
  const ids = SECTION_IDS[type];
  const hasOffer = type === "restaurant" ? content.menu.length > 0 : content.services.length > 0;
  const name = content.businessName || "Votre entreprise";

  return (
    <div
      className="site-root @container flex min-h-full flex-col bg-site-bg font-site-body text-site-text"
      style={themeVars(content.theme)}
    >
      <header className="sticky top-0 z-20 border-b border-site-border bg-site-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 @3xl:h-20 @3xl:px-8">
          <a href="#accueil" className="flex min-w-0 items-center gap-3">
            <Logo content={content} />
            <span className="site-heading truncate text-lg @3xl:text-xl">{name}</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-site-muted @4xl:flex">
            <a href="#a-propos" className="transition hover:text-site-text">À propos</a>
            {hasOffer && <a href={`#${ids.offer}`} className="transition hover:text-site-text">{ids.offerLabel}</a>}
            <a href="#infos" className="transition hover:text-site-text">Infos pratiques</a>
          </nav>
          <a
            href={`#${ids.form}`}
            className="hidden shrink-0 rounded-site bg-site-brand px-4 py-2.5 text-sm font-medium text-site-brand-ink transition hover:opacity-90 @xl:inline-flex"
          >
            {meta.cta}
          </a>
        </div>
      </header>

      <main className="flex-1">
        <Hero site={site} name={name} />
        <About content={content} />
        {hasOffer && type === "restaurant" && <Menu content={content} id={ids.offer} title={meta.servicesTitle} />}
        {hasOffer && type !== "restaurant" && (
          <Services content={content} id={ids.offer} title={meta.servicesTitle} withDetails={type === "rendezvous"} />
        )}
        {content.images.gallery.length > 0 && <Gallery images={content.images.gallery} name={name} />}
        <Infos content={content} />
        <section id={ids.form} className="scroll-mt-20 bg-site-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 @3xl:px-8 @4xl:grid-cols-[1fr_1.3fr] @4xl:py-24">
            <div>
              <h2 className="site-heading text-3xl @3xl:text-4xl">{meta.formTitle}</h2>
              <p className="mt-4 max-w-md text-site-muted">{meta.formIntro}</p>
              {content.contact.phone && (
                <p className="mt-6 text-sm text-site-muted">
                  Vous préférez appeler ?{" "}
                  <a href={`tel:${content.contact.phone.replace(/\s/g, "")}`} className="font-medium text-site-text underline underline-offset-4">
                    {content.contact.phone}
                  </a>
                </p>
              )}
            </div>
            <RequestForm siteId={site.id} type={type} services={content.services} businessName={name} preview={preview} />
          </div>
        </section>
      </main>

      <footer className="border-t border-site-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-site-muted @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:px-8">
          <p>
            © {name}
            {content.city && ` · ${content.city}`}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="/mentions-legales" className="hover:text-site-text">Mentions légales</a>
            {site.plan === "free" && (
              <a
                href={appUrl(`/?ref=${site.slug}`)}
                className="inline-flex items-center gap-1.5 rounded-full border border-site-border px-3 py-1 text-xs hover:text-site-text"
              >
                Site créé avec <strong className="font-semibold">{profile.builderName}</strong>
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Barre d'action collée en bas sur mobile : sticky plutôt que fixed pour fonctionner aussi dans l'aperçu */}
      <div className="sticky bottom-0 z-20 flex gap-2 border-t border-site-border bg-site-bg/95 p-3 backdrop-blur @3xl:hidden">
        {content.contact.phone && (
          <a
            href={`tel:${content.contact.phone.replace(/\s/g, "")}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-site border border-site-border py-3 text-sm font-medium"
          >
            <Phone className="size-4" /> Appeler
          </a>
        )}
        <a
          href={`#${ids.form}`}
          className="flex flex-[1.4] items-center justify-center rounded-site bg-site-brand py-3 text-sm font-medium text-site-brand-ink"
        >
          {meta.cta}
        </a>
      </div>
    </div>
  );
}

function SiteImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // Images déjà redimensionnées à l'envoi : pas besoin de l'optimiseur d'images.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
}

function Logo({ content }: { content: SiteContent }) {
  if (content.images.logo) {
    return <SiteImage src={content.images.logo} alt="" className="size-9 shrink-0 rounded-site object-contain @3xl:size-11" />;
  }
  const initials = (content.businessName || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span className="site-heading grid size-9 shrink-0 place-items-center rounded-site bg-site-brand text-sm text-site-brand-ink @3xl:size-11 @3xl:text-base">
      {initials}
    </span>
  );
}

function Hero({ site, name }: { site: SiteViewData; name: string }) {
  const { content, type } = site;
  const meta = TYPE_META[type];
  const ids = SECTION_IDS[type];
  const centered = content.theme.style === "elegant";
  const cover = content.images.cover;

  const text = (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      {content.city && (
        <p className={`flex items-center gap-2 text-sm font-medium tracking-wide text-site-brand uppercase ${centered ? "justify-center" : ""}`}>
          <MapPin className="size-4" /> {content.city}
        </p>
      )}
      <h1 className="site-heading mt-5 text-4xl leading-[1.05] @xl:text-5xl @4xl:text-6xl">{name}</h1>
      {content.tagline && <p className="mt-6 text-lg leading-relaxed text-site-muted @3xl:text-xl">{content.tagline}</p>}
      <div className={`mt-9 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>
        <a
          href={`#${ids.form}`}
          className="inline-flex items-center gap-2 rounded-site bg-site-brand px-6 py-3.5 font-medium text-site-brand-ink transition hover:opacity-90"
        >
          {meta.cta} <ArrowRight className="size-4" />
        </a>
        {content.contact.phone ? (
          <a
            href={`tel:${content.contact.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 rounded-site border border-site-border bg-site-bg px-6 py-3.5 font-medium transition hover:border-site-text"
          >
            <Phone className="size-4" /> {content.contact.phone}
          </a>
        ) : (
          <a
            href={`#${ids.offer}`}
            className="inline-flex items-center gap-2 rounded-site border border-site-border bg-site-bg px-6 py-3.5 font-medium transition hover:border-site-text"
          >
            {type === "restaurant" ? "Voir la carte" : `Voir les ${ids.offerLabel.toLowerCase()}`}
          </a>
        )}
      </div>
    </div>
  );

  return (
    <section id="accueil" className="relative overflow-hidden">
      {/* Halo décoratif aux couleurs de la marque */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-site-brand opacity-[0.07] blur-3xl"
      />
      <div
        className={`relative mx-auto max-w-6xl px-5 py-16 @3xl:px-8 @4xl:py-28 ${
          centered ? "" : "grid items-center gap-12 @4xl:grid-cols-[1.1fr_1fr]"
        }`}
      >
        {text}
        {cover ? (
          <div className={centered ? "mt-14" : ""}>
            <SiteImage
              src={cover}
              alt={name}
              className={`w-full rounded-site object-cover shadow-xl shadow-black/5 ${centered ? "aspect-[21/9]" : "aspect-[4/3]"}`}
            />
          </div>
        ) : (
          !centered && <HeroCard site={site} />
        )}
      </div>
    </section>
  );
}

/** Sans photo de couverture : un aperçu de l'offre et des infos clés pour équilibrer le haut de page. */
function HeroCard({ site }: { site: SiteViewData }) {
  const { content, type } = site;
  const highlights =
    type === "restaurant"
      ? content.menu.flatMap((c) => c.items).slice(0, 3).map((d) => ({ name: d.name, detail: d.price }))
      : content.services.slice(0, 3).map((s) => ({ name: s.name, detail: s.price || s.duration }));
  const openDays = content.hours.filter((d) => !d.closed).length;

  return (
    <div className="relative hidden @4xl:block">
      <div aria-hidden className="absolute -inset-4 rotate-2 rounded-site bg-site-brand/10" />
      <div className="relative rounded-site border border-site-border bg-site-bg p-8 shadow-xl shadow-black/5">
        <p className="text-sm font-medium tracking-wide text-site-brand uppercase">
          {type === "restaurant" ? "À la carte" : "En bref"}
        </p>
        <ul className="mt-5 divide-y divide-site-border">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-baseline justify-between gap-6 py-3.5">
              <span className="font-medium">{h.name}</span>
              {h.detail && <span className="shrink-0 text-sm text-site-muted">{h.detail}</span>}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2.5 rounded-site bg-site-surface p-4 text-sm">
          {openDays > 0 && (
            <p className="flex items-center gap-2.5">
              <Clock className="size-4 text-site-brand" /> Ouvert {openDays} jour{openDays > 1 ? "s" : ""} sur 7
            </p>
          )}
          {(content.contact.address || content.city) && (
            <p className="flex items-center gap-2.5">
              <MapPin className="size-4 shrink-0 text-site-brand" />
              <span className="truncate">{content.contact.address.split("\n")[0] || content.city}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function About({ content }: { content: SiteContent }) {
  if (!content.about) return null;
  return (
    <section id="a-propos" className="scroll-mt-20 border-t border-site-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 @3xl:px-8 @4xl:grid-cols-[1fr_2fr] @4xl:gap-16 @4xl:py-24">
        <div>
          <p className="text-sm font-medium tracking-wide text-site-brand uppercase">À propos</p>
          <h2 className="site-heading mt-3 text-3xl @3xl:text-4xl">Bienvenue</h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-site-muted">
          {content.about.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i} className="whitespace-pre-line">{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services({
  content,
  id,
  title,
  withDetails,
}: {
  content: SiteContent;
  id: string;
  title: string;
  withDetails: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-20 bg-site-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 @3xl:px-8 @4xl:py-24">
        <h2 className="site-heading text-3xl @3xl:text-4xl">{title}</h2>
        {withDetails ? (
          <ul className="mt-10 divide-y divide-site-border overflow-hidden rounded-site border border-site-border bg-site-bg">
            {content.services.map((service, i) => (
              <li key={i} className="flex flex-col gap-2 p-5 @2xl:flex-row @2xl:items-center @2xl:justify-between @2xl:gap-6 @3xl:p-6">
                <div>
                  <p className="text-lg font-medium">{service.name}</p>
                  {service.description && <p className="mt-1 text-site-muted">{service.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  {service.duration && (
                    <span className="inline-flex items-center gap-1.5 text-site-muted">
                      <Clock className="size-4" /> {service.duration}
                    </span>
                  )}
                  {service.price && (
                    <span className="rounded-full bg-site-brand/10 px-3 py-1 font-semibold text-site-brand">{service.price}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 grid gap-5 @2xl:grid-cols-2 @4xl:grid-cols-3">
            {content.services.map((service, i) => (
              <article key={i} className="rounded-site border border-site-border bg-site-bg p-7">
                <p className="font-mono text-sm text-site-brand">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="site-heading mt-4 text-xl">{service.name}</h3>
                {service.description && <p className="mt-3 leading-relaxed text-site-muted">{service.description}</p>}
                {service.price && <p className="mt-4 font-semibold text-site-brand">{service.price}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Menu({ content, id, title }: { content: SiteContent; id: string; title: string }) {
  return (
    <section id={id} className="scroll-mt-20 bg-site-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 @3xl:px-8 @4xl:py-24">
        <h2 className="site-heading text-center text-3xl @3xl:text-4xl">{title}</h2>
        <div className="mt-12 grid gap-x-16 gap-y-12 @3xl:grid-cols-2">
          {content.menu.map((category, i) => (
            <div key={i}>
              <h3 className="site-heading border-b border-site-border pb-3 text-2xl text-site-brand">{category.name}</h3>
              <ul className="mt-5 space-y-5">
                {category.items.map((dish, j) => (
                  <li key={j}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-medium">{dish.name}</span>
                      <span aria-hidden className="flex-1 border-b border-dotted border-site-muted/40" />
                      {dish.price && <span className="font-semibold">{dish.price}</span>}
                    </div>
                    {dish.description && <p className="mt-1 text-sm text-site-muted">{dish.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({ images, name }: { images: string[]; name: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 @3xl:px-8 @4xl:py-24">
      <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-3 @3xl:gap-4">
        {images.map((src, i) => (
          <SiteImage
            key={src}
            src={src}
            alt={`${name}, photo ${i + 1}`}
            className={`aspect-square w-full rounded-site object-cover ${i === 0 && images.length > 2 ? "@3xl:col-span-2 @3xl:row-span-2 @3xl:aspect-auto @3xl:h-full" : ""}`}
          />
        ))}
      </div>
    </section>
  );
}

function Infos({ content }: { content: SiteContent }) {
  const { contact } = content;
  const mapsUrl = contact.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`
    : null;

  return (
    <section id="infos" className="scroll-mt-20 border-t border-site-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 @3xl:grid-cols-2 @3xl:px-8 @4xl:grid-cols-3 @4xl:py-24">
        <div>
          <h2 className="site-heading text-2xl">Horaires</h2>
          <dl className="mt-5 space-y-2.5">
            {content.hours.map((day, i) => (
              <div key={i} className="flex justify-between gap-4 border-b border-site-border pb-2.5 text-sm">
                <dt className="font-medium">{DAYS[i]}</dt>
                <dd className={day.closed ? "text-site-muted" : ""}>{day.closed ? "Fermé" : day.hours || "Ouvert"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="site-heading text-2xl">Nous trouver</h2>
          {contact.address ? (
            <>
              <p className="mt-5 flex gap-3 leading-relaxed whitespace-pre-line">
                <MapPin className="mt-1 size-4 shrink-0 text-site-brand" /> {contact.address}
              </p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-site-brand underline-offset-4 hover:underline"
                >
                  Itinéraire <ArrowRight className="size-4" />
                </a>
              )}
            </>
          ) : (
            <p className="mt-5 text-site-muted">{content.city || "Adresse communiquée sur demande."}</p>
          )}
        </div>

        <div>
          <h2 className="site-heading text-2xl">Contact</h2>
          <ul className="mt-5 space-y-3">
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-site-brand">
                  <Phone className="size-4 text-site-brand" /> {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 break-all hover:text-site-brand">
                  <Mail className="size-4 shrink-0 text-site-brand" /> {contact.email}
                </a>
              </li>
            )}
            {contact.instagram && (
              <li>
                <a href={socialUrl(contact.instagram, "instagram")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-site-brand">
                  <InstagramIcon className="size-4 text-site-brand" /> Instagram
                </a>
              </li>
            )}
            {contact.facebook && (
              <li>
                <a href={socialUrl(contact.facebook, "facebook")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-site-brand">
                  <FacebookIcon className="size-4 text-site-brand" /> Facebook
                </a>
              </li>
            )}
            {!contact.phone && !contact.email && !contact.instagram && !contact.facebook && (
              <li className="text-site-muted">Utilisez le formulaire ci-dessous pour nous écrire.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Accepte une URL complète ou un simple identifiant (« @maboutique »). */
function socialUrl(value: string, network: "instagram" | "facebook") {
  if (/^https?:\/\//.test(value)) return value;
  return `https://www.${network}.com/${value.replace(/^@/, "")}`;
}
