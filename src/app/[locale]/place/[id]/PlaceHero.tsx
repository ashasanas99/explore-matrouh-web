'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Place } from '@/types'

interface PlaceHeroProps {
  place: Place
  locale: string
  isAdmin: boolean
  backHref: string
}

export default function PlaceHero({ place, locale, isAdmin, backHref }: PlaceHeroProps) {
  const gallery = [
    ...(place.image_url ? [place.image_url] : []),
    ...(Array.isArray(place.image_gallery_url) ? place.image_gallery_url : []),
  ]
  const [activeIndex, setActiveIndex] = useState(0)
  const isRtl = locale === 'ar'
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  function prev() { setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length) }
  function next() { setActiveIndex((i) => (i + 1) % gallery.length) }

  return (
    <div className="relative">
      {/* Main image */}
      <div className="relative h-[280px] md:h-[400px] w-full bg-muted">
        {gallery[activeIndex] ? (
          <Image
            src={gallery[activeIndex]}
            alt={locale === 'ar' && place.name_ar ? place.name_ar : place.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary" />
        )}

        {/* Navigation arrows for gallery */}
        {gallery.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronRight size={18} className="text-white" />
            </button>
          </>
        )}

        {/* Overlay buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Link
            href={backHref}
            className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
            aria-label="Back"
          >
            <BackIcon size={18} className="text-white" />
          </Link>

          {isAdmin && (
            <Link
              href={`/${locale}/admin/places/${place.id}/edit`}
              className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="Edit place"
            >
              <Pencil size={16} className="text-white" />
            </Link>
          )}
        </div>

        {/* Counter */}
        {gallery.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold font-sans rounded-full px-2.5 py-1">
            {activeIndex + 1}/{gallery.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2 bg-white border-b border-border">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all ${i === activeIndex ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
