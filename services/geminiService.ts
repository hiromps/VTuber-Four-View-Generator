
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
  const stylePrompt = "in the exact same art style, color palette, and character details. The character should be in a neutral T-pose. The background must be a solid, neutral gray (#808080).";

  switch (view) {
    case 'front':
      return `${criticalInstructions}${commonPrompt} front view, but standardized in a T-pose ${stylePrompt}`;
    case 'back':
      return `${criticalInstructions}${commonPrompt} back view ${stylePrompt}`;
    case 'left':
      return `${criticalInstructions}${commonPrompt} left side view ${stylePrompt}`;
    case 'right':
      return `${criticalInstructions}${commonPrompt} right side view ${stylePrompt}`;
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
  const stylePrompt = "expression, in the exact same art style, color palette, and character details. Keep the same viewing angle and pose. The background must be a solid, neutral gray (#808080).";

  switch (expression) {
    case 'joy':
      return `${criticalInstructions}${commonPrompt} joyful, happy, smiling ${stylePrompt}`;
    case 'anger':
      return `${criticalInstructions}${commonPrompt} angry, furious, frowning ${stylePrompt}`;
    case 'sorrow':
      return `${criticalInstructions}${commonPrompt} sad, sorrowful, tearful ${stylePrompt}`;
    case 'surprise':
      return `${criticalInstructions}${commonPrompt} surprised, shocked, wide-eyed ${stylePrompt}`;
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
