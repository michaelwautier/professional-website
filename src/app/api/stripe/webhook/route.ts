import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import type Stripe from "stripe";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { getStripe } from "@/lib/integrations";
import { tagsForSite } from "@/lib/sites";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);

async function setPlan(siteId: string, values: Partial<typeof sites.$inferInsert>) {
  const [site] = await db.update(sites).set(values).where(eq(sites.id, siteId)).returning();
  if (site) tagsForSite(site).forEach((tag) => revalidateTag(tag, { expire: 0 }));
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe non configuré", { status: 501 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const siteId = session.metadata?.siteId;
      if (siteId && session.mode === "subscription") {
        await setPlan(siteId, {
          plan: "pro",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const siteId = subscription.metadata?.siteId;
      if (!siteId) break;
      const active = event.type === "customer.subscription.updated" && ACTIVE_STATUSES.has(subscription.status);
      // Fin d'abonnement : le site repasse sur son sous-domaine gratuit, le domaine perso reste enregistré.
      await setPlan(siteId, active ? { plan: "pro" } : { plan: "free", stripeSubscriptionId: null });
      break;
    }
  }

  return Response.json({ received: true });
}
