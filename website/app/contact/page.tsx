// app/contact/page.tsx
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata = {
  title: 'Contact — Consulting Hub',
  description: 'Get in touch with Consulting Hub.',
}

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-24 sm:px-16">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Get in touch
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Have a compliance question or want to know more? Send a message and
            we&apos;ll get back to you.
          </p>
        </div>
        <ContactForm />
      </main>
    </div>
  )
}
