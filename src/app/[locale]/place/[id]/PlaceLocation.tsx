import { MapPin, ExternalLink } from 'lucide-react'
import type { Place } from '@/types'
import type { useTranslations } from 'next-intl'

interface PlaceLocationProps {
  place: Place
  locale: string
  t: ReturnType<typeof useTranslations>
}

export default function PlaceLocation({ place, locale, t }: PlaceLocationProps) {
  const isRtl = locale === 'ar'
  const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
  const mapsUrl = place.google_maps_url ||
    (place.latitude && place.longitude
      ? `https://www.google.com/maps?q=${place.latitude},${place.longitude}`
      : `https://www.google.com/maps/search/${encodeURIComponent(name + ' مرسى مطروح')}`)

  if (!place.address && !place.google_maps_url && !place.latitude) return null

  return (
    <div className="bg-white rounded-2xl p-4 card-shadow border border-border/30" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary-lighter flex items-center justify-center">
          <MapPin size={16} className="text-primary" />
        </div>
        <h2 className="font-bold font-sans text-foreground">{t('locationMap')}</h2>
      </div>

      {place.address && (
        <p className="text-sm text-foreground/80 font-sans mb-3">{place.address}</p>
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary text-primary font-semibold text-sm font-sans hover:bg-primary-lighter transition-colors"
      >
        <ExternalLink size={16} />
        {t('openInMaps')}
      </a>
    </div>
  )
}
