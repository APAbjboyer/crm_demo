// components/admin/AddOrderForm.tsx
'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addOrder } from '@/lib/crm/actions'

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export function AddOrderForm({ personId }: { personId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null)
        startTransition(async () => {
          const result = await addOrder(formData)
          if (result?.error) {
            setError(result.error)
          } else {
            formRef.current?.reset()
            router.refresh()
          }
        })
      }}
      className="grid grid-cols-1 gap-3 rounded-lg border border-[#A0ADC0]/40 p-5 sm:grid-cols-4"
    >
      <input type="hidden" name="person_id" value={personId} />

      {error && (
        <p role="alert" className="col-span-full rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <label htmlFor="product_name" className="block text-xs font-semibold text-[#333132] mb-1">
          Product / service
        </label>
        <input
          id="product_name"
          name="product_name"
          type="text"
          required
          placeholder="e.g. Annual membership"
          className="w-full rounded-md border border-[#A0ADC0] px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-xs font-semibold text-[#333132] mb-1">
          Amount (AUD)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          className="w-full rounded-md border border-[#A0ADC0] px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
        />
        <input type="hidden" name="currency" value="AUD" />
      </div>

      <div>
        <label htmlFor="status" className="block text-xs font-semibold text-[#333132] mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue="pending"
          className="w-full rounded-md border border-[#A0ADC0] bg-white px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-full">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[#29394D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#485F88] disabled:opacity-50"
        >
          {isPending ? 'Adding…' : 'Add order'}
        </button>
      </div>
    </form>
  )
}
