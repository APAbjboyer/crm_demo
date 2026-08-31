// components/auth/LogoutButton.tsx
'use client'
import { logout } from '@/lib/auth/actions'

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="rounded px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
    >
      Sign out
    </button>
  )
}
