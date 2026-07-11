import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import AdminSettingsForm from './AdminSettingsForm'

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/sign-in`)
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) redirect(`/${locale}`)

  const { data: settings } = await supabase.from('app_settings').select('*').maybeSingle()

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('socialLinks')} locale={locale} backHref={`/${locale}/admin`} />
      <AdminSettingsForm locale={locale} settings={settings} />
    </>
  )
}
