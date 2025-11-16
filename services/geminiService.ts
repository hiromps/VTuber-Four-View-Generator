
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

// 高画質設定の共通定義
const QUALITY_SETTINGS = {
  // Gemini API config設定
  generationConfig: {
    temperature: 0.4, // より一貫性のある高品質な出力
  },
  // プロンプト用の品質指示
  qualityPrompt: "QUALITY REQUIREMENTS: Generate in MAXIMUM quality and resolution. The output must be sharp, detailed, and crisp with NO compression artifacts, NO blurriness, and NO quality degradation. Maintain pristine image quality throughout.",
};

function getPromptForView(view: ViewType, additionalPrompt: string = '', hasAttachedImage: boolean = false): string {
  // 追加の指示を最初に配置して強調
  const criticalInstructions = additionalPrompt
    ? `CRITICAL REQUIREMENT - YOU MUST APPLY THESE MODIFICATIONS: ${additionalPrompt}. `
    : '';

  // 添付画像がある場合の指示
  const attachedImageInstructions = hasAttachedImage
    ? `IMPORTANT: A reference image is provided showing items/accessories/clothing. Apply these items to the character naturally and appropriately. `
    : '';

  const commonPrompt = "Using the provided image of a character's front view, generate a high-quality, clean illustration of the character's";
  const framingPrompt = "IMPORTANT: The ENTIRE character must be FULLY VISIBLE within the frame from head to toe. DO NOT crop any part of the character. Leave appropriate margin space around the character. The full body must fit completely within the image boundaries.";
  const stylePrompt = "in the exact same art style, color palette, and character details. The character should be in a neutral T-pose. The background must be a solid, neutral gray (#808080).";

  switch (view) {
    case 'front':
      return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${commonPrompt} front view, but standardized in a T-pose ${stylePrompt} ${framingPrompt}`;
    case 'back':
      return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${commonPrompt} back view ${stylePrompt} ${framingPrompt}`;
    case 'left':
      return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${commonPrompt} left side view ${stylePrompt} ${framingPrompt}`;
    case 'right':
      return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${commonPrompt} right side view ${stylePrompt} ${framingPrompt}`;
  }
}

