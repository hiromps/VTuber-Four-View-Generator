
export type ViewType = 'front' | 'back' | 'left' | 'right';

export interface GeneratedImages {
  front: string | null;
  back: string | null;
  left: string | null;
  right: string | null;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface UploadedFile {
    base64: string;
    mimeType: string;
    objectURL: string;
}
