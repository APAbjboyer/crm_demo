// app/admin/newsletter/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = {
  title: 'Newsletter — Admin',
}

export const dynamic = 'force-dynamic'

type Person = {
  id: string
  name: string | null
  email: string
  company: string | null
  created_at: string
}

export default async function AdminNewsletterPage() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('people')
    .select('id, name, email, company, created_at')
    .eq('ok_to_contact', true)
    .order('created_at', { ascending: false })

  const people = (data ?? []) as Person[]

  return (
    <div className="flex flex-1 flex-col bg-white font-sans">
      <header className="border-b-4 border-[#6EC9C0] bg-[#333132] px-6 py-10 sm:px-16">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EC9C0]">Admin</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Newsletter</h1>
        <p className="mt-1 text-sm text-[#A0ADC0]">
          {people.length} opted in to email (people.ok_to_contact = true).
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-16">
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load the newsletter list: {error.message}
          </p>
        )}

        {!error && people.length === 0 && (
          <p className="text-sm text-[#808897]">No one has opted in yet.</p>
        )}

        {people.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-[#A0ADC0]/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#29394D]/5 text-xs font-semibold uppercase tracking-wide text-[#808897]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Since</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id} className="border-t border-[#A0ADC0]/30">
                    <td className="px-4 py-3">
                      <Link href={`/admin/people/${person.id}`} className="font-medium text-[#29394D] hover:underline">
                        {person.name ?? 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#333132]">{person.email}</td>
                    <td className="px-4 py-3 text-[#333132]">{person.company ?? '—'}</td>
                    <td className="px-4 py-3 text-[#808897]">
                      {new Date(person.created_at).toLocaleDateString('en-AU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
