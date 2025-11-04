
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { ViewType, AspectRatio, ExpressionType } from '../types';

// 環境変数のチェック
if (!process.env.API_KEY) {
  console.error('ERROR: API_KEY is not set in environment variables');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('GEMINI')));
  throw new Error('API_KEY environment variable is required');
}

console.log('[Gemini] API_KEY is set:', process.env.API_KEY ? 'Yes (length: ' + process.env.API_KEY.length + ')' : 'No');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function getPromptForView(view: ViewType, additionalPrompt: string = ''): string {
  // 追加の指示を最初に配置して強調
  const criticalInstructions = additionalPrompt
    ? `CRITICAL REQUIREMENT - YOU MUST APPLY THESE MODIFICATIONS: ${additionalPrompt}. `
    : '';

  const commonPrompt = "Using the provided image of a character's front view, generate a high-quality, clean illustration of the character's";
  const framingPrompt = "IMPORTANT: The ENTIRE character must be FULLY VISIBLE within the frame from head to toe. DO NOT crop any part of the character. Leave appropriate margin space around the character. The full body must fit completely within the image boundaries.";
  const stylePrompt = "in the exact same art style, color palette, and character details. The character should be in a neutral T-pose. The background must be a solid, neutral gray (#808080).";

  switch (view) {
    case 'front':
      return `${criticalInstructions}${commonPrompt} front view, but standardized in a T-pose ${stylePrompt} ${framingPrompt}`;
    case 'back':
      return `${criticalInstructions}${commonPrompt} back view ${stylePrompt} ${framingPrompt}`;
    case 'left':
      return `${criticalInstructions}${commonPrompt} left side view ${stylePrompt} ${framingPrompt}`;
    case 'right':
      return `${criticalInstructions}${commonPrompt} right side view ${stylePrompt} ${framingPrompt}`;
  }
}

