// app/admin/people/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { AddOrderForm } from '@/components/admin/AddOrderForm'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  membership: 'Membership',
  training_enrolment: 'Training / course enrolment',
  consulting_review: 'Consulting / compliance review',
}

const CONTACT_STATUS_LABELS: Record<string, string> = {
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

// Custom attribute keys get a friendly label; anything else falls back to
// a readable version of the raw key so a future attribute doesn't vanish.
const ATTRIBUTE_LABELS: Record<string, string> = {
  last_consulting_engagement_date: 'Last consulting engagement date',
}

function formatAttributeKey(key: string) {
  return ATTRIBUTE_LABELS[key] ?? key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(amountCents / 100)
}

type Person = {
  id: string
  name: string | null
  email: string
  phone: string | null
  company: string | null
  role: string | null
  source_site: string | null
  ok_to_contact: boolean
  attributes: Record<string, unknown> | null
  created_at: string
}

type ContactRow = {
  id: string
  type: string
  subject: string | null
  message: string | null
  status: string
  created_at: string
}

type OrderRow = {
  id: string
  product_name: string
  amount_cents: number
  currency: string
  status: string
  created_at: string
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data } = await supabase.from('people').select('name, email').eq('id', id).maybeSingle()
  return { title: data ? `${data.name ?? data.email} — Admin` : 'Person — Admin' }
}

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: person, error: personError }, { data: contactsData }, { data: ordersData }] = await Promise.all([
    supabase.from('people').select('*').eq('id', id).maybeSingle<Person>(),
    supabase
      .from('contacts')
      .select('id, type, subject, message, status, created_at')
      .eq('person_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('id, product_name, amount_cents, currency, status, created_at')
      .eq('person_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (personError || !person) {
    notFound()
  }

  const contacts = (contactsData ?? []) as ContactRow[]
  const orders = (ordersData ?? []) as OrderRow[]
  const attributeEntries = Object.entries(person.attributes ?? {})

  return (
    <div className="flex flex-1 flex-col bg-white font-sans">
      <header className="border-b-4 border-[#6EC9C0] bg-[#333132] px-6 py-10 sm:px-16">
        <Link href="/admin/people" className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EC9C0] hover:underline">
          ← People
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{person.name ?? 'Unknown'}</h1>
        <p className="mt-1 text-sm text-[#A0ADC0]">{person.email}</p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-6 py-10 sm:px-16">
        {/* Contact details + custom attributes */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[#29394D]">Details</h2>
          <div className="rounded-lg border border-[#A0ADC0]/40 p-5">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#808897]">Phone</dt>
                <dd className="text-sm text-[#333132]">{person.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#808897]">Company</dt>
                <dd className="text-sm text-[#333132]">{person.company ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#808897]">Role</dt>
                <dd className="text-sm text-[#333132]">{person.role ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#808897]">Source</dt>
                <dd className="text-sm text-[#333132]">{person.source_site ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#808897]">Newsletter</dt>
                <dd className="text-sm text-[#333132]">{person.ok_to_contact ? 'Opted in' : 'Not opted in'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#808897]">Person since</dt>
                <dd className="text-sm text-[#333132]">{new Date(person.created_at).toLocaleDateString('en-AU')}</dd>
              </div>
            </dl>

            {attributeEntries.length > 0 && (
              <div className="mt-5 border-t border-[#A0ADC0]/30 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#808897]">Custom attributes</p>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  {attributeEntries.map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs font-semibold text-[#485F88]">{formatAttributeKey(key)}</dt>
                      <dd className="text-sm text-[#333132]">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </section>

        {/* Inquiry history */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[#29394D]">Inquiry history</h2>
          {contacts.length === 0 ? (
            <p className="text-sm text-[#808897]">No inquiries yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {contacts.map((c) => (
                <div key={c.id} className="rounded-lg border border-[#A0ADC0]/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#485F88]">{TYPE_LABELS[c.type] ?? c.type}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#6EC9C0]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#29394D]">
                        {CONTACT_STATUS_LABELS[c.status] ?? c.status}
                      </span>
                      <span className="text-xs text-[#808897]">
                        {new Date(c.created_at).toLocaleString('en-AU')}
                      </span>
                    </div>
                  </div>
                  {c.message && <p className="mt-2 text-sm leading-6 text-[#333132]">{c.message}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Orders */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[#29394D]">Orders</h2>
          <div className="mb-4 flex flex-col gap-3">
            {orders.length === 0 ? (
              <p className="text-sm text-[#808897]">No orders yet.</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#A0ADC0]/40 p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#29394D]">{o.product_name}</p>
                    <p className="text-xs text-[#808897]">{new Date(o.created_at).toLocaleString('en-AU')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#333132]">{formatMoney(o.amount_cents, o.currency)}</span>
                    <span className="rounded-full bg-[#6EC9C0]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#29394D]">
                      {ORDER_STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#808897]">Add an order</p>
          <AddOrderForm personId={person.id} />
        </section>
      </main>
    </div>
  )
}
