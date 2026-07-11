import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import EditProfileForm from './EditProfileForm'

export default async function EditProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/sign-in`)

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('editProfile')} locale={locale} backHref={`/${locale}/profile`} />
      <EditProfileForm
        locale={locale}
        initialName={profile?.full_name || ''}
        email={user.email || ''}
        avatarUrl={profile?.avatar_url || null}
        userId={user.id}
      />
    </>
  )
}
