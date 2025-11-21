import { createClient, createAdminClient } from '@/lib/supabase/server'
import { ModelType } from '@/types'
import { TOKEN_COSTS, MODEL_TOKEN_MULTIPLIERS, calculateTokenCost } from '@/lib/tokenCosts'

export type GenerationType = keyof typeof TOKEN_COSTS

// Re-export for backward compatibility
export { TOKEN_COSTS, MODEL_TOKEN_MULTIPLIERS, calculateTokenCost }

// Get user's token balance
export async function getUserTokens(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('tokens')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user tokens:', error)
    throw new Error(`Failed to fetch user tokens: ${error.message}`)
  }

  if (!data) {
    throw new Error('User not found in database')
  }

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
  type: GenerationType,
  model: ModelType = 'gemini-2.5-flash-image'
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const supabase = await createClient()
  const cost = calculateTokenCost(type, model)

  try {
    console.log(`Consuming tokens: userId=${userId}, type=${type}, cost=${cost}`)

    // Get current balance
    const currentTokens = await getUserTokens(userId)
    console.log(`Current token balance: ${currentTokens}`)

    if (currentTokens < cost) {
      console.log(`Insufficient tokens: need ${cost}, have ${currentTokens}`)
      return {
        success: false,
        newBalance: currentTokens,
        error: 'Insufficient tokens',
      }
    }

    // Deduct tokens
    const newBalance = currentTokens - cost
    console.log(`Deducting tokens: new balance will be ${newBalance}`)

    const { error: updateError } = await supabase
      .from('users')
      .update({ tokens: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user tokens:', updateError)
      throw updateError
    }

    // Record transaction
    const transactionType =
      type === 'CHARACTER_SHEET' ? 'generation_sheet' :
      type === 'FACIAL_EXPRESSIONS' ? 'generation_expressions' :
      type === 'POSE_GENERATION' ? 'generation_pose' :
      type === 'LIVE2D_PARTS' ? 'generation_live2d_parts' :
      'generation_concept'

    console.log(`Recording transaction: type=${transactionType}, amount=${-cost}`)

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: transactionType,
        amount: -cost,
        balance_after: newBalance,
      })

    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
      throw transactionError
    }

    console.log('Token consumption successful')
    return { success: true, newBalance }
  } catch (error) {
    console.error('Error consuming tokens:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to consume tokens'
    return {
      success: false,
      newBalance: 0,
      error: errorMessage,
    }
  }
}

// Check if user has already purchased a specific package (for first-time-only packages)
export async function hasUserPurchasedPackage(userId: string, packageId: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'purchase')
      .eq('package_id', packageId)
      .limit(1)

    if (error) {
      console.error('Error checking purchase history for package:', error)
      return false
    }

    return (data?.length ?? 0) > 0
  } catch (error) {
    console.error('Error checking purchase history for package:', error)
    return false
  }
}

// Refund tokens (when generation fails)
export async function refundTokens(
  userId: string,
  type: GenerationType,
  model: ModelType = 'gemini-2.5-flash-image'
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const supabase = await createClient()
  const cost = calculateTokenCost(type, model)

  try {
    console.log(`Refunding tokens: userId=${userId}, type=${type}, amount=${cost}`)

    // Get current balance
    const currentTokens = await getUserTokens(userId)
    console.log(`Current token balance: ${currentTokens}`)

    // Add tokens back
    const newBalance = currentTokens + cost
    console.log(`Refunding tokens: new balance will be ${newBalance}`)

    const { error: updateError } = await supabase
      .from('users')
      .update({ tokens: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user tokens for refund:', updateError)
      throw updateError
    }

    // Record refund transaction
    const transactionType =
      type === 'CHARACTER_SHEET' ? 'refund_sheet' :
      type === 'FACIAL_EXPRESSIONS' ? 'refund_expressions' :
      type === 'POSE_GENERATION' ? 'refund_pose' :
      type === 'LIVE2D_PARTS' ? 'refund_live2d_parts' :
      'refund_concept'

    console.log(`Recording refund transaction: type=${transactionType}, amount=${cost}`)

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: transactionType,
        amount: cost,
        balance_after: newBalance,
      })

    if (transactionError) {
      console.error('Error recording refund transaction:', transactionError)
      throw transactionError
    }

    console.log('Token refund successful')
    return { success: true, newBalance }
  } catch (error) {
    console.error('Error refunding tokens:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to refund tokens'
    return {
      success: false,
      newBalance: 0,
      error: errorMessage,
    }
  }
}

// Add tokens (after purchase)
export async function addTokens(
  userId: string,
  amount: number,
  stripeSessionId: string,
  packageId?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  // Use admin client to bypass RLS for webhook processing
  const supabase = createAdminClient()

  try {
    console.log(`Adding tokens: userId=${userId}, amount=${amount}, sessionId=${stripeSessionId}`)

    // Get current user data
    let currentTokens = 0
    let userEmail: string | null = null

    try {
      // Query directly with admin client
      const { data, error } = await supabase
        .from('users')
        .select('tokens, email')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user tokens:', error)
        throw error
      }

      currentTokens = data?.tokens || 0
      userEmail = data?.email || null
      console.log(`Current token balance: ${currentTokens}`)
    } catch (error) {
      console.log('User not found in users table, will fetch from auth')
      // User doesn't exist in users table, get email from auth.users
      const { data: authData } = await supabase.auth.admin.getUserById(userId)
      userEmail = authData?.user?.email || null
      currentTokens = 0
    }

    const newBalance = currentTokens + amount
    console.log(`New balance will be: ${newBalance}`)

    // Upsert user tokens (insert if not exists, update if exists)
    const upsertData: { id: string; tokens: number; email?: string } = {
      id: userId,
      tokens: newBalance
    }

    // Include email if available
    if (userEmail) {
      upsertData.email = userEmail
    }

    const { error: upsertError } = await supabase
      .from('users')
      .upsert(upsertData, { onConflict: 'id' })

    if (upsertError) {
      console.error('Error upserting user tokens:', upsertError)
      throw upsertError
    }

    console.log('User tokens updated successfully')

    // Record transaction
    const transactionData: any = {
      user_id: userId,
      type: 'purchase',
      amount: amount,
      balance_after: newBalance,
      stripe_session_id: stripeSessionId,
    }

    // Add package_id if provided
    if (packageId) {
      transactionData.package_id = packageId
    }

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)

    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
      throw transactionError
    }

    console.log('Transaction recorded successfully')
    console.log(`Tokens added successfully. New balance: ${newBalance}`)

    return { success: true, newBalance }
  } catch (error) {
    console.error('Error adding tokens:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to add tokens'
    return {
      success: false,
      newBalance: 0,
      error: errorMessage,
    }
  }
}
