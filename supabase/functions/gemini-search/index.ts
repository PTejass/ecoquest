import { GoogleGenAI } from "npm:@google/genai@1.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Validate request body
    const requestText = await req.text();
    if (!requestText) {
      return new Response(JSON.stringify({
        error: "Request body is empty"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // Parse JSON safely
    let body;
    try {
      body = JSON.parse(requestText);
    } catch (e) {
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const { query } = body;
    if (!query) {
      return new Response(JSON.stringify({
        error: "Query is required"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Clean and normalize the query
    const cleanQuery = query.trim().replace(/\s+/g, ' ');
    const queryForPrompt = cleanQuery.length < 10 ? `How do I dispose of ${cleanQuery}?` : cleanQuery;

    const apiKeys = [
      Deno.env.get("GEMINI_API_KEY_1") || Deno.env.get("GEMINI_API_KEY"),
      Deno.env.get("GEMINI_API_KEY_2"),
      Deno.env.get("GEMINI_API_KEY_3")
    ].filter(Boolean);

    if (apiKeys.length === 0) {
      return new Response(JSON.stringify({
        error: "Configuration error",
        message: "No API keys found"
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Format the prompt with proper spacing and line breaks
    const prompt = `Given this waste disposal related query: "${queryForPrompt}"

Provide a response in the following format (using markdown):

First, a brief introduction about the waste item.

Then, use these exact headings with emoji:

🔍 Type & Classification
[Brief classification and characteristics]

♻ Disposal Guidelines
- [Main disposal method]
- [Alternative methods if applicable]
- [Special handling instructions]

🌍 Environmental Impact
- [Positive impacts when disposed correctly]
- [Negative impacts if disposed incorrectly]

⚠ Safety Tips
- [Key safety considerations]
- [Handling precautions]

Keep each section concise but informative, using bullet points where appropriate.
Use informative tone.`;

    const models = [
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.1-pro-preview"
    ];
    const prompts = [prompt, `Provide waste disposal guidance for: "${queryForPrompt}". Include type, disposal methods, safety tips, and environmental impact.`];

    for (const model of models) {
      for (const apiKey of apiKeys) {
        for (const currentPrompt of prompts) {
          try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
              model,
              contents: currentPrompt
            });
            const text = response.text;
            if (!text) {
              throw new Error("Empty response from AI model");
            }
            return new Response(JSON.stringify({
              response: text
            }), {
              headers: corsHeaders
            });
          } catch (error) {
            console.error(`Failed with model ${model} on key:`, error.message);
          }
        }
      }
    }

    throw new Error("Failed to generate response with all model and key fallbacks");
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Service error",
      message: error.message || "An unexpected error occurred"
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
