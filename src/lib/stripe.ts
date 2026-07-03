import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

export default stripe

export async function createPaymentIntent(amount: number, bookingId: string) {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "pen",
    metadata: { bookingId },
    automatic_payment_methods: { enabled: true },
  })
  return intent
}

export async function retrievePaymentIntent(id: string) {
  return stripe.paymentIntents.retrieve(id)
}
