import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import DesktopNav from '@/components/layout/DesktopNav'
import OnboardingModal from './OnboardingModal'
import {
  Search,
  Sun,
  Umbrella,
  Hotel,
  Coffee,
  UtensilsCrossed,
  Store,
  PartyPopper,
  MapPin,
  Star,
  Heart,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Place, Category } from '@/types'

export const revalidate = 3600

interface HomePageProps {
  params: Promise<{ locale: string }>
}

// Decorative hero background. TODO: replace with a licensed/CMS-managed asset
// (e.g. Supabase storage or a dedicated `hero_image_url` field on app_settings).
const HERO_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA3tdpTyx021ImD3dLxCakik351g0VvnTQqV56VNw7Z9XLgIvDs7dtUpU214jVb9UkOTaYNMAjECKHIq_IdEdQa8QJ-2bpNqFCBMcKp6623sMykEqO5VTJOKN_NknGwnP3FAgmoMrhPtORosqM-M93hv37pdpsk9GqIJdKT74jeB8NlxkFtJKI6E1b2FAXzSXr8oe9hgQgiGJAeLMlqpZna1vTpk6g2FZceLAJd8xPzdWdhOQZYq7DfCysSpiEXEv7gd3UabQJh9kK-'

// Maps a category slug to a representative icon for the quick-links row.
// Falls back to MapPin for any slug not covered here.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  beaches: Umbrella,
  hotels: Hotel,
  cafes: Coffee,
  restaurants: UtensilsCrossed,
  markets: Store,
  entertainment: PartyPopper,
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()
  const isRtl = locale === 'ar'

  const [featuredRes, categoriesRes] = await Promise.all([
    supabase.from('places').select('*').eq('is_featured', true).order('created_at', { ascending: false }).limit(10),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
  ])

  const featured: Place[] = featuredRes.data || []
  const categories: Category[] = categoriesRes.data || []

  const mainCategories = categories.filter((c) =>
    ['beaches', 'hotels', 'cafes', 'restaurants', 'markets', 'entertainment'].includes(c.slug || '')
  )

  const [primaryFeatured, secondaryFeatured] = featured

  return (
    <>
      <DesktopNav locale={locale} />

      <main dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section className="relative w-full h-[80vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div
              className="bg-cover bg-center w-full h-full"
              style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative z-10 text-center px-4 md:px-gutter-desktop w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
            <h1 className="text-display text-white drop-shadow-lg">
              {isRtl ? 'مرحباً بكم في مرسى مطروح' : 'Welcome to Marsa Matrouh'}
            </h1>

            {/* Weather Widget */}
            <Link
              href={`/${locale}/weather`}
              className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 text-on-surface shadow-[0px_10px_30px_rgba(0,0,0,0.1)] hover:bg-white/90 transition-colors"
            >
              <Sun size={20} className="text-primary" />
              <span className="font-semibold text-primary">
                {isRtl ? 'مشمس 28°م' : 'Sunny 28°C'}
              </span>
            </Link>

            {/* Search Bar */}
            <Link href={`/${locale}/search`} className="w-full max-w-2xl mt-4 relative group block">
              <div className="glass-panel rounded-full flex items-center p-2 shadow-lg w-full transition-shadow group-hover:shadow-xl">
                <Search size={20} className="text-outline ms-4 shrink-0" />
                <span className="flex-grow text-outline/70 text-sm px-4 text-start truncate">
                  {isRtl ? 'ابحث عن شواطئ، فنادق، مطاعم...' : 'Search beaches, hotels, restaurants...'}
                </span>
                <span className="bg-primary text-white px-6 py-3 rounded-full text-label-md group-hover:bg-primary/90 transition-colors shadow-md shrink-0">
                  {isRtl ? 'بحث' : 'Search'}
                </span>
              </div>
            </Link>
          </div>
        </section>

        <div className="max-w-container-max-width mx-auto px-4 md:px-gutter-desktop">
          {/* Category Quick-Links */}
          {mainCategories.length > 0 && (
            <section className="mt-section-gap">
              <h2 className="text-headline-lg text-on-surface mb-8 text-center md:text-start">
                {isRtl ? 'استكشف حسب الفئة' : 'Explore by Category'}
              </h2>

              <div className="flex overflow-x-auto md:grid md:grid-cols-6 gap-4 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                {mainCategories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.slug || ''] || MapPin
                  const name = isRtl && cat.name_ar ? cat.name_ar : cat.name
                  return (
                    <Link
                      key={cat.id}
                      href={`/${locale}/category/${cat.slug || cat.id}`}
                      className="snap-start flex-none w-32 md:w-auto bg-surface rounded-xl p-4 flex flex-col items-center gap-3 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0px_15px_35px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all border border-outline-variant/30"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Icon size={26} />
                      </div>
                      <span className="text-label-md text-on-surface-variant text-center line-clamp-1">
                        {name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Featured Places (Bento Grid) */}
          {featured.length > 0 && (
            <section className="mt-section-gap mb-section-gap">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-headline-lg text-on-surface">{t('featuredPlaces')}</h2>
                <Link
                  href={`/${locale}/all-categories`}
                  className="text-primary hover:opacity-80 text-label-md items-center gap-1 hidden md:flex"
                >
                  {t('seeAll')}
                  <ChevronRight size={16} className={cn(isRtl && 'rotate-180')} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {primaryFeatured && (
                  <FeaturedBentoCard place={primaryFeatured} locale={locale} size="large" />
                )}
                {secondaryFeatured && (
                  <FeaturedBentoCard place={secondaryFeatured} locale={locale} size="small" />
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <OnboardingModal locale={locale} />
    </>
  )
}

function FeaturedBentoCard({
  place,
  locale,
  size,
}: {
  place: Place
  locale: string
  size: 'large' | 'small'
}) {
  const isRtl = locale === 'ar'
  const name = isRtl && place.name_ar ? place.name_ar : place.name
  const isLarge = size === 'large'

  return (
    <article
      className={cn(
        'bg-surface rounded-[24px] overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.04)] group relative border border-outline-variant/20 h-[400px]',
        isLarge ? 'md:col-span-8' : 'md:col-span-4'
      )}
    >
      <Link href={`/${locale}/place/${place.id}`} className="absolute inset-0 w-full h-full overflow-hidden">
        {place.image_url ? (
          <Image
            src={place.image_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes={isLarge ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </Link>

      {/* Presentational only — wire to real favorite state if this needs to be interactive */}
      <button
        type="button"
        aria-label={isRtl ? 'إضافة إلى المفضلة' : 'Add to favorites'}
        className="absolute top-4 end-4 w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white transition-colors z-10"
      >
        <Heart size={18} className="text-primary" />
      </button>

      <div className="absolute bottom-0 start-0 w-full p-6 text-white z-10">
        <h3 className={cn(isLarge ? 'text-headline-lg' : 'text-headline-md', 'drop-shadow-md mb-2 line-clamp-1')}>
          {name}
        </h3>
        <div className="flex items-center gap-4 text-white/90 text-body-sm">
          {place.rating > 0 && (
            <div className="flex items-center gap-1 glass-panel px-2 py-1 rounded-md text-on-surface shrink-0">
              <Star size={14} className="fill-warning text-warning" />
              <span className="font-semibold">{place.rating.toFixed(1)}</span>
            </div>
          )}
          {place.address && (
            <div className="flex items-center gap-1 min-w-0">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{place.address}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}