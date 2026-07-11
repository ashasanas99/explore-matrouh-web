import type { Metadata } from 'next'
import { Shield } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy', robots: { index: false } }
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const isRtl = locale === 'ar'

  const paragraphs = t('privacy_text').split('\n\n').filter(Boolean)

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('privacyPolicy')} locale={locale} backHref={`/${locale}`} />

      <main className="px-4 py-6 max-w-lg mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl p-5 card-shadow border border-border/30">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-primary-lighter flex items-center justify-center">
              <Shield size={20} className="text-primary" />
            </div>
            <h1 className="font-bold font-sans text-foreground text-base">{t('privacyPolicy')}</h1>
          </div>

          <div className="space-y-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-sm text-foreground/80 font-sans leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
