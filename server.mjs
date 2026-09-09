import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// Get API keys, support 3 fallback keys
const getApiKeys = () => [
  process.env.GEMINI_API_KEY_1 || process.env.VITE_GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
].filter(Boolean);

const models = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview'
];


app.post('/api/detect-waste', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) {
      return res.status(500).json({ error: 'No API keys configured' });
    }

    const prompt = "Analyze this image and identify the waste item. Return ONLY the name of the waste item, nothing else. For example, if you see a plastic bottle, just return \"plastic bottle\". If you see multiple items, identify the most prominent waste item.";

    for (const model of models) {
      for (const apiKey of apiKeys) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const generativeModel = genAI.getGenerativeModel({ model });
          const result = await generativeModel.generateContent([
            prompt,
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            }
          ]);

          const wasteName = result.response.text().trim();
          return res.json({ wasteName });
        } catch (error) {
          console.error(`[detect-waste] Failed with model ${model}:`, error.message);
        }
      }
    }
    throw new Error('Failed to detect waste with all model and key fallbacks');
  } catch (error) {
    console.error('[detect-waste] Error:', error.message);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

app.post('/api/gemini-search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query required' });
    }

    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) {
      return res.status(500).json({ error: 'No API keys configured' });
    }

    const prompts = [
      `Given this waste disposal related query: "${query.trim()}"
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

⚠️ Safety Tips
- [Key safety considerations]
- [Handling precautions]

VERY Strict Rule: Do NOT include any response lines like "Here's a response" before these headings. Start with a brief intro and the first heading. Format concisely, no extra sentences outside the structured sections.`,
      `Provide waste disposal guidance for: "${query.trim()}". Include type, disposal methods, safety tips, and environmental impact.`
    ];

    for (const model of models) {
      for (const apiKey of apiKeys) {
        for (const prompt of prompts) {
          try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const generativeModel = genAI.getGenerativeModel({ model });
            const result = await generativeModel.generateContent(prompt);
            const text = result.response.text();

            if (!text) throw new Error('Empty response');
            return res.json({ response: text });
          } catch (error) {
            console.error(`[gemini-search] Failed with model ${model}:`, error.message);
          }
        }
      }
    }
    throw new Error('Failed to generate response with all model and key fallbacks');
  } catch (error) {
    console.error('[gemini-search] Error:', error.message);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
