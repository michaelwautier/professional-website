import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClientOnly } from "@/components/builder/client-only";
import { SiteBuilder } from "@/components/builder/site-builder";
import { getCurrentUser } from "@/lib/auth";
import { TYPE_META } from "@/lib/presets";
import { isSiteType, SITE_TYPES } from "@/lib/site-schema";

export function generateStaticParams() {
  return SITE_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps<"/creer/[type]">): Promise<Metadata> {
  const { type } = await params;
  return { title: isSiteType(type) ? `Créer mon site · ${TYPE_META[type].label}` : "Créer mon site" };
}

// Le squelette fait partie de la coquille statique ; le type et la session sont lus à la requête.
export default function CreatePage({ params }: PageProps<"/creer/[type]">) {
  return (
    <div className="h-[calc(100dvh-3.5rem)]">
      <Suspense fallback={<BuilderSkeleton />}>
        <BuilderForVisitor params={params} />
      </Suspense>
    </div>
  );
}

async function BuilderForVisitor({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isSiteType(type)) notFound();
  const user = await getCurrentUser();
  return (
    <ClientOnly fallback={<BuilderSkeleton />}>
      <SiteBuilder mode="create" type={type} userEmail={user?.email ?? null} />
    </ClientOnly>
  );
}

function BuilderSkeleton() {
  return (
    <div className="grid h-full lg:grid-cols-[minmax(400px,480px)_1fr]">
      <div className="space-y-4 border-r border-line p-6">
        <div className="h-2 w-full animate-pulse rounded-full bg-line" />
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-line" />
        <div className="h-24 animate-pulse rounded-xl bg-line/60" />
        <div className="h-12 animate-pulse rounded-xl bg-line/60" />
      </div>
      <div className="hidden p-4 lg:block">
        <div className="h-full animate-pulse rounded-2xl bg-line/50" />
      </div>
    </div>
  );
}
