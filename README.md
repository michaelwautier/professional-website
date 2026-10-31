# Site professionnel + Éclore

Un seul projet Next.js qui sert deux choses sur le même nom de domaine :

- **Le portfolio** (`mondomaine.fr`) : présentation, services, projets, formulaire de contact.
- **Éclore**, un service de création de sites en libre-service pour les professionnels non techniques. En quelques
  étapes, ils obtiennent un site vitrine, de prise de rendez-vous ou de restaurant, en ligne immédiatement sur
  `leur-nom.mondomaine.fr`. Ils peuvent ensuite le modifier, recevoir les demandes de leurs clients, passer à la
  formule Pro pour avoir leur propre domaine, ou te confier la suite.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · PostgreSQL + Drizzle ORM · Stripe · Resend

## Faire tourner le projet en local

Aucun service externe n'est nécessaire : sans clés Resend, Stripe ou Vercel, chaque fonctionnalité a un mode local.

### Prérequis

- **Node.js 20.9 ou plus récent**, avec npm
- **PostgreSQL**, au choix :
  - Homebrew : `brew install postgresql@18 && brew services start postgresql@18`
  - Docker : le fichier `docker-compose.yml` fourni suffit

### 1. Installer

```bash
git clone git@github.com:michaelwautier/professional-website.git
cd professional-website
npm install
cp .env.example .env.local
```

Pour démarrer, seules deux variables de `.env.local` comptent :

| Variable | Valeur locale | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `localhost:3100` | Domaine racine. Les sites clients sont servis sur `<slug>.localhost:3100`. |
| `DATABASE_URL` | `postgres://localhost:5432/professional_website` | Connexion Postgres (voir l'étape 2 pour Docker). |
| `OWNER_EMAIL` | ton adresse | Facultative : propriétaire des sites de démo, reçoit les prospects et accède à `/espace/admin`. |

Les autres variables (Resend, Stripe, Vercel) peuvent rester vides.

### 2. Créer la base de données

Avec Postgres installé via Homebrew :

```bash
createdb professional_website
```

Ou avec Docker, en remplaçant d'abord dans `.env.local` :
`DATABASE_URL=postgres://postgres:postgres@localhost:5432/professional_website`

```bash
docker compose up -d
```

Puis, dans les deux cas, créer les tables et les trois sites de démonstration :

```bash
npm run db:migrate
npm run db:seed
```

### 3. Lancer

```bash
npm run dev
```

| Adresse | Contenu |
| --- | --- |
| http://localhost:3100 | Portfolio |
| http://localhost:3100/creer | Création d'un site (Éclore) |
| http://localhost:3100/espace | Espace client |
| http://demo-artisan.localhost:3100 | Site de démo vitrine |
| http://demo-coiffure.localhost:3100 | Site de démo prise de rendez-vous |
| http://demo-restaurant.localhost:3100 | Site de démo restaurant |

Chrome, Firefox et Edge résolvent `*.localhost` tout seuls. Si ton navigateur ne le fait pas, ajoute une ligne par
site dans `/etc/hosts`, par exemple `127.0.0.1 demo-artisan.localhost`.

### Tester les parcours sans services externes

- **Créer un site** : passe par `/creer`. Le site est en ligne dès la dernière étape, sur `<slug>.localhost:3100`.
- **Se connecter** : sur `/connexion`, le lien magique s'affiche directement sur la page et dans la console du
  serveur. Tous les e-mails (bienvenue, nouvelles demandes, prospects) y sont aussi imprimés.
- **Accéder à l'administration** : connecte-toi avec `OWNER_EMAIL`, puis ouvre `/espace/admin`.
- **Formule Pro et domaine perso** : dans l'onglet « Domaine » d'un site, le bouton « Simuler le paiement (dev) »
  active la formule Pro, et la vérification DNS passe automatiquement en local. Pour voir le site servi par son
  domaine : `curl -H "Host: mon-domaine.fr" http://localhost:3100`.

### Scripts utiles

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement sur le port 3100 |
| `npm run build` puis `npm start` | Build et serveur de production |
| `npm run lint` / `npm run typecheck` | ESLint et vérification TypeScript (comme en CI) |
| `npm run db:generate` | Génère une migration après une modification de `src/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:seed` | (Re)crée les sites de démonstration |
| `npm run db:studio` | Explore la base dans le navigateur (Drizzle Studio) |

### Dépannage

- **Port 3100 déjà utilisé** : change le port dans le script `dev` de `package.json` **et** dans
  `NEXT_PUBLIC_ROOT_DOMAIN`.
- **`docker compose up` échoue sur le port 5432** : un Postgres local tourne déjà. Utilise-le, ou arrête-le avec
  `brew services stop postgresql@18`.
- **Repartir d'une base vide** :

  ```bash
  dropdb professional_website && createdb professional_website && npm run db:migrate && npm run db:seed
  ```

## Contribuer

`main` est protégée : on passe toujours par une branche (`feat/…`, `fix/…`, `docs/…`) et une pull request fusionnée
en squash, après le passage de la CI (lint, types, migrations, build). Le titre de la PR devient le message du commit
sur `main` : il doit suivre les Conventional Commits (`feat: …`, `fix: …`).

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
