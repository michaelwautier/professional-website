import type { MenuCategory, Service, SiteContent, SiteStyle, SiteType } from "@/lib/site-schema";

// Textes et prestations d'exemple proposés selon le métier : personne ne part d'une page blanche.

type Preset = {
  id: string;
  label: string;
  tagline: string;
  about: string;
  services?: Service[];
  menu?: MenuCategory[];
  color: string;
  style: SiteStyle;
};

type Day = SiteContent["hours"][number];

const s = (name: string, description = "", price = "", duration = ""): Service => ({
  name,
  description,
  price,
  duration,
});

const item = (name: string, description: string, price: string) => ({ name, description, price });

const open = (hours: string): Day => ({ closed: false, hours });
const closed: Day = { closed: true, hours: "" };

export const TYPE_META: Record<
  SiteType,
  {
    label: string;
    pitch: string;
    examples: string;
    cta: string;
    servicesTitle: string;
    formTitle: string;
    formIntro: string;
    hours: Day[];
  }
> = {
  vitrine: {
    label: "Site vitrine",
    pitch: "Présentez votre activité, vos services et recevez des demandes de devis.",
    examples: "Artisans, consultants, professions libérales, créatifs",
    cta: "Demander un devis",
    servicesTitle: "Nos services",
    formTitle: "Parlons de votre projet",
    formIntro: "Décrivez votre besoin, nous vous répondons rapidement.",
    hours: [open("9h – 18h"), open("9h – 18h"), open("9h – 18h"), open("9h – 18h"), open("9h – 18h"), closed, closed],
  },
  rendezvous: {
    label: "Prise de rendez-vous",
    pitch: "Affichez vos prestations et tarifs, vos clients demandent un créneau en ligne.",
    examples: "Coiffeurs, esthéticiennes, coachs, thérapeutes, garages",
    cta: "Prendre rendez-vous",
    servicesTitle: "Prestations & tarifs",
    formTitle: "Prendre rendez-vous",
    formIntro: "Choisissez une prestation et un créneau, nous vous confirmons le rendez-vous.",
    hours: [closed, open("9h – 19h"), open("9h – 19h"), open("9h – 19h"), open("9h – 19h"), open("9h – 17h"), closed],
  },
  restaurant: {
    label: "Restaurant & carte",
    pitch: "Mettez en valeur votre carte, vos horaires et recevez des réservations.",
    examples: "Restaurants, bars, cafés, boulangeries, food trucks",
    cta: "Réserver une table",
    servicesTitle: "La carte",
    formTitle: "Réserver une table",
    formIntro: "Indiquez la date, l'heure et le nombre de couverts, nous vous confirmons la réservation.",
    hours: [
      closed,
      open("12h – 14h30 · 19h – 22h30"),
      open("12h – 14h30 · 19h – 22h30"),
      open("12h – 14h30 · 19h – 22h30"),
      open("12h – 14h30 · 19h – 23h"),
      open("12h – 14h30 · 19h – 23h"),
      open("12h – 15h"),
    ],
  },
};

export const PRESETS: Record<SiteType, Preset[]> = {
  vitrine: [
    {
      id: "artisan",
      label: "Artisan du bâtiment",
      tagline: "Votre artisan de confiance à {city}",
      about:
        "{name} intervient à {city} et dans ses environs pour tous vos travaux, du petit dépannage au chantier complet.\n\nNous travaillons avec soin, dans le respect des délais et de votre budget. Chaque devis est gratuit et sans engagement.",
      services: [
        s("Dépannage rapide", "Intervention sous 24 h pour les urgences."),
        s("Installation", "Pose et mise en service de vos équipements, dans les règles de l'art."),
        s("Rénovation", "Remise à neuf complète, du conseil à la finition."),
        s("Entretien", "Contrats d'entretien pour éviter les mauvaises surprises."),
      ],
      color: "#1e3a8a",
      style: "moderne",
    },
    {
      id: "consultant",
      label: "Consultant / indépendant",
      tagline: "J'aide les entreprises à {city} à passer un cap",
      about:
        "Fort d'une solide expérience terrain, {name} accompagne dirigeants et équipes pour clarifier leurs priorités et passer à l'action.\n\nMon approche : écouter, comprendre votre contexte, puis proposer des solutions concrètes et mesurables.",
      services: [
        s("Diagnostic", "Un état des lieux précis de votre situation et de vos leviers."),
        s("Accompagnement", "Un suivi régulier pour mettre en œuvre les changements."),
        s("Formation", "Des ateliers pratiques pour faire monter vos équipes en compétence."),
      ],
      color: "#27272a",
      style: "moderne",
    },
    {
      id: "liberal",
      label: "Profession libérale",
      tagline: "Conseil et accompagnement à {city}",
      about:
        "{name} vous reçoit à {city} et vous accompagne avec rigueur et confidentialité.\n\nNous prenons le temps de comprendre votre situation pour vous apporter des réponses claires et adaptées.",
      services: [
        s("Premier rendez-vous", "Un échange pour faire le point sur votre situation."),
        s("Conseil", "Des recommandations personnalisées et argumentées."),
        s("Suivi", "Un accompagnement dans la durée, à chaque étape."),
      ],
      color: "#1e3a8a",
      style: "elegant",
    },
    {
      id: "creatif",
      label: "Photographe / créatif",
      tagline: "Des images qui racontent votre histoire",
      about:
        "Basé à {city}, {name} capture les moments qui comptent avec un regard sensible et naturel.\n\nChaque projet est unique : nous en parlons ensemble pour créer des images qui vous ressemblent.",
      services: [
        s("Mariages & événements", "Un reportage complet de votre journée."),
        s("Portraits", "Des séances en studio ou en extérieur."),
        s("Entreprises", "Photos corporate, produits et locaux."),
      ],
      color: "#27272a",
      style: "elegant",
    },
    {
      id: "autre",
      label: "Autre activité",
      tagline: "Votre partenaire à {city}",
      about:
        "{name} est installé à {city}. Nous mettons notre savoir-faire à votre service avec un seul objectif : votre satisfaction.\n\nContactez-nous pour en savoir plus, nous serons ravis de vous répondre.",
      services: [
        s("Service 1", "Décrivez ici votre premier service."),
        s("Service 2", "Décrivez ici votre deuxième service."),
        s("Service 3", "Décrivez ici votre troisième service."),
      ],
      color: "#0e7490",
      style: "moderne",
    },
  ],
  rendezvous: [
    {
      id: "coiffure",
      label: "Coiffure",
      tagline: "Votre salon de coiffure à {city}",
      about:
        "Bienvenue chez {name} ! Notre équipe vous accueille à {city} dans une ambiance détendue pour prendre soin de vos cheveux.\n\nCoupes, couleurs, soins : nous prenons le temps de vous conseiller pour un résultat qui vous ressemble.",
      services: [
        s("Coupe femme", "Shampoing, coupe et brushing.", "38 €", "45 min"),
        s("Coupe homme", "Shampoing, coupe et coiffage.", "22 €", "30 min"),
        s("Couleur", "Coloration complète, soin inclus.", "à partir de 55 €", "1 h 30"),
        s("Brushing", "Mise en forme et coiffage.", "25 €", "30 min"),
      ],
      color: "#9f1239",
      style: "elegant",
    },
    {
      id: "beaute",
      label: "Beauté & bien-être",
      tagline: "Un moment rien que pour vous à {city}",
      about:
        "{name} vous accueille à {city} pour une parenthèse de douceur.\n\nNos soins sont réalisés avec des produits de qualité, dans un cadre calme et chaleureux.",
      services: [
        s("Soin du visage", "Nettoyage, gommage et masque adaptés à votre peau.", "60 €", "1 h"),
        s("Massage relaxant", "Un massage complet pour relâcher les tensions.", "65 €", "1 h"),
        s("Manucure", "Soin des mains et pose de vernis.", "30 €", "45 min"),
      ],
      color: "#6b21a8",
      style: "chaleureux",
    },
    {
      id: "accompagnement",
      label: "Coach / thérapeute",
      tagline: "Avancer à votre rythme, en confiance",
      about:
        "{name} vous accompagne à {city} et en visio pour retrouver de l'équilibre et atteindre vos objectifs.\n\nChaque accompagnement est personnalisé : nous commençons par une première séance pour faire connaissance.",
      services: [
        s("Première séance", "Faire connaissance et définir vos objectifs.", "60 €", "1 h"),
        s("Séance de suivi", "Un temps d'échange régulier.", "50 €", "45 min"),
        s("Séance en visio", "Le même accompagnement, depuis chez vous.", "50 €", "45 min"),
      ],
      color: "#166534",
      style: "chaleureux",
    },
    {
      id: "garage",
      label: "Garage / atelier",
      tagline: "L'entretien de votre véhicule à {city}",
      about:
        "{name} prend soin de votre véhicule à {city} : entretien, réparations et diagnostic, toutes marques.\n\nDevis transparent avant toute intervention, et un véhicule rendu dans les délais.",
      services: [
        s("Vidange", "Vidange et remplacement du filtre à huile.", "à partir de 69 €", "1 h"),
        s("Révision complète", "Points de contrôle constructeur.", "à partir de 149 €", "2 h"),
        s("Pneus", "Montage, équilibrage et géométrie.", "sur devis", "1 h"),
        s("Diagnostic", "Lecture électronique et recherche de panne.", "49 €", "45 min"),
      ],
      color: "#27272a",
      style: "moderne",
    },
    {
      id: "autre",
      label: "Autre activité",
      tagline: "Réservez votre créneau en quelques clics",
      about:
        "{name} vous reçoit à {city} sur rendez-vous.\n\nChoisissez votre prestation ci-dessous et indiquez le créneau qui vous arrange, nous vous confirmons rapidement.",
      services: [
        s("Prestation 1", "Décrivez cette prestation.", "40 €", "1 h"),
        s("Prestation 2", "Décrivez cette prestation.", "60 €", "1 h 30"),
      ],
      color: "#0e7490",
      style: "moderne",
    },
  ],
  restaurant: [
    {
      id: "restaurant",
      label: "Restaurant",
      tagline: "Cuisine de saison, faite maison, à {city}",
      about:
        "Chez {name}, nous cuisinons des produits frais et locaux, au rythme des saisons.\n\nUne carte courte qui change souvent, une équipe aux petits soins : on vous attend à {city} !",
      menu: [
        {
          name: "Entrées",
          items: [
            item("Velouté du moment", "Selon le marché, crème crue et croûtons.", "8 €"),
            item("Œuf parfait", "Crème de champignons, noisettes torréfiées.", "11 €"),
          ],
        },
        {
          name: "Plats",
          items: [
            item("Poisson du jour", "Légumes de saison, beurre blanc.", "22 €"),
            item("Suprême de volaille", "Purée maison, jus corsé.", "19 €"),
            item("Risotto végétarien", "Parmesan et herbes fraîches.", "17 €"),
          ],
        },
        {
          name: "Desserts",
          items: [
            item("Mousse au chocolat", "Chocolat noir 70 %, fleur de sel.", "8 €"),
            item("Tarte du jour", "Fruits de saison.", "8 €"),
          ],
        },
      ],
      color: "#c2410c",
      style: "chaleureux",
    },
    {
      id: "bar",
      label: "Bar / café",
      tagline: "Le rendez-vous des bons moments à {city}",
      about:
        "{name}, c'est un café le matin, une planche à partager le soir, et toujours une bonne ambiance.\n\nPassez nous voir à {city}, en terrasse ou au comptoir.",
      menu: [
        {
          name: "Boissons chaudes",
          items: [item("Espresso", "", "2 €"), item("Cappuccino", "", "3,50 €"), item("Chocolat chaud", "", "4 €")],
        },
        {
          name: "Cocktails",
          items: [
            item("Spritz", "Apéritif, prosecco, eau pétillante.", "8 €"),
            item("Mojito", "Rhum, citron vert, menthe fraîche.", "9 €"),
          ],
        },
        {
          name: "À partager",
          items: [
            item("Planche mixte", "Charcuterie et fromages de la région.", "18 €"),
            item("Houmous maison", "Pain pita grillé.", "7 €"),
          ],
        },
      ],
      color: "#b45309",
      style: "moderne",
    },
    {
      id: "boulangerie",
      label: "Boulangerie / pâtisserie",
      tagline: "Pains et pâtisseries artisanales à {city}",
      about:
        "Chaque matin, {name} pétrit, façonne et cuit sur place des pains au levain et des viennoiseries pur beurre.\n\nRetrouvez-nous à {city} pour une baguette tout juste sortie du four.",
      menu: [
        {
          name: "Pains",
          items: [
            item("Baguette tradition", "", "1,30 €"),
            item("Pain de campagne au levain", "", "4,50 €"),
          ],
        },
        {
          name: "Viennoiseries",
          items: [item("Croissant pur beurre", "", "1,20 €"), item("Pain au chocolat", "", "1,40 €")],
        },
        {
          name: "Pâtisseries",
          items: [item("Éclair au chocolat", "", "3,20 €"), item("Tarte aux fruits", "Part individuelle.", "3,80 €")],
        },
      ],
      color: "#b45309",
      style: "chaleureux",
    },
    {
      id: "foodtruck",
      label: "Food truck",
      tagline: "Street food maison, à {city} et alentours",
      about:
        "{name} sillonne {city} et ses environs avec une cuisine généreuse, préparée minute avec des produits frais.\n\nRetrouvez nos emplacements de la semaine et réservez pour vos événements !",
      menu: [
        {
          name: "Burgers",
          items: [
            item("Le classique", "Bœuf, cheddar, oignons confits, sauce maison.", "12 €"),
            item("Le végé", "Galette de légumes, fromage frais, roquette.", "11 €"),
          ],
        },
        {
          name: "Accompagnements",
          items: [item("Frites maison", "", "4 €"), item("Salade coleslaw", "", "3,50 €")],
        },
      ],
      color: "#166534",
      style: "moderne",
    },
  ],
};

