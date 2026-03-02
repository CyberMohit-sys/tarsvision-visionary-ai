import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, aspectRatio, creativity, detail, lighting } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Enhance prompt using Gemini text model
    const enhanceResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional AI image prompt engineer. Enhance this image generation prompt to be more detailed, cinematic, and visually stunning. Add specific details about lighting, composition, camera angle, resolution, and artistic style. Keep it under 300 words.

Style preset: ${style || 'Cinematic Ultra'}
Aspect ratio: ${aspectRatio || '1:1'}
Creativity level: ${creativity || 70}%
Detail intensity: ${detail || 80}%
Lighting: ${lighting || 'Natural'}

Original prompt: "${prompt}"

Return ONLY the enhanced prompt text, nothing else.`
            }]
          }]
        }),
      }
    );

    if (!enhanceResponse.ok) {
      const errText = await enhanceResponse.text();
      console.error("Enhance error:", errText);
      throw new Error("Failed to enhance prompt");
    }

    const enhanceData = await enhanceResponse.json();
    const enhancedPrompt = enhanceData.candidates?.[0]?.content?.parts?.[0]?.text || prompt;

    // Step 2: Generate image using Gemini image model
    const imageResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: enhancedPrompt }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!imageResponse.ok) {
      const errText = await imageResponse.text();
      console.error("Image generation error:", errText);
      throw new Error("Failed to generate image");
    }

    const imageData = await imageResponse.json();
    const parts = imageData.candidates?.[0]?.content?.parts || [];
    
    const images: string[] = [];
    for (const part of parts) {
      if (part.inlineData) {
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    }

    return new Response(JSON.stringify({ 
      images, 
      enhancedPrompt,
      count: images.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
