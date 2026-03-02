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
