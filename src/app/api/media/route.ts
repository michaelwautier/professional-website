import { db } from "@/db";
import { media } from "@/db/schema";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

// Les images sont redimensionnées dans le navigateur avant l'envoi (voir lib/image-upload.ts).
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Aucune image reçue." }, { status: 400 });
  if (!ALLOWED.has(file.type)) return Response.json({ error: "Format accepté : JPEG, PNG ou WebP." }, { status: 415 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Image trop lourde (2 Mo maximum)." }, { status: 413 });

  const [row] = await db
    .insert(media)
    .values({ mime: file.type, size: file.size, data: Buffer.from(await file.arrayBuffer()) })
    .returning({ id: media.id });

  return Response.json({ url: `/api/media/${row.id}` });
}
