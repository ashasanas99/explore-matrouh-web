'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, Heart, Search, CloudSun, Info, Shield,
  LogIn, LogOut, ChevronRight, X, LayoutDashboard
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'

interface GlobalDrawerProps {
  open: boolean
  onClose: () => void
  locale: string
}

interface DrawerItem {
  icon: React.ElementType
  labelEn: string
  labelAr: string
  href?: string
  onClick?: () => void
  adminOnly?: boolean
  authOnly?: boolean
  guestOnly?: boolean
  danger?: boolean
}

export default function GlobalDrawer({ open, onClose, locale }: GlobalDrawerProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const isRtl = locale === 'ar'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? null)
        supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
          .then(({ data: p }) => setProfile(p))
      }
    })
  }, [open])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    onClose()
    router.push(`/${locale}`)
    router.refresh()
  }

  const items: DrawerItem[] = [
    { icon: User, labelEn: 'Profile', labelAr: 'الملف الشخصي', href: `/${locale}/profile`, authOnly: true },
    { icon: Heart, labelEn: 'Favorites', labelAr: 'المفضلة', href: `/${locale}/favorites`, authOnly: true },
    { icon: Search, labelEn: 'Search', labelAr: 'بحث', href: `/${locale}/search` },
    { icon: CloudSun, labelEn: 'Weather', labelAr: 'الطقس', href: `/${locale}/weather` },
    { icon: Info, labelEn: 'About & Contact', labelAr: 'عن التطبيق', href: `/${locale}/about` },
    { icon: Shield, labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية', href: `/${locale}/privacy-policy` },
    { icon: LayoutDashboard, labelEn: 'Admin Dashboard', labelAr: 'لوحة التحكم', href: `/${locale}/admin`, adminOnly: true },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 bottom-0 z-50 w-[300px] bg-white flex flex-col shadow-2xl transition-transform duration-300',
          isRtl ? 'right-0' : 'left-0',
          open
            ? 'translate-x-0'
            : isRtl ? 'translate-x-full' : '-translate-x-full'
        )}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <span className="text-lg font-bold text-foreground font-sans">
            {locale === 'ar' ? 'استكشف مطروح' : 'Explore Matrouh'}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        {userEmail && (
          <div className="px-5 py-4 bg-primary-lighter border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {profile?.full_name || userEmail}
                </p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {items.map((item) => {
            if (item.adminOnly && !profile?.is_admin) return null
            if (item.authOnly && !userEmail) return null

            const Icon = item.icon
            const label = locale === 'ar' ? item.labelAr : item.labelEn

            return (
              <Link
                key={item.labelEn}
                href={item.href!}
                onClick={onClose}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-primary-lighter flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <span className="flex-1 font-semibold text-sm text-foreground font-sans">{label}</span>
                <ChevronRight size={16} className={cn('text-muted-foreground', isRtl && 'rotate-180')} />
              </Link>
            )
          })}
        </nav>

        {/* Auth action */}
        <div className="p-4 border-t border-border">
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive-light text-destructive font-semibold font-sans text-sm transition-opacity active:opacity-80"
            >
              <LogOut size={18} />
              {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          ) : (
            <Link
              href={`/${locale}/sign-in`}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold font-sans text-sm transition-opacity active:opacity-80"
            >
              <LogIn size={18} />
              {locale === 'ar' ? 'تسجيل الدخول' : 'Log In'}
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
