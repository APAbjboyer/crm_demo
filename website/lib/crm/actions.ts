// lib/crm/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const INQUIRY_TYPES = ['membership', 'training_enrolment', 'consulting_review'] as const
const CONTACT_STATUSES = ['new_lead', 'contacted', 'discovery_call', 'proposal', 'won', 'lost'] as const
const ORDER_STATUSES = ['pending', 'paid', 'refunded', 'cancelled'] as const

/**
 * The logged-in admin's email, pulled from the Supabase Auth session
 * server-side and checked against ADMIN_EMAILS — never trust a
 * client-supplied "actor" value for attribution on writes.
 * Returns null if there is no authenticated admin.
 */
async function getActorEmail(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email.toLowerCase())) return null
  return user.email
}

export async function submitInquiry(formData: FormData) {
  const name = (formData.get('name') as string || '').trim()
  const email = (formData.get('email') as string || '').trim()
  const phone = (formData.get('phone') as string || '').trim()
  const company = (formData.get('company') as string || '').trim()
  const type = (formData.get('type') as string || '').trim()
  const message = (formData.get('message') as string || '').trim()
  const okToContact = formData.get('ok_to_contact') === 'on'
  const lastConsultingEngagementDate = (formData.get('last_consulting_engagement_date') as string || '').trim()

  if (!name || !email || !message) {
    return { error: 'Name, email, and message are all required.' }
  }
  if (!INQUIRY_TYPES.includes(type as (typeof INQUIRY_TYPES)[number])) {
    return { error: 'Please choose what your inquiry is about.' }
  }

  const newAttributes: Record<string, string> = {}
  if (lastConsultingEngagementDate) {
    newAttributes.last_consulting_engagement_date = lastConsultingEngagementDate
  }

  const supabase = createAdminClient()

  // Merge with any existing person by email — a later submission that
  // leaves a field blank must never erase a value given previously.
  const { data: existing } = await supabase
    .from('people')
    .select('phone, company, ok_to_contact, attributes')
    .eq('email', email)
    .maybeSingle()

  const { data: person, error: personError } = await supabase
    .from('people')
    .upsert(
      {
        email,
        name,
        phone: phone || existing?.phone || null,
        company: company || existing?.company || null,
        source_site: 'austpayroll',
        ok_to_contact: okToContact || existing?.ok_to_contact || false,
        attributes: { ...(existing?.attributes || {}), ...newAttributes },
      },
      { onConflict: 'email' }
    )
    .select('id')
    .single()

  if (personError || !person) {
    return { error: 'Something went wrong submitting the form. Please try again.' }
  }

  const { error: contactError } = await supabase.from('contacts').insert({
    person_id: person.id,
    type,
    message,
    source: 'website',
    status: 'new_lead',
  })

  if (contactError) {
    return { error: 'Something went wrong submitting the form. Please try again.' }
  }

  // TODO: send a confirmation email via Resend once RESEND_API_KEY holds a
  // real key and a sending domain is verified (deferred — Build 2 explicitly
  // excludes this integration; see product-plan.md "BUILD 2 (all)").

  return { success: true }
}

/**
 * Moves a Contacts row through the pipeline (new_lead → contacted →
 * discovery_call → proposal → won/lost) and writes the matching
 * activity_log row in the same database transaction, via the
 * transition_contact_status() Postgres function — so a status change and
 * its audit row either both land or neither does.
 */
export async function updateContactStatus(contactId: string, toStatus: string, note?: string) {
  if (!contactId || !CONTACT_STATUSES.includes(toStatus as (typeof CONTACT_STATUSES)[number])) {
    return { error: 'Invalid status.' }
  }

  const actor = await getActorEmail()
  if (!actor) {
    return { error: 'You must be signed in as an admin to do that.' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.rpc('transition_contact_status', {
    p_contact_id: contactId,
    p_to_status: toStatus,
    p_actor: actor,
    p_note: note?.trim() || null,
  })

  if (error) {
    return { error: 'Could not update status. Please try again.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/people')
  return { success: true }
}

/**
 * Records a purchase against a person. Amount is collected from the form
 * in dollars and stored in amount_cents to avoid floating-point money bugs.
 */
export async function addOrder(formData: FormData) {
  const personId = (formData.get('person_id') as string || '').trim()
  const productName = (formData.get('product_name') as string || '').trim()
  const amountRaw = (formData.get('amount') as string || '').trim()
  const currency = ((formData.get('currency') as string) || 'AUD').trim().toUpperCase() || 'AUD'
  const status = (formData.get('status') as string || 'pending').trim()

  if (!personId || !productName || !amountRaw) {
    return { error: 'Product name and amount are required.' }
  }

  const amount = Number(amountRaw)
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Enter a valid amount greater than zero.' }
  }
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { error: 'Invalid order status.' }
  }

  const actor = await getActorEmail()
  if (!actor) {
    return { error: 'You must be signed in as an admin to do that.' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('orders').insert({
    person_id: personId,
    product_name: productName,
    amount_cents: Math.round(amount * 100),
    currency,
    status,
  })

  if (error) {
    return { error: 'Could not add the order. Please try again.' }
  }

  revalidatePath(`/admin/people/${personId}`)
  revalidatePath('/admin/orders')
  return { success: true }
}
