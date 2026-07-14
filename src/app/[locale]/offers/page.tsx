import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Tag, ChevronRight, MapPin } from 'lucide-react'
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

 const { data: places, error } = await supabase
    .from('places')
    .select('*')
    .eq('has_offers', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[offers] Supabase error:', error.message)
  }
  const isRtl = locale === 'ar'

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('exclusiveOffers')} locale={locale} backHref={`/${locale}`} />

      <main className="max-w-container-max-width mx-auto px-gutter-mobile md:px-margin-desktop mt-8 mb-12" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Hero Banner */}
        <section className="relative rounded-xl overflow-hidden mb-section-gap h-64 md:h-96 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLv_G6PVOMi9usPbE7bcsxGa6GZG53IwBiZ-dtcjS_aXI2UGVDV4mBdx651WIQL3zLZA7eRhgBiS2g0TyTngmUAsoZ5og1OxCmTrSVYYtGgesnf7J2A-UVarjwCfDBzmpXuMRBForGPkjELp2D_4vbIxnpNv7tjd8axOpCNnjTULnP19p3BIvHSMwEnPO9Exp8r9RiJrZLkss01QuKDF2NtwsUpEruYS5XCRPYYTHWhoiYBKcBT7pZVvaE2-izfVTbfVyjugP4tfBs')" }}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${isRtl ? 'from-transparent to-black/80' : 'from-black/80 to-transparent'}`}></div>
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
            <span className="font-label-md text-label-md text-primary-fixed mb-4 tracking-widest uppercase">
              {isRtl ? 'عروض حصرية' : 'Exclusive Deals'}
            </span>
            <h1 className="font-display text-headline-lg-mobile md:text-display text-white mb-4 max-w-lg">
              {isRtl ? 'اكتشف مطروح بتكلفة أقل' : 'Discover Matrouh For Less'}
            </h1>
            <p className="font-body-sm md:text-body-lg text-white/90 max-w-md mb-8">
              {isRtl 
                ? 'استمتع بتجارب مميزة مع باقتنا المختارة من العروض الموسمية.' 
                : 'Unlock premium experiences with our curated selection of seasonal offers.'}
            </p>
          </div>
        </section>

        {/* Filters (Scrollable Pills) */}
        <section className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 w-max">
            <button className="px-6 py-2 rounded-full font-label-md text-label-md bg-primary-container text-on-primary transition-all shadow-[0px_4px_10px_rgba(0,0,0,0.1)]">
              {isRtl ? 'كل العروض' : 'All Offers'}
            </button>
            <button className="px-6 py-2 rounded-full font-label-md text-label-md bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all">
              {isRtl ? 'فنادق' : 'Hotels'}
            </button>
            <button className="px-6 py-2 rounded-full font-label-md text-label-md bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all">
              {isRtl ? 'مطاعم' : 'Dining'}
            </button>
            <button className="px-6 py-2 rounded-full font-label-md text-label-md bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all">
              {isRtl ? 'أنشطة' : 'Activities'}
            </button>
            <button className="px-6 py-2 rounded-full font-label-md text-label-md bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all">
              {isRtl ? 'مواصلات' : 'Transport'}
            </button>
          </div>
        </section>

        {/* Offers Grid */}
        {places?.length ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => {
              const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
              const desc = locale === 'ar' && place.description_ar ? place.description_ar : place.description
              
              return (
                <Link key={place.id} href={`/${locale}/place/${place.id}`} className="block group">
                  <article className="bg-white/60 backdrop-blur-md rounded-xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-white/40 h-full flex flex-col hover:shadow-[0px_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {place.image_url ? (
                        <Image 
                          src={place.image_url} 
                          alt={name} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-105" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary transition-transform duration-500 group-hover:scale-105" />
                      )}
                      
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 shadow-sm flex items-center gap-1.5">
                        <Tag size={14} className="text-error" />
                        <span className="font-label-md text-label-md text-error font-bold">{t('specialOffer')}</span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 line-clamp-1">{name}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">
                        {desc || place.address || ''}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/30">
                        <div className="flex flex-col max-w-[50%]">
                          {place.address && (
                            <span className="font-label-md text-[10px] text-tertiary uppercase tracking-wider flex items-center gap-1 truncate">
                              <MapPin size={12} className="shrink-0" />
                              <span className="truncate">{place.address}</span>
                            </span>
                          )}
                        </div>
                        <button className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm flex items-center gap-1 shrink-0">
                          {t('browseOffer')}
                          <ChevronRight size={16} className={isRtl ? 'rotate-180' : ''} />
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </section>
        ) : (
          <EmptyState icon="🎁" title={locale === 'ar' ? 'لا توجد عروض متاحة حالياً' : 'No offers available right now'} />
        )}
      </main>
    </>
  )
}