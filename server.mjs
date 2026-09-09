import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log('Server startup at', new Date().toISOString());
const logFile = createWriteStream('server_debug.log', { flags: 'a' });

function log(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${msg}`);
  logFile.write(`[${timestamp}] ${msg}\n`);
}

log('Starting server...');
log(`Environment: GEMINI_KEY=${!!process.env.VITE_GEMINI_API_KEY}, PORT=${process.env.PORT || 3000}`);

const app = express();
const upload = multer();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  log(`[${req.method}] ${req.path}`);
  next();
});

// Image detection endpoint
app.post('/api/detect-waste', upload.single('image'), async (req, res) => {
  log('detect-waste handler called');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `Analyze this image and identify the waste item. Return ONLY the name of the waste item, nothing else.`;

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
    log(`Image processed: ${wasteName}`);

    res.json({ wasteName });
  } catch (error) {
    log(`Error in detect-waste: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Text search endpoint
app.post('/api/gemini-search', async (req, res) => {
  log(`gemini-search handler called with query: ${req.body.query}`);
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      log('Empty query');
      return res.status(400).json({ error: 'Query is required' });
    }

    log(`Processing query: ${query}`);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const prompt = `Waste disposal expert. User asks about: "${query.trim()}"

Respond in 2-3 sentences about disposal method, bin category, and special handling.`;

    log('Calling Gemini API');
    const result = await model.generateContent(prompt);
    log('Waiting for response');
    const response = await result.response;
    const text = response.text();
    log(`Got response: ${text.substring(0, 50)}`);

    res.json({ response: text });
  } catch (error) {
    log(`Error in gemini-search: ${error.message}`);
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMsg, uniqueId: "FRESH_SERVER_TEST_123" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log(`Server listening on port ${PORT}`);
});
