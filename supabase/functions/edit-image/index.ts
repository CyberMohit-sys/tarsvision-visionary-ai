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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const imgMimeType = mimeType || 'image/jpeg';
    if (!allowedTypes.includes(imgMimeType)) {
      return new Response(JSON.stringify({ error: "Invalid image type. Only JPG, PNG, WEBP allowed." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sizeInBytes = (imageBase64.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Image exceeds 5MB limit" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageDataUrl = `data:${imgMimeType};base64,${imageBase64}`;

    // Edit image using Lovable AI multimodal
    const editResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageDataUrl } }
            ]
          }
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!editResponse.ok) {
      const errText = await editResponse.text();
      console.error("Edit image error:", editResponse.status, errText);

      if (editResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (editResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Image editing failed: ${editResponse.status}`);
    }

    const editData = await editResponse.json();
    const message = editData.choices?.[0]?.message;

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
      enhancedPrompt: prompt,
      count: images.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("edit-image error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
