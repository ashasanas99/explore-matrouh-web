import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import DesktopNav from '@/components/layout/DesktopNav'
import HomeHero from './HomeHero'
import FeaturedCarousel from './FeaturedCarousel'
import CategorySection from './CategorySection'
import OnboardingModal from './OnboardingModal'
import type { Place, Category } from '@/types'

export const revalidate = 3600

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const [featuredRes, categoriesRes] = await Promise.all([
    supabase.from('places').select('*').eq('is_featured', true).order('created_at', { ascending: false }).limit(10),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
  ])

  const featured: Place[] = featuredRes.data || []
  const categories: Category[] = categoriesRes.data || []

  const mainCategories = categories.filter((c) =>
    ['beaches', 'hotels', 'cafes', 'restaurants', 'markets', 'entertainment'].includes(c.slug || '')
  )
  const serviceCategories = categories.filter((c) =>
    ['hospitals', 'clinics', 'pharmacies', 'banks', 'atms', 'car-maintenance', 'emergencies', 'transportation', 'car-rental', 'supermarkets', 'bakeries', 'government-offices', 'gas-stations', 'electronics-repair'].includes(c.slug || '')
  )

  return (
    <>
      <DesktopNav locale={locale} />
      <main className="min-h-screen bg-background">
        <HomeHero locale={locale} t={{ appName: t('appName') }} />

        <div className="px-4 pb-4 space-y-6">
          {/* Featured Places */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold font-sans">⭐ {t('featuredPlaces')}</h2>
              </div>
              <Suspense fallback={<div className="h-40 bg-muted rounded-3xl animate-pulse" />}>
                <FeaturedCarousel places={featured} locale={locale} />
              </Suspense>
            </section>
          )}

          {/* Main Categories + Places */}
          <CategorySection
            categories={mainCategories}
            allCategories={categories}
            locale={locale}
            seeAllLabel={t('seeAll')}
            t={{
              noPlacesYet: t('noPlacesYet'),
              loadingPlaces: t('loadingPlaces'),
            }}
          />

          {/* Services Directory */}
          {serviceCategories.length > 0 && (
            <section>
              <h2 className="text-base font-bold font-sans mb-3">
                {locale === 'ar' ? 'دليل الخدمات' : 'Services Directory'}
              </h2>
              <CategorySection
                categories={serviceCategories}
                allCategories={categories}
                locale={locale}
                seeAllLabel={t('seeAll')}
                t={{
                  noPlacesYet: t('noPlacesYet'),
                  loadingPlaces: t('loadingPlaces'),
                }}
                compact
              />
            </section>
          )}
        </div>
      </main>

      <OnboardingModal locale={locale} />
    </>
  )
}
