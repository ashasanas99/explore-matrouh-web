'use client'

import Link from 'next/link'
import { Search, CloudSun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getTimeGreeting } from '@/lib/utils'

interface HomeHeroProps {
  locale: string
  t: { appName: string }
}

export default function HomeHero({ locale, t }: HomeHeroProps) {
  const [time, setTime] = useState('')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      setTime(now.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }))
      setGreeting(getTimeGreeting(locale))
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [locale])

  return (
    <div
      className="bg-gradient-to-br from-primary to-emerald-700 text-white px-4 pt-12 pb-6"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/${locale}/weather`}
          className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 hover:bg-white/30 transition-colors"
        >
          <CloudSun size={16} />
          <span className="text-xs font-semibold font-sans">
            {locale === 'ar' ? 'الطقس' : 'Weather'}
          </span>
        </Link>

        <Link
          href={`/${locale}/search`}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </Link>
      </div>

      {/* Greeting */}
      <div className="text-center">
        <p className="text-white/80 text-xs font-semibold font-sans">{greeting}</p>
        <h1 className="text-2xl font-bold font-sans mt-1">{t.appName}</h1>
        {time && (
          <p className="text-white/70 text-sm font-sans mt-1">{time}</p>
        )}
        <p className="text-white/60 text-xs font-sans mt-1">
          {locale === 'ar' ? 'مرسى مطروح، مصر' : 'Marsa Matrouh, Egypt'}
        </p>
      </div>
    </div>
  )
}
