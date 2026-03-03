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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build detailed prompt with style and parameters
    let detailedPrompt = prompt;
    if (style) detailedPrompt += `. Style: ${style}`;
    if (aspectRatio) detailedPrompt += `. Aspect Ratio: ${aspectRatio}`;
    if (lighting) detailedPrompt += `. Lighting: ${lighting}`;
    if (detail) detailedPrompt += `. Detail level: ${detail}/100`;
    if (creativity) detailedPrompt += `. Creativity: ${creativity}/100`;

    // Step 1: Enhance the prompt using Lovable AI text model
    let enhancedPrompt = detailedPrompt;
    try {
      const enhanceResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: "You are a professional AI image prompt optimizer. Enhance prompts to be more detailed, vivid, and specific for image generation. Add details about style, composition, lighting, color palette, mood, and artistic direction. Keep it under 200 words. Return ONLY the enhanced prompt text, nothing else."
            },
            { role: "user", content: detailedPrompt }
          ],
        }),
      });

      if (enhanceResponse.ok) {
        const enhanceData = await enhanceResponse.json();
        const enhancedText = enhanceData.choices?.[0]?.message?.content;
        if (enhancedText) enhancedPrompt = enhancedText;
      } else {
        console.warn("Enhance prompt warning:", enhanceResponse.status);
      }
    } catch (enhanceErr) {
      console.warn("Enhance step failed, using original prompt:", enhanceErr);
    }

    // Step 2: Generate image using Lovable AI image model
    const generateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { role: "user", content: enhancedPrompt }
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!generateResponse.ok) {
      const errText = await generateResponse.text();
      console.error("Generate image error:", generateResponse.status, errText);

      if (generateResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (generateResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in your workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Image generation failed: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    const message = generateData.choices?.[0]?.message;

    const images: string[] = [];
    if (message?.images) {
      for (const img of message.images) {
        if (img?.image_url?.url) {
          images.push(img.image_url.url);
        }
      }
    }

    if (images.length === 0) {
      throw new Error("No images generated from API response");
    }

    return new Response(JSON.stringify({
      images,
      enhancedPrompt,
      count: images.length,
    }), {
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
