import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAuditById } from '@/lib/audit-store'
import { processAudit } from '@/lib/audit-processor'
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
      await supabase
        .from('audits')
        .update({
          stripe_session_id: session.id,
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auditId)

      // Fetch audit and start processing
      const audit = await getAuditById(auditId)
      if (audit) {
        // Download .pbix from temporary storage
        const uploadPath = `uploads/${auditId}.pbix`
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('audit-reports')
          .download(uploadPath)

        if (downloadError || !fileData) {
          console.error(`Failed to download .pbix for ${auditId}:`, downloadError)
          await supabase.from('audits').update({ status: 'failed' }).eq('id', auditId)
          return NextResponse.json({ received: true })
        }

        const fileBuffer = Buffer.from(await fileData.arrayBuffer())

        // Delete the temporary upload immediately
        await supabase.storage.from('audit-reports').remove([uploadPath])

        // Start processing (async — don't block webhook response)
        processAudit(auditId, fileBuffer, audit.file_name, audit.email).catch((err) => {
          console.error(`Processing failed for ${auditId}:`, err)
        })

        console.log(`Payment confirmed and processing started for ${auditId}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}