export const generateCharacterSheetView = async (
  base64Image: string,
  mimeType: string,
  view: ViewType,
  additionalPrompt: string = ''
): Promise<string> => {
  try {
    console.log(`[Gemini] Generating ${view} view...`);

    // Base64文字列とMIMEタイプの検証
    if (!base64Image || base64Image.trim() === '') {
      throw new Error('Base64 image data is empty');
    }

    const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validMimeTypes.includes(mimeType)) {
      throw new Error(`Invalid MIME type: ${mimeType}`);
    }

    // Base64文字列から空白・改行を削除
    const cleanBase64 = base64Image.replace(/[\r\n\s]/g, '');
    console.log(`[Gemini] Base64 length: ${cleanBase64.length}, MIME: ${mimeType}`);

    // Gemini 2.5 Flash Image モデルを使用
    console.log('[Gemini] Calling Gemini API with model: gemini-2.5-flash-image');
    const response: GenerateContentResponse = await ai.models.generateContent({
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
            text: getPromptForView(view, additionalPrompt),
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    console.log('[Gemini] API call successful, processing response...');
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log(`[Gemini] Image generated for ${view} view successfully`);
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image was generated for the character sheet view.');
  } catch (error) {
    console.error(`[Gemini] Error generating ${view} view:`, error);

    // より詳細なエラーメッセージを提供
    if (error instanceof Error) {
      console.error(`[Gemini] Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      if (error.message.includes('did not match')) {
        throw new Error(`Invalid image format. Please ensure you upload a valid PNG, JPEG, or WebP image.`);
      }
      throw error;
    }
    throw new Error(`Failed to generate ${view} view. Please try again.`);
  }
};


export const generateConceptArt = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `award-winning digital illustration, masterpiece, ${prompt}`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image?.imageBytes;
            if (base64ImageBytes) {
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error('No image was generated for the concept art prompt.');
    } catch (error) {
        console.error('Error generating concept art:', error);
        throw new Error('Failed to generate concept art. Please check the console for details.');
    }
};

function getPromptForExpression(expression: ExpressionType, additionalPrompt: string = ''): string {
  // 追加の指示を最初に配置して強調
  const criticalInstructions = additionalPrompt
    ? `CRITICAL REQUIREMENT - YOU MUST APPLY THESE MODIFICATIONS: ${additionalPrompt}. `
    : '';

  const commonPrompt = "Using the provided image of a character, generate a high-quality, clean illustration of the character's face with a";
  const framingPrompt = "IMPORTANT: The character's head and upper body must be FULLY VISIBLE within the frame. DO NOT crop the top of the head, chin, or shoulders. Leave appropriate margin space around the character. The entire head and face must fit completely within the image boundaries.";
  const stylePrompt = "expression, in the exact same art style, color palette, and character details. Keep the same viewing angle and pose. The background must be a solid, neutral gray (#808080).";

  switch (expression) {
    case 'joy':
      return `${criticalInstructions}${commonPrompt} joyful, happy, smiling ${stylePrompt} ${framingPrompt}`;
    case 'anger':
      return `${criticalInstructions}${commonPrompt} angry, furious, frowning ${stylePrompt} ${framingPrompt}`;
    case 'sorrow':
      return `${criticalInstructions}${commonPrompt} sad, sorrowful, tearful ${stylePrompt} ${framingPrompt}`;
    case 'surprise':
      return `${criticalInstructions}${commonPrompt} surprised, shocked, wide-eyed ${stylePrompt} ${framingPrompt}`;
  }
}

export const generateFacialExpression = async (
  base64Image: string,
  mimeType: string,
  expression: ExpressionType,
  additionalPrompt: string = ''
): Promise<string> => {
  try {
    console.log(`[Gemini] Generating ${expression} expression...`);

    // Base64文字列とMIMEタイプの検証
    if (!base64Image || base64Image.trim() === '') {
      throw new Error('Base64 image data is empty');
    }

    const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validMimeTypes.includes(mimeType)) {
      throw new Error(`Invalid MIME type: ${mimeType}`);
    }

    // Base64文字列から空白・改行を削除
    const cleanBase64 = base64Image.replace(/[\r\n\s]/g, '');
    console.log(`[Gemini] Base64 length: ${cleanBase64.length}, MIME: ${mimeType}`);

    // Gemini 2.5 Flash Image モデルを使用
    console.log('[Gemini] Calling Gemini API with model: gemini-2.5-flash-image');
    const response: GenerateContentResponse = await ai.models.generateContent({
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
            text: getPromptForExpression(expression, additionalPrompt),
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    console.log('[Gemini] API call successful, processing response...');
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log(`[Gemini] Image generated for ${expression} expression successfully`);
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image was generated for the facial expression.');
  } catch (error) {
    console.error(`[Gemini] Error generating ${expression} expression:`, error);

    // より詳細なエラーメッセージを提供
    if (error instanceof Error) {
      console.error(`[Gemini] Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      if (error.message.includes('did not match')) {
        throw new Error(`Invalid image format. Please ensure you upload a valid PNG, JPEG, or WebP image.`);
      }
      throw error;
    }
    throw new Error(`Failed to generate ${expression} expression. Please try again.`);
  }
};

/**
 * Gemini Proモデルを使用してプロンプトを英語に変換し、最適化します
 */
export const enhancePrompt = async (prompt: string): Promise<string> => {
  try {
    console.log('[Gemini] Enhancing prompt...');

    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is empty');
    }

    // Gemini 2.0 Flash モデルを使用してテキスト生成
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: {
        parts: [
          {
            text: `You are an expert at translating and optimizing image modification instructions.

IMPORTANT: The user is providing ADDITIONAL INSTRUCTIONS to modify an existing character image.
This is NOT a complete image description - it's just a modification request.

Your task:
1. Translate from Japanese to English (if in Japanese)
2. Convert the modification instruction into concise, descriptive keywords
3. Focus ONLY on the requested change/addition, not the entire image
4. Keep it brief (5-15 words maximum)
5. Use descriptive adjectives that work well for AI image generation
6. Return ONLY the optimized keywords without explanations

Examples:
- Input: "髪色を金色に変えてください" → Output: "vibrant golden blonde hair"
- Input: "背景を青空にして" → Output: "clear blue sky background"
- Input: "笑顔にしてください" → Output: "bright cheerful smile"
- Input: "猫耳を追加" → Output: "cute cat ears"

User's modification instruction:
${prompt}

Optimized keywords:`,
          },
        ],
      },
    });

    const enhancedPrompt = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!enhancedPrompt) {
      throw new Error('No enhanced prompt was generated');
    }

    console.log('[Gemini] Prompt enhanced successfully');
    console.log('[Gemini] Original:', prompt);
    console.log('[Gemini] Enhanced:', enhancedPrompt);

    return enhancedPrompt;
  } catch (error) {
    console.error('[Gemini] Error enhancing prompt:', error);

    if (error instanceof Error) {
      console.error('[Gemini] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
    throw new Error('Failed to enhance prompt. Please try again.');
  }
};
