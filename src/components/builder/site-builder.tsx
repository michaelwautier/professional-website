"use client";

import { ArrowLeft, ArrowRight, Check, CircleAlert, Eye, LoaderCircle, RotateCcw, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { checkSlug, createSite, updateSiteContent } from "@/lib/actions/sites";
import { ROOT_DOMAIN } from "@/lib/hosts";
import { getPreset, initialContent, PRESETS, presetTexts, TYPE_META } from "@/lib/presets";
import { siteContentSchema, slugify, type SiteContent, type SiteType } from "@/lib/site-schema";
import { ColorPicker, GalleryField, HoursEditor, ImageField, MenuEditor, ServicesEditor, StylePicker } from "./fields";
import { SitePreview } from "./site-preview";

type Props =
  | { mode: "create"; type: SiteType; userEmail: string | null }
  | { mode: "edit"; type: SiteType; siteId: string; slug: string; plan: "free" | "pro"; initialContent: SiteContent };

type Draft = {
  content: SiteContent;
  slug: string;
  email: string;
  // Tant que l'utilisateur n'a pas retouché ces champs, ils suivent le nom, la ville et le métier choisis.
  edited: { tagline: boolean; about: boolean; offer: boolean; theme: boolean; slug: boolean };
};

const STEPS = [
  { title: "Votre activité", intro: "Quelques informations pour commencer : on prépare le reste pour vous." },
  { title: "Votre contenu", intro: "Les textes et l'offre sont préremplis selon votre métier. Adaptez-les à votre façon." },
  { title: "Infos pratiques", intro: "Comment vous joindre et quand vous trouver." },
  { title: "Apparence", intro: "Choisissez un style, une couleur et ajoutez vos photos." },
  { title: "Mise en ligne", intro: "Dernière étape : choisissez l'adresse de votre site." },
];

const draftKey = (type: SiteType) => `builder-draft:${type}`;

function freshDraft(type: SiteType, presetId?: string): Draft {
  return {
    content: initialContent(type, presetId),
    slug: "",
    email: "",
    edited: { tagline: false, about: false, offer: false, theme: false, slug: false },
  };
}

function loadDraft(type: SiteType): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(type));
    if (!raw) return null;
    const draft = JSON.parse(raw) as Draft;
    // Un brouillon est souvent incomplet (pas encore de nom) : on vérifie seulement sa forme.
    return draft?.edited && Array.isArray(draft.content?.hours) && draft.content.hours.length === 7 ? draft : null;
  } catch {
    return null;
  }
}

