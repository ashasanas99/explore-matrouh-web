import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import PlaceForm from '../../PlaceForm'

export default async function EditPlacePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/sign-in`)
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) redirect(`/${locale}`)

  const [{ data: place }, { data: categories }] = await Promise.all([
    supabase.from('places').select('*').eq('id', id).maybeSingle(),
    supabase.from('categories').select('*').order('sort_order'),
  ])

  if (!place) notFound()

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('editPlace')} locale={locale} backHref={`/${locale}/place/${id}`} />
      <PlaceForm locale={locale} categories={categories || []} place={place} isEdit />
    </>
  )
}
