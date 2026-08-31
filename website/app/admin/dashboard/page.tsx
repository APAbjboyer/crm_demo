// app/admin/dashboard/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = {
  title: 'Dashboard — Admin',
}

export const dynamic = 'force-dynamic'

const STAGE_ORDER = ['new_lead', 'contacted', 'discovery_call', 'proposal', 'won', 'lost'] as const

const STAGE_LABELS: Record<(typeof STAGE_ORDER)[number], string> = {
  new_lead: 'New lead',
  contacted: 'Contacted',
  discovery_call: 'Discovery call',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('contacts').select('status')

  const counts: Record<string, number> = {}
  for (const stage of STAGE_ORDER) counts[stage] = 0
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }
  const total = (data ?? []).length

  return (
    <div className="flex flex-1 flex-col bg-white font-sans">
      <header className="border-b-4 border-[#6EC9C0] bg-[#333132] px-6 py-10 sm:px-16">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EC9C0]">Admin</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[#A0ADC0]">
          Pipeline snapshot across {total} inquir{total === 1 ? 'y' : 'ies'}.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-16">
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load pipeline counts: {error.message}
          </p>
        )}

        {!error && (
          <>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#808897]">
              Pipeline stages
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {STAGE_ORDER.map((stage) => (
                <Link
                  key={stage}
                  href="/admin"
                  className="rounded-lg border border-[#A0ADC0]/40 p-5 transition hover:border-[#6EC9C0] hover:shadow-sm"
                >
                  <p className="text-4xl font-bold tracking-tight text-[#29394D]">
                    {counts[stage]}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#485F88]">
                    {STAGE_LABELS[stage]}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-10 rounded-lg border border-dashed border-[#A0ADC0]/60 p-5">
              <p className="text-sm font-semibold text-[#29394D]">Renewals due</p>
              <p className="mt-1 text-sm text-[#808897]">
                Not tracked yet — membership renewal dates aren&apos;t recorded on a person&apos;s
                record. Add a renewal-date attribute to People to light this up.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