export const generateCharacterSheetView = async (
  base64Image: string,
  mimeType: string,
  view: ViewType,
  additionalPrompt: string = '',
  attachedImageBase64?: string,
  attachedImageMimeType?: string
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

    // 添付画像がある場合は検証
    let cleanAttachedBase64: string | undefined;
    if (attachedImageBase64 && attachedImageMimeType) {
      if (!validMimeTypes.includes(attachedImageMimeType)) {
        throw new Error(`Invalid attached image MIME type: ${attachedImageMimeType}`);
      }
      cleanAttachedBase64 = attachedImageBase64.replace(/[\r\n\s]/g, '');
      console.log(`[Gemini] Attached image Base64 length: ${cleanAttachedBase64.length}, MIME: ${attachedImageMimeType}`);
    }

    // Gemini 2.5 Flash Image モデルを使用
    console.log('[Gemini] Calling Gemini API with model: gemini-2.5-flash-image');

    // パーツの配列を構築
    const parts: any[] = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      },
    ];

    // 添付画像がある場合は追加
    if (cleanAttachedBase64 && attachedImageMimeType) {
      parts.push({
        inlineData: {
          data: cleanAttachedBase64,
          mimeType: attachedImageMimeType,
        },
      });
    }

    // テキストプロンプトを追加
    parts.push({
      text: getPromptForView(view, additionalPrompt, !!cleanAttachedBase64),
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
        ...QUALITY_SETTINGS.generationConfig,
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
        // 高画質プロンプトを追加
        const qualityEnhancedPrompt = `${QUALITY_SETTINGS.qualityPrompt} award-winning digital illustration, masterpiece, ultra-high resolution, crisp details, sharp focus, professional quality, ${prompt}`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: qualityEnhancedPrompt,
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

function getPromptForExpression(expression: ExpressionType, additionalPrompt: string = '', hasAttachedImage: boolean = false): string {
  // 追加の指示を最初に配置して強調
  const criticalInstructions = additionalPrompt
    ? `CRITICAL REQUIREMENT - YOU MUST APPLY THESE MODIFICATIONS: ${additionalPrompt}. `
    : '';

  // 添付画像がある場合の指示
  const attachedImageInstructions = hasAttachedImage
    ? `IMPORTANT: A reference image is provided showing items/accessories/clothing. Apply these items to the character naturally and appropriately. `
    : '';

  const commonPrompt = "Using the provided image of a character, generate a high-quality, clean illustration of the character's face with a";
  const framingPrompt = "IMPORTANT: The character's head and upper body must be FULLY VISIBLE within the frame. DO NOT crop the top of the head, chin, or shoulders. Leave appropriate margin space around the character. The entire head and face must fit completely within the image boundaries.";
  const stylePrompt = "expression, in the exact same art style, color palette, and character details. Keep the same viewing angle and pose. The background must be a solid, neutral gray (#808080).";

  switch (expression) {
    case 'joy':
      return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${commonPrompt} joyful, happy, smiling ${stylePrompt} ${framingPrompt}`;
    case 'anger':
      return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${commonPrompt} angry, furious, frowning ${stylePrompt} ${framingPrompt}`;
    case 'sorrow':
      return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${commonPrompt} sad, sorrowful, tearful ${stylePrompt} ${framingPrompt}`;
    case 'surprise':
      return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${commonPrompt} surprised, shocked, wide-eyed ${stylePrompt} ${framingPrompt}`;
  }
}

export const generateFacialExpression = async (
  base64Image: string,
  mimeType: string,
  expression: ExpressionType,
  additionalPrompt: string = '',
  attachedImageBase64?: string,
  attachedImageMimeType?: string
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

    // 添付画像がある場合は検証
    let cleanAttachedBase64: string | undefined;
    if (attachedImageBase64 && attachedImageMimeType) {
      if (!validMimeTypes.includes(attachedImageMimeType)) {
        throw new Error(`Invalid attached image MIME type: ${attachedImageMimeType}`);
      }
      cleanAttachedBase64 = attachedImageBase64.replace(/[\r\n\s]/g, '');
      console.log(`[Gemini] Attached image Base64 length: ${cleanAttachedBase64.length}, MIME: ${attachedImageMimeType}`);
    }

    // Gemini 2.5 Flash Image モデルを使用
    console.log('[Gemini] Calling Gemini API with model: gemini-2.5-flash-image');

    // パーツの配列を構築
    const parts: any[] = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      },
    ];

    // 添付画像がある場合は追加
    if (cleanAttachedBase64 && attachedImageMimeType) {
      parts.push({
        inlineData: {
          data: cleanAttachedBase64,
          mimeType: attachedImageMimeType,
        },
      });
    }

    // テキストプロンプトを追加
    parts.push({
      text: getPromptForExpression(expression, additionalPrompt, !!cleanAttachedBase64),
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
        ...QUALITY_SETTINGS.generationConfig,
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

function getPromptForPose(poseDescription: string = '', hasReferenceImage: boolean = false, additionalPrompt: string = '', hasAttachedImage: boolean = false): string {
  // 追加の指示を最初に配置して強調
  const criticalInstructions = additionalPrompt
    ? `CRITICAL REQUIREMENT - YOU MUST APPLY THESE MODIFICATIONS: ${additionalPrompt}. `
    : '';

  // 添付画像がある場合の指示
  const attachedImageInstructions = hasAttachedImage
    ? `IMPORTANT: A reference image is provided showing items/accessories/clothing. Apply these items to the character naturally and appropriately. `
    : '';

  // 参考画像がある場合の指示（大幅に強化）
  const referenceImageInstructions = hasReferenceImage
    ? `CRITICAL PRIORITY - POSE REPLICATION:
A reference image is provided showing the EXACT pose that must be replicated. This is the PRIMARY objective.

MANDATORY POSE REQUIREMENTS - Copy these elements PRECISELY from the reference image:
1. Body Angle: Match the exact torso rotation, tilt, and facing direction
2. Head Position: Replicate the exact head tilt, rotation, and facial direction
3. Arm Positions: Copy the EXACT arm angles, elbow bends, hand positions, and finger gestures
4. Leg Stance: Match the exact leg positioning, knee bends, foot placement, and weight distribution
5. Overall Posture: Replicate the exact body balance, center of gravity, and dynamic movement
6. Detailed Gestures: Copy every subtle hand gesture, finger position, and body language cue

DO NOT improvise or approximate. The pose must be an EXACT replication of the reference image pose, applied to the character's design. `
    : '';

  // ポーズの説明がある場合の指示
  const poseInstructions = poseDescription
    ? `POSE DESCRIPTION: ${poseDescription}
This description provides context for the desired pose. ${hasReferenceImage ? 'Use this to understand the intent, but PRIORITIZE the reference image for exact positioning.' : 'Create a natural and accurate pose that matches this description precisely.'} `
    : '';

  const commonPrompt = "Using the provided character image, generate a high-quality, clean illustration of the character in the specified pose.";
  const framingPrompt = "FRAMING: The ENTIRE character must be FULLY VISIBLE within the frame from head to toe. DO NOT crop any part of the character. Leave appropriate margin space around the character. The full body must fit completely within the image boundaries.";
  const stylePrompt = "STYLE CONSISTENCY: Maintain the exact same art style, color palette, character design, and visual details from the original character image. The background must be a solid, neutral gray (#808080).";

  return `${QUALITY_SETTINGS.qualityPrompt}\n\n${criticalInstructions}${attachedImageInstructions}${referenceImageInstructions}${poseInstructions}${commonPrompt}\n\n${stylePrompt}\n\n${framingPrompt}`;
}

export const generatePose = async (
  base64Image: string,
  mimeType: string,
  poseDescription: string = '',
  referenceImageBase64?: string,
  referenceImageMimeType?: string,
  additionalPrompt: string = '',
  attachedImageBase64?: string,
  attachedImageMimeType?: string
): Promise<string> => {
  try {
    console.log(`[Gemini] Generating custom pose...`);

    // Base64文字列とMIMEタイプの検証
    if (!base64Image || base64Image.trim() === '') {
      throw new Error('Base64 image data is empty');
    }

    const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validMimeTypes.includes(mimeType)) {
      throw new Error(`Invalid MIME type: ${mimeType}`);
    }

    // ポーズの説明または参考画像が必要
    if (!poseDescription && !referenceImageBase64) {
      throw new Error('Either pose description or reference image must be provided');
    }

    // Base64文字列から空白・改行を削除
    const cleanBase64 = base64Image.replace(/[\r\n\s]/g, '');
    console.log(`[Gemini] Base64 length: ${cleanBase64.length}, MIME: ${mimeType}`);

    // 参考画像がある場合は検証
    let cleanReferenceBase64: string | undefined;
    if (referenceImageBase64 && referenceImageMimeType) {
      if (!validMimeTypes.includes(referenceImageMimeType)) {
        throw new Error(`Invalid reference image MIME type: ${referenceImageMimeType}`);
      }
      cleanReferenceBase64 = referenceImageBase64.replace(/[\r\n\s]/g, '');
      console.log(`[Gemini] Reference image Base64 length: ${cleanReferenceBase64.length}, MIME: ${referenceImageMimeType}`);
    }

    // 添付画像がある場合は検証
    let cleanAttachedBase64: string | undefined;
    if (attachedImageBase64 && attachedImageMimeType) {
      if (!validMimeTypes.includes(attachedImageMimeType)) {
        throw new Error(`Invalid attached image MIME type: ${attachedImageMimeType}`);
      }
      cleanAttachedBase64 = attachedImageBase64.replace(/[\r\n\s]/g, '');
      console.log(`[Gemini] Attached image Base64 length: ${cleanAttachedBase64.length}, MIME: ${attachedImageMimeType}`);
    }

    // Gemini 2.5 Flash Image モデルを使用
    console.log('[Gemini] Calling Gemini API with model: gemini-2.5-flash-image');

    // パーツの配列を構築
    // 参考画像がある場合は、参考画像を最初に配置してモデルがそれを重視するようにする
    const parts: any[] = [];

    // 1. 参考画像を最初に追加（存在する場合）
    if (cleanReferenceBase64 && referenceImageMimeType) {
      parts.push({
        text: 'REFERENCE IMAGE - This shows the EXACT pose to replicate:'
      });
      parts.push({
        inlineData: {
          data: cleanReferenceBase64,
          mimeType: referenceImageMimeType,
        },
      });
    }

    // 2. キャラクター画像を追加
    parts.push({
      text: 'CHARACTER IMAGE - Apply the pose to this character:'
    });
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType,
      },
    });

    // 3. 添付画像を追加（存在する場合）
    if (cleanAttachedBase64 && attachedImageMimeType) {
      parts.push({
        text: 'ATTACHED REFERENCE - Items/accessories/clothing to add:'
      });
      parts.push({
        inlineData: {
          data: cleanAttachedBase64,
          mimeType: attachedImageMimeType,
        },
      });
    }

    // 4. テキストプロンプトを追加
    parts.push({
      text: getPromptForPose(poseDescription, !!cleanReferenceBase64, additionalPrompt, !!cleanAttachedBase64),
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
        ...QUALITY_SETTINGS.generationConfig,
      },
    });

    console.log('[Gemini] API call successful, processing response...');
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log(`[Gemini] Pose image generated successfully`);
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image was generated for the custom pose.');
  } catch (error) {
    console.error(`[Gemini] Error generating pose:`, error);

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
    throw new Error(`Failed to generate pose. Please try again.`);
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

export interface Live2DPart {
  name: string;
  description: string;
}

export interface Live2DPartsResponse {
  parts: Live2DPart[];
  visualizationImage: string | null;
}

export const generateLive2DParts = async (
  base64Image: string,
  description: string = ''
): Promise<Live2DPartsResponse> => {
  try {
    console.log('[Gemini] Generating Live2D parts design...');

    // Base64文字列から data:image/... プレフィックスを削除してクリーン化
    let cleanBase64 = base64Image;
    let mimeType = 'image/png';

    if (base64Image.startsWith('data:')) {
      const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        cleanBase64 = matches[2];
      }
    }

    cleanBase64 = cleanBase64.replace(/[\r\n\s]/g, '');
    console.log(`[Gemini] Base64 length: ${cleanBase64.length}, MIME: ${mimeType}`);

    // ユーザーの追加指示を含むプロンプト
    const userInstructions = description
      ? `\n\nUSER'S SPECIFIC REQUIREMENTS: ${description}\nPlease incorporate these requirements into your parts breakdown recommendations.`
      : '';

    const prompt = `Analyze this character illustration and provide a comprehensive Live2D parts breakdown recommendation.

${userInstructions}

You are an expert Live2D rigger. Analyze the character and recommend how to separate it into layers for Live2D animation.

Provide a detailed breakdown in the following JSON format:
{
  "parts": [
    {
      "name": "Part name (in Japanese)",
      "description": "Detailed description of this part, what it includes, and how it should be separated (in Japanese)"
    }
  ]
}

IMPORTANT GUIDELINES:
1. Include ALL necessary parts for a complete Live2D model
2. Recommend proper layer separation for eyes (whites, irises, pupils, highlights, eyelids)
3. Recommend proper layer separation for mouth (upper lip, lower lip, tongue, teeth)
4. Recommend proper layer separation for hair (front hair, back hair, side hair, ahoge, etc.)
5. Include facial features, accessories, and clothing as separate parts where needed
6. Consider animation requirements - parts that need to move independently should be separate
7. Provide practical recommendations that a Live2D artist can follow
8. All text must be in Japanese

Typical Live2D parts structure:
- 顔ベース（輪郭・肌）
- 目（白目、瞳、ハイライト、上まつげ、下まつげ、左右別々）
- 眉毛（左右別々）
- 口（上唇、下唇、舌、歯）
- 髪（前髪、後ろ髪、サイド、アホ毛など）
- 体（首、胴体、腕、手など）
- 装飾品（アクセサリー、リボン、帽子など）

Respond ONLY with valid JSON. Do not include any other text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.TEXT],
        temperature: 0.3,
      },
    });

    console.log('[Gemini] API call successful, processing response...');

    // レスポンスからテキストを取得
    let responseText = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.text) {
        responseText += part.text;
      }
    }

    if (!responseText) {
      throw new Error('No response text generated');
    }

    console.log('[Gemini] Response text:', responseText);

    // JSONをパース（マークダウンコードブロックを削除）
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[Gemini] JSON parse error:', parseError);
      console.error('[Gemini] Raw text:', responseText);
      throw new Error('Failed to parse Live2D parts response');
    }

    if (!parsedResponse.parts || !Array.isArray(parsedResponse.parts)) {
      throw new Error('Invalid Live2D parts response format');
    }

    // パーツリストを作成（画像生成は行わず、メタデータのみ）
    const parts: Live2DPart[] = parsedResponse.parts.map((part: any) => ({
      name: part.name || '不明なパーツ',
      description: part.description || '説明なし',
    }));

    console.log(`[Gemini] Generated ${parts.length} Live2D parts recommendations`);

    // パーツ分け案を視覚化した図解画像を生成
    console.log('[Gemini] Generating visualization image...');
    let visualizationImage: string | null = null;

    try {
      // パーツリストをテキスト形式にまとめる
      const partsListText = parts
        .map((part, index) => `${index + 1}. ${part.name}: ${part.description}`)
        .join('\n');

      const visualizationPrompt = `Based on this character image, create a technical diagram showing Live2D parts separation with the following parts:

${partsListText}

Draw the same character with these additions:
1. Clear colored boundary lines showing where each part should be separated
2. Japanese labels with arrows pointing to each part
3. Different colors for different part types (eyes=blue, hair=red, face=green, etc.)
4. Professional technical illustration style

The result should look like a blueprint or instruction manual that an artist can follow.`;

      const visualizationResponse = await ai.models.generateContent({
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
              text: visualizationPrompt,
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
          temperature: 0.3,
        },
      });

      console.log('[Gemini] Visualization API call successful, processing response...');

      // レスポンス構造をログ出力
      console.log('[Gemini] Visualization response structure:', {
        hasCandidates: !!visualizationResponse.candidates,
        candidatesLength: visualizationResponse.candidates?.length,
        firstCandidate: visualizationResponse.candidates?.[0] ? 'exists' : 'missing',
      });

      for (const part of visualizationResponse.candidates?.[0]?.content?.parts || []) {
        console.log('[Gemini] Processing part:', {
          hasInlineData: !!part.inlineData,
          hasText: !!part.text,
        });

        if (part.inlineData) {
          console.log('[Gemini] Visualization image generated successfully');
          visualizationImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!visualizationImage) {
        console.warn('[Gemini] No visualization image was generated');
        console.warn('[Gemini] Full response:', JSON.stringify(visualizationResponse, null, 2));
      }
    } catch (vizError) {
      console.error('[Gemini] Error generating visualization image:', vizError);
      if (vizError instanceof Error) {
        console.error('[Gemini] Visualization error details:', {
          name: vizError.name,
          message: vizError.message,
          stack: vizError.stack,
        });
      }
      // 視覚化画像の生成に失敗してもパーツリストは返す
    }

    return {
      parts,
      visualizationImage,
    };
  } catch (error) {
    console.error('[Gemini] Error generating Live2D parts:', error);

    if (error instanceof Error) {
      console.error('[Gemini] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
    throw new Error('Failed to generate Live2D parts design. Please try again.');
  }
};
