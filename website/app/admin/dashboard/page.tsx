// app/admin/dashboard/page.tsx
import Link from 'next/link'
import type { ReactNode } from 'react'
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

// Ordinal ramp, one hue (brand navy → dark navy), monotone light→dark —
// pipeline stage order carries meaning, so color encodes position in the
// sequence, not identity. Validated: node scripts/validate_palette.js
// "#AEB4BB,#98A0AA,#7C8692,#616C7B,#455364,#29394D" --mode light --ordinal
// --surface "#ffffff" → all checks pass (light-end 2.09:1, adjacent ΔL ≥ 0.06).
const STAGE_RAMP: Record<(typeof STAGE_ORDER)[number], string> = {
  new_lead: '#AEB4BB',
  contacted: '#98A0AA',
  discovery_call: '#7C8692',
  proposal: '#616C7B',
  won: '#455364',
  lost: '#29394D',
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
}

// Fixed status palette (never themed) — paid reads as the good outcome,
// pending as in-progress, refunded/cancelled as the two ways money didn't
// land. Reserved steps, always icon + label (pending/refunded sit below
// 3:1 on a light surface by design — the icon + label pairing is the
// mitigation, per the palette's own contrast notes).
const ORDER_STATUS_COLOR: Record<string, string> = {
  paid: '#0ca30c',
  pending: '#fab219',
  refunded: '#ec835a',
  cancelled: '#d03b3b',
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

// One bar in a horizontal bar chart. Mark spec: <=24px thick, 4px rounded
// data-end (the tip, away from the baseline), square at the baseline,
// value labeled at the tip rather than inside the fill (so it never
// collides with a short bar). No gridlines: every value is already
// direct-labeled, so an axis would repeat information, not add it.
function BarRow({
  label,
  value,
  displayValue,
  pct,
  color,
  icon,
}: {
  label: string
  value: number
  displayValue: string
  pct: number
  color: string
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-36 shrink-0 items-center gap-1.5 text-sm text-[#52514e]">
        {icon}
        {label}
      </span>
      <div className="h-5 flex-1" title={`${label}: ${displayValue}`}>
        <div
          className="h-5 rounded-r-[4px]"
          style={{ width: `${Math.max(pct, value > 0 ? 2 : 0)}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-sm font-semibold text-[#29394D]">
        {displayValue}
      </span>
    </div>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5L6.5 12L13 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ClockIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="2" />
      <path d="M8 5V8.3L10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function ReturnIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 5H10.5C12 5 13 6.2 13 7.5C13 8.8 12 10 10.5 10H5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 7.5L4 10L6.5 12.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function CancelIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4L12 12M12 4L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const ORDER_STATUS_ICON: Record<string, (color: string) => ReactNode> = {
  paid: (c) => <CheckIcon color={c} />,
  pending: (c) => <ClockIcon color={c} />,
  refunded: (c) => <ReturnIcon color={c} />,
  cancelled: (c) => <CancelIcon color={c} />,
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
  const maxStageCount = Math.max(1, ...STAGE_ORDER.map((s) => counts[s]))

  const revenueByStatus: Record<string, number> = { pending: 0, paid: 0, refunded: 0, cancelled: 0 }
  for (const order of orders ?? []) {
    revenueByStatus[order.status] = (revenueByStatus[order.status] ?? 0) + order.amount_cents
  }
  const ORDER_STATUS_ORDER = ['paid', 'pending', 'refunded', 'cancelled'] as const
  const maxRevenue = Math.max(1, ...ORDER_STATUS_ORDER.map((s) => revenueByStatus[s] ?? 0))

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

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-16">
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
            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-[#A0ADC0]/40 p-5">
              {STAGE_ORDER.map((stage) => (
                <BarRow
                  key={stage}
                  label={STAGE_LABELS[stage]}
                  value={counts[stage]}
                  displayValue={String(counts[stage])}
                  pct={(counts[stage] / maxStageCount) * 100}
                  color={STAGE_RAMP[stage]}
                />
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
                  Revenue by order status
                </h2>
                <div className="mt-4 flex flex-col gap-2 rounded-lg border border-[#A0ADC0]/40 p-5">
                  {ORDER_STATUS_ORDER.map((status) => (
                    <BarRow
                      key={status}
                      label={ORDER_STATUS_LABELS[status]}
                      value={revenueByStatus[status] ?? 0}
                      displayValue={formatMoney(revenueByStatus[status] ?? 0)}
                      pct={((revenueByStatus[status] ?? 0) / maxRevenue) * 100}
                      color={ORDER_STATUS_COLOR[status]}
                      icon={ORDER_STATUS_ICON[status]?.(ORDER_STATUS_COLOR[status])}
                    />
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
