"use client";

import { Check, ImagePlus, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { inputClass } from "@/components/ui";
import { uploadImage, type ImageKind } from "@/lib/image-upload";
import { DAYS, type MenuCategory, type Service, type SiteContent, type SiteStyle } from "@/lib/site-schema";
import { PALETTE, STYLES } from "@/lib/themes";

const smallInput = inputClass.replace("py-2.5", "py-2");

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-danger/5 hover:text-danger"
    >
      {children}
    </button>
  );
}

function AddButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm font-medium text-ink-soft transition hover:border-accent hover:text-accent disabled:opacity-40"
    >
      <Plus className="size-4" /> {children}
    </button>
  );
}

export function ServicesEditor({
  services,
  onChange,
  withDuration,
}: {
  services: Service[];
  onChange: (services: Service[]) => void;
  withDuration: boolean;
}) {
  const update = (i: number, patch: Partial<Service>) =>
    onChange(services.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-3">
      {services.map((service, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-line bg-white p-3">
          <div className="flex gap-2">
            <input
              value={service.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Nom de la prestation"
              aria-label="Nom de la prestation"
              className={`${smallInput} font-medium`}
            />
            <IconButton label="Supprimer" onClick={() => onChange(services.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
          <textarea
            value={service.description}
            onChange={(e) => update(i, { description: e.target.value })}
            placeholder="Description courte (facultatif)"
            aria-label="Description"
            rows={2}
            className={`${smallInput} resize-none text-sm`}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={service.price}
              onChange={(e) => update(i, { price: e.target.value })}
              placeholder="Prix (ex. 45 €)"
              aria-label="Prix"
              className={`${smallInput} text-sm`}
            />
            {withDuration && (
              <input
                value={service.duration}
                onChange={(e) => update(i, { duration: e.target.value })}
                placeholder="Durée (ex. 1 h)"
                aria-label="Durée"
                className={`${smallInput} text-sm`}
              />
            )}
          </div>
        </div>
      ))}
      <AddButton
        disabled={services.length >= 20}
        onClick={() => onChange([...services, { name: "", description: "", price: "", duration: "" }])}
      >
        Ajouter {withDuration ? "une prestation" : "un service"}
      </AddButton>
    </div>
  );
}

export function MenuEditor({ menu, onChange }: { menu: MenuCategory[]; onChange: (menu: MenuCategory[]) => void }) {
  const updateCategory = (i: number, patch: Partial<MenuCategory>) =>
    onChange(menu.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  return (
    <div className="space-y-4">
      {menu.map((category, i) => (
        <div key={i} className="rounded-xl border border-line bg-white p-3">
          <div className="flex gap-2">
            <input
              value={category.name}
              onChange={(e) => updateCategory(i, { name: e.target.value })}
              placeholder="Catégorie (ex. Entrées)"
              aria-label="Nom de la catégorie"
              className={`${smallInput} font-semibold`}
            />
            <IconButton label="Supprimer la catégorie" onClick={() => onChange(menu.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
          <div className="mt-3 space-y-2 border-l-2 border-line pl-3">
            {category.items.map((dish, k) => {
              const updateDish = (patch: Partial<typeof dish>) =>
                updateCategory(i, { items: category.items.map((d, l) => (l === k ? { ...d, ...patch } : d)) });
              return (
                <div key={k} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      value={dish.name}
                      onChange={(e) => updateDish({ name: e.target.value })}
                      placeholder="Plat ou produit"
                      aria-label="Nom du plat"
                      className={`${smallInput} text-sm`}
                    />
                    <input
                      value={dish.price}
                      onChange={(e) => updateDish({ price: e.target.value })}
                      placeholder="Prix"
                      aria-label="Prix"
                      className={`${smallInput} w-24 shrink-0 text-sm`}
                    />
                    <IconButton
                      label="Supprimer"
                      onClick={() => updateCategory(i, { items: category.items.filter((_, l) => l !== k) })}
                    >
                      <X className="size-4" />
                    </IconButton>
                  </div>
                  <input
                    value={dish.description}
                    onChange={(e) => updateDish({ description: e.target.value })}
                    placeholder="Description (facultatif)"
                    aria-label="Description du plat"
                    className={`${smallInput} text-[13px]`}
                  />
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => updateCategory(i, { items: [...category.items, { name: "", description: "", price: "" }] })}
              disabled={category.items.length >= 40}
              className="inline-flex items-center gap-1.5 py-1 text-sm font-medium text-accent hover:underline disabled:opacity-40"
            >
              <Plus className="size-4" /> Ajouter un plat
            </button>
          </div>
        </div>
      ))}
      <AddButton disabled={menu.length >= 12} onClick={() => onChange([...menu, { name: "", items: [] }])}>
        Ajouter une catégorie
      </AddButton>
    </div>
  );
}

export function HoursEditor({ hours, onChange }: { hours: SiteContent["hours"]; onChange: (hours: SiteContent["hours"]) => void }) {
  const update = (i: number, patch: Partial<SiteContent["hours"][number]>) =>
    onChange(hours.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const firstOpen = hours.find((d) => !d.closed && d.hours);

  return (
    <div className="space-y-2">
      {hours.map((day, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-sm font-medium">{DAYS[i]}</span>
          <input
            value={day.closed ? "" : day.hours}
            onChange={(e) => update(i, { hours: e.target.value })}
            disabled={day.closed}
            placeholder={day.closed ? "Fermé" : "ex. 9h – 18h"}
            aria-label={`Horaires du ${DAYS[i].toLowerCase()}`}
            className={`${smallInput} text-sm`}
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={day.closed}
              onChange={(e) => update(i, { closed: e.target.checked })}
              className="size-4 accent-accent"
            />
            Fermé
          </label>
        </div>
      ))}
      {firstOpen && (
        <button
          type="button"
          onClick={() => onChange(hours.map((d) => (d.closed ? d : { ...d, hours: firstOpen.hours })))}
          className="text-sm font-medium text-accent hover:underline"
        >
          Appliquer « {firstOpen.hours} » à tous les jours ouverts
        </button>
      )}
    </div>
  );
}

function useUpload(kind: ImageKind) {
  const [state, setState] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null });
  async function upload(file: File) {
    setState({ busy: true, error: null });
    try {
      const url = await uploadImage(file, kind);
      setState({ busy: false, error: null });
      return url;
    } catch (error) {
      setState({ busy: false, error: error instanceof Error ? error.message : "L'envoi a échoué." });
      return null;
    }
  }
  return { ...state, upload };
}

export function ImageField({
  value,
  onChange,
  kind,
  label,
  hint,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  kind: ImageKind;
  label: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { busy, error, upload } = useUpload(kind);

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1.5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-white text-muted transition hover:border-accent hover:text-accent ${
            kind === "logo" ? "size-20" : "h-20 w-32"
          }`}
        >
          {busy ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className={`size-full ${kind === "logo" ? "object-contain p-2" : "object-cover"}`} />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </button>
        <div className="text-[13px] text-muted">
          <p>{hint}</p>
          <div className="mt-1.5 flex gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="font-medium text-accent hover:underline">
              {value ? "Changer" : "Choisir une image"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange(null)} className="font-medium text-danger hover:underline">
                Retirer
              </button>
            )}
          </div>
          {error && <p className="mt-1 text-danger">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) {
            const url = await upload(file);
            if (url) onChange(url);
          }
        }}
      />
    </div>
  );
}

export function GalleryField({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { busy, error, upload } = useUpload("gallery");
  const remaining = 8 - images.length;

  return (
    <div>
      <p className="text-sm font-medium">Galerie photos</p>
      <p className="text-[13px] text-muted">Jusqu&apos;à 8 photos de vos réalisations, de vos locaux ou de vos plats.</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {images.map((src) => (
          <div key={src} className="group relative aspect-square overflow-hidden rounded-lg bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((i) => i !== src))}
              aria-label="Retirer la photo"
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid aspect-square place-items-center rounded-lg border border-dashed border-line text-muted transition hover:border-accent hover:text-accent"
            aria-label="Ajouter des photos"
          >
            {busy ? <LoaderCircle className="size-5 animate-spin" /> : <Plus className="size-5" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-[13px] text-danger">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []).slice(0, remaining);
          e.target.value = "";
          const urls: string[] = [];
          for (const file of files) {
            const url = await upload(file);
            if (url) urls.push(url);
          }
          if (urls.length) onChange([...images, ...urls]);
        }}
      />
    </div>
  );
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const isCustom = !PALETTE.some((c) => c.value === value);
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {PALETTE.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          aria-label={color.name}
          title={color.name}
          className={`grid size-9 place-items-center rounded-full transition ${value === color.value ? "ring-2 ring-offset-2 ring-ink" : "hover:scale-110"}`}
          style={{ background: color.value }}
        >
          {value === color.value && <Check className="size-4 text-white" />}
        </button>
      ))}
      <label
        title="Couleur personnalisée"
        className={`relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full bg-[conic-gradient(#f43f5e,#f59e0b,#84cc16,#06b6d4,#6366f1,#d946ef,#f43f5e)] transition ${isCustom ? "ring-2 ring-offset-2 ring-ink" : "hover:scale-110"}`}
      >
        <span className="size-4 rounded-full border-2 border-white" style={{ background: isCustom ? value : "white" }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Couleur personnalisée"
        />
      </label>
    </div>
  );
}

const STYLE_SAMPLE_FONT: Record<SiteStyle, string> = {
  moderne: "var(--font-geist-sans)",
  elegant: "var(--font-playfair)",
  chaleureux: "var(--font-fraunces)",
};

export function StylePicker({ value, onChange }: { value: SiteStyle; onChange: (style: SiteStyle) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {(Object.keys(STYLES) as SiteStyle[]).map((style) => (
        <button
          key={style}
          type="button"
          onClick={() => onChange(style)}
          aria-pressed={value === style}
          className={`rounded-xl border p-3 text-left transition ${value === style ? "border-accent bg-accent-soft/50 ring-1 ring-accent" : "border-line bg-white hover:border-ink/30"}`}
        >
          <span
            className="block text-2xl leading-none"
            style={{ fontFamily: STYLE_SAMPLE_FONT[style], fontWeight: style === "moderne" ? 700 : 500 }}
          >
            Aa
          </span>
          <span className="mt-2 block text-sm font-medium">{STYLES[style].label}</span>
          <span className="mt-0.5 block text-xs leading-snug text-muted">{STYLES[style].description}</span>
        </button>
      ))}
    </div>
  );
}
