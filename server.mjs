import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      "Analyze this image and identify the waste item. Return ONLY the name of the waste item, nothing else. For example, if you see a plastic bottle, just return \"plastic bottle\". If you see multiple items, identify the most prominent waste item.",
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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

    const text = (await result.response).text();
    res.json({ response: text });
  } catch (error) {
    console.error('[gemini-search] Error:', error.message);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
