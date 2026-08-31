// app/admin/orders/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = {
  title: 'Orders — Admin',
}

export const dynamic = 'force-dynamic'

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(amountCents / 100)
}

type OrderRow = {
  id: string
  product_name: string
  amount_cents: number
  currency: string
  status: string
  created_at: string
  people: {
    id: string
    name: string | null
    email: string
  } | null
}

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('id, product_name, amount_cents, currency, status, created_at, people(id, name, email)')
    .order('created_at', { ascending: false })

  const orders = (data ?? []) as unknown as OrderRow[]
  const totalPaidCents = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount_cents, 0)

  return (
    <div className="flex flex-1 flex-col bg-white font-sans">
      <header className="border-b-4 border-[#6EC9C0] bg-[#333132] px-6 py-10 sm:px-16">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EC9C0]">Admin</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Orders</h1>
        <p className="mt-1 text-sm text-[#A0ADC0]">
          {orders.length} total · {formatMoney(totalPaidCents, 'AUD')} paid
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-16">
        <p className="mb-6 text-sm text-[#808897]">
          To add an order, open the person&apos;s record from{' '}
          <Link href="/admin/people" className="text-[#485F88] hover:underline">People</Link> and use the
          &quot;Add an order&quot; form there.
        </p>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load orders: {error.message}
          </p>
        )}

        {!error && orders.length === 0 && (
          <p className="text-sm text-[#808897]">No orders yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#A0ADC0]/40 p-4">
              <div>
                <p className="text-sm font-semibold text-[#29394D]">{order.product_name}</p>
                {order.people ? (
                  <Link href={`/admin/people/${order.people.id}`} className="text-xs text-[#485F88] hover:underline">
                    {order.people.name ?? order.people.email}
                  </Link>
                ) : (
                  <p className="text-xs text-[#808897]">Unknown person</p>
                )}
                <p className="text-xs text-[#808897]">{new Date(order.created_at).toLocaleString('en-AU')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#333132]">
                  {formatMoney(order.amount_cents, order.currency)}
                </span>
                <span className="rounded-full bg-[#6EC9C0]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#29394D]">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
