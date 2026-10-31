// Contenu du portfolio : tout ce qui te présente se modifie ici.
// ⚠️ À relire : nom, accroche, liens et descriptions de projets ont été préremplis à partir de tes dépôts.

export const profile = {
  name: "Michael Wautier",
  firstName: "Michael",
  role: "Développeur web full-stack",
  location: "France · à distance",
  headline: "Je conçois des sites et des applications web qui font gagner du temps à ceux qui les utilisent.",
  intro:
    "Développeur full-stack, j'accompagne indépendants, TPE et startups de l'idée à la mise en ligne : site vitrine, outil métier sur-mesure ou produit SaaS avec paiement en ligne. Un seul interlocuteur, du code solide et des explications sans jargon.",
  email: "wautiermichael@gmail.com",
  availability: "Disponible pour de nouveaux projets",
  links: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
  },
  // Nom du service de création de sites proposé aux professionnels.
  builderName: "Éclore",
};

export const skills = [
  "Ruby on Rails",
  "TypeScript",
  "React",
  "Next.js",
  "Vue 3",
  "Hotwire",
  "PostgreSQL",
  "Stripe",
  "Capacitor",
  "Python",
  "Rust",
  "Tailwind CSS",
];

export const services = [
  {
    icon: "layout",
    title: "Sites vitrines & landing pages",
    description:
      "Un site rapide, bien référencé et facile à mettre à jour pour présenter votre activité et être trouvé sur Google.",
  },
  {
    icon: "app",
    title: "Applications web sur-mesure",
    description:
      "Outils métiers, plateformes SaaS, espaces clients : je transforme vos processus en logiciels simples à utiliser.",
  },
  {
    icon: "mobile",
    title: "Applications mobiles",
    description:
      "iOS et Android à partir d'une seule base de code, avec Hotwire Native ou Capacitor, publiées sur les stores.",
  },
  {
    icon: "payment",
    title: "Paiement & abonnements",
    description:
      "Encaissement en ligne, abonnements, factures automatiques : intégration Stripe complète et sécurisée.",
  },
  {
    icon: "support",
    title: "Maintenance & accompagnement",
    description:
      "Mises à jour, sécurité, nouvelles fonctionnalités : je reste à vos côtés une fois le projet en ligne.",
  },
];

export type Project = {
  name: string;
  kind: string;
  description: string;
  highlights: string[];
  stack: string[];
  url?: string;
  accent: string;
  icon: "wallet" | "calendar" | "cart" | "keyboard";
};

export const projects: Project[] = [
  {
    name: "Centime",
    kind: "Application web & mobile",
    description:
      "Suivi des revenus et dépenses avec synchronisation bancaire automatique (DSP2) et catégorisation qui apprend des habitudes de l'utilisateur.",
    highlights: ["Synchro bancaire GoCardless", "Formule Pro via Stripe", "Apps iOS/Android en Hotwire Native"],
    stack: ["Rails 8", "PostgreSQL", "Hotwire", "Stripe", "Kamal"],
    accent: "#0f766e",
    icon: "wallet",
  },
  {
    name: "Planning IDEL",
    kind: "Outil métier",
    description:
      "Générateur de plannings pour un cabinet infirmier libéral : il répartit équitablement les tournées en respectant les indisponibilités et les règles du cabinet.",
    highlights: ["Solveur de contraintes CP-SAT", "Plannings équitables en quelques secondes", "En production"],
    stack: ["Python", "OR-Tools", "Streamlit"],
    url: "https://planning-idel.streamlit.app/",
    accent: "#1d4ed8",
    icon: "calendar",
  },
  {
    name: "Caddie Combo",
    kind: "Application mobile",
    description:
      "La liste de courses devient un jeu : elle se trie selon l'ordre des rayons du magasin et se vide rayon par rayon, avec combos et badges.",
    highlights: ["iOS & Android via Capacitor", "Synchronisation temps réel", "Thèmes visuels"],
    stack: ["Vue 3", "TypeScript", "Capacitor", "Rails API"],
    accent: "#c2410c",
    icon: "cart",
  },
  {
    name: "Keyboard Warrior",
    kind: "Jeu",
    description:
      "Un jeu de rythme où chaque note est une lettre : on joue la musique en tapant des mots. Compatible avec les bibliothèques de morceaux existantes.",
    highlights: ["macOS, Windows, Linux", "Démo jouable dans le navigateur", "Téléchargement de morceaux intégré"],
    stack: ["Rust"],
    url: "https://keyboardwarrior.app",
    accent: "#7c3aed",
    icon: "keyboard",
  },
];

export const methodSteps = [
  { title: "On en parle", description: "Un premier échange gratuit pour comprendre votre activité, vos objectifs et votre budget." },
  { title: "Je vous propose", description: "Un devis clair, un planning et une maquette pour valider la direction ensemble." },
  { title: "Je construis", description: "Développement par étapes, avec un aperçu en ligne que vous suivez au fil de l'eau." },
  { title: "On met en ligne", description: "Mise en production, formation à la prise en main et suivi après le lancement." },
];
