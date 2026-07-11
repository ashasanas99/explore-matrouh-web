import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
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
      <main className="px-4 py-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {categories?.length ? (
          <>
            <p className="text-sm text-muted-foreground font-sans mb-4">
              {categories.length} {locale === 'ar' ? 'فئة' : 'categories'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const name = locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/category/${cat.slug || cat.id}`}
                    className="relative rounded-2xl overflow-hidden bg-card card-shadow border border-border/40 group"
                  >
                    <div className="relative aspect-video bg-muted">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary-light flex items-center justify-center">
                          <span className="text-primary text-3xl">📍</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <span className="text-white text-xs font-bold font-sans text-shadow line-clamp-1 flex-1">{name}</span>
                        <ChevronRight size={14} className={`text-white flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState icon="🗂️" title={t('noCategories')} />
        )}
      </main>
    </>
  )
}
