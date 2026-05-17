import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON parsing for other routes
app.use(express.json({ limit: '10mb' }));

// API routes
app.post("/api/analyze", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const prompt = `너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.
사용자가 업로드한 얼굴 사진을 바탕으로 퍼스널컬러를 분석해줘. 단, 사진의 조명, 화장, 필터, 카메라 색감에 따라 결과가 달라질 수 있으므로 최종 진단이 아니라 참고용 분석으로 안내해줘.

분석 결과는 반드시 지정된 JSON 형식으로만 답변하고, 다른 설명은 덧붙이지 마.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disclaimer: { type: Type.STRING },
            summary: { type: Type.STRING },
            tone_direction: { type: Type.STRING, enum: ["warm", "cool", "neutral"] },
            season_type: { type: Type.STRING },
            sub_type: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            analysis: {
              type: Type.OBJECT,
              properties: {
                skin_tone: { type: Type.STRING },
                brightness: { type: Type.STRING },
                saturation: { type: Type.STRING },
                contrast: { type: Type.STRING },
                overall_impression: { type: Type.STRING }
              }
            },
            recommended_colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            avoid_colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            makeup_recommendations: {
              type: Type.OBJECT,
              properties: {
                lip: { type: Type.ARRAY, items: { type: Type.STRING } },
                blush: { type: Type.ARRAY, items: { type: Type.STRING } },
                eyeshadow: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            hair_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            fashion_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            style_tip: { type: Type.STRING },
            photo_quality_note: { type: Type.STRING }
          },
          required: ["disclaimer", "summary", "tone_direction", "season_type", "sub_type", "analysis", "recommended_colors", "avoid_colors", "makeup_recommendations", "hair_recommendations", "fashion_recommendations", "style_tip"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
