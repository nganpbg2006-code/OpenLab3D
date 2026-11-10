import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Server-side Gemini 4 Argon High-Thinking Circuit Physics Analysis Route
  app.post('/api/analyze-circuit', async (req, res) => {
    try {
      const { circuitSummary, question } = req.body || {};

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
        return res.status(400).json({
          error: 'API_KEY_MISSING',
          message:
            'Vui lòng kiểm tra hoặc chọn khóa API (Paid API Key) trong mục Settings > Secrets của AI Studio để sử dụng tính năng Phân tích Chuyên sâu với mô hình gemini-4-argon (ThinkingLevel.HIGH).',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptText = `Hãy phân tích trạng thái vật lý và sơ đồ đấu dây thực tế của Bộ Thí Nghiệm Mạch Điện Nối Tiếp DC (Chuẩn Thông tư 38/2021/TT-BGDĐT & OpenLab 3D v2.4):
Thông số mạch hiện tại:
${JSON.stringify(circuitSummary, null, 2)}

Câu hỏi / Yêu cầu từ người thực hành:
${question || 'Hãy giải thích chi tiết dòng điện, hiệu điện thế, công suất tiêu thụ trên bóng đèn và biến trở, kiểm tra cách mắc Ampe kế/Vôn kế hiện tại có đúng quy tắc an toàn phòng thí nghiệm không, và gợi ý thí nghiệm tiếp theo.'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: promptText,
        config: {
          systemInstruction:
            'Bạn là Kỹ sư Mô phỏng Vật lý Điện học & Giảng viên Thực hành Phòng thí nghiệm OpenLab 3D v2.4. Hãy trình bày ngắn gọn, rõ ràng, chính xác theo Định luật Ôm cho đoạn mạch nối tiếp và toàn mạch. Trình bày từng mục bằng tiếng Việt dễ hiểu.',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });

      return res.json({
        analysis: response.text ?? 'Không nhận được phản hồi từ mô hình.',
      });
    } catch (err: any) {
      const status = err?.status || 500;
      const rawMsg = String(err?.message || err || 'Lỗi không xác định');
      if (
        status === 403 ||
        status === 400 ||
        rawMsg.includes('PERMISSION_DENIED') ||
        rawMsg.includes('API_KEY_INVALID')
      ) {
        return res.status(403).json({
          error: 'API_KEY_INVALID',
          message:
            'Không thể truy cập gemini-4-argon. Vui lòng kiểm tra khóa API (hoặc chọn khóa API có bật thanh toán) trong bảng Settings > Secrets.',
        });
      }
      if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          error: 'RESOURCE_EXHAUSTED',
          message:
            'Đã vượt hạn mức truy cập. Nâng cấp lên khóa API trả phí trong Settings > Secrets sẽ mở rộng hạn mức cho mô hình gemini-4-argon.',
        });
      }
      return res.status(500).json({
        error: 'SERVER_ERROR',
        message: `Lỗi máy chủ khi gọi mô hình phân tích mạch: ${rawMsg}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OpenLab 3D v2.4 Server listening on http://localhost:${PORT}`);
  });
}

startServer();
