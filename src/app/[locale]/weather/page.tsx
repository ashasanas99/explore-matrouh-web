import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import WeatherContent from './WeatherContent'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'ar' ? 'طقس مطروح' : 'Matrouh Weather' }
}

export default async function WeatherPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('weatherTitle')} locale={locale} backHref={`/${locale}`} />
      <WeatherContent locale={locale} />
    </>
  )
}
