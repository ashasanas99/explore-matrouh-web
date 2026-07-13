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

      <main className="flex-grow max-w-[container-max-width] mx-auto w-full px-margin-mobile md:px-margin-desktop py-12" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] p-8 md:p-12">
          <header className="mb-12 text-center md:text-start">
            <h1 className="font-display text-display text-primary mb-4 flex items-center justify-center md:justify-start gap-3">
              <Shield className="text-primary w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
              {t('privacyPolicy')}
            </h1>
          </header>

          <div className="space-y-6">
            {paragraphs.map((para, i) => (
              <p key={i} className="font-body-md text-body-md text-on-surface-variant">
                {para}
              </p>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}