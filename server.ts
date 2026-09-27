import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Increase payload limit for scanned image uploads (base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Shutter scan endpoint with multi-model fallback and auto-retry for 503/429 spikes
app.post('/api/scan-challan', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'ছবির ডেটা পাওয়া যায়নি (Image data missing)' });
    }

    // Clean base64 string if data URI header is present
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const promptText = `
You are an expert civil engineering document scanner & OCR specialist for construction site materials (specifically Steel Shuttering / সাটারিং চালান).
Analyze this uploaded delivery slip / receive copy (শাটার রিসিভ চালান).
Carefully read all printed and handwritten text. Note that numbers might be handwritten (e.g., 330x1230, 475x885, 475x860, 500x1500, 450x1000, 300x930, 670x900, 450x1050, 450x950, 300x1140, 480x1040, 375x1500, etc.).
Quantities in such slips are often written as "01/00" or "02/00" or "1/00" which means 1 piece, 2 pieces, etc.
Unit is typically "u" or "pcs" or "pc".

Extract:
1. Header metadata:
   - passNumber (e.g. "96692" or whatever is written near PASS NO)
   - time (e.g. "5:40 AM/PM")
   - date (e.g. "14/09/24" or "14/09/2024" or from receiver note)
   - recipient (e.g. "AL-Amin")
   - designation (e.g. "TR ID" or similar)
   - sourceProject (e.g. "Demura Sonitia to project Non kh Dunbo Non")
   - transportNumber (e.g. "TR-59")
   - destination
   - receiverSignNote (e.g. "Received Alamin 14/09/24")

2. Items table:
   For every steel shutter line item:
   - description: e.g. "Steel Shutter"
   - widthMm: the smaller or first dimension in millimeters as a positive number (e.g. 330, 475, 530, 500, 450, 300, 430, 670, 480, 375).
   - lengthMm: the larger or second dimension in millimeters as a positive number (e.g. 1230, 885, 860, 1140, 850, 1500, 1000, 930, 900, 1050, 950, 1040).
   - quantity: the total pieces count as integer (e.g., "01/00" is 1, "02/00" or "2/00" is 2).
   - unit: "u" or "pcs"
   - remarks: any note in the remarks column
   - confidence: 'high' if digits are very clear, 'medium' if slightly faint, 'low' if guessed.

Be meticulous and extract all rows listed on the slip in order. Return valid structured JSON.
`;

    // Candidate models in priority order for resilience
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let responseText: string | undefined;

    for (const model of candidateModels) {
      try {
        console.log(`Attempting OCR with model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                passNumber: { type: Type.STRING },
                time: { type: Type.STRING },
                date: { type: Type.STRING },
                recipient: { type: Type.STRING },
                designation: { type: Type.STRING },
                sourceProject: { type: Type.STRING },
                transportNumber: { type: Type.STRING },
                destination: { type: Type.STRING },
                receiverSignNote: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      widthMm: { type: Type.NUMBER },
                      lengthMm: { type: Type.NUMBER },
                      quantity: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      remarks: { type: Type.STRING },
                      confidence: { type: Type.STRING },
                    },
                    required: ['widthMm', 'lengthMm', 'quantity'],
                  },
                },
                notes: { type: Type.STRING },
              },
              required: ['items'],
            },
          },
        });

        responseText = response.text;
        if (responseText) {
          console.log(`OCR succeeded with model: ${model}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed: ${err.message || err}. Trying next fallback...`);
        // Small delay before trying next model
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (!responseText) {
      throw lastError || new Error('All OCR models were unavailable. Please try again.');
    }

    const parsedData = JSON.parse(responseText);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Scan Challan Error:', error);
    const isOverload = error.message?.includes('503') || error.message?.includes('high demand') || error.status === 503;
    const userMessage = isOverload
      ? 'গুগল এআই সার্ভারে এই মুহূর্তে সাময়িক অতিরিক্ত ট্রাফিক রয়েছে। কয়েক সেকেন্ড পর নিচে "পুনরায় চেষ্টা করুন" বাটনে ক্লিক করুন।'
      : (error.message || 'চালান স্ক্যান করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');

    return res.status(500).json({
      success: false,
      isOverload,
      error: userMessage,
    });
  }
});

// Calculation helper endpoint or sample data
app.get('/api/sample-challan', (_req, res) => {
  res.json({
    success: true,
    data: {
      passNumber: '96692',
      date: '14/09/2024',
      time: '5:40 PM',
      recipient: 'AL-Amin',
      designation: 'TR ID',
      sourceProject: 'Demura Sonitia to project Non kh Dunbo Non',
      transportNumber: 'TR-59',
      destination: 'Main Site Yard',
      receiverSignNote: 'Received Alamin 14/09/24',
      items: [
        { id: '1', description: 'Steel Shutter', widthMm: 330, lengthMm: 1230, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '2', description: 'Steel Shutter', widthMm: 475, lengthMm: 885, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '3', description: 'Steel Shutter', widthMm: 475, lengthMm: 860, quantity: 2, unit: 'u', remarks: '', confidence: 'high' },
        { id: '4', description: 'Steel Shutter', widthMm: 475, lengthMm: 1140, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '5', description: 'Steel Shutter', widthMm: 530, lengthMm: 850, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '6', description: 'Steel Shutter', widthMm: 500, lengthMm: 1500, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '7', description: 'Steel Shutter', widthMm: 450, lengthMm: 1000, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '8', description: 'Steel Shutter', widthMm: 300, lengthMm: 930, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '9', description: 'Steel Shutter', widthMm: 430, lengthMm: 930, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '10', description: 'Steel Shutter', widthMm: 670, lengthMm: 900, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '11', description: 'Steel Shutter', widthMm: 450, lengthMm: 1050, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '12', description: 'Steel Shutter', widthMm: 450, lengthMm: 950, quantity: 2, unit: 'u', remarks: '', confidence: 'high' },
        { id: '13', description: 'Steel Shutter', widthMm: 300, lengthMm: 1140, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '14', description: 'Steel Shutter', widthMm: 480, lengthMm: 1040, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
        { id: '15', description: 'Steel Shutter', widthMm: 375, lengthMm: 1500, quantity: 1, unit: 'u', remarks: '', confidence: 'high' },
      ],
      notes: 'Store Keeper & Inventory Officer verification confirmed.',
    },
  });
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
