import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion à votre espace" };

export default function LoginPage() {
  return (
    <main className="grid flex-1 place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight">Accéder à mon espace</h1>
        <p className="mt-2 text-center text-[15px] text-muted">Pas de mot de passe : on vous envoie un lien par e-mail.</p>
        <Card className="mt-8 p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </Card>
        <p className="mt-6 text-center text-sm text-muted">
          Pas encore de site ?{" "}
          <Link href="/creer" className="font-medium text-ink underline underline-offset-4">
            Créez-le gratuitement
          </Link>
        </p>
      </div>
    </main>
  );
}
