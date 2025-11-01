import { createClient } from '@/lib/supabase/server'

// Token costs for each generation type
export const TOKEN_COSTS = {
  CHARACTER_SHEET: 4, // 4 images (front, back, left, right)
  CONCEPT_ART: 1,     // 1 image
} as const

export type GenerationType = keyof typeof TOKEN_COSTS

// Get user's token balance
export async function getUserTokens(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('tokens')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data.tokens
}

// Check if user has enough tokens
export async function hasEnoughTokens(
  userId: string,
  cost: number
): Promise<boolean> {
  const tokens = await getUserTokens(userId)
  return tokens >= cost
}

// Consume tokens for generation
export async function consumeTokens(
  userId: string,
  type: GenerationType
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const supabase = await createClient()
  const cost = TOKEN_COSTS[type]

  try {
    // Get current balance
    const currentTokens = await getUserTokens(userId)

    if (currentTokens < cost) {
      return {
        success: false,
        newBalance: currentTokens,
        error: 'Insufficient tokens',
      }
    }

    // Deduct tokens
    const newBalance = currentTokens - cost
    const { error: updateError } = await supabase
      .from('users')
      .update({ tokens: newBalance })
      .eq('id', userId)

    if (updateError) throw updateError

    // Record transaction
    const transactionType = type === 'CHARACTER_SHEET'
      ? 'generation_sheet'
      : 'generation_concept'

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: transactionType,
        amount: -cost,
        balance_after: newBalance,
      })

    if (transactionError) throw transactionError

    return { success: true, newBalance }
  } catch (error) {
    console.error('Error consuming tokens:', error)
    return {
      success: false,
      newBalance: 0,
      error: 'Failed to consume tokens',
    }
  }
}

// Add tokens (after purchase)
export async function addTokens(
  userId: string,
  amount: number,
  stripeSessionId: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const supabase = await createClient()

  try {
    // Get current balance
    const currentTokens = await getUserTokens(userId)
    const newBalance = currentTokens + amount

    // Update user tokens
    const { error: updateError } = await supabase
      .from('users')
      .update({ tokens: newBalance })
      .eq('id', userId)

    if (updateError) throw updateError

    // Record transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'purchase',
        amount: amount,
        balance_after: newBalance,
        stripe_session_id: stripeSessionId,
      })

    if (transactionError) throw transactionError

    return { success: true, newBalance }
  } catch (error) {
    console.error('Error adding tokens:', error)
    return {
      success: false,
      newBalance: 0,
      error: 'Failed to add tokens',
    }
  }
}
