import type { Metadata } from "next";
import { profile } from "@/content/profile";
import { ROOT_DOMAIN } from "@/lib/hosts";
import { PRO_PRICE_LABEL } from "@/lib/integrations";

export const metadata: Metadata = { title: "Mentions légales et conditions d'utilisation" };

// ⚠️ Modèle à compléter (statut, SIRET, adresse) et à faire relire : ce texte ne remplace pas un conseil juridique.
export default function LegalPage() {
  const domain = ROOT_DOMAIN.split(":")[0];
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-ink-soft [&_li]:text-ink-soft">
      <h1 className="text-4xl font-semibold tracking-tight">Mentions légales</h1>

      <h2>Éditeur</h2>
      <p>
        {profile.name}, {profile.role.toLowerCase()} — [statut juridique, ex. entrepreneur individuel], SIRET [à compléter],
        [adresse à compléter]. Contact : {profile.email}.
      </p>

      <h2>Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>

      <h2>Données personnelles</h2>
      <p>
        Les informations envoyées via les formulaires (nom, e-mail, téléphone, message) servent uniquement à répondre à votre
        demande et ne sont jamais revendues. Vous pouvez demander leur consultation, rectification ou suppression à tout
        moment en écrivant à {profile.email}. Ce site n&apos;utilise qu&apos;un cookie technique de connexion à l&apos;espace client,
        aucun cookie publicitaire ni de mesure d&apos;audience.
      </p>

      <h1 id="conditions" className="mt-20 scroll-mt-24 text-4xl font-semibold tracking-tight">
        Conditions d&apos;utilisation de {profile.builderName}
      </h1>

      <h2>Le service</h2>
      <p>
        {profile.builderName} permet de créer gratuitement un site internet hébergé sur un sous-domaine de {domain}. La
        formule Pro ({PRO_PRICE_LABEL}, sans engagement) permet de relier un nom de domaine personnel et retire la mention
        « Site créé avec {profile.builderName} ».
      </p>

      <h2>Vos responsabilités</h2>
      <p>
        Vous êtes l&apos;éditeur de votre site et responsable de son contenu : exactitude des informations, droits sur les
        textes et images publiés, respect de la loi. Tout contenu illicite, trompeur ou portant atteinte aux droits
        d&apos;autrui peut entraîner la mise hors ligne du site sans préavis.
      </p>

      <h2>Disponibilité</h2>
      <p>
        Le service est fourni en l&apos;état, avec un effort raisonnable pour assurer sa disponibilité. Vous pouvez supprimer
        votre site à tout moment depuis votre espace ; ses données sont alors effacées.
      </p>

      <h2>Demandes de vos clients</h2>
      <p>
        Les demandes envoyées par les visiteurs de votre site (contact, rendez-vous, réservation) vous sont transmises par
        e-mail et conservées dans votre espace. Vous vous engagez à les utiliser uniquement pour y répondre.
      </p>
    </main>
  );
}
