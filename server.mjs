import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log('Starting server...');
console.log('Environment variables loaded:', {
  hasGeminiKey: !!process.env.VITE_GEMINI_API_KEY,
  port: process.env.PORT || 3000
});

const app = express();
const upload = multer();
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/api/detect-waste', upload.single('image'), async (req, res) => {
  try {
    console.log('[detect-waste] Image upload received');
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('[detect-waste] Converting to base64...');
    const base64Image = req.file.buffer.toString('base64');
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    console.log('[detect-waste] Calling Gemini...');
    const result = await model.generateContent([
      "Analyze this image and identify the waste item. Return ONLY the name of the waste item, nothing else. For example, if you see a plastic bottle, just return \"plastic bottle\". If you see multiple items, identify the most prominent waste item.",
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    console.log('[detect-waste] Getting response...');
    const wasteName = (await result.response).text().trim();
    console.log('[detect-waste] Detected:', wasteName);
    res.json({ wasteName });
  } catch (error) {
    console.error('[detect-waste] Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

app.post('/api/gemini-search', async (req, res) => {
  try {
    console.log('[gemini-search] Request received:', req.body);
    const { query } = req.body;
    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query required' });
    }

    console.log('[gemini-search] Getting model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    console.log('[gemini-search] Calling Gemini...');
    const result = await model.generateContent(
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

VERY Strict Rule: Do NOT include any response lines like "Here's a response" before these headings. Start with a brief intro and the first heading. Format concisely, no extra sentences outside the structured sections.`
    );

    console.log('[gemini-search] Getting response...');
    const text = (await result.response).text();
    console.log('[gemini-search] Success:', text.substring(0, 50));
    res.json({ response: text });
  } catch (error) {
    console.error('[gemini-search] Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Ready to receive requests');
});
