import { NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function POST(req: Request) {
  try {
    const { auditId, plan, email } = await req.json()

    if (!auditId || !plan || !email) {
      return NextResponse.json({ error: 'Missende parameters.' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is niet geconfigureerd.' }, { status: 500 })
    }

    // Get the correct price ID
    const priceId =
      plan === 'bundle'
        ? process.env.STRIPE_PRICE_BUNDLE_5
        : process.env.STRIPE_PRICE_SINGLE_AUDIT

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe prijs niet geconfigureerd.' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'ideal'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        auditId,
        plan,
      },
      success_url: `${BASE_URL}/tools/report-auditor/status/${auditId}?payment=success`,
      cancel_url: `${BASE_URL}/tools/report-auditor#upload`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het aanmaken van de betaalsessie.' },
      { status: 500 }
    )
  }
}
