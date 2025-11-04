
import { UploadedFile } from '../types';

/**
 * 画像を指定された最大サイズにリサイズする
 */
const resizeImage = (file: File, maxWidth: number = 2048, maxHeight: number = 2048): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // アスペクト比を維持しながらリサイズ
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // Canvasで画像をリサイズ
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // CanvasをBlobに変換（品質0.92で最適化）
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          resolve(blob);
        },
        file.type,
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
};

export const fileToData = async (file: File): Promise<UploadedFile> => {
  // 有効なMIMEタイプを検証
  const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validMimeTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Please upload PNG, JPEG, or WebP images.`);
  }

  try {
    // 画像を最大2048x2048にリサイズ（必要な場合のみ）
    const resizedBlob = await resizeImage(file, 2048, 2048);
    const resizedFile = new File([resizedBlob], file.name, { type: file.type });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Base64データを抽出し、改行・空白を削除してクリーンアップ
        const base64 = base64String.split(',')[1]?.replace(/[\r\n\s]/g, '');

        if (!base64) {
          reject(new Error('Failed to extract base64 data from image'));
          return;
        }

        const objectURL = URL.createObjectURL(resizedFile);
        resolve({
          base64,
          mimeType: file.type,
          objectURL
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(resizedFile);
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to process image');
  }
};
