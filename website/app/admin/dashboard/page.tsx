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

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(
    amountCents / 100
  )
}

type RecentContact = {
  id: string
  type: string
  status: string
  created_at: string
  people: { id: string; name: string | null; email: string } | null
}

const TYPE_LABELS: Record<string, string> = {
  membership: 'Membership',
  training_enrolment: 'Training / course enrolment',
  consulting_review: 'Consulting / compliance review',
}

const STAGE_STYLES: Record<string, string> = {
  new_lead: 'bg-[#6EC9C0]/15 text-[#29394D]',
  contacted: 'bg-[#485F88]/15 text-[#29394D]',
  discovery_call: 'bg-[#485F88]/15 text-[#29394D]',
  proposal: 'bg-[#485F88]/25 text-[#29394D]',
  won: 'bg-[#6EC9C0]/40 text-[#29394D]',
  lost: 'bg-[#808897]/20 text-[#808897]',
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const [{ data, error }, { data: orders, error: ordersError }, { data: recent, error: recentError }] =
    await Promise.all([
      supabase.from('contacts').select('status'),
      supabase.from('orders').select('amount_cents, status'),
      supabase
        .from('contacts')
        .select('id, type, status, created_at, people(id, name, email)')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

  const counts: Record<string, number> = {}
  for (const stage of STAGE_ORDER) counts[stage] = 0
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }
  const total = (data ?? []).length

  const revenueByStatus: Record<string, number> = { pending: 0, paid: 0, refunded: 0, cancelled: 0 }
  for (const order of orders ?? []) {
    revenueByStatus[order.status] = (revenueByStatus[order.status] ?? 0) + order.amount_cents
  }
  const paidRevenue = revenueByStatus.paid ?? 0

  const recentContacts = (recent ?? []) as unknown as RecentContact[]

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

            {ordersError ? (
              <p className="mt-10 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                Couldn&apos;t load revenue: {ordersError.message}
              </p>
            ) : (
              <>
                <h2 className="mt-10 text-sm font-bold uppercase tracking-[0.14em] text-[#808897]">
                  Revenue
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border-2 border-[#485F88] bg-[#485F88]/5 p-5">
                    <p className="text-3xl font-bold tracking-tight text-[#29394D]">
                      {formatMoney(paidRevenue)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#485F88]">Paid</p>
                  </div>
                  {(['pending', 'refunded', 'cancelled'] as const).map((status) => (
                    <div key={status} className="rounded-lg border border-[#A0ADC0]/40 p-5">
                      <p className="text-3xl font-bold tracking-tight text-[#29394D]">
                        {formatMoney(revenueByStatus[status] ?? 0)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#808897]">
                        {ORDER_STATUS_LABELS[status]}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {recentError ? (
              <p className="mt-10 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                Couldn&apos;t load recent activity: {recentError.message}
              </p>
            ) : (
              <>
                <h2 className="mt-10 text-sm font-bold uppercase tracking-[0.14em] text-[#808897]">
                  Recent activity
                </h2>
                <div className="mt-4 flex flex-col gap-2">
                  {recentContacts.length === 0 && (
                    <p className="text-sm text-[#808897]">No inquiries yet.</p>
                  )}
                  {recentContacts.map((contact) => (
                    <Link
                      key={contact.id}
                      href="/admin"
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#A0ADC0]/40 px-4 py-3 transition hover:border-[#6EC9C0] hover:shadow-sm"
                    >
                      <div>
                        <span className="text-sm font-semibold text-[#29394D]">
                          {contact.people?.name ?? 'Unknown'}
                        </span>
                        <span className="ml-2 text-sm text-[#808897]">
                          {TYPE_LABELS[contact.type] ?? contact.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            STAGE_STYLES[contact.status] ?? 'bg-[#A0ADC0]/20 text-[#29394D]'
                          }`}
                        >
                          {STAGE_LABELS[contact.status as (typeof STAGE_ORDER)[number]] ?? contact.status}
                        </span>
                        <span className="text-xs text-[#808897]">
                          {new Date(contact.created_at).toLocaleString('en-AU')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
