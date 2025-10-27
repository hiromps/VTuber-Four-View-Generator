
import { UploadedFile } from './types';

export const fileToData = (file: File): Promise<UploadedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(',')[1];
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
