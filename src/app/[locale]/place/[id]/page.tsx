import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import DesktopNav from '@/components/layout/DesktopNav'
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  Waves, 
  Umbrella, 
  Car, 
  Coffee, 
  ExternalLink, 
  MessageCircle 
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

  const gallery = [
    ...(place.image_url ? [place.image_url] : []),
    ...(Array.isArray(place.image_gallery_url) ? place.image_gallery_url : []),
  ]

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

      <main className="w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero Image Gallery */}
        <section className="relative w-full h-[512px] md:h-[716px] md:mt-16">
          <div className="w-full h-full overflow-x-auto flex snap-x snap-mandatory hide-scrollbar">
            {gallery.length > 0 ? (
              gallery.map((img, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                  <Image 
                    src={img} 
                    alt={name} 
                    fill 
                    className="object-cover" 
                    sizes="100vw" 
                    priority={idx === 0} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex-shrink-0 snap-center relative bg-primary/20">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            )}
          </div>
          
          {/* Gallery Indicators */}
          {gallery.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {gallery.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all ${idx === 0 ? 'bg-white' : 'bg-white/50'}`}
                ></div>
              ))}
            </div>
          )}
        </section>

        {/* Main Content Canvas */}
        <section className="relative z-20 -mt-8 bg-surface rounded-t-3xl md:rounded-none px-gutter-mobile md:px-gutter-desktop py-8 max-w-container-max-width mx-auto">
          
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {place.categories && (
                  <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-label-md font-label-md">
                    {locale === 'ar' && place.categories.name_ar ? place.categories.name_ar : place.categories.name}
                  </span>
                )}
                {avgRating > 0 && (
                  <div className="flex items-center text-primary font-semibold text-body-sm font-body-sm bg-surface-container-low px-2 py-1 rounded-md">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {avgRating.toFixed(1)} ({reviews.length})
                  </div>
                )}
              </div>
              <h1 className="text-headline-lg-mobile md:text-display font-headline-lg-mobile md:font-display text-on-surface">
                {name}
              </h1>
              {place.address && (
                <p className="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {place.address}
                </p>
              )}
            </div>
            
            {/* Status Pill */}
            <div className="flex items-center gap-2 px-4 py-2 bg-tertiary-fixed rounded-xl border border-tertiary-fixed-dim shadow-sm">
              <Clock className="text-primary-fixed-variant w-5 h-5" />
              <div>
                <p className="text-label-md font-label-md text-on-tertiary-container">
                  {place.status === 'Open' ? t('openNow') : place.status === 'Closed' ? t('closed') : t('seasonal')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 pb-8 border-b border-outline-variant/30">
            {place.whatsapp_number && (
              <a 
                href={`https://wa.me/${place.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(place.whatsapp_message || '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 bg-primary-container text-on-primary font-headline-sm text-headline-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0px_4px_14px_rgba(59,168,138,0.3)] hover:scale-[1.02] transition-transform"
              >
                <MessageCircle className="w-6 h-6" />
                {t('bookViaWhatsApp')}
              </a>
            )}
            <div className="flex gap-4 justify-between md:justify-start w-full md:w-auto">
              {place.phone && (
                <a 
                  href={`tel:${place.phone}`} 
                  className="flex-1 md:flex-none flex flex-col items-center justify-center gap-2 w-full md:w-24 h-[72px] border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <Phone className="text-primary w-6 h-6" />
                  <span className="text-label-md font-label-md">{t('callNow')}</span>
                </a>
              )}
              {(place.google_maps_url || (place.latitude && place.longitude)) && (
                <a 
                  href={place.google_maps_url || `https://www.google.com/maps?q=${place.latitude},${place.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 md:flex-none flex flex-col items-center justify-center gap-2 w-full md:w-24 h-[72px] border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <Navigation className="text-primary w-6 h-6" />
                  <span className="text-label-md font-label-md">{t('directions') || 'Directions'}</span>
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column (Description & Details) */}
            <div className="md:col-span-8">
              <h2 className="text-headline-sm font-headline-sm text-on-surface mb-4">
                {t('aboutPlace')}
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed mb-8 whitespace-pre-line">
                {locale === 'ar' && place.description_ar ? place.description_ar : place.description}
              </p>

              {/* Features Bento Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20 flex flex-col items-center text-center gap-2">
                  <Waves className="text-primary w-8 h-8" />
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Calm Waters</span>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20 flex flex-col items-center text-center gap-2">
                  <Umbrella className="text-primary w-8 h-8" />
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Sunbeds</span>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20 flex flex-col items-center text-center gap-2">
                  <Car className="text-primary w-8 h-8" />
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Parking</span>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20 flex flex-col items-center text-center gap-2">
                  <Coffee className="text-primary w-8 h-8" />
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Cafe Nearby</span>
                </div>
              </div>
            </div>

            {/* Right Column (Location/Map) */}
            <div className="md:col-span-4">
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20 mb-8">
                <h3 className="text-headline-md font-headline-md text-on-surface mb-4">
                  {t('locationMap')}
                </h3>
                <div className="w-full h-48 rounded-xl overflow-hidden bg-surface-dim mb-4 relative">
                  <Image 
                    src={gallery[0] || '/placeholder-map.jpg'} 
                    alt="Map Location" 
                    fill 
                    className="object-cover opacity-70" 
                  />
                  <a 
                    href={place.google_maps_url || `https://www.google.com/maps?q=${place.latitude},${place.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="absolute bottom-3 right-3 bg-white text-primary p-2 rounded-lg shadow-md text-label-md font-label-md flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" /> {t('openInMaps')}
                  </a>
                </div>
                {place.address && (
                  <p className="text-body-sm font-body-sm text-on-surface-variant flex items-start gap-2">
                    <Car className="w-5 h-5 text-primary shrink-0" />
                    <span>{place.address}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 pt-10 border-t border-outline-variant/30">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-headline-md font-headline-md text-on-surface">
                {t('reviewsCount')} ({reviews.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-dim flex items-center justify-center text-on-surface-variant font-bold">
                          {review.avatar_url ? (
                            <Image 
                              src={review.avatar_url} 
                              alt={review.user_name || 'User'} 
                              width={40} 
                              height={40} 
                              className="object-cover w-full h-full" 
                            />
                          ) : (
                            (review.user_name || 'A')[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="text-body-md font-body-md font-semibold text-on-surface">
                            {review.user_name || 'Anonymous'}
                          </h4>
                          <p className="text-label-md font-label-md text-on-surface-variant">
                            {formatDate(review.created_at, locale)}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-outline-variant'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-body-md font-body-md">
                  {locale === 'ar' ? 'لا توجد تقييمات بعد.' : 'No reviews yet.'}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}