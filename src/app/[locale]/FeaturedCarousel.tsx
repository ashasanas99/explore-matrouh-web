'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type { Place } from '@/types'

interface FeaturedCarouselProps {
  places: Place[]
  locale: string
}

export default function FeaturedCarousel({ places, locale }: FeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  function startAutoPlay() {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % places.length
        scrollToIndex(next)
        return next
      })
    }, 4000)
  }

  function stopAutoPlay() {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  function scrollToIndex(index: number) {
    const container = scrollRef.current
    if (!container) return
    const items = container.querySelectorAll('[data-slide]')
    if (items[index]) {
      items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    }
  }

  useEffect(() => {
    startAutoPlay()
    return () => stopAutoPlay()
  }, [places.length])

  function handleScroll() {
    const container = scrollRef.current
    if (!container) return
    const index = Math.round(container.scrollLeft / container.clientWidth)
    setActiveIndex(index)
  }

  if (!places.length) return null

  return (
    <div className="relative rounded-3xl overflow-hidden">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-snap-x scrollbar-hide"
        onScroll={handleScroll}
        onMouseEnter={stopAutoPlay}
        onMouseLeave={startAutoPlay}
        onTouchStart={stopAutoPlay}
        onTouchEnd={startAutoPlay}
      >
        {places.map((place, i) => {
          const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name
          return (
            <Link
              key={place.id}
              href={`/${locale}/place/${place.id}`}
              data-slide={i}
              className="relative flex-shrink-0 w-full scroll-snap-start"
            >
              <div className="relative h-[220px] w-full bg-muted">
                {place.image_url ? (
                  <Image
                    src={place.image_url}
                    alt={name}
                    fill
                    className="object-cover"
                    priority={i === 0}
                    sizes="100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-lighter to-primary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* VIP Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-warning/90 text-white rounded-full px-2.5 py-1">
                  <Star size={11} fill="white" />
                  <span className="text-[10px] font-bold font-sans uppercase">VIP</span>
                </div>

                {/* Name */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-lg font-bold font-sans text-shadow-strong leading-tight line-clamp-2">
                    {name}
                  </h3>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
        {places.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); scrollToIndex(i) }}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
