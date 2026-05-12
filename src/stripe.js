import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe('pk_test_51TW1p0Jy6G7FvaMQnxxO6aOVWs89xtJLTpSQEoHflonVTDwlGYjpXpAcaSSeYkCAS6iNWGud3ULwuAPluINzpcal00hq5FGN6U')

export const PLANS = {
  starter: {
    nom: 'Starter',
    prix: '19€/mois',
    priceId: 'price_1TW1sjJy6G7FvaMQdFvpUGjc',
  },
  pro: {
    nom: 'Pro',
    prix: '29€/mois',
    priceId: 'price_1TW1tJJy6G7FvaMQxpSs5gWE',
  },
  premium: {
    nom: 'Premium',
    prix: '49€/mois',
    priceId: 'price_1TW1tuJy6G7FvaMQ6cZhQEDD',
  },
}