import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'ar'] as const

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  if (!locales.includes(locale as 'en' | 'ar')) notFound()

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
