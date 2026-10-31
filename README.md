# Site professionnel + Éclore

Un seul projet Next.js qui sert deux choses sur le même nom de domaine :

- **Le portfolio** (`mondomaine.fr`) : présentation, services, projets, formulaire de contact.
- **Éclore**, un service de création de sites en libre-service pour les professionnels non techniques. En quelques
  étapes, ils obtiennent un site vitrine, de prise de rendez-vous ou de restaurant, en ligne immédiatement sur
  `leur-nom.mondomaine.fr`. Ils peuvent ensuite le modifier, recevoir les demandes de leurs clients, passer à la
  formule Pro pour avoir leur propre domaine, ou te confier la suite.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · PostgreSQL + Drizzle ORM · Stripe · Resend

## Démarrage en local

Prérequis : Node 20+, PostgreSQL (Homebrew, ou `docker compose up -d`).

```bash
cp .env.example .env.local   # puis ajuster DATABASE_URL si besoin
createdb professional_website
npm install
npm run db:migrate
npm run db:seed              # 3 sites de démonstration, rattachés à OWNER_EMAIL
npm run dev
```

- Portfolio : http://localhost:3100
- Sites de démo : http://demo-artisan.localhost:3100, http://demo-coiffure.localhost:3100, http://demo-restaurant.localhost:3100
- Espace client : http://localhost:3100/espace

Les navigateurs résolvent `*.localhost` tout seuls, aucune configuration DNS n'est nécessaire. Sans clé Resend, les
e-mails (liens de connexion, notifications) s'affichent dans la console, et la page de connexion affiche directement
le lien. Sans Stripe, la page « Domaine » propose un bouton « Simuler le paiement (dev) ».

## Comment ça marche

| Où | Quoi |
| --- | --- |
| `src/proxy.ts` | Lit l'en-tête `Host` : un sous-domaine ou un domaine perso est réécrit vers `/s/[site]`, le reste sert l'app principale. |
| `src/app/s/[site]` | Rendu des sites clients. Les données sont en cache (`"use cache"` + tags) et invalidées à chaque modification. |
| `src/components/site/site-view.tsx` | Le gabarit des sites. Le même composant sert au site en ligne et à l'aperçu en direct de l'assistant (container queries). |
| `src/lib/presets.ts` | Métiers proposés, avec textes, prestations, carte, couleurs et horaires préremplis. |
| `src/components/builder` | Assistant de création et d'édition, avec aperçu ordinateur et mobile. |
| `src/app/(app)/espace` | Espace client : contenu, demandes reçues, domaine perso, paramètres. `/espace/admin` est réservé à `OWNER_EMAIL`. |
| `src/lib/auth.ts` | Connexion sans mot de passe par lien e-mail. Seules les empreintes SHA-256 des jetons sont stockées. |
| `src/lib/integrations.ts` | Stripe et l'API Domaines de Vercel, activés seulement si les clés sont présentes. |
| `src/content/profile.ts` | **Tout le contenu du portfolio** : nom, accroche, services, projets. |

## Mise en ligne sur Vercel

1. **Projet** : importer le dépôt dans Vercel.
2. **Base de données** : ajouter Neon depuis le Marketplace Vercel, qui renseigne `DATABASE_URL`.
3. **Build** : remplacer la commande de build par `npm run db:migrate && npm run build`.
4. **Variables** : reprendre `.env.example`, avec `NEXT_PUBLIC_ROOT_DOMAIN=mondomaine.fr`.
5. **Domaines** : dans *Settings → Domains*, ajouter `mondomaine.fr` **et** `*.mondomaine.fr`. Le wildcard impose
   d'utiliser les nameservers de Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) chez le registraire.
6. **E-mails** : créer un compte Resend, vérifier le domaine, puis renseigner `RESEND_API_KEY` et `EMAIL_FROM`.
7. **Formule Pro** (facultatif) : créer un produit avec un prix mensuel dans Stripe (`STRIPE_PRICE_ID`), puis un webhook
   vers `https://mondomaine.fr/api/stripe/webhook` avec les évènements `checkout.session.completed`,
   `customer.subscription.updated` et `customer.subscription.deleted` (`STRIPE_WEBHOOK_SECRET`). Activer aussi le
   portail client dans Stripe.
8. **Domaines perso automatiques** (facultatif) : créer un token Vercel et renseigner `VERCEL_API_TOKEN`,
   `VERCEL_PROJECT_ID` et `VERCEL_TEAM_ID`. Sans eux, le domaine est vérifié par lecture DNS et tu l'ajoutes
   toi-même au projet Vercel.
9. Lancer `npm run db:seed` une fois sur la base de production pour que les liens « Voir un exemple » fonctionnent.

## À personnaliser avant la mise en ligne

- `src/content/profile.ts` : nom, accroche, liens GitHub et LinkedIn, projets. Ils ont été préremplis à partir de
  tes dépôts, à relire.
- `src/app/(site)/mentions-legales/page.tsx` : statut, SIRET, adresse. À faire relire.
- `PRO_PRICE_LABEL` dans `src/lib/integrations.ts`, à aligner avec le prix Stripe.
- Le nom « Éclore » (`builderName` dans `profile.ts`).

## Pistes pour la suite

- Type « Boutique en ligne » avec paiement Stripe Connect, pour que les commerçants encaissent directement.
- Acompte à la réservation, et créneaux réels plutôt qu'une demande de rendez-vous.
- Limitation du nombre de requêtes (Upstash) sur les formulaires publics et l'envoi d'images.
- Nettoyage des images orphelines (envoyées dans un brouillon jamais publié).
- Stockage des images sur Vercel Blob si le volume grossit.
