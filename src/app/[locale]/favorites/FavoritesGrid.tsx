'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import EmptyState from '@/components/shared/EmptyState'
import type { Favorite } from '@/types'

interface FavoritesGridProps {
  favorites: Favorite[]
  locale: string
  t: { noFavorites: string; noFavoritesSub: string }
}

export default function FavoritesGrid({ favorites: initial, locale, t }: FavoritesGridProps) {
  const [favorites, setFavorites] = useState(initial)
  const isRtl = locale === 'ar'

  async function removeFavorite(favoriteId: string, placeId: string) {
    const supabase = createClient()
    await supabase.from('favorites').delete().eq('id', favoriteId)
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId))
    toast.success(locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites')
  }

  if (!favorites.length) {
    return <EmptyState icon="❤️" title={t.noFavorites} subtitle={t.noFavoritesSub} />
  }

  return (
    <main className="px-4 py-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        {favorites.length} {locale === 'ar' ? 'مكان محفوظ' : 'saved places'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {favorites.map((fav) => {
          const place = fav.places
          if (!place) return null
          const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name

          return (
            <div key={fav.id} className="relative rounded-2xl overflow-hidden bg-card card-shadow border border-border/40">
              <Link href={`/${locale}/place/${place.id}`}>
                <div className="relative aspect-[4/3] bg-muted">
                  {place.image_url ? (
                    <Image src={place.image_url} alt={name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary-light flex items-center justify-center">
                      <span className="text-primary text-4xl">📍</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-bold font-sans text-shadow leading-tight line-clamp-2">{name}</p>
                    {place.address && (
                      <p className="text-white/70 text-[10px] font-sans flex items-center gap-0.5 mt-0.5">
                        <MapPin size={9} />
                        <span className="truncate">{place.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={() => removeFavorite(fav.id, place.id)}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-destructive-light transition-colors"
                aria-label="Remove from favorites"
              >
                <Trash2 size={12} className="text-destructive" />
              </button>
            </div>
          )
        })}
      </div>
    </main>
  )
}
