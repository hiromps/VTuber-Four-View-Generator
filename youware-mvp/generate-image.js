#!/usr/bin/env node

/**
 * Nano-Banana (Gemini 2.5 Flash Image) 画像生成コンソール
 *
 * 使用方法:
 *   node generate-image.js "プロンプト" [オプション]
 *
 * オプション:
 *   --output <ファイル名>        出力ファイル名（デフォルト: generated_image_[timestamp].png）
 *   --aspect-ratio <比率>        アスペクト比（例: 16:9, 4:3, 1:1）
 *   --help                      ヘルプを表示
 *
 * 例:
 *   node generate-image.js "a cat sitting on a couch"
 *   node generate-image.js "sunset landscape" --output sunset.png --aspect-ratio 16:9
 */

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

// 環境変数からAPIキーを取得
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// コマンドライン引数をパース
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ エラー: プロンプトを指定してください');
    showHelp();
    process.exit(1);
  }

  const config = {
    prompt: null,
    output: null,
    aspectRatio: null,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      config.output = args[i + 1];
      i += 2;
    } else if (arg === '--aspect-ratio' || arg === '-a') {
      config.aspectRatio = args[i + 1];
      i += 2;
    } else if (!config.prompt && !arg.startsWith('--')) {
      config.prompt = arg;
      i += 1;
    } else {
      console.error(`❌ 不明なオプション: ${arg}`);
      showHelp();
      process.exit(1);
    }
  }

  if (!config.prompt) {
    console.error('❌ エラー: プロンプトを指定してください');
    showHelp();
    process.exit(1);
  }

  // デフォルトの出力ファイル名を設定
  if (!config.output) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    config.output = `generated_image_${timestamp}.png`;
  }

  return config;
}

// ヘルプメッセージを表示
function showHelp() {
  console.log(`
Nano-Banana (Gemini 2.5 Flash Image) 画像生成コンソール

使用方法:
  node generate-image.js "プロンプト" [オプション]

オプション:
  --output, -o <ファイル名>     出力ファイル名（デフォルト: generated_image_[timestamp].png）
  --aspect-ratio, -a <比率>    アスペクト比（例: 16:9, 4:3, 1:1）
  --help, -h                   このヘルプを表示

例:
  node generate-image.js "a cat sitting on a couch"
  node generate-image.js "sunset landscape" --output sunset.png
  node generate-image.js "portrait" --aspect-ratio 3:4 --output portrait.png

環境変数:
  GEMINI_API_KEY              Google AI Studio APIキー（必須）

APIキーの取得:
  https://aistudio.google.com/app/apikey

料金:
  画像生成: $0.039 per image (約25枚/$1)
  `);
}

// 画像を生成
async function generateImage(prompt, config) {
  console.log('🎨 画像を生成中...');
  console.log(`📝 プロンプト: "${prompt}"`);

  if (config.aspectRatio) {
    console.log(`📐 アスペクト比: ${config.aspectRatio}`);
  }

  try {
    // Gemini AI クライアントを初期化
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // API呼び出し設定
    const requestConfig = {
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['Image'], // 画像のみを返す
        temperature: 0.4,
      },
    };

    // アスペクト比が指定されている場合は設定に追加
    if (config.aspectRatio) {
      requestConfig.config.imageConfig = {
        aspectRatio: config.aspectRatio,
      };
    }

    // 画像生成API呼び出し
    console.log('🔄 nano-banana (gemini-2.5-flash-image) モデルに送信中...');
    const response = await ai.models.generateContent(requestConfig);

    // レスポンスから画像データを取得
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData) {
        console.log('✅ 画像生成成功！');
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    throw new Error('APIレスポンスに画像データが含まれていません');

  } catch (error) {
    console.error('❌ 画像生成エラー:', error.message);

    if (error.message.includes('API key')) {
      console.error('\n💡 ヒント: .envファイルにGEMINI_API_KEYが正しく設定されているか確認してください');
      console.error('   APIキーの取得: https://aistudio.google.com/app/apikey');
    }

    throw error;
  }
}

// 画像をファイルに保存
async function saveImage(imageData, outputPath) {
  try {
    console.log(`💾 ファイルに保存中: ${outputPath}`);

    // Base64データをバッファに変換
    const buffer = Buffer.from(imageData, 'base64');

    // ファイルに書き込み
    await fs.writeFile(outputPath, buffer);

    // ファイルサイズを取得
    const stats = await fs.stat(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ 保存完了！`);
    console.log(`📁 ファイル: ${path.resolve(outputPath)}`);
    console.log(`📊 サイズ: ${fileSizeKB} KB`);

  } catch (error) {
    console.error('❌ ファイル保存エラー:', error.message);
    throw error;
  }
}

// メイン処理
async function main() {
  // ヘルプ表示の場合は早期リターン
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  console.log('🍌 Nano-Banana 画像生成コンソール\n');

  // APIキーの確認
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
    console.error('❌ エラー: GEMINI_API_KEY が設定されていません\n');
    console.error('セットアップ手順:');
    console.error('1. Google AI Studio でAPIキーを取得: https://aistudio.google.com/app/apikey');
    console.error('2. .envファイルを開く');
    console.error('3. GEMINI_API_KEY=your_api_key_here を実際のAPIキーに置き換える\n');
    process.exit(1);
  }

  // コマンドライン引数をパース
  const config = parseArgs();

  try {
    // 画像を生成
    const imageData = await generateImage(config.prompt, config);

    // ファイルに保存
    await saveImage(imageData.data, config.output);

    console.log('\n🎉 処理完了！');
    console.log(`💰 消費トークン: 約$0.039 (nano-bananaモデル料金)`);

  } catch (error) {
    console.error('\n❌ 処理失敗:', error.message);
    process.exit(1);
  }
}

// スクリプトを実行
if (require.main === module) {
  main();
}

module.exports = { generateImage, saveImage, parseArgs };
