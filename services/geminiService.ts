
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { ViewType, AspectRatio } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function getPromptForView(view: ViewType): string {
  const commonPrompt = "Using the provided image of a character's front view, generate a high-quality, clean illustration of the character's";
  const stylePrompt = "in the exact same art style, color palette, and character details. The character should be in a neutral T-pose. The background must be a solid, neutral gray (#808080).";

  switch (view) {
    case 'front':
      return `${commonPrompt} front view, but standardized in a T-pose ${stylePrompt}`;
    case 'back':
      return `${commonPrompt} back view ${stylePrompt}`;
    case 'left':
      return `${commonPrompt} left side view ${stylePrompt}`;
    case 'right':
      return `${commonPrompt} right side view ${stylePrompt}`;
  }
}

export const generateCharacterSheetView = async (
  base64Image: string,
  mimeType: string,
  view: ViewType
): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: getPromptForView(view),
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image was generated for the character sheet view.');
  } catch (error) {
    console.error(`Error generating ${view} view:`, error);
    throw new Error(`Failed to generate ${view} view. Please check the console for details.`);
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
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error('No image was generated for the concept art prompt.');
    } catch (error) {
        console.error('Error generating concept art:', error);
        throw new Error('Failed to generate concept art. Please check the console for details.');
    }
};
