import { LogOut } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BuilderLogo } from "@/components/brand";
import { logout } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-white/90 px-5 backdrop-blur">
        <BuilderLogo />
        <Suspense fallback={null}>
          <AccountMenu />
        </Suspense>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

async function AccountMenu() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/connexion" className="text-sm font-medium text-ink-soft hover:text-ink">
        Connexion
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/espace" className="font-medium text-ink-soft hover:text-ink">
        Mes sites
      </Link>
      <span className="hidden text-muted md:inline">{user.email}</span>
      <form action={logout}>
        <button type="submit" className="grid size-8 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink" title="Se déconnecter" aria-label="Se déconnecter">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}
