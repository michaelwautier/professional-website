import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";
import { verifyLogin } from "@/lib/actions/auth";

export const instant = false;
export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

// Le jeton n'est consommé qu'au clic : les antivirus de messagerie qui ouvrent les liens ne le « brûlent » pas.
export default async function VerifyPage({ searchParams }: PageProps<"/connexion/verifier">) {
  const { token } = await searchParams;

  return (
    <main className="grid flex-1 place-items-center px-6 py-16">
      <Card className="w-full max-w-sm p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Bon retour parmi nous</h1>
        <p className="mt-2 text-[15px] text-muted">Cliquez pour ouvrir votre espace.</p>
        <form action={verifyLogin} className="mt-6">
          <input type="hidden" name="token" value={typeof token === "string" ? token : ""} />
          <Button type="submit" variant="accent" size="lg" className="w-full">
            Me connecter
          </Button>
        </form>
      </Card>
    </main>
  );
}
