import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, List, Settings } from 'lucide-react'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'

export const metadata = { title: 'Admin Dashboard', robots: { index: false } }

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect(`/${locale}/sign-in`)
  
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  
  if (!profile?.is_admin) redirect(`/${locale}`)

  const isRtl = locale === 'ar'
  const cards = [
    { icon: Plus, title: t('addNewPlace'), desc: locale === 'ar' ? 'أضف مكاناً جديداً للدليل' : 'Add a new place to the directory', href: `/${locale}/admin/places/new`, color: 'bg-primary' },
    { icon: List, title: t('manageExisting'), desc: locale === 'ar' ? 'تصفح وتعديل الأماكن الحالية' : 'Browse and edit existing places', href: `/${locale}/all-categories`, color: 'bg-primary' },
    { icon: Settings, title: t('manageSocialLinks'), desc: locale === 'ar' ? 'تحديث معلومات التواصل الاجتماعي' : 'Update social media information', href: `/${locale}/admin/settings`, color: 'bg-primary' },
  ]

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('adminDashboard')} locale={locale} backHref={`/${locale}/profile`} />
      
      <main className="flex-1 p-6 md:p-10 max-w-[1200px] mx-auto w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{t('adminDashboard')}</h1>
          <p className="text-on-surface-variant font-body-sm text-body-sm">
            {locale === 'ar' ? 'مرحباً بك مجدداً. إليك ما يمكنك إدارته اليوم.' : "Welcome back. Here is what you can manage today."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {cards.map(({ icon: Icon, title, desc, href }, index) => {
            const isPrimary = index === 2;

            if (isPrimary) {
              return (
                <Link key={title} href={href} className="block bg-primary text-on-primary rounded-2xl p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-primary-fixed/30 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent"></div>
                  <div className="absolute -bottom-8 -right-8 opacity-20">
                    <Icon className="w-32 h-32" />
                  </div>
                  <div className="relative z-10 flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-on-primary/20 flex items-center justify-center text-on-primary backdrop-blur-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-label-md text-label-md uppercase tracking-wider">{title}</h3>
                  </div>
                  <div className="relative z-10 flex items-end gap-3">
                    <span className="font-body-sm text-body-sm opacity-80">{desc}</span>
                  </div>
                </Link>
              )
            }

            return (
              <Link key={title} href={href} className="block bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon className="w-16 h-16 text-primary" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{title}</h3>
                </div>
                <div className="flex items-end gap-3">
                  <span className="font-body-sm text-body-sm text-on-surface">{desc}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}