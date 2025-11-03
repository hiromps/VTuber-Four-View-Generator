
import { UploadedFile } from '../types';

export const fileToData = (file: File): Promise<UploadedFile> => {
  return new Promise((resolve, reject) => {
    // 有効なMIMEタイプを検証
    const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      reject(new Error(`Invalid file type: ${file.type}. Please upload PNG, JPEG, or WebP images.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Base64データを抽出し、改行・空白を削除してクリーンアップ
      const base64 = base64String.split(',')[1]?.replace(/[\r\n\s]/g, '');

      if (!base64) {
        reject(new Error('Failed to extract base64 data from image'));
        return;
      }

      const objectURL = URL.createObjectURL(file);
      resolve({
        base64,
        mimeType: file.type,
        objectURL
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
