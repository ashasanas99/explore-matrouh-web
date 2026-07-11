'use client'

import { Phone, Share2, Heart } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Place } from '@/types'
import type { useTranslations } from 'next-intl'

interface PlaceActionsProps {
  place: Place
  locale: string
  userId: string | null
  isFavorited: boolean
  t: ReturnType<typeof useTranslations>
}

export default function PlaceActions({ place, locale, userId, isFavorited: initialFavorited, t }: PlaceActionsProps) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [favLoading, setFavLoading] = useState(false)
  const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
  const isRtl = locale === 'ar'

  async function toggleFavorite() {
    if (!userId) {
      router.push(`/${locale}/sign-in`)
      return
    }
    setFavLoading(true)
    const supabase = createClient()
    if (favorited) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('place_id', place.id)
      setFavorited(false)
      toast.success(locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites')
    } else {
      await supabase.from('favorites').insert({ place_id: place.id })
      setFavorited(true)
      toast.success(locale === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to favorites')
    }
    setFavLoading(false)
  }

  async function handleShare() {
    const shareData = {
      title: name,
      text: locale === 'ar' ? `تحقق من ${name} في استكشف مطروح` : `Check out ${name} on Explore Matrouh`,
      url: window.location.href,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {/* user cancelled */}
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard')
    }
  }

  return (
    <div className="flex gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Call */}
      {place.phone ? (
        <a
          href={`tel:${place.phone}`}
          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-primary-lighter border border-primary/20 hover:bg-primary-light transition-colors"
        >
          <Phone size={20} className="text-primary" />
          <span className="text-xs font-bold text-primary font-sans">{t('callNow')}</span>
        </a>
      ) : (
        <div className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-muted opacity-40 cursor-not-allowed">
          <Phone size={20} className="text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground font-sans">{t('callNow')}</span>
        </div>
      )}

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-primary-lighter border border-primary/20 hover:bg-primary-light transition-colors"
      >
        <Share2 size={20} className="text-primary" />
        <span className="text-xs font-bold text-primary font-sans">{t('sharePlace')}</span>
      </button>

      {/* Favorite */}
      <button
        onClick={toggleFavorite}
        disabled={favLoading}
        className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-primary-lighter border border-primary/20 hover:bg-primary-light transition-colors disabled:opacity-60"
        aria-label={favorited ? t('removeFromFavorites') : t('addToFavorites')}
      >
        <Heart size={20} className={favorited ? 'fill-destructive text-destructive' : 'text-primary'} />
        <span className="text-xs font-bold font-sans text-primary">
          {favorited ? t('removeFromFavorites') : t('addToFavorites')}
        </span>
      </button>
    </div>
  )
}
