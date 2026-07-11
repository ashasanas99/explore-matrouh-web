import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import ChangePasswordForm from './ChangePasswordForm'

export default async function ChangePasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/sign-in`)

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('changePassword')} locale={locale} backHref={`/${locale}/profile`} />
      <ChangePasswordForm locale={locale} />
    </>
  )
}
