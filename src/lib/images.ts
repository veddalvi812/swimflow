import { useFreeStore } from "@/store/free-store";
import { toast } from "@/store/ui";

const MAX_DIM = 1200;
const MAX_BYTES = 8 * 1024 * 1024;

// Shrinks an image so it can live inside the board data, then drops it on the canvas.
export async function addImageFile(file: File, at: { x: number; y: number }) {
  if (!file.type.startsWith("image/")) return false;
  if (file.size > MAX_BYTES) {
    toast("That image is over 8 MB. Try a smaller one.", "error");
    return false;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    const keepAlpha = file.type === "image/png" || file.type === "image/gif" || file.type === "image/webp";
    const src = canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.85);
    // Show it at a comfortable size on the canvas.
    const shown = Math.min(1, 360 / w);
    useFreeStore.getState().addBlock("image", { src, alt: file.name }, at, {
      w: Math.round(w * shown),
      h: Math.round(h * shown),
      fixed: true,
    });
    return true;
  } catch {
    toast("Couldn't read that image.", "error");
    return false;
  }
}
