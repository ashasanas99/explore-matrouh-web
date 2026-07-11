import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, User, Heart, Lock as LockIcon, Shield, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import LogoutButton from './LogoutButton'

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false },
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const isRtl = locale === 'ar'
    return (
      <>
        <DesktopNav locale={locale} />
        <TopAppBar title={t('profile')} locale={locale} backHref={`/${locale}`} />
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold font-sans text-foreground mb-2">{t('loginRequired')}</h2>
          <p className="text-sm text-muted-foreground font-sans mb-6 max-w-xs">{t('loginRequiredMsg')}</p>
          <Link
            href={`/${locale}/sign-in`}
            className="px-8 py-3.5 rounded-xl bg-primary text-white font-bold font-sans text-sm transition-opacity active:opacity-80"
          >
            {t('logIn')}
          </Link>
        </div>
      </>
    )
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  const isRtl = locale === 'ar'

  const settingRows = [
    { icon: User, labelKey: 'editProfile', href: `/${locale}/profile/edit` },
    { icon: Heart, labelKey: 'myFavorites', href: `/${locale}/favorites` },
    { icon: LockIcon, labelKey: 'changePassword', href: `/${locale}/profile/change-password` },
    ...(profile?.is_admin ? [{ icon: Shield, labelKey: 'adminDashboard', href: `/${locale}/admin` }] : []),
  ] as const

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('profile')} locale={locale} backHref={`/${locale}`} />

      <main className="px-4 py-6 max-w-lg mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Avatar + info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-muted overflow-hidden mb-3 ring-4 ring-primary/20">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name || ''} width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary">
                <User size={32} className="text-white" />
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold font-sans text-foreground">{profile?.full_name || user.email}</h2>
          <p className="text-sm text-muted-foreground font-sans">{user.email}</p>
        </div>

        {/* Settings rows */}
        <div className="bg-white rounded-2xl card-shadow border border-border/30 divide-y divide-border overflow-hidden mb-4">
          {settingRows.map(({ icon: Icon, labelKey, href }) => (
            <Link key={labelKey} href={href} className="flex items-center gap-4 px-4 py-4 hover:bg-muted transition-colors group">
              <div className="w-10 h-10 rounded-full bg-primary-lighter flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <span className="flex-1 font-semibold text-sm text-foreground font-sans">{t(labelKey)}</span>
              <ChevronRight size={16} className={`text-muted-foreground ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          ))}
        </div>

        <LogoutButton locale={locale} label={t('logout')} />
      </main>
    </>
  )
}
