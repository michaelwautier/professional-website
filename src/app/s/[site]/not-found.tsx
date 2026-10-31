import { profile } from "@/content/profile";
import { appUrl } from "@/lib/hosts";

export default function TenantNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-center">
      <div className="max-w-md">
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Ce site n&apos;existe pas… encore.</h1>
        <p className="mt-4 text-muted">
          L&apos;adresse est peut-être mal saisie, ou le site a été mis hors ligne. Vous pouvez aussi créer le vôtre
          gratuitement en quelques minutes.
        </p>
        <a
          href={appUrl("/creer")}
          className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-soft"
        >
          Créer mon site avec {profile.builderName}
        </a>
      </div>
    </main>
  );
}
