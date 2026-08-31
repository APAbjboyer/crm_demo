// lib/crm/actions.ts
'use server'
import { createAdminClient } from '@/lib/supabase/admin'

const INQUIRY_TYPES = ['membership', 'training_enrolment', 'consulting_review'] as const

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

  return { success: true }
}
