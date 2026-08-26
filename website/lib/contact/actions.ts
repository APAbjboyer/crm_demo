// lib/contact/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function submitContactForm(formData: FormData) {
  const name = (formData.get('name') as string || '').trim()
  const email = (formData.get('email') as string || '').trim()
  const message = (formData.get('message') as string || '').trim()

  if (!name || !email || !message) {
    return { error: 'Name, email, and message are all required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_submissions')
    .insert({ name, email, message })

  if (error) return { error: 'Something went wrong submitting the form. Please try again.' }
  return { success: true }
}
