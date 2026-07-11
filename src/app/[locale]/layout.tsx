import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Montserrat } from 'next/font/google'
import { Toaster } from 'sonner'
import BottomTabBar from '@/components/layout/BottomTabBar'
// globals.css imported in root layout

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const locales = ['en', 'ar'] as const
type Locale = (typeof locales)[number]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: '' })

  return {
    title: {
      default: t('appName'),
      template: `%s | ${t('appName')}`,
    },
    description: t('tagline'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ar: '/ar',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} className={montserrat.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="relative min-h-screen pb-[80px] md:pb-0">
            {children}
          </div>
          <BottomTabBar locale={locale} />
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
