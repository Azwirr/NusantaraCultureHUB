import { COSTUME_SLUGS } from "./assets";

export const PORTRAIT_MODEL = "google/gemini-3.1-flash-image";
export const MAX_FACE_BYTES = 3_000_000;
export const PORTRAIT_CONSENT = "portrait-ai-v1";
export function validCostume(slug: string) { return (COSTUME_SLUGS as readonly string[]).includes(slug); }
export function portraitPrompt(title: string) {
  return `Create exactly ONE coherent photorealistic editorial portrait, vertical 3:4, showing the person in image 1 dressed in the complete Indonesian traditional outfit ${title}. Image 1 is the ONLY identity reference: preserve the person's recognizable face, skin tone, apparent age and facial features. Do not replace them with a model or beautify away their identity. Images 2, 3 and 4 are isolated headwear, upper garment and lower garment references, NOT objects to paste on a photograph. Reconstruct these as one naturally worn, properly fitted outfit with coherent fabric, folds, lighting, realistic human anatomy and a seamless connection between clothing parts. Keep the distinct regional silhouette, textile colors, motifs and accessories of these references. Respect any religious head covering present in the face photo. Show one person from head to below the knees, centered, face sharp and unobstructed, modest fully clothed pose, hands relaxed. Soft warm studio light, a simple cream backdrop, refined cultural fashion photography. No collage, floating clothes, empty costume, cutout edges, duplicate faces, extra people, fantasy armor, writing, logos or watermark. The clothing must belong to the photographed person, not float over their original body. Return the generated image, not an explanation.`;
}
