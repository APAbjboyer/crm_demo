// components/admin/StatusSelect.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateContactStatus } from '@/lib/crm/actions'

const STATUS_OPTIONS = [
  { value: 'new_lead', label: 'New lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'discovery_call', label: 'Discovery call' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
] as const

export function StatusSelect({ contactId, status }: { contactId: string; status: string }) {
  const [value, setValue] = useState(status)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleChange(next: string) {
    const previous = value
    setValue(next)
    setError(null)
    startTransition(async () => {
      const result = await updateContactStatus(contactId, next)
      if (result?.error) {
        setValue(previous)
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="Pipeline status"
        className="rounded-full border border-[#A0ADC0]/60 bg-[#6EC9C0]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#29394D] focus:outline-none focus:ring-2 focus:ring-[#485F88] disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="max-w-[12rem] text-right text-xs text-red-700">{error}</span>}
    </div>
  )
}
