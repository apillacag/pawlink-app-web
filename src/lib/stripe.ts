import Stripe from "stripe"

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(key)
}

export default getStripe

export async function createPaymentIntent(amount: number, bookingId: string) {
  const stripe = getStripe()
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "pen",
    metadata: { bookingId },
    automatic_payment_methods: { enabled: true },
  })
  return intent
}

export async function retrievePaymentIntent(id: string) {
  const stripe = getStripe()
  return stripe.paymentIntents.retrieve(id)
}
