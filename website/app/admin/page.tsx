// app/admin/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { StatusSelect } from '@/components/admin/StatusSelect'

export const metadata = {
  title: 'Leads — Admin',
}

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  membership: 'Membership',
  training_enrolment: 'Training / course enrolment',
  consulting_review: 'Consulting / compliance review',
}

type Lead = {
  id: string
  type: string
  status: string
  message: string | null
  created_at: string
  people: {
    id: string
    name: string | null
    email: string
    phone: string | null
    company: string | null
    attributes: Record<string, string> | null
  } | null
}

export default async function AdminLeadsPage() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('id, type, status, message, created_at, people(id, name, email, phone, company, attributes)')
    .order('created_at', { ascending: false })

  const leads = (data ?? []) as unknown as Lead[]

  return (
    <div className="flex flex-1 flex-col bg-white font-sans">
      <header className="border-b-4 border-[#6EC9C0] bg-[#333132] px-6 py-10 sm:px-16">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EC9C0]">Admin</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Leads</h1>
        <p className="mt-1 text-sm text-[#A0ADC0]">
          Every inquiry, newest first. {leads.length} total.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-16">
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load leads: {error.message}
          </p>
        )}

        {!error && leads.length === 0 && (
          <p className="text-sm text-[#808897]">No inquiries yet.</p>
        )}

        <div className="flex flex-col gap-4">
          {leads.map((lead) => {
            const person = lead.people
            return (
            <div key={lead.id} className="rounded-lg border border-[#A0ADC0]/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-[#29394D]">
                    {person ? (
                      <Link href={`/admin/people/${person.id}`} className="hover:underline">
                        {person.name ?? 'Unknown'}
                      </Link>
                    ) : (
                      'Unknown'
                    )}{' '}
                    <span className="font-normal text-[#808897]">— {person?.email}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-[#485F88]">
                    {TYPE_LABELS[lead.type] ?? lead.type}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusSelect contactId={lead.id} status={lead.status} />
                  <span className="text-xs text-[#808897]">
                    {new Date(lead.created_at).toLocaleString('en-AU')}
                  </span>
                </div>
              </div>

              {lead.message && (
                <p className="mt-3 text-sm leading-6 text-[#333132]">{lead.message}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#808897]">
                {person?.phone && <span>Phone: {person.phone}</span>}
                {person?.company && <span>Company: {person.company}</span>}
                {person?.attributes?.last_consulting_engagement_date && (
                  <span>
                    Last consulting engagement: {person.attributes.last_consulting_engagement_date}
                  </span>
                )}
              </div>
            </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
