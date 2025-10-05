import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function detectWaste(imageBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
    
    const prompt = `Analyze this image and identify the waste item. Follow these rules:

    1. Identify the main item in the image
    2. Be specific about the type of waste (e.g., "plastic water bottle" not just "plastic")
    3. If multiple items, identify the most prominent waste item
    4. Return ONLY the name of the waste item, nothing else
    5. Do not include any additional text or formatting

    Examples of good responses:
    - "plastic water bottle"
    - "aluminum soda can"
    - "cardboard box"
    - "glass wine bottle"
    - "paper coffee cup"
    -"action figure"
    - "blade"
    -"metal plate"

    Return ONLY the waste item name, no other text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const wasteName = response.text().trim();

    // Clean up the response to ensure we only get the waste name
    const cleanWasteName = wasteName
      .replace(/^["']|["']$/g, '') // Remove quotes if present
      .replace(/^waste item:?\s*/i, '') // Remove "waste item:" prefix if present
      .trim();

    return {
      wasteName: cleanWasteName,
      success: true
    };
  } catch (error) {
    console.error('Error detecting waste:', error);
    return {
      wasteName: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to detect waste'
    };
  }
} 
