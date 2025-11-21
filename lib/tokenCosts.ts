import { ModelType } from '@/types'

// Token costs for each generation type
export const TOKEN_COSTS = {
  CHARACTER_SHEET: 4,     // 4 images (front, back, left, right)
  FACIAL_EXPRESSIONS: 4,  // 4 images (joy, anger, sorrow, surprise)
  CONCEPT_ART: 1,         // 1 image
  POSE_GENERATION: 1,     // 1 image (custom pose)
  LIVE2D_PARTS: 5,        // Live2D parts design with multiple layers
} as const

export type GenerationType = keyof typeof TOKEN_COSTS

// Model token multipliers
export const MODEL_TOKEN_MULTIPLIERS: Record<ModelType, number> = {
  'gemini-2.5-flash-image': 1.0,
  'nanobanana-pro': 1.5,
}

// Calculate token cost based on generation type and model
export function calculateTokenCost(type: GenerationType, model: ModelType = 'gemini-2.5-flash-image'): number {
  const baseCost = TOKEN_COSTS[type]
  const multiplier = MODEL_TOKEN_MULTIPLIERS[model]
  return Math.ceil(baseCost * multiplier)
}
