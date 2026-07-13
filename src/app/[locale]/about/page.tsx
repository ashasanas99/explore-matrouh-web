import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import type { AppSettings } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'ar' ? 'عن التطبيق' : 'About & Contact' }
}

const contactLinks = [
  { key: 'whatsapp', icon: '💬', prefix: 'https://wa.me/', labelEn: 'WhatsApp', labelAr: 'واتساب' },
  { key: 'facebook', icon: '📘', prefix: '', labelEn: 'Facebook', labelAr: 'فيسبوك' },
  { key: 'instagram', icon: '📷', prefix: '', labelEn: 'Instagram', labelAr: 'إنستغرام' },
  { key: 'email', icon: '✉️', prefix: 'mailto:', labelEn: 'Email', labelAr: 'البريد الإلكتروني' },
  { key: 'website', icon: '🌐', prefix: '', labelEn: 'Website', labelAr: 'الموقع الإلكتروني' },
  { key: 'tiktok', icon: '🎵', prefix: '', labelEn: 'TikTok', labelAr: 'تيك توك' },
] as const

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()
  const { data: settings } = await supabase.from('app_settings').select('*').maybeSingle()
  const isRtl = locale === 'ar'

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('aboutContact')} locale={locale} backHref={`/${locale}`} />

      <main className="flex-grow w-full max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-section-gap" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="font-display text-display text-primary mb-4 hidden md:block">
            {t('aboutContact')}
          </h1>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-4 md:hidden">
            {t('aboutContact')}
          </h1>
        </div>

        {/* Hero Image Container */}
        <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-16 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <Image 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6NW2wbMpvdG9jztYGX1ywFmkOiEYoow-M1tg4g59n17unYGwKYhpBveEWGTy4OqGERunaYeY6Fzh9xa2J9wfOchd8xtj1MDwKcBGPuMKvhjbDlmaE7v2u_XL72irzpKj14o_yLbvj03eQ6C3xMiE2e7K-qqNzNd4aAeKHK3jf1nDuBOJWYxhkL36IdInjbDl72jXzHnIS9cEZqHR3LpkFDkuojIVgfRkyre3ji9tjaIvsSZP_k5V7nG-TrXg4FrTDmyZE_AMfcd5l" 
            alt={t('aboutContact')}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Content Paper */}
        <article className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] p-8 md:p-12 mx-auto max-w-4xl">
          
          {/* About Section */}
          <section className="mb-12">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">
              {t('about_title')}
            </h2>
            <p className="font-body-md text-body-md text-on-surface mb-4 leading-relaxed">
              {t('about_p1')}
            </p>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed">
              {t('about_p2')}
            </p>
          </section>

          {/* Connect Section */}
          <section>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">
              {t('connect_title')}
            </h2>
            <p className="font-body-md text-body-md text-on-surface mb-8">
              {t('connect_desc')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contactLinks.map(({ key, icon, prefix, labelEn, labelAr }) => {
                const value = settings?.[key as keyof AppSettings] as string | null
                const label = locale === 'ar' ? labelAr : labelEn
                const href = value ? (prefix + value) : null

                return (
                  <div 
                    key={key} 
                    className={`bg-surface-container-low p-6 rounded-lg ${isRtl ? 'border-r-4' : 'border-l-4'} border-primary flex items-center justify-between`}
                  >
                    <div className={`flex-1 overflow-hidden ${isRtl ? 'pl-4' : 'pr-4'}`}>
                      <h3 className="font-headline-sm text-headline-sm text-on-primary-container mb-3 flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        {label}
                      </h3>
                      {value ? (
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate" dir="ltr">
                          {value}
                        </p>
                      ) : (
                        <p className="font-body-sm text-body-sm text-on-surface-variant opacity-70">
                          {t('linkNotAvailable')}
                        </p>
                      )}
                    </div>
                    
                    {href && (
                      <Link 
                        href={href} 
                        target={key !== 'email' ? '_blank' : undefined} 
                        rel="noopener noreferrer" 
                        className="p-3 rounded-full bg-surface hover:bg-primary/10 transition-colors flex-shrink-0"
                      >
                        <ExternalLink size={20} className="text-primary" />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

        </article>
      </main>
    </>
  )
}