import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/guards'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex items-center justify-between border-b border-[#A0ADC0]/40 bg-[#333132] px-6 py-3 sm:px-16">
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EC9C0]">Admin</span>
          <Link href="/admin" className="text-sm font-medium text-white hover:text-[#6EC9C0]">Leads</Link>
          <Link href="/admin/people" className="text-sm font-medium text-white hover:text-[#6EC9C0]">People</Link>
        </div>
        <LogoutButton />
      </nav>
      {children}
    </div>
  )
}
