import { Star } from 'lucide-react'
import type { Place } from '@/types'
import type { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface PlaceInfoProps {
  place: Place
  locale: string
  avgRating: number
  reviewCount: number
  t: ReturnType<typeof useTranslations>
}

export default function PlaceInfo({ place, locale, avgRating, reviewCount, t }: PlaceInfoProps) {
  const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
  const isRtl = locale === 'ar'

  const statusColor = {
    Open: 'bg-success-light text-success',
    Closed: 'bg-destructive-light text-destructive',
    Seasonal: 'bg-warning-light text-warning',
  }[place.status] || 'bg-muted text-muted-foreground'

  const statusLabel = {
    Open: t('openNow'),
    Closed: t('closed'),
    Seasonal: t('seasonal'),
  }[place.status] || place.status

  return (
    <div className="bg-white rounded-2xl p-4 card-shadow border border-border/30" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-xl font-bold font-sans text-foreground leading-tight mb-2">{name}</h1>

      <div className="flex items-center gap-3 flex-wrap">
        {avgRating > 0 && (
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-warning text-warning" />
            <span className="text-sm font-bold font-sans">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground font-sans">({reviewCount})</span>
          </div>
        )}

        <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold font-sans', statusColor)}>
          {statusLabel}
        </span>

        {place.price_level && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold font-sans bg-muted text-muted-foreground">
            {place.price_level}
          </span>
        )}

        {place.categories && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold font-sans bg-primary-lighter text-primary">
            {locale === 'ar' && place.categories.name_ar ? place.categories.name_ar : place.categories.name}
          </span>
        )}
      </div>
    </div>
  )
}
