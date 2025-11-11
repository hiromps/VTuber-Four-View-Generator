// Youwareバックエンド用サーバーコード
// このファイルはYouwareでバックエンド機能を有効にした場合に使用します

// 環境変数の読み込み
// Youwareでは自動的に.envファイルから環境変数が読み込まれます
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY が設定されていません');
  console.error('プロジェクト設定で環境変数を設定するか、.envファイルを作成してください');
  throw new Error('GEMINI_API_KEY is required');
}

// 必要なパッケージをインポート
// Note: Youwareで以下のパッケージがインストールされている必要があります
// npm install @google/genai express cors

const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Modality } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 10MBまでのリクエストを許可

// Gemini AI初期化
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

console.log('✅ Gemini API initialized');

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'VTuber Four-View Generator API is running',
    timestamp: new Date().toISOString()
  });
});

// 四面図生成エンドポイント
app.post('/api/generate-view', async (req, res) => {
  try {
    const { base64Image, mimeType, view, additionalPrompt } = req.body;

    console.log(`[API] Generating ${view} view...`);

    // バリデーション
    if (!base64Image || !mimeType || !view) {
      return res.status(400).json({
        error: 'Missing required fields: base64Image, mimeType, view'
      });
    }

    // プロンプト生成
    const criticalInstructions = additionalPrompt
      ? `CRITICAL REQUIREMENT - YOU MUST APPLY THESE MODIFICATIONS: ${additionalPrompt}. `
      : '';

    const commonPrompt = "Using the provided image of a character's front view, generate a high-quality, clean illustration of the character's";
    const framingPrompt = "IMPORTANT: The ENTIRE character must be FULLY VISIBLE within the frame from head to toe. DO NOT crop any part of the character. Leave appropriate margin space around the character. The full body must fit completely within the image boundaries.";
    const stylePrompt = "in the exact same art style, color palette, and character details. The character should be in a neutral T-pose. The background must be a solid, neutral gray (#808080).";

    let viewPrompt;
    switch (view) {
      case 'front':
        viewPrompt = `${criticalInstructions}${commonPrompt} front view, but standardized in a T-pose ${stylePrompt} ${framingPrompt}`;
        break;
      case 'back':
        viewPrompt = `${criticalInstructions}${commonPrompt} back view ${stylePrompt} ${framingPrompt}`;
        break;
      case 'left':
        viewPrompt = `${criticalInstructions}${commonPrompt} left side view ${stylePrompt} ${framingPrompt}`;
        break;
      case 'right':
        viewPrompt = `${criticalInstructions}${commonPrompt} right side view ${stylePrompt} ${framingPrompt}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid view type' });
    }

    // Base64データのクリーンアップ
    const cleanBase64 = base64Image.replace(/[\r\n\s]/g, '');

    // Gemini API呼び出し
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: viewPrompt
          }
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
        temperature: 0.4,
      },
    });

    console.log('[API] Gemini API call successful');

    // レスポンスから画像データを取得
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        console.log(`[API] ✅ ${view} view generated successfully`);
        return res.json({
          success: true,
          imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          view: view
        });
      }
    }

    throw new Error('No image was generated');

  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate image',
      view: req.body.view
    });
  }
});

// 全ビュー生成エンドポイント（並列処理）
app.post('/api/generate-all-views', async (req, res) => {
  try {
    const { base64Image, mimeType, additionalPrompt } = req.body;

    console.log('[API] Generating all 4 views...');

    if (!base64Image || !mimeType) {
      return res.status(400).json({
        error: 'Missing required fields: base64Image, mimeType'
      });
    }

    const views = ['front', 'back', 'left', 'right'];

    // 全ビューを並列生成
    const promises = views.map(async (view) => {
      const viewResponse = await fetch(`http://localhost:${PORT}/api/generate-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image,
          mimeType,
          view,
          additionalPrompt
        })
      });

      if (!viewResponse.ok) {
        throw new Error(`Failed to generate ${view} view`);
      }

      const data = await viewResponse.json();
      return { view, imageUrl: data.imageUrl };
    });

    const results = await Promise.all(promises);

    // 結果をオブジェクト形式に変換
    const images = {};
    results.forEach(({ view, imageUrl }) => {
      images[view] = imageUrl;
    });

    console.log('[API] ✅ All 4 views generated successfully');

    res.json({
      success: true,
      images: images
    });

  } catch (error) {
    console.error('[API] Error generating all views:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate all views'
    });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Generate view: POST http://localhost:${PORT}/api/generate-view`);
  console.log(`   Generate all: POST http://localhost:${PORT}/api/generate-all-views`);
});

module.exports = app;
