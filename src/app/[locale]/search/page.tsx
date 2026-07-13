'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Star, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import EmptyState from '@/components/shared/EmptyState'
import Image from 'next/image'
import Link from 'next/link'
import type { Place } from '@/types'

interface SearchPageClientProps {
  locale: string
}

export default function SearchPageClient({ locale }: SearchPageClientProps) {
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const isRtl = locale === 'ar'

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) { setPlaces([]); setSearched(false); return }
      setLoading(true)
      setSearched(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('places')
        .select('*')
        .or(`name.ilike.%${q}%,name_ar.ilike.%${q}%,address.ilike.%${q}%`)
        .order('name')
        .limit(50)
      setPlaces(data || [])
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    const id = setTimeout(() => doSearch(query), 350)
    return () => clearTimeout(id)
  }, [query, doSearch])

  const t = {
    search: locale === 'ar' ? 'بحث' : 'Search',
    searchPlaceholder: locale === 'ar' ? 'ابحث عن وجهات، شواطئ، مقاهي...' : 'Search destinations, beaches, cafes...',
    searching: locale === 'ar' ? 'جاري البحث...' : 'Searching...',
    searchHint: locale === 'ar' ? 'اكتب للبحث عن الأماكن' : 'Type to search places',
    noResults: locale === 'ar' ? 'لا توجد نتائج' : 'No results found',
    noResultsHint: locale === 'ar' ? 'جرب كلمة بحث مختلفة.' : 'Try a different search term.',
    result: locale === 'ar' ? 'نتيجة' : 'result',
    results: locale === 'ar' ? 'نتائج' : 'results',
    for: locale === 'ar' ? 'لـ' : 'for',
    all: locale === 'ar' ? 'الكل' : 'All',
    beaches: locale === 'ar' ? 'شواطئ' : 'Beaches',
    topRated: locale === 'ar' ? 'الأعلى تقييماً' : 'Top Rated',
    openNow: locale === 'ar' ? 'مفتوح الآن' : 'Open Now',
    hotels: locale === 'ar' ? 'فنادق' : 'Hotels',
    restaurants: locale === 'ar' ? 'مطاعم' : 'Restaurants',
  }

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar
        title={t.search}
        locale={locale}
        backHref={`/${locale}`}
        rightElement={<div className="w-10" />}
      />

      <main className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pt-8" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Search Section */}
        <section className="mb-8">
          <div className="relative w-full md:max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pl-0 rtl:pr-4 flex items-center pointer-events-none">
              <Search className="text-outline w-5 h-5" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              autoFocus
              className="glass-card w-full pl-12 pr-10 rtl:pl-10 rtl:pr-12 py-4 rounded-full border border-surface-variant shadow-[0px_10px_30px_rgba(0,0,0,0.04)] font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 placeholder:text-outline-variant"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-4 rtl:pr-0 rtl:pl-4 flex items-center text-outline-variant hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex overflow-x-auto hide-scrollbar gap-3 mt-6 pb-2 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0 md:justify-center">
            <button className="whitespace-nowrap px-6 py-2 rounded-full border border-primary bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all hover:shadow-md active:scale-95">
              {t.all}
            </button>
            <button className="whitespace-nowrap px-6 py-2 rounded-full border border-surface-variant bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95">
              {t.beaches}
            </button>
            <button className="whitespace-nowrap px-6 py-2 rounded-full border border-surface-variant bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95">
              {t.topRated}
            </button>
            <button className="whitespace-nowrap px-6 py-2 rounded-full border border-surface-variant bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95">
              {t.openNow}
            </button>
            <button className="whitespace-nowrap px-6 py-2 rounded-full border border-surface-variant bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95">
              {t.hotels}
            </button>
            <button className="whitespace-nowrap px-6 py-2 rounded-full border border-surface-variant bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95">
              {t.restaurants}
            </button>
          </div>
        </section>

        {/* States */}
        {loading && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-surface-dim rounded-xl animate-pulse" />
            ))}
          </section>
        )}

        {!loading && searched && places.length > 0 && (
          <>
            <p className="text-body-sm font-body-sm text-on-surface-variant mb-6">
              {places.length} {places.length === 1 ? t.result : t.results} {t.for} &ldquo;{query}&rdquo;
            </p>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
              {places.map((place) => {
                const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
                return (
                  <Link key={place.id} href={`/${locale}/place/${place.id}`}>
                    <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer border border-surface-variant/50">
                      <div className="relative h-48 overflow-hidden bg-surface-dim">
                        {place.image_url ? (
                          <Image 
                            src={place.image_url} 
                            alt={name} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        {place.rating > 0 && (
                          <div className="absolute top-3 right-3 glass-card px-2 py-1 rounded flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                            <span className="font-label-md text-label-md text-on-surface font-bold">{place.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 truncate">{name}</h3>
                        {place.address && (
                          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 truncate">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{place.address}</span>
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                )
              })}
            </section>
          </>
        )}

        {!loading && searched && places.length === 0 && (
          <div className="mt-12">
            <EmptyState icon="🔍" title={t.noResults} subtitle={t.noResultsHint} />
          </div>
        )}

        {!loading && !searched && (
          <div className="mt-12">
            <EmptyState icon="🔍" title={t.searchHint} />
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </>
  )
}