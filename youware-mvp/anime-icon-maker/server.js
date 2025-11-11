// Shonen Icon Maker - バックエンドサーバー
// nano-banana (Gemini 2.5 Flash Image) を使用した少年アニメ風アイコン生成API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Modality } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// 環境変数チェック
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
    console.error('❌ GEMINI_API_KEY が設定されていません');
    console.error('セットアップ手順:');
    console.error('1. Google AI Studio (https://aistudio.google.com/app/apikey) でAPIキーを取得');
    console.error('2. .envファイルに GEMINI_API_KEY を設定');
    process.exit(1);
}

// ミドルウェア
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.')); // 静的ファイル配信

// Gemini AI初期化
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
console.log('✅ Gemini API initialized');

// アニメスタイル定義
const animeStyles = {
    'solo-leveling': {
        name: 'Solo Leveling',
        characteristics: 'dark fantasy, RPG game UI elements, glowing blue eyes, shadow effects, dramatic lighting, manhwa art style, detailed shading, epic atmosphere'
    },
    'demon-slayer': {
        name: 'Demon Slayer (鬼滅の刃)',
        characteristics: 'Taisho era Japan, water/fire breathing effects, dynamic action pose, traditional patterns, colorful effects, Ufotable animation style, vibrant colors'
    },
    'jujutsu-kaisen': {
        name: 'Jujutsu Kaisen (呪術廻戦)',
        characteristics: 'cursed energy effects, MAPPA animation style, dark urban setting, occult atmosphere, dynamic combat pose, detailed uniform, intense expression'
    },
    'chainsaw-man': {
        name: 'Chainsaw Man',
        characteristics: 'gritty art style, dark humor, chaotic energy, blood effects, aggressive pose, MAPPA animation style, raw and edgy atmosphere'
    },
    'my-hero-academia': {
        name: 'My Hero Academia (僕のヒーローアカデミア)',
        characteristics: 'superhero costume, quirk effects, heroic pose, Bones animation style, vibrant colors, dynamic action, inspiring atmosphere'
    },
    'brand-vision': {
        name: 'Brand Vision',
        characteristics: 'clean modern design, minimalist aesthetic, bold colors, geometric shapes, professional look, contemporary style'
    },
    'apothecary-diaries': {
        name: 'The Apothecary Diaries (薬屋のひとりごと)',
        characteristics: 'ancient Chinese imperial palace, elegant traditional clothing, soft color palette, gentle expression, historical drama style, detailed fabric patterns'
    },
    'generic-shonen': {
        name: 'Generic Shonen',
        characteristics: 'dynamic action pose, vibrant colors, energy effects, determined expression, classic shonen manga style, bold outlines'
    }
};

// 背景タイプ定義
const backgroundTypes = {
    'dramatic': 'dramatic cinematic background, epic atmosphere, dynamic lighting, energy particles',
    'solid': 'solid color background, clean and simple',
    'gradient': 'gradient background, smooth color transition, modern aesthetic',
    'action': 'action scene background, motion blur, speed lines, intense battle atmosphere',
    'transparent': 'simple background, minimal distraction, focus on character'
};

// プロンプト構築関数
function buildPrompt(description, style, background) {
    const styleInfo = animeStyles[style] || animeStyles['generic-shonen'];
    const bgInfo = backgroundTypes[background] || backgroundTypes['dramatic'];

    const prompt = `Create a profile icon of ${description},
${styleInfo.characteristics},
${bgInfo},
anime art style, high quality illustration,
portrait composition, face focus, upper body,
perfect for social media profile picture,
1024x1024 square format, centered composition,
detailed facial features, expressive eyes,
professional digital art`;

    return prompt.replace(/\s+/g, ' ').trim();
}

// ヘルスチェック
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Shonen Icon Maker API is running',
        timestamp: new Date().toISOString()
    });
});

// アイコン生成エンドポイント
app.post('/api/generate-icon', async (req, res) => {
    try {
        const { description, style, background } = req.body;

        console.log(`[API] Generating icon...`);
        console.log(`  Description: ${description}`);
        console.log(`  Style: ${style}`);
        console.log(`  Background: ${background}`);

        // バリデーション
        if (!description || !style || !background) {
            return res.status(400).json({
                error: 'Missing required fields: description, style, background'
            });
        }

        // プロンプト構築
        const prompt = buildPrompt(description, style, background);
        console.log(`  Prompt: ${prompt.substring(0, 100)}...`);

        // nano-banana (Gemini 2.5 Flash Image) API呼び出し
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: prompt,
            config: {
                responseModalities: [Modality.IMAGE],
                temperature: 0.7, // クリエイティブさを高める
                imageConfig: {
                    aspectRatio: '1:1' // 正方形アイコン
                }
            }
        });

        // レスポンスから画像データを取得
        const parts = response.candidates?.[0]?.content?.parts || [];

        for (const part of parts) {
            if (part.inlineData) {
                const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;

                console.log(`[API] ✅ Icon generated successfully`);
                console.log(`  Size: ${(part.inlineData.data.length / 1024).toFixed(2)} KB`);

                return res.json({
                    success: true,
                    imageUrl: imageUrl,
                    prompt: prompt,
                    style: animeStyles[style]?.name || style,
                    background: background,
                    timestamp: new Date().toISOString()
                });
            }
        }

        throw new Error('No image was generated by AI');

    } catch (error) {
        console.error('[API] Error:', error.message);

        // エラーの詳細をログ
        if (error.message.includes('API key')) {
            console.error('💡 Hint: Check your GEMINI_API_KEY in .env file');
        }

        res.status(500).json({
            error: error.message || 'Failed to generate icon',
            details: 'Please check server logs for more information'
        });
    }
});

// 利用可能なスタイル一覧
app.get('/api/styles', (req, res) => {
    res.json({
        styles: Object.keys(animeStyles).map(key => ({
            id: key,
            name: animeStyles[key].name,
            description: animeStyles[key].characteristics
        }))
    });
});

// 利用可能な背景一覧
app.get('/api/backgrounds', (req, res) => {
    res.json({
        backgrounds: Object.keys(backgroundTypes).map(key => ({
            id: key,
            description: backgroundTypes[key]
        }))
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 Shonen Icon Maker Server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Generate icon: POST http://localhost:${PORT}/api/generate-icon`);
    console.log(`   Styles list: GET http://localhost:${PORT}/api/styles`);
    console.log('');
    console.log('⚡ Ready to generate awesome anime icons!');
});

module.exports = app;
