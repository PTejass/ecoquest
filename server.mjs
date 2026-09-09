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
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const result = await model.generateContent([
      'Identify the waste item in this image. Return ONLY the item name.',
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const wasteName = (await result.response).text().trim();
    res.json({ wasteName });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
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
      `Waste expert: How to dispose of "${query.trim()}"? (2-3 sentences: method, bin category, special handling)`
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
