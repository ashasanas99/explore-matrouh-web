import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import EmptyState from '@/components/shared/EmptyState'
import { ChevronDown, Heart, Star, MapPin, ArrowRight } from 'lucide-react'

export const revalidate = 3600

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const supabase = await createClient()
  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .maybeSingle()

  const name = cat ? (locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name) : slug

  return {
    title: name,
    description: `${locale === 'ar' ? 'تصفح أفضل' : 'Browse the best'} ${name} ${locale === 'ar' ? 'في مطروح' : 'in Matrouh'}`,
    alternates: {
      canonical: `/${locale}/category/${slug}`,
      languages: { en: `/en/category/${slug}`, ar: `/ar/category/${slug}` },
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .maybeSingle()

  if (!cat) notFound()

  const { data: places } = await supabase
    .from('places')
    .select('*')
    .eq('category_id', cat.id)
    .order('created_at', { ascending: false })

  const catName = locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name
  const isRtl = locale === 'ar'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: catName,
    itemListElement: (places || []).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: locale === 'ar' && p.name_ar ? p.name_ar : p.name,
      url: `/place/${p.id}`,
    })),
  }

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={catName} locale={locale} backHref={`/${locale}/all-categories`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="flex-grow pt-8 md:pt-12 pb-24 md:pb-32 px-gutter-mobile md:px-gutter-desktop max-w-container-max-width mx-auto w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Category Header & Filter */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-display font-display text-on-surface mb-2">{catName}</h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant">
                {places?.length || 0} {places?.length === 1 ? t('placeFound') : t('placesFound')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2 text-label-md font-label-md text-on-surface hover:border-primary transition-colors">
                {locale === 'ar' ? 'ترتيب حسب التقييم' : 'Sort by Rating'}
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2 text-label-md font-label-md text-on-surface hover:border-primary transition-colors">
                {locale === 'ar' ? 'المسافة' : 'Distance'}
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2 text-label-md font-label-md text-on-surface hover:border-primary transition-colors">
                {locale === 'ar' ? 'نطاق السعر' : 'Price Range'}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        {places?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {places.map((place) => {
              const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
              return (
                <div key={place.id} className="bg-surface-container-lowest rounded-[16px] shadow-[0px_10px_30px_rgba(0,0,0,0.04)] overflow-hidden group hover:shadow-[0px_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative">
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    {place.image_url ? (
                      <Image 
                        src={place.image_url} 
                        alt={name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary-light flex items-center justify-center">
                        <span className="text-primary text-4xl">📍</span>
                      </div>
                    )}
                    <button aria-label="Add to favorites" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-primary hover:text-error transition-colors z-10">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-headline-sm font-headline-sm text-on-surface truncate pr-2">{name}</h3>
                      {place.rating > 0 && (
                        <div className="flex items-center gap-1 text-primary shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-label-md font-label-md">{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {place.address && (
                      <div className="flex items-center gap-1 text-on-surface-variant text-body-sm font-body-sm mb-3">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{place.address}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-body-sm font-body-sm font-semibold text-primary">{place.price_level || ''}</span>
                      <Link href={`/${locale}/place/${place.id}`} className="text-label-md font-label-md text-primary hover:underline flex items-center gap-1">
                        {locale === 'ar' ? 'التفاصيل' : 'Details'} 
                        <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState icon="🏙️" title={t('noPlacesYet')} subtitle={t('noPlacesYetSub')} />
        )}
      </main>
    </>
  )
}