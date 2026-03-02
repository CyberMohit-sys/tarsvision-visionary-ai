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
    const { prompt, imageBase64, mimeType } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(JSON.stringify({ error: "Image data is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const imgMimeType = mimeType || 'image/jpeg';
    if (!allowedTypes.includes(imgMimeType)) {
      return new Response(JSON.stringify({ error: "Invalid image type. Only JPG, PNG, WEBP allowed." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check approximate base64 size (5MB limit)
    const sizeInBytes = (imageBase64.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Image exceeds 5MB limit" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Enhance transformation prompt
    const enhanceResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional AI image editor. Enhance this image transformation prompt to be more detailed and specific. Add details about style, lighting, color palette, and artistic direction. Keep it under 200 words.\n\nOriginal prompt: "${prompt}"\n\nReturn ONLY the enhanced prompt text, nothing else.`
            }]
          }]
        }),
      }
    );

    let enhancedPrompt = prompt;
    if (enhanceResponse.ok) {
      const enhanceData = await enhanceResponse.json();
      enhancedPrompt = enhanceData.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
    } else {
      const enhanceError = await enhanceResponse.text();
      console.error("Enhance prompt error:", enhanceResponse.status, enhanceError);
      // Continue with original prompt if enhancement fails
    }

    // Step 2: Send image + prompt to Gemini multimodal for editing
    const editResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: enhancedPrompt },
              {
                inlineData: {
                  mimeType: imgMimeType,
                  data: imageBase64,
                }
              }
            ]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!editResponse.ok) {
      const errText = await editResponse.text();
      console.error("Edit image error:", errText);
      throw new Error(`Image generation failed: ${editResponse.status} - ${errText}`);
    }

    const editData = await editResponse.json();
    const parts = editData.candidates?.[0]?.content?.parts || [];
    
    const images: string[] = [];
    for (const part of parts) {
      if (part.inlineData) {
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    }

    if (images.length === 0) {
      throw new Error("No images generated from API response");
    }

    return new Response(JSON.stringify({ 
      success: true,
      data: {
        images, 
        enhancedPrompt,
        count: images.length 
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("edit-image error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});