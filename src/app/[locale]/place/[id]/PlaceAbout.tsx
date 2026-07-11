import { Info } from 'lucide-react'
import type { Place } from '@/types'
import type { useTranslations } from 'next-intl'

interface PlaceAboutProps {
  place: Place
  locale: string
  t: ReturnType<typeof useTranslations>
}

export default function PlaceAbout({ place, locale, t }: PlaceAboutProps) {
  const description = locale === 'ar' && place.description_ar ? place.description_ar : place.description
  const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
  const isRtl = locale === 'ar'
  const fallback = locale === 'ar'
    ? `${name} هو مكان رائع في مرسى مطروح. اكتشف ما يقدمه هذا المكان المميز.`
    : `${name} is a wonderful place in Marsa Matrouh. Discover what this remarkable location has to offer.`

  return (
    <div className="bg-white rounded-2xl p-4 card-shadow border border-border/30" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary-lighter flex items-center justify-center">
          <Info size={16} className="text-primary" />
        </div>
        <h2 className="font-bold font-sans text-foreground">{t('aboutPlace')}</h2>
      </div>
      <p className="text-sm text-foreground/80 font-sans leading-relaxed">
        {description || fallback}
      </p>
    </div>
  )
}
