import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Tag, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import EmptyState from '@/components/shared/EmptyState'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'ar' ? 'عروض حصرية' : 'Exclusive Offers',
    description: locale === 'ar' ? 'أفضل العروض والخصومات في مطروح' : 'Best deals and offers in Matrouh',
  }
}

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const { data: places } = await supabase
    .from('places')
    .select('*')
    .eq('has_offers', true)
    .order('created_at', { ascending: false })

  const isRtl = locale === 'ar'

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('exclusiveOffers')} locale={locale} backHref={`/${locale}`} />

      <main className="px-4 py-4 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {places?.length ? places.map((place) => {
          const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
          return (
            <Link key={place.id} href={`/${locale}/place/${place.id}`}>
              <div className="relative rounded-3xl overflow-hidden card-shadow border border-border/30">
                {/* Image */}
                <div className="relative h-[200px] w-full bg-muted">
                  {place.image_url ? (
                    <Image src={place.image_url} alt={name} fill className="object-cover" sizes="100vw" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Special Offer badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-warning text-white rounded-full px-3 py-1.5">
                    <Tag size={12} />
                    <span className="text-xs font-bold font-sans">{t('specialOffer')}</span>
                  </div>

                  {/* Place name overlay */}
                  <div className="absolute bottom-12 left-4 right-4">
                    <h3 className="text-white font-bold font-sans text-lg text-shadow-strong leading-tight line-clamp-2">{name}</h3>
                    {place.address && (
                      <p className="text-white/70 text-xs font-sans mt-0.5 line-clamp-1">{place.address}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-primary flex items-center justify-between px-4 py-3">
                  <span className="text-white text-sm font-bold font-sans">{t('browseOffer')}</span>
                  <ChevronRight size={16} className={`text-white ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </Link>
          )
        }) : (
          <EmptyState icon="🎁" title={locale === 'ar' ? 'لا توجد عروض متاحة حالياً' : 'No offers available right now'} />
        )}
      </main>
    </>
  )
}
