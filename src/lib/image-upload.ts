// Redimensionne l'image dans le navigateur avant l'envoi : photos de téléphone de 8 Mo → ~300 Ko.

const MAX_SIDE = { logo: 512, cover: 2000, gallery: 1600 } as const;

export type ImageKind = keyof typeof MAX_SIDE;

async function resize(file: File, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  // WebP garde la transparence des logos ; certains navigateurs ne savent pas l'encoder et renvoient du PNG.
  const webp = await toBlob("image/webp");
  if (webp?.type === "image/webp") return webp;
  const fallback = await toBlob(file.type === "image/png" ? "image/png" : "image/jpeg");
  if (!fallback) throw new Error("Impossible de lire cette image.");
  return fallback;
}

export async function uploadImage(file: File, kind: ImageKind): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Ce fichier n'est pas une image.");
  const blob = await resize(file, MAX_SIDE[kind]);

  const body = new FormData();
  body.append("file", blob, "image");
  const res = await fetch("/api/media", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "L'envoi de l'image a échoué.");
  return data.url;
}
