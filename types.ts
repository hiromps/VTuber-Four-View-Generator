
export type ViewType = 'front' | 'back' | 'left' | 'right';

export interface GeneratedImages {
  front: string | null;
  back: string | null;
  left: string | null;
  right: string | null;
  [key: string]: string | null;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface UploadedFile {
    base64: string;
    mimeType: string;
    objectURL: string;
}

export type ExpressionType = 'joy' | 'anger' | 'sorrow' | 'surprise';

export interface GeneratedExpressions {
  joy: string | null;
  anger: string | null;
  sorrow: string | null;
  surprise: string | null;
  [key: string]: string | null;
}

export interface PoseGenerationInput {
  characterImage: UploadedFile;
  poseDescription?: string;
  referenceImage?: UploadedFile;
}

export interface GeneratedPose {
  image: string | null;
}

export type ModelType = 'gemini-2.5-flash-image' | 'nanobanana-pro';

export interface ModelConfig {
  name: string;
  displayName: string;
  tokenMultiplier: number;
}
