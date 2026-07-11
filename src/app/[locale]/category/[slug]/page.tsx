import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import PlaceCard from '@/components/shared/PlaceCard'
import EmptyState from '@/components/shared/EmptyState'

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

      <main className="px-4 py-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {places?.length ? (
          <>
            <p className="text-sm text-muted-foreground font-sans mb-4">
              {places.length} {places.length === 1 ? t('placeFound') : t('placesFound')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} locale={locale} variant="grid" />
              ))}
            </div>
          </>
        ) : (
          <EmptyState icon="🏙️" title={t('noPlacesYet')} subtitle={t('noPlacesYetSub')} />
        )}
      </main>
    </>
  )
}
