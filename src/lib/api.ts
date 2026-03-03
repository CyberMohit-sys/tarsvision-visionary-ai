import { supabase } from "@/integrations/supabase/client";

export interface GenerateParams {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  creativity?: number;
  detail?: number;
  lighting?: string;
}

export interface EditParams {
  prompt: string;
  imageBase64: string;
  mimeType?: string;
}

export interface GenerateResult {
  images: string[];
  enhancedPrompt: string;
  count: number;
}

export async function generateImage(params: GenerateParams): Promise<GenerateResult> {
  const { data, error } = await supabase.functions.invoke("generate", {
    body: params,
  });

  if (error) throw new Error(error.message || "Generation failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function editImage(params: EditParams): Promise<GenerateResult> {
  const { data, error } = await supabase.functions.invoke("edit-image", {
    body: params,
  });

  if (error) throw new Error(error.message || "Editing failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

/**
 * Adds a TarsVision watermark to an image via canvas
 */
export function addWatermark(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0);

      // Watermark styling
      const fontSize = Math.max(14, img.width * 0.028);
      ctx.font = `600 ${fontSize}px 'Inter', 'Segoe UI', sans-serif`;

      const text = "TarsVision";
      const metrics = ctx.measureText(text);
      const padding = fontSize * 0.6;
      const x = img.width - metrics.width - padding;
      const y = img.height - padding;

      // Semi-transparent dark pill background
      const bgPadX = fontSize * 0.4;
      const bgPadY = fontSize * 0.25;
      ctx.fillStyle = "rgba(11, 15, 25, 0.65)";
      const bgX = x - bgPadX;
      const bgY = y - fontSize + bgPadY;
      const bgW = metrics.width + bgPadX * 2;
      const bgH = fontSize + bgPadY * 2;
      const radius = bgH / 2;

      ctx.beginPath();
      ctx.moveTo(bgX + radius, bgY);
      ctx.lineTo(bgX + bgW - radius, bgY);
      ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + radius);
      ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - radius, bgY + bgH);
      ctx.lineTo(bgX + radius, bgY + bgH);
      ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - radius);
      ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
      ctx.closePath();
      ctx.fill();

      // Gradient text
      const gradient = ctx.createLinearGradient(x, y, x + metrics.width, y);
      gradient.addColorStop(0, "#a78bfa");
      gradient.addColorStop(1, "#06b6d4");
      ctx.fillStyle = gradient;
      ctx.fillText(text, x, y);

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image for watermark"));
    img.src = imageSrc;
  });
}