export function SiteBuilder(props: Props) {
  const { type } = props;
  const isCreate = props.mode === "create";
  const steps = isCreate ? STEPS : STEPS.slice(0, 4);

  const [draft, setDraft] = useState<Draft>(() => {
    if (props.mode === "edit") {
      return {
        content: props.initialContent,
        slug: props.slug,
        email: "",
        edited: { tagline: true, about: true, offer: true, theme: true, slug: true },
      };
    }
    return loadDraft(type) ?? freshDraft(type);
  });
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedContent, setSavedContent] = useState(() => JSON.stringify(draft.content));
  const [justSaved, setJustSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const { content } = draft;
  const dirty = !isCreate && JSON.stringify(content) !== savedContent;

  // Brouillon conservé dans le navigateur : on peut fermer l'onglet et reprendre plus tard.
  useEffect(() => {
    if (isCreate) localStorage.setItem(draftKey(type), JSON.stringify(draft));
  }, [draft, isCreate, type]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patchContent(patch: Partial<SiteContent>, edited?: Partial<Draft["edited"]>) {
    setDraft((d) => ({ ...d, content: { ...d.content, ...patch }, edited: { ...d.edited, ...edited } }));
    setError(null);
  }

  /** Nom ou ville modifiés : les textes et l'adresse non retouchés suivent automatiquement. */
  function updateIdentity(patch: { businessName?: string; city?: string }) {
    setDraft((d) => {
      const next = { ...d.content, ...patch };
      const texts = presetTexts(type, next.sector, { name: next.businessName, city: next.city });
      return {
        ...d,
        slug: d.edited.slug ? d.slug : slugify(next.businessName),
        content: {
          ...next,
          tagline: d.edited.tagline ? next.tagline : texts.tagline,
          about: d.edited.about ? next.about : texts.about,
        },
      };
    });
    setError(null);
  }

  function choosePreset(presetId: string) {
    if (presetId === content.sector) return;
    const preset = getPreset(type, presetId);
    const replaceOffer =
      !draft.edited.offer || window.confirm("Remplacer vos prestations actuelles par celles de ce métier ?");
    setDraft((d) => {
      const texts = presetTexts(type, presetId, { name: d.content.businessName, city: d.content.city });
      return {
        ...d,
        edited: { ...d.edited, offer: replaceOffer ? false : d.edited.offer },
        content: {
          ...d.content,
          sector: presetId,
          tagline: d.edited.tagline ? d.content.tagline : texts.tagline,
          about: d.edited.about ? d.content.about : texts.about,
          services: replaceOffer ? structuredClone(preset.services ?? []) : d.content.services,
          menu: replaceOffer ? structuredClone(preset.menu ?? []) : d.content.menu,
          theme: d.edited.theme ? d.content.theme : { color: preset.color, style: preset.style },
        },
      };
    });
  }

  function goTo(target: number) {
    if (isCreate && target > step && step === 0 && content.businessName.trim().length < 2) {
      setError("Indiquez le nom de votre entreprise pour continuer.");
      return;
    }
    setError(null);
    setStep(target);
    document.getElementById("builder-scroll")?.scrollTo({ top: 0 });
  }

  function validateContent() {
    const parsed = siteContentSchema.safeParse(content);
    if (parsed.success) return parsed.data;
    const issue = parsed.error.issues[0];
    const key = String(issue.path[0]);
    const stepOf: Record<string, number> = { businessName: 0, tagline: 0, city: 0, about: 1, services: 1, menu: 1, hours: 2, contact: 2 };
    setStep(stepOf[key] ?? 3);
    setError(issue.message.startsWith("Invalid") ? "Une information est invalide, vérifiez ce formulaire." : issue.message);
    return null;
  }

  function submitCreate() {
    if (props.mode !== "create") return;
    const valid = validateContent();
    if (!valid) return;
    if (!acceptTerms) return setError("Veuillez accepter les conditions d'utilisation.");
    startTransition(async () => {
      const result = await createSite({
        type,
        content: valid,
        slug: draft.slug,
        email: props.userEmail ?? draft.email,
        acceptTerms: true,
      });
      // En cas de succès, l'action redirige vers l'espace client et le brouillon n'a plus lieu d'être.
      if (!result || result.ok) return localStorage.removeItem(draftKey(type));
      setError(result.error);
      if (result.step !== undefined) setStep(result.step);
    });
  }

  function submitEdit() {
    if (props.mode !== "edit") return;
    const valid = validateContent();
    if (!valid) return;
    startTransition(async () => {
      const result = await updateSiteContent(props.siteId, valid);
      if (!result.ok) {
        setError(result.error);
        if (result.step !== undefined) setStep(result.step);
        return;
      }
      setSavedContent(JSON.stringify(valid));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    });
  }

  const previewSite = {
    slug: draft.slug,
    type,
    content,
    plan: props.mode === "edit" ? props.plan : ("free" as const),
  };
  const isLast = step === steps.length - 1;

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[minmax(400px,480px)_1fr]">
      <div className="flex min-h-0 flex-col border-line bg-paper lg:border-r">
        {/* En-tête : étapes */}
        <div className="border-b border-line bg-white px-6 pt-5 pb-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              {TYPE_META[type].label}
              {isCreate && ` · Étape ${step + 1} sur ${steps.length}`}
            </p>
            {isCreate && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Effacer ce brouillon et recommencer ?")) {
                    setDraft(freshDraft(type));
                    setStep(0);
                  }
                }}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
              >
                <RotateCcw className="size-3" /> Recommencer
              </button>
            )}
          </div>
          <nav className="mt-3 flex gap-1.5" aria-label="Étapes">
            {steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => (isCreate ? i < step && goTo(i) : goTo(i))}
                className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-accent" : "bg-line"} ${isCreate && i >= step ? "cursor-default" : "cursor-pointer hover:opacity-80"}`}
                aria-label={s.title}
                aria-current={i === step ? "step" : undefined}
              />
            ))}
          </nav>
          {!isCreate && (
            <div className="mt-3 flex flex-wrap gap-1">
              {steps.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`rounded-full px-3 py-1 text-sm transition ${i === step ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"}`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div id="builder-scroll" className="flex-1 overflow-y-auto px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">{steps[step].title}</h1>
          <p className="mt-1 text-[15px] text-muted">{steps[step].intro}</p>

          <div className="mt-6 space-y-5">
            {step === 0 && (
              <>
                <div>
                  <p className="text-sm font-medium">Votre métier</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRESETS[type].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => choosePreset(preset.id)}
                        aria-pressed={content.sector === preset.id}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                          content.sector === preset.id
                            ? "border-accent bg-accent text-white"
                            : "border-line bg-white text-ink-soft hover:border-ink/30"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Nom de votre entreprise">
                  <input
                    value={content.businessName}
                    onChange={(e) => updateIdentity({ businessName: e.target.value })}
                    placeholder="ex. Boulangerie Dupont"
                    className={inputClass}
                    autoFocus={isCreate}
                    maxLength={80}
                  />
                </Field>
                <Field label="Ville" hint="Affichée sur votre site et utile pour être trouvé localement sur Google.">
                  <input
                    value={content.city}
                    onChange={(e) => updateIdentity({ city: e.target.value })}
                    placeholder="ex. Lyon"
                    className={inputClass}
                    maxLength={80}
                  />
                </Field>
                <Field label="Slogan" hint="Une phrase qui résume ce que vous faites.">
                  <input
                    value={content.tagline}
                    onChange={(e) => patchContent({ tagline: e.target.value }, { tagline: true })}
                    className={inputClass}
                    maxLength={140}
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Présentation" hint="Qui êtes-vous, que proposez-vous, qu'est-ce qui vous distingue ?">
                  <textarea
                    value={content.about}
                    onChange={(e) => patchContent({ about: e.target.value }, { about: true })}
                    rows={7}
                    className={`${inputClass} resize-y leading-relaxed`}
                    maxLength={2000}
                  />
                </Field>
                <div>
                  <p className="text-sm font-medium">{TYPE_META[type].servicesTitle}</p>
                  <p className="mb-3 text-[13px] text-muted">Ce sont des exemples : adaptez les noms, descriptions et prix.</p>
                  {type === "restaurant" ? (
                    <MenuEditor menu={content.menu} onChange={(menu) => patchContent({ menu }, { offer: true })} />
                  ) : (
                    <ServicesEditor
                      services={content.services}
                      withDuration={type === "rendezvous"}
                      onChange={(services) => patchContent({ services }, { offer: true })}
                    />
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Téléphone">
                    <input
                      value={content.contact.phone}
                      onChange={(e) => patchContent({ contact: { ...content.contact, phone: e.target.value } })}
                      type="tel"
                      placeholder="06 12 34 56 78"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="E-mail public">
                    <input
                      value={content.contact.email}
                      onChange={(e) => patchContent({ contact: { ...content.contact, email: e.target.value } })}
                      type="email"
                      placeholder="contact@…"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Adresse">
                  <textarea
                    value={content.contact.address}
                    onChange={(e) => patchContent({ contact: { ...content.contact, address: e.target.value } })}
                    rows={2}
                    placeholder={"12 rue de la République\n69002 Lyon"}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
                <div>
                  <p className="mb-2 text-sm font-medium">Horaires</p>
                  <HoursEditor hours={content.hours} onChange={(hours) => patchContent({ hours })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Instagram" hint="@compte ou lien">
                    <input
                      value={content.contact.instagram}
                      onChange={(e) => patchContent({ contact: { ...content.contact, instagram: e.target.value } })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Facebook" hint="Nom de page ou lien">
                    <input
                      value={content.contact.facebook}
                      onChange={(e) => patchContent({ contact: { ...content.contact, facebook: e.target.value } })}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="SIRET (facultatif)" hint="Affiché dans les mentions légales, obligatoires pour un site professionnel.">
                  <input
                    value={content.contact.siret}
                    onChange={(e) => patchContent({ contact: { ...content.contact, siret: e.target.value } })}
                    inputMode="numeric"
                    className={inputClass}
                    maxLength={20}
                  />
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium">Style</p>
                  <StylePicker
                    value={content.theme.style}
                    onChange={(style) => patchContent({ theme: { ...content.theme, style } }, { theme: true })}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Couleur principale</p>
                  <ColorPicker
                    value={content.theme.color}
                    onChange={(color) => patchContent({ theme: { ...content.theme, color } }, { theme: true })}
                  />
                </div>
                <ImageField
                  kind="logo"
                  label="Logo"
                  hint="Sinon, vos initiales sont utilisées."
                  value={content.images.logo}
                  onChange={(logo) => patchContent({ images: { ...content.images, logo } })}
                />
                <ImageField
                  kind="cover"
                  label="Photo principale"
                  hint="Affichée en haut de votre site : votre vitrine, votre équipe, vos réalisations…"
                  value={content.images.cover}
                  onChange={(cover) => patchContent({ images: { ...content.images, cover } })}
                />
                <GalleryField
                  images={content.images.gallery}
                  onChange={(gallery) => patchContent({ images: { ...content.images, gallery } })}
                />
              </>
            )}

            {step === 4 && props.mode === "create" && (
              <PublishStep
                slug={draft.slug}
                onSlugChange={(slug) => setDraft((d) => ({ ...d, slug, edited: { ...d.edited, slug: true } }))}
                email={draft.email}
                onEmailChange={(email) => setDraft((d) => ({ ...d, email }))}
                userEmail={props.userEmail}
                acceptTerms={acceptTerms}
                onAcceptTerms={setAcceptTerms}
              />
            )}
          </div>
        </div>

        {/* Pied : navigation */}
        <div className="border-t border-line bg-white px-6 py-4">
          {error && (
            <p className="mb-3 flex items-start gap-2 rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
              <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft lg:hidden"
            >
              <Eye className="size-4" /> Aperçu
            </button>
            {isCreate ? (
              <>
                {step > 0 && (
                  <Button variant="ghost" onClick={() => goTo(step - 1)} className="lg:mr-auto">
                    <ArrowLeft className="size-4" /> Retour
                  </Button>
                )}
                {isLast ? (
                  <Button variant="accent" onClick={submitCreate} disabled={pending} className="ml-auto">
                    {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
                    Mettre mon site en ligne
                  </Button>
                ) : (
                  <Button onClick={() => goTo(step + 1)} className="ml-auto">
                    Continuer <ArrowRight className="size-4" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <span className="text-sm text-muted lg:mr-auto">
                  {justSaved ? (
                    <span className="inline-flex items-center gap-1.5 text-success"><Check className="size-4" /> Enregistré, votre site est à jour</span>
                  ) : dirty ? (
                    "Modifications non enregistrées"
                  ) : (
                    "Tout est enregistré"
                  )}
                </span>
                <Button variant="accent" onClick={submitEdit} disabled={pending || !dirty} className="ml-auto">
                  {pending && <LoaderCircle className="size-4 animate-spin" />}
                  Enregistrer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden min-h-0 p-4 lg:block">
        <SitePreview site={previewSite} />
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper p-3 lg:hidden">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="mb-3 inline-flex items-center gap-1.5 self-end rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
          >
            <X className="size-4" /> Fermer l&apos;aperçu
          </button>
          <div className="min-h-0 flex-1">
            <SitePreview site={previewSite} />
          </div>
        </div>
      )}
    </div>
  );
}

function PublishStep({
  slug,
  onSlugChange,
  email,
  onEmailChange,
  userEmail,
  acceptTerms,
  onAcceptTerms,
}: {
  slug: string;
  onSlugChange: (slug: string) => void;
  email: string;
  onEmailChange: (email: string) => void;
  userEmail: string | null;
  acceptTerms: boolean;
  onAcceptTerms: (value: boolean) => void;
}) {
  const [check, setCheck] = useState<{ slug: string; available: boolean; error?: string } | null>(null);

  // Vérification de disponibilité, 400 ms après la dernière frappe.
  useEffect(() => {
    if (!slug) return;
    const timer = setTimeout(async () => {
      const result = await checkSlug(slug);
      setCheck({ slug, ...result });
    }, 400);
    return () => clearTimeout(timer);
  }, [slug]);

  const status = !slug ? null : check?.slug !== slug ? "checking" : check.available ? "ok" : "error";

  return (
    <>
      <Field
        label="Adresse de votre site"
        error={status === "error" ? check?.error : undefined}
        hint={status === "ok" ? <span className="text-success">✓ Cette adresse est disponible</span> : "Lettres minuscules, chiffres et tirets."}
      >
        <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-white focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
          <input
            value={slug}
            onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            className="min-w-0 flex-1 px-3.5 py-2.5 text-[15px] outline-none"
            maxLength={40}
            aria-label="Sous-domaine"
          />
          <span className="flex items-center gap-2 border-l border-line bg-paper px-3 font-mono text-sm text-muted">
            {status === "checking" && <LoaderCircle className="size-3.5 animate-spin" />}.{ROOT_DOMAIN}
          </span>
        </div>
      </Field>

      {userEmail ? (
        <p className="rounded-xl bg-white p-4 text-sm text-ink-soft ring-1 ring-line">
          Le site sera ajouté à votre compte <strong>{userEmail}</strong>.
        </p>
      ) : (
        <Field label="Votre e-mail" hint="Pour gérer votre site et recevoir vos demandes. Jamais affiché publiquement.">
          <input
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.fr"
            className={inputClass}
          />
        </Field>
      )}

      <ul className="space-y-2 rounded-xl bg-white p-4 text-sm text-ink-soft ring-1 ring-line">
        {[
          "Gratuit, sans carte bancaire",
          "En ligne immédiatement, modifiable à tout moment",
          "Les demandes de vos clients arrivent par e-mail",
          "Votre propre nom de domaine en option",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check className="size-4 text-success" /> {item}
          </li>
        ))}
      </ul>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => onAcceptTerms(e.target.checked)}
          className="mt-0.5 size-4 accent-accent"
        />
        <span>
          J&apos;accepte les{" "}
          <a href="/mentions-legales#conditions" target="_blank" className="font-medium text-ink underline underline-offset-2">
            conditions d&apos;utilisation
          </a>{" "}
          et je certifie que les informations publiées sur mon site sont exactes.
        </span>
      </label>
    </>
  );
}
