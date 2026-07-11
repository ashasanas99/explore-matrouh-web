'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import PlaceCard from '@/components/shared/PlaceCard'
import EmptyState from '@/components/shared/EmptyState'
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
    searchPlaceholder: locale === 'ar' ? 'ابحث عن أماكن...' : 'Search places...',
    searching: locale === 'ar' ? 'جاري البحث...' : 'Searching...',
    searchHint: locale === 'ar' ? 'اكتب للبحث عن الأماكن' : 'Type to search places',
    noResults: locale === 'ar' ? 'لا توجد نتائج' : 'No results found',
    noResultsHint: locale === 'ar' ? 'جرب كلمة بحث مختلفة.' : 'Try a different search term.',
    result: locale === 'ar' ? 'نتيجة' : 'result',
    results: locale === 'ar' ? 'نتائج' : 'results',
    for: locale === 'ar' ? 'لـ' : 'for',
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

      <main className="px-4 py-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Search input */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoFocus
            className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-border bg-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && searched && places.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground font-sans mb-3">
              {places.length} {places.length === 1 ? t.result : t.results} {t.for} &ldquo;{query}&rdquo;
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} locale={locale} variant="grid" />
              ))}
            </div>
          </>
        )}

        {!loading && searched && places.length === 0 && (
          <EmptyState icon="🔍" title={t.noResults} subtitle={t.noResultsHint} />
        )}

        {!loading && !searched && (
          <EmptyState icon="🔍" title={t.searchHint} />
        )}
      </main>
    </>
  )
}
