import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Umbrella, 
  Hotel, 
  UtensilsCrossed, 
  Landmark, 
  Coffee, 
  ShoppingBag, 
  MapPin, 
  type LucideIcon 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import EmptyState from '@/components/shared/EmptyState'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'ar' ? 'جميع الفئات' : 'All Categories',
    description: locale === 'ar' ? 'تصفح جميع فئات الأماكن في مطروح' : 'Browse all place categories in Matrouh',
    robots: { index: true },
  }
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  beaches: Umbrella,
  hotels: Hotel,
  restaurants: UtensilsCrossed,
  historical: Landmark,
  cafes: Coffee,
  shopping: ShoppingBag,
  markets: ShoppingBag,
  entertainment: Landmark,
}

export default async function AllCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  const isRtl = locale === 'ar'

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar
        title={t('allCategories')}
        locale={locale}
        backHref={`/${locale}`}
      />
      <main className="flex-grow py-8 px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        {categories?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter-desktop">
            {categories.map((cat) => {
              const name = locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name
              const Icon = CATEGORY_ICONS[cat.slug || ''] || MapPin

              return (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug || cat.id}`}
                  className="group relative overflow-hidden rounded-[16px] aspect-[4/3] block shadow-[0px_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-surface-container"
                >
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-lighter to-primary-light flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                      <span className="text-primary text-5xl">📍</span>
                    </div>
                  )}
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 p-6 flex items-center gap-4 text-on-primary w-full">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
                      <Icon size={24} className="text-white" />
                    </div>
                    <h2 className="font-headline-md text-headline-md text-white tracking-wide line-clamp-2">{name}</h2>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <EmptyState icon="🗂️" title={t('noCategories')} />
        )}
      </main>
    </>
  )
}