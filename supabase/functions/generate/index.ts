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

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build detailed prompt
    let detailedPrompt = prompt;
    if (style) detailedPrompt += `. Style: ${style}`;
    if (aspectRatio) detailedPrompt += `. Aspect Ratio: ${aspectRatio}`;
    if (lighting) detailedPrompt += `. Lighting: ${lighting}`;
    if (detail) detailedPrompt += `. Detail level: ${detail}/100`;
    if (creativity) detailedPrompt += `. Creativity: ${creativity}/100`;

    // Step 1: Enhance prompt (non-fatal)
    let enhancedPrompt = detailedPrompt;
    try {
      const enhanceResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a professional AI image prompt optimizer. Enhance this prompt to be more detailed, vivid, and specific for image generation. Add details about style, composition, lighting, color palette, mood, and artistic direction. Keep it under 200 words. Return ONLY the enhanced prompt text.\n\nOriginal: "${detailedPrompt}"`
              }]
            }]
          }),
        }
      );

      if (enhanceResponse.ok) {
        const enhanceData = await enhanceResponse.json();
        const enhancedText = enhanceData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (enhancedText) enhancedPrompt = enhancedText;
      } else {
        console.warn("Enhance warning:", enhanceResponse.status);
      }
    } catch (enhanceErr) {
      console.warn("Enhance step failed:", enhanceErr);
    }

    // Step 2: Generate image
    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: enhancedPrompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      }
    );

    if (!generateResponse.ok) {
      const errText = await generateResponse.text();
      console.error("Generate error:", generateResponse.status, errText);

      // If Gemini fails, fall back to Lovable AI
      console.log("Falling back to Lovable AI gateway...");
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error(`Image generation failed: ${generateResponse.status}`);
      }

      const fallbackResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: enhancedPrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!fallbackResponse.ok) {
        const fallbackErr = await fallbackResponse.text();
        console.error("Fallback error:", fallbackResponse.status, fallbackErr);
        throw new Error(`Image generation failed on both APIs`);
      }

      const fallbackData = await fallbackResponse.json();
      const message = fallbackData.choices?.[0]?.message;
      const images: string[] = [];
      if (message?.images) {
        for (const img of message.images) {
          if (img?.image_url?.url) images.push(img.image_url.url);
        }
      }

      if (images.length === 0) throw new Error("No images generated");

      return new Response(JSON.stringify({ images, enhancedPrompt, count: images.length }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const generateData = await generateResponse.json();
    const parts = generateData.candidates?.[0]?.content?.parts || [];
    const images: string[] = [];
    for (const part of parts) {
      if (part.inlineData) {
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    }

    if (images.length === 0) throw new Error("No images generated from API response");

    return new Response(JSON.stringify({ images, enhancedPrompt, count: images.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
