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

    // Build detailed prompt with style and parameters
    let detailedPrompt = prompt;
    if (style) detailedPrompt += `\nStyle: ${style}`;
    if (aspectRatio) detailedPrompt += `\nAspect Ratio: ${aspectRatio}`;
    if (lighting) detailedPrompt += `\nLighting: ${lighting}`;
    
    // Step 1: Enhance the prompt
    const enhanceResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional AI image generator prompt optimizer. Enhance this prompt to be more detailed, vivid, and specific for image generation. Add details about style, composition, lighting, color palette, mood, and artistic direction. Keep it under 200 words and make it inspirational.\n\nOriginal prompt: "${detailedPrompt}"\n\nReturn ONLY the enhanced prompt text, nothing else.`
            }]
          }]
        }),
      }
    );

    let enhancedPrompt = detailedPrompt;
    try {
      if (enhanceResponse.ok) {
        const enhanceData = await enhanceResponse.json();
        const enhancedText = enhanceData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (enhancedText) {
          enhancedPrompt = enhancedText;
        }
      } else {
        const enhanceError = await enhanceResponse.text();
        console.warn("Enhance prompt warning:", enhanceResponse.status, enhanceError);
        // Continue with original prompt - enhancement is optional
      }
    } catch (enhanceErr) {
      console.warn("Enhance step failed, using original prompt:", enhanceErr);
    }

    // Step 2: Generate images using Gemini
    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        }),
      }
    );

    if (!generateResponse.ok) {
      const errText = await generateResponse.text();
      console.error("Generate image error:", generateResponse.status, errText);
      throw new Error(`Image generation failed: ${generateResponse.status} - ${errText}`);
    }

    const generateData = await generateResponse.json();
    const parts = generateData.candidates?.[0]?.content?.parts || [];
    
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
    console.error("generate error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
