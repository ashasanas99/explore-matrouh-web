'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, User, LogOut, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'

interface DesktopNavProps {
  locale: string
}

const navLinks = [
  { hrefEn: '/en', hrefAr: '/ar', labelEn: 'Home', labelAr: 'الرئيسية' },
  { hrefEn: '/en/all-categories', hrefAr: '/ar/all-categories', labelEn: 'Categories', labelAr: 'الفئات' },
  { hrefEn: '/en/offers', hrefAr: '/ar/offers', labelEn: 'Offers', labelAr: 'العروض' },
  { hrefEn: '/en/news', hrefAr: '/ar/news', labelEn: 'News', labelAr: 'الأخبار' },
]

export default function DesktopNav({ locale }: DesktopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push(`/${locale}`)
    router.refresh()
  }

  function isActive(href: string): boolean {
    if (href === `/${locale}` || href === `/${locale === 'ar' ? 'ar' : 'en'}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`
    }
    return pathname.startsWith(href)
  }

  const otherLocale = locale === 'en' ? 'ar' : 'en'
  const otherLocalePath = pathname.replace(`/${locale}`, `/${otherLocale}`)

  return (
    <header className="hidden md:block bg-white border-b border-border sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.05)]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 flex items-center h-16 gap-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-bold text-lg text-foreground font-sans">
            {locale === 'ar' ? 'استكشف مطروح' : 'Explore Matrouh'}
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {navLinks.map((link) => {
            const href = locale === 'ar' ? link.hrefAr : link.hrefEn
            const label = locale === 'ar' ? link.labelAr : link.labelEn
            const active = isActive(href)
            return (
              <Link
                key={link.labelEn}
                href={href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold font-sans transition-colors',
                  active
                    ? 'text-primary bg-primary-lighter'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <Link
            href={`/${locale}/search`}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Search"
          >
            <Search size={20} className="text-muted-foreground" />
          </Link>

          {/* Lang toggle */}
          <Link
            href={otherLocalePath}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-muted transition-colors font-sans"
          >
            {locale === 'ar' ? 'EN' : 'ع'}
          </Link>

          {/* User menu */}
          {userEmail ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <User size={14} className="text-white" />
                  )}
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className={cn(
                    'absolute top-full mt-1 w-48 bg-white rounded-xl border border-border shadow-lg z-20 py-1',
                    isRtl ? 'left-0' : 'right-0'
                  )}>
                    <Link href={`/${locale}/profile`} onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors font-sans">
                      {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
                    </Link>
                    <Link href={`/${locale}/favorites`} onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors font-sans">
                      {locale === 'ar' ? 'المفضلة' : 'Favorites'}
                    </Link>
                    {profile?.is_admin && (
                      <Link href={`/${locale}/admin`} onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors font-sans">
                        {locale === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
                      </Link>
                    )}
                    <hr className="my-1 border-border" />
                    <button onClick={handleLogout}
                      className="w-full text-start px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive-light transition-colors font-sans">
                      {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href={`/${locale}/sign-in`}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold font-sans transition-opacity active:opacity-80 hover:opacity-90"
            >
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
