import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy-initialize Gemini API only when needed and when the key exists
function getGenAI(): GoogleGenerativeAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
  }
  return new GoogleGenerativeAI(apiKey);
}

function resolveSupportedModel() {
  const candidates = [
    'gemini-2.5-flash', 
    'gemini-2.5-pro',   // Most capable fallback
    'gemini-1.5-flash', // Previous fast model fallback
    'gemini-1.0-pro-vision', 
  ];
  // Return the first candidate; API will error if unavailable and we'll try the next
  return candidates;
}

export async function detectWaste(imageBase64: string) {
  try {
    const genAI = getGenAI();
    const modelCandidates = resolveSupportedModel();
    let lastError: unknown = null;
    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          `Analyze this image and identify the waste item. Return only the name.PLEASE NOTICE THE SPECIFIC WASTE ITEM AND RETURN THE NAME OF THE WASTE ITEM.THAT'S VERY IMPORTANT. AND NOTICE THE MOST OBVIOUS ITEM IN THE IMAGE.`,
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/jpeg'
            }
          }
        ]);
        const response = await result.response;
        const wasteName = response.text().trim();
        const cleanWasteName = wasteName
          .replace(/^["']|["']$/g, '')
          .replace(/^waste item:?\s*/i, '')
          .trim();
        return { wasteName: cleanWasteName, success: true };
      } catch (err) {
        lastError = err;
        // try next model
        continue;
      }
    }
    throw lastError ?? new Error('No supported Gemini model available');
  } catch (error) {
    console.error('Error detecting waste:', error);
    return {
      wasteName: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to detect waste'
    };
  }
} 
