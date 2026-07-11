'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton({ locale, label }: { locale: string; label: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold font-sans text-sm transition-opacity active:opacity-80"
    >
      <LogOut size={18} />
      {label}
    </button>
  )
}
