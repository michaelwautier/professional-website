import type { ButtonHTMLAttributes, ReactNode } from "react";

// Primitives d'interface de l'application principale (portfolio, assistant, espace client).

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  accent: "bg-accent text-white hover:bg-accent/90 shadow-sm shadow-accent/20",
  secondary: "border border-line bg-white text-ink hover:border-ink/30",
  ghost: "text-ink-soft hover:bg-ink/5",
  danger: "border border-danger/20 bg-white text-danger hover:bg-danger/5",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className = "") {
  return `inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:bg-paper disabled:text-muted";

export function Field({
  label,
  hint,
  error,
  className = "",
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="text-[13px] text-danger">{error}</span>
      ) : (
        hint && <span className="text-[13px] text-muted">{hint}</span>
      )}
    </label>
  );
}

export function Card({ className = "", children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <div id={id} className={`rounded-2xl border border-line bg-white ${className}`}>
      {children}
    </div>
  );
}
