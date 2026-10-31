import Link from "next/link";
import { profile } from "@/content/profile";

export function Monogram({ className = "" }: { className?: string }) {
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <span className={`grid size-9 place-items-center rounded-xl bg-ink font-mono text-xs font-semibold tracking-tight text-white ${className}`}>
      {initials}
    </span>
  );
}

export function BuilderMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--color-accent)" />
      <path d="M16 7c2.8 2.6 4 5.5 3.6 8.4C22.4 14 25 14.2 26 16c-2.2 3.6-6 5.4-10 5.4S8.2 19.6 6 16c1-1.8 3.6-2 6.4-.6C12 12.5 13.2 9.6 16 7z" fill="white" />
      <path d="M16 21.4V26" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BuilderLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <BuilderMark className="size-7" />
      <span className="font-semibold tracking-tight">{profile.builderName}</span>
      <span className="hidden text-sm text-muted sm:inline">par {profile.name}</span>
    </Link>
  );
}
