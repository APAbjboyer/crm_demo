// lib/supabase/admin.ts
// Server-only client for the CRM (people, contacts, activity_log, orders).
// Uses the service role key and bypasses RLS — never import this from a
// client component, and never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