function fill(template: string, vars: { name: string; city: string }) {
  return template
    .replaceAll("{name}", vars.name.trim() || "Notre entreprise")
    .replaceAll("{city}", vars.city.trim() || "votre ville");
}

export function getPreset(type: SiteType, presetId: string) {
  return PRESETS[type].find((p) => p.id === presetId) ?? PRESETS[type][0];
}

/** Textes du métier choisi, personnalisés avec le nom et la ville. */
export function presetTexts(type: SiteType, presetId: string, vars: { name: string; city: string }) {
  const preset = getPreset(type, presetId);
  return { tagline: fill(preset.tagline, vars), about: fill(preset.about, vars) };
}

export function initialContent(type: SiteType, presetId = PRESETS[type][0].id): SiteContent {
  const preset = getPreset(type, presetId);
  return {
    businessName: "",
    sector: preset.id,
    city: "",
    ...presetTexts(type, preset.id, { name: "", city: "" }),
    services: structuredClone(preset.services ?? []),
    menu: structuredClone(preset.menu ?? []),
    hours: structuredClone(TYPE_META[type].hours),
    contact: { phone: "", email: "", address: "", instagram: "", facebook: "", siret: "" },
    images: { logo: null, cover: null, gallery: [] },
    theme: { color: preset.color, style: preset.style },
  };
}
