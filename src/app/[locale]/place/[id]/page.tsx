import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import PlaceHero from './PlaceHero'
import PlaceInfo from './PlaceInfo'
import PlaceActions from './PlaceActions'
import PlaceAbout from './PlaceAbout'
import PlaceLocation from './PlaceLocation'
import PlaceReviews from './PlaceReviews'

export const revalidate = 3600

interface PlacePageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: place } = await supabase.from('places').select('*').eq('id', id).maybeSingle()
  if (!place) return { title: 'Place Not Found' }

  const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
  const desc = locale === 'ar' && place.description_ar ? place.description_ar : place.description

  return {
    title: name,
    description: desc || `${name} — Explore Matrouh`,
    openGraph: {
      title: name,
      description: desc || '',
      images: place.image_url ? [{ url: place.image_url, alt: name }] : [],
    },
    alternates: {
      canonical: `/${locale}/place/${id}`,
      languages: { en: `/en/place/${id}`, ar: `/ar/place/${id}` },
    },
  }
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { locale, id } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const [placeRes, reviewsRes, { data: { user } }] = await Promise.all([
    supabase.from('places').select('*, categories(*)').eq('id', id).maybeSingle(),
    supabase.from('reviews').select('*').eq('place_id', id).order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ])

  if (!placeRes.data) notFound()

  const place = placeRes.data
  const reviews = reviewsRes.data || []
  const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  // Check if user favorited this place
  let isFavorited = false
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('place_id', id)
      .maybeSingle()
    isFavorited = !!fav
  }

  // Admin check
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
    isAdmin = !!profile?.is_admin
  }

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name,
    description: locale === 'ar' ? place.description_ar : place.description,
    image: place.image_url,
    address: place.address,
    telephone: place.phone,
    priceRange: place.price_level,
    ...(avgRating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  }

  return (
    <>
      <DesktopNav locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <PlaceHero
          place={place}
          locale={locale}
          isAdmin={isAdmin}
          backHref={`/${locale}`}
        />

        {/* Top bar overlaid on hero is handled inside PlaceHero */}

        <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto md:px-6">
          {/* Info */}
          <PlaceInfo place={place} locale={locale} avgRating={avgRating} reviewCount={reviews.length} t={t} />

          {/* Actions */}
          <PlaceActions place={place} locale={locale} userId={user?.id || null} isFavorited={isFavorited} t={t} />

          {/* WhatsApp booking */}
          {place.whatsapp_number && (
            <a
              href={`https://wa.me/${place.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(place.whatsapp_message || (locale === 'ar' ? `مرحباً، أود الحجز في ${name}` : `Hello, I would like to book at ${name}`))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 rounded-xl text-center font-bold text-white font-sans text-sm transition-opacity active:opacity-80"
              style={{ backgroundColor: '#25D366' }}
            >
              📱 {t('bookViaWhatsApp')}
            </a>
          )}

          {/* About */}
          <PlaceAbout place={place} locale={locale} t={t} />

          {/* Location */}
          <PlaceLocation place={place} locale={locale} t={t} />

          {/* Reviews */}
          <PlaceReviews
            place={place}
            reviews={reviews}
            locale={locale}
            userId={user?.id || null}
            t={t}
          />
        </div>
      </div>
    </>
  )
}
