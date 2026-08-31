// components/inquire/InquiryForm.tsx
'use client'
import { useForm } from '@tanstack/react-form'
import { submitInquiry } from '@/lib/crm/actions'
import { useState } from 'react'

const INQUIRY_TYPES = [
  { value: 'membership', label: 'Membership' },
  { value: 'training_enrolment', label: 'Training / course enrolment' },
  { value: 'consulting_review', label: 'Consulting / compliance review' },
] as const

export function InquiryForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      type: '' as string,
      message: '',
      last_consulting_engagement_date: '',
      ok_to_contact: false,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const fd = new FormData()
      fd.set('name', value.name)
      fd.set('email', value.email)
      fd.set('phone', value.phone)
      fd.set('company', value.company)
      fd.set('type', value.type)
      fd.set('message', value.message)
      if (value.last_consulting_engagement_date) {
        fd.set('last_consulting_engagement_date', value.last_consulting_engagement_date)
      }
      if (value.ok_to_contact) fd.set('ok_to_contact', 'on')

      const result = await submitInquiry(fd)
      if (result?.error) setServerError(result.error)
      else setSubmitted(true)
    },
  })

  if (submitted) {
    return (
      <p role="status" className="rounded-md bg-[#6EC9C0]/15 px-4 py-3 text-sm font-medium text-[#29394D]">
        Thanks — we&apos;ve got your inquiry and will be in touch within one business day.
      </p>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
      className="space-y-4"
    >
      {serverError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <form.Field
        name="type"
        validators={{ onChange: ({ value }) => !value ? 'Please choose what this is about' : undefined }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className="block text-sm font-semibold text-[#333132] mb-1">
              What can we help with?
            </label>
            <select
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="w-full rounded-md border border-[#A0ADC0] bg-white px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
            >
              <option value="">Select one…</option>
              {INQUIRY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-700">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={s => s.values.type}>
        {(type) => type === 'consulting_review' && (
          <form.Field name="last_consulting_engagement_date">
            {(field) => (
              <div>
                <label htmlFor={field.name} className="block text-sm font-semibold text-[#333132] mb-1">
                  Date of your last consulting engagement (if any)
                </label>
                <input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-[#A0ADC0] bg-white px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
                />
              </div>
            )}
          </form.Field>
        )}
      </form.Subscribe>

      <form.Field
        name="name"
        validators={{ onChange: ({ value }) => !value ? 'Name is required' : undefined }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className="block text-sm font-semibold text-[#333132] mb-1">Name</label>
            <input
              id={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="w-full rounded-md border border-[#A0ADC0] bg-white px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
            />
            {field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-700">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="email"
        validators={{ onChange: ({ value }) => !value ? 'Email is required' : undefined }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className="block text-sm font-semibold text-[#333132] mb-1">Email</label>
            <input
              id={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="w-full rounded-md border border-[#A0ADC0] bg-white px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
            />
            {field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-700">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="phone">
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-semibold text-[#333132] mb-1">Phone</label>
              <input
                id={field.name}
                type="tel"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                className="w-full rounded-md border border-[#A0ADC0] bg-white px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="company">
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-semibold text-[#333132] mb-1">Company</label>
              <input
                id={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                className="w-full rounded-md border border-[#A0ADC0] bg-white px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field
        name="message"
        validators={{ onChange: ({ value }) => !value ? 'Tell us a bit about what you need' : undefined }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className="block text-sm font-semibold text-[#333132] mb-1">Message</label>
            <textarea
              id={field.name}
              rows={4}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="w-full rounded-md border border-[#A0ADC0] bg-white px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
            />
            {field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-700">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="ok_to_contact">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-[#333132]">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={e => field.handleChange(e.target.checked)}
              className="h-4 w-4 rounded border-[#A0ADC0]"
            />
            Keep me updated with payroll compliance news
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={s => s.isSubmitting}>
        {(isSubmitting) => (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#29394D] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#485F88] disabled:opacity-50"
          >
            {isSubmitting ? 'Sending…' : 'Send inquiry'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
