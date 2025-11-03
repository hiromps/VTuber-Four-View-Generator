// Gemini API接続テスト
const { GoogleGenAI } = require('@google/genai');

const apiKey = 'AIzaSyBkKsus0k7AMERx8XqiBgLrz3O7bwYfvh4';
const ai = new GoogleGenAI({ apiKey });

async function testGemini() {
  try {
    console.log('Testing Gemini API connection...');

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'A simple red circle',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      console.log('✅ Gemini API is working!');
      console.log('Generated image size:', response.generatedImages[0].image.imageBytes.length, 'bytes');
    } else {
      console.log('❌ No images generated');
    }
  } catch (error) {
    console.error('❌ Gemini API Error:');
    console.error(error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testGemini();
