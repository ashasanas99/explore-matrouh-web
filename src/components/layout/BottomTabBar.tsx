'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, Gift, Newspaper, Menu } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import GlobalDrawer from './GlobalDrawer'

interface BottomTabBarProps {
  locale: string
}

const tabs = [
  { id: 'home', icon: Home, href: '', labelEn: 'Home', labelAr: 'الرئيسية' },
  { id: 'categories', icon: Grid, href: '/all-categories', labelEn: 'Categories', labelAr: 'الفئات' },
  { id: 'offers', icon: Gift, href: '/offers', labelEn: 'Offers', labelAr: 'العروض' },
  { id: 'news', icon: Newspaper, href: '/news', labelEn: 'News', labelAr: 'الأخبار' },
  { id: 'menu', icon: Menu, href: null, labelEn: 'Menu', labelAr: 'القائمة' },
]

export default function BottomTabBar({ locale }: BottomTabBarProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function isActive(href: string | null): boolean {
    if (!href) return false
    const full = `/${locale}${href}`
    if (href === '') return pathname === `/${locale}` || pathname === `/${locale}/`
    return pathname.startsWith(full)
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch h-[70px] pb-safe">
          {tabs.map((tab) => {
            const active = isActive(tab.href)
            const label = locale === 'ar' ? tab.labelAr : tab.labelEn
            const Icon = tab.icon

            if (tab.href === null) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setDrawerOpen(true)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 text-[#9CA3AF] transition-colors active:opacity-70"
                >
                  <Icon size={22} />
                  <span className="text-[10px] font-semibold font-sans">{label}</span>
                </button>
              )
            }

            return (
              <Link
                key={tab.id}
                href={`/${locale}${tab.href}`}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:opacity-70',
                  active ? 'text-primary' : 'text-[#9CA3AF]'
                )}
              >
                <Icon size={22} />
                <span className="text-[10px] font-semibold font-sans">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <GlobalDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} locale={locale} />
    </>
  )
}
