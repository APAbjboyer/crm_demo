// components/contact/ContactForm.tsx
'use client'
import { useForm } from '@tanstack/react-form'
import { submitContactForm } from '@/lib/contact/actions'
import { useState } from 'react'

export function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    defaultValues: { name: '', email: '', message: '' },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const fd = new FormData()
      fd.set('name', value.name)
      fd.set('email', value.email)
      fd.set('message', value.message)
      const result = await submitContactForm(fd)
      if (result?.error) setServerError(result.error)
      else setSubmitted(true)
    },
  })

  if (submitted) {
    return (
      <p role="status" className="rounded bg-green-50 px-4 py-3 text-sm text-green-700">
        Thanks — your message has been sent. We&apos;ll get back to you soon.
      </p>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
      className="space-y-4"
    >
      {serverError && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <form.Field
        name="name"
        validators={{ onChange: ({ value }) => !value ? 'Name is required' : undefined }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className="block text-sm font-medium mb-1">Name</label>
            <input
              id={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
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
            <label htmlFor={field.name} className="block text-sm font-medium mb-1">Email</label>
            <input
              id={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="message"
        validators={{ onChange: ({ value }) => !value ? 'Message is required' : undefined }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className="block text-sm font-medium mb-1">Message</label>
            <textarea
              id={field.name}
              rows={5}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={s => s.isSubmitting}>
        {(isSubmitting) => (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending…' : 'Send message'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
