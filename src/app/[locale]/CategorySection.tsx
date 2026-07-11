'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import PlaceCard from '@/components/shared/PlaceCard'
import type { Category, Place } from '@/types'
import { cn } from '@/lib/utils'

interface CategorySectionProps {
  categories: Category[]
  allCategories: Category[]
  locale: string
  seeAllLabel: string
  t: { noPlacesYet: string; loadingPlaces: string }
  compact?: boolean
}

export default function CategorySection({
  categories,
  locale,
  seeAllLabel,
  t,
  compact,
}: CategorySectionProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(categories[0])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeCategory) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('places')
      .select('*')
      .eq('category_id', activeCategory.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setPlaces(data || [])
        setLoading(false)
      })
  }, [activeCategory])

  if (!categories.length) return null

  const catName = locale === 'ar' && activeCategory?.name_ar ? activeCategory.name_ar : activeCategory?.name

  return (
    <section>
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
        {categories.map((cat) => {
          const label = locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name
          const isActive = activeCategory?.id === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold font-sans transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-primary-lighter hover:text-primary'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Places list */}
      <div className="mt-3 space-y-2">
        {/* Section header with "See All" */}
        {activeCategory && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground font-sans">{catName}</h3>
            <Link
              href={`/${locale}/category/${activeCategory.slug || activeCategory.id}`}
              className="text-sm font-semibold text-primary font-sans hover:opacity-80"
            >
              {seeAllLabel} →
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-[200px] h-[140px] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : places.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} locale={locale} variant="carousel" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-sans py-4 text-center">{t.noPlacesYet}</p>
        )}
      </div>
    </section>
  )
}
