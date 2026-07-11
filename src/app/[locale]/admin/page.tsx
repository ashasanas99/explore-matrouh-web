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
      <main className="px-4 py-6 max-w-lg mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {cards.map(({ icon: Icon, title, desc, href, color }) => (
          <Link key={title} href={href} className="block bg-white rounded-2xl p-5 card-shadow border border-border/30 hover:bg-primary-lightest transition-colors group">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold font-sans text-foreground text-base mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground font-sans">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </main>
    </>
  )
}
