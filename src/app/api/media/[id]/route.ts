import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

// Une image n'est jamais modifiée (une nouvelle image = un nouvel identifiant) : cache navigateur et CDN permanent.
export async function GET(_request: Request, { params }: RouteContext<"/api/media/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Introuvable", { status: 404 });

  const [file] = await db.select({ mime: media.mime, data: media.data }).from(media).where(eq(media.id, id)).limit(1);
  if (!file) return new Response("Introuvable", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
