import type { Metadata } from 'next'
import Link from 'next/link'
import { Lock, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import EmptyState from '@/components/shared/EmptyState'
import FavoritesGrid from './FavoritesGrid'

export const metadata: Metadata = {
  title: 'Favorites',
  robots: { index: false },
}

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const isRtl = locale === 'ar'
    return (
      <>
        <DesktopNav locale={locale} />
        <TopAppBar title={t('favorites')} locale={locale} backHref={`/${locale}`} />
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold font-sans text-foreground mb-2">{t('loginRequired')}</h2>
          <p className="text-sm text-muted-foreground font-sans mb-6">{t('loginToFavorites')}</p>
          <Link href={`/${locale}/sign-in`} className="px-8 py-3.5 rounded-xl bg-primary text-white font-bold font-sans text-sm">
            {t('logIn')}
          </Link>
        </div>
      </>
    )
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, places(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('favorites')} locale={locale} backHref={`/${locale}/profile`} />
      <FavoritesGrid
        favorites={favorites || []}
        locale={locale}
        t={{ noFavorites: t('noFavorites'), noFavoritesSub: t('noFavoritesSub') }}
      />
    </>
  )
}
