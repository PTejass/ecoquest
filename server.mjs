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

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/api/detect-waste', upload.single('image'), async (req, res) => {
  console.log('Received image upload request');
  try {
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Processing image...');
    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');

    // Initialize Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });

    // Prepare the prompt
    const prompt = `Analyze this image and identify the waste item. Return ONLY the name of the waste item, nothing else. For example, if you see a plastic bottle, just return "plastic bottle". If you see multiple items, identify the most prominent waste item.`;

    console.log('Sending request to Gemini API...');
    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const wasteName = response.text().trim();
    console.log('Waste detected:', wasteName);

    res.json({ wasteName });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Ready to receive requests');
}); 