import { ExternalLink, MailCheck } from "lucide-react";
import type { Metadata } from "next";
import { buttonClass } from "@/components/ui";
import { siteHost, siteUrl } from "@/lib/hosts";
import { slugSchema } from "@/lib/site-schema";

export const instant = false;
export const metadata: Metadata = { title: "Votre site est en ligne", robots: { index: false } };

// Affiché quand le site a été rattaché à un compte existant : la connexion passe par le lien envoyé par e-mail.
export default async function ThanksPage({ searchParams }: PageProps<"/creer/merci">) {
  const parsed = slugSchema.safeParse((await searchParams).site);
  const slug = parsed.success ? parsed.data : null;

  return (
    <main className="grid flex-1 place-items-center px-6 py-16">
      <div className="max-w-lg text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
          <MailCheck className="size-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Votre site est en ligne&nbsp;!</h1>
        <p className="mt-4 text-muted">
          Cette adresse e-mail a déjà un compte : nous vous avons envoyé un lien pour vous connecter et retrouver votre
          site dans votre espace.
        </p>
        {slug && (
          <a href={siteUrl(slug)} target="_blank" rel="noopener noreferrer" className={buttonClass("accent", "lg", "mt-8")}>
            Voir {siteHost(slug)} <ExternalLink className="size-4" />
          </a>
        )}
      </div>
    </main>
  );
}
