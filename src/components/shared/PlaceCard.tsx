import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Place } from '@/types'

interface PlaceCardProps {
  place: Place
  locale: string
  variant?: 'grid' | 'carousel'
  isAdmin?: boolean
  editHref?: string
}

export default function PlaceCard({
  place,
  locale,
  variant = 'grid',
  isAdmin,
  editHref,
}: PlaceCardProps) {
  const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
  const address = place.address || ''

  if (variant === 'carousel') {
    return (
      <div className="relative flex-shrink-0 w-[200px] rounded-2xl overflow-hidden card-shadow">
        <Link href={`/${locale}/place/${place.id}`}>
          <div className="relative h-[140px] w-full bg-muted">
            {place.image_url ? (
              <Image
                src={place.image_url}
                alt={name}
                fill
                className="object-cover"
                sizes="200px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary-light flex items-center justify-center">
                <span className="text-primary text-3xl">📍</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-xs font-bold font-sans text-shadow leading-tight line-clamp-2">{name}</p>
              {address && (
                <p className="text-white/80 text-[10px] font-sans flex items-center gap-0.5 mt-0.5">
                  <MapPin size={9} />
                  <span className="truncate">{address}</span>
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card card-shadow border border-border/40">
      <Link href={`/${locale}/place/${place.id}`}>
        <div className="relative aspect-[4/3] w-full bg-muted">
          {place.image_url ? (
            <Image
              src={place.image_url}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary-light flex items-center justify-center">
              <span className="text-primary text-4xl">📍</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-xs font-bold font-sans text-shadow leading-tight line-clamp-2">{name}</p>
            {address && (
              <p className="text-white/70 text-[10px] font-sans flex items-center gap-0.5 mt-0.5">
                <MapPin size={9} />
                <span className="truncate">{address}</span>
              </p>
            )}
          </div>
        </div>
      </Link>

      {isAdmin && editHref && (
        <Link
          href={editHref}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          onClick={(e) => e.stopPropagation()}
          aria-label="Edit place"
        >
          <Pencil size={12} className="text-primary" />
        </Link>
      )}
    </div>
  )
}
