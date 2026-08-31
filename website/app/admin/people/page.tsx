// app/admin/people/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = {
  title: 'People — Admin',
}

export const dynamic = 'force-dynamic'

type Person = {
  id: string
  name: string | null
  email: string
  phone: string | null
  company: string | null
  ok_to_contact: boolean
  attributes: Record<string, string> | null
  created_at: string
}

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q || '').trim()
  // The PostgREST .or() filter string treats "," and "()" as syntax —
  // strip them so a search term can't be read as extra filter clauses.
  const safeQuery = query.replace(/[,()]/g, '')

  const supabase = createAdminClient()
  let request = supabase
    .from('people')
    .select('id, name, email, phone, company, ok_to_contact, attributes, created_at')
    .order('created_at', { ascending: false })

  if (safeQuery) {
    request = request.or(
      `name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,company.ilike.%${safeQuery}%`
    )
  }

  const { data, error } = await request
  const people = (data ?? []) as Person[]

  return (
    <div className="flex flex-1 flex-col bg-white font-sans">
      <header className="border-b-4 border-[#6EC9C0] bg-[#333132] px-6 py-10 sm:px-16">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EC9C0]">Admin</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">People</h1>
        <p className="mt-1 text-sm text-[#A0ADC0]">{people.length} shown.</p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-16">
        <form method="get" className="mb-6 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name, email, or company…"
            className="w-full max-w-sm rounded-md border border-[#A0ADC0] px-3 py-2 text-sm text-[#333132] focus:outline-none focus:ring-2 focus:ring-[#485F88]"
          />
          <button
            type="submit"
            className="rounded-md bg-[#29394D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#485F88]"
          >
            Search
          </button>
          {query && (
            <Link
              href="/admin/people"
              className="flex items-center px-3 text-sm text-[#808897] hover:underline"
            >
              Clear
            </Link>
          )}
        </form>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load people: {error.message}
          </p>
        )}

        {!error && people.length === 0 && (
          <p className="text-sm text-[#808897]">
            {query ? `No matches for "${query}".` : 'No people yet.'}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {people.map((person) => (
            <div key={person.id} className="rounded-lg border border-[#A0ADC0]/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-base font-semibold text-[#29394D]">
                  <Link href={`/admin/people/${person.id}`} className="hover:underline">
                    {person.name ?? 'Unknown'}
                  </Link>{' '}
                  <span className="font-normal text-[#808897]">— {person.email}</span>
                </p>
                {person.ok_to_contact && (
                  <span className="rounded-full bg-[#6EC9C0]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#29394D]">
                    Newsletter
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#808897]">
                {person.phone && <span>Phone: {person.phone}</span>}
                {person.company && <span>Company: {person.company}</span>}
                {person.attributes?.last_consulting_engagement_date && (
                  <span>
                    Last consulting engagement: {person.attributes.last_consulting_engagement_date}
                  </span>
                )}
                <span>Since: {new Date(person.created_at).toLocaleDateString('en-AU')}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
