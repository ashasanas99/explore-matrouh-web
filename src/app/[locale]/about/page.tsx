import type { Metadata } from 'next'
import Link from 'next/link'
import { Info, ExternalLink } from 'lucide-react'
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

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* About section */}
        <div className="bg-white rounded-2xl p-5 card-shadow border border-border/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-lighter flex items-center justify-center">
              <Info size={20} className="text-primary" />
            </div>
            <h2 className="font-bold font-sans text-foreground text-base">{t('about_title')}</h2>
          </div>
          <p className="text-sm text-foreground/80 font-sans leading-relaxed mb-3">{t('about_p1')}</p>
          <p className="text-sm text-foreground/80 font-sans leading-relaxed">{t('about_p2')}</p>
        </div>

        {/* Connect section */}
        <div className="bg-white rounded-2xl p-5 card-shadow border border-border/30">
          <h2 className="font-bold font-sans text-foreground text-base mb-1">{t('connect_title')}</h2>
          <p className="text-xs text-muted-foreground font-sans mb-4">{t('connect_desc')}</p>

          <div className="divide-y divide-border">
            {contactLinks.map(({ key, icon, prefix, labelEn, labelAr }) => {
              const value = settings?.[key as keyof AppSettings] as string | null
              const label = locale === 'ar' ? labelAr : labelEn
              const href = value ? (prefix + value) : null

              return (
                <div key={key} className="flex items-center gap-3 py-3">
                  <span className="text-xl w-8 text-center">{icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold font-sans">{label}</p>
                    {value ? (
                      <p className="text-xs text-muted-foreground font-sans truncate">{value}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 font-sans">{t('linkNotAvailable')}</p>
                    )}
                  </div>
                  {href && (
                    <Link href={href} target={key !== 'email' ? '_blank' : undefined} rel="noopener noreferrer" className="p-2 rounded-full hover:bg-muted transition-colors">
                      <ExternalLink size={14} className="text-primary" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
