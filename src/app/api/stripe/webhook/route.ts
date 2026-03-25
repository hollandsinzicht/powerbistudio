import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAuditById } from '@/lib/audit-store'
import { supabase } from '@/lib/supabase'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  const stripe = getStripe()
  if (!stripe || !sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const auditId = session.metadata?.auditId

    if (auditId) {
      // Update audit with Stripe session ID
      const { error } = await supabase
        .from('audits')
        .update({
          stripe_session_id: session.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auditId)

      if (error) {
        console.error('Failed to update audit with Stripe session:', error)
      }

      // Check if audit exists and start processing if it was waiting for payment
      const audit = await getAuditById(auditId)
      if (audit && audit.status === 'pending_payment') {
        // Processing will be triggered by the upload flow
        // This webhook just confirms payment was successful
        console.log(`Payment confirmed for audit ${auditId}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}
