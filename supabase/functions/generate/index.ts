import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Safely retrieve and validate Gemini API key
 */
function getGeminiApiKey(): string | null {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return null;
  }
  return apiKey;
}

/**
 * Enhance prompt using Gemini API with proper error handling
 */
async function enhancePromptWithGemini(
  prompt: string,
  apiKey: string,
  style: string = 'Cinematic Ultra',
  aspectRatio: string = '1:1',
  creativity: number = 70,
  detail: number = 80,
  lighting: string = 'Natural'
): Promise<string> {
  const enhancementPrompt = `You are a professional AI image prompt engineer. Enhance this image generation prompt to be more detailed, cinematic, and visually stunning. Add specific details about lighting, composition, camera angle, resolution, and artistic style. Keep it under 300 words.

Style preset: ${style}
Aspect ratio: ${aspectRatio}
Creativity level: ${creativity}%
Detail intensity: ${detail}%
Lighting: ${lighting}

Original prompt: "${prompt}"

Return ONLY the enhanced prompt text, nothing else.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancementPrompt
            }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini enhancement API error:", response.status, errorText);
      // Fallback: return original prompt if enhancement fails
      return prompt;
    }

    const data = await response.json();
    
    // Validate JSON response structure
    const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!enhancedText || typeof enhancedText !== 'string' || enhancedText.trim().length === 0) {
      console.error("Invalid response structure from Gemini API");
      // Fallback: return original prompt if response is invalid
      return prompt;
    }

    return enhancedText.trim();
  } catch (error) {
    console.error("Error during prompt enhancement:", error instanceof Error ? error.message : error);
    // Fallback: return original prompt on error
    return prompt;
  }
}

/**
 * Generate image using Gemini API with proper error handling
 */
async function generateImageWithGemini(
  enhancedPrompt: string,
  apiKey: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini image generation API error:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    
    const images: string[] = [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    }

    return images;
  } catch (error) {
    console.error("Error during image generation:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Main handler - Process POST requests for image generation
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Parse JSON body with error handling
    let requestBody: Record<string, unknown>;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError instanceof Error ? parseError.message : parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Extract and validate prompt parameter
    const { prompt, style, aspectRatio, creativity, detail, lighting } = requestBody;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: "Prompt is required and must be a string" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (prompt.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Prompt must be less than 2000 characters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Check for API key early
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "API configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Step 1: Enhance prompt (with fallback to original if fails)
    const enhancedPrompt = await enhancePromptWithGemini(
      prompt,
      apiKey,
      style as string | undefined,
      aspectRatio as string | undefined,
      creativity as number | undefined,
      detail as number | undefined,
      lighting as string | undefined
    );

    // Step 2: Generate images
    const images = await generateImageWithGemini(enhancedPrompt, apiKey);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          images,
          enhancedPrompt,
          count: images.length
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    // Catch any unhandled errors and return safe response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Unhandled error in generate function:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to process request"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
