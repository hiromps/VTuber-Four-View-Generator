import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Token packages
export const TOKEN_PACKAGES = [
  {
    id: '10_tokens',
    name: '10 Tokens',
    tokens: 10,
    price: 499, // $4.99 in cents
    priceDisplay: '$4.99',
    pricePerToken: '$0.50',
  },
  {
    id: '30_tokens',
    name: '30 Tokens',
    tokens: 30,
    price: 1199, // $11.99 in cents
    priceDisplay: '$11.99',
    pricePerToken: '$0.40',
    popular: true,
  },
  {
    id: '100_tokens',
    name: '100 Tokens',
    tokens: 100,
    price: 2999, // $29.99 in cents
    priceDisplay: '$29.99',
    pricePerToken: '$0.30',
  },
]

export function getTokenPackage(packageId: string) {
  return TOKEN_PACKAGES.find((pkg) => pkg.id === packageId)
}
