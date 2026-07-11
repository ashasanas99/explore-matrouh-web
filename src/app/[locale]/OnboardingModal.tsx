'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { PrimaryButton } from '@/components/shared/Buttons'
import { cn } from '@/lib/utils'

interface OnboardingModalProps {
  locale: string
}

const slides = [
  {
    titleKey: 'onboarding_title_1',
    descKey: 'onboarding_desc_1',
    emoji: '🏖️',
  },
  {
    titleKey: 'onboarding_title_2',
    descKey: 'onboarding_desc_2',
    emoji: '🗺️',
  },
  {
    titleKey: 'onboarding_title_3',
    descKey: 'onboarding_desc_3',
    emoji: '✈️',
  },
]

const en: Record<string, string> = {
  onboarding_title_1: 'Discover Marsa Matrouh',
  onboarding_title_2: 'Find the Best Places',
  onboarding_title_3: 'Plan Your Perfect Trip',
  onboarding_desc_1: "Explore the stunning beaches and hidden gems of Egypt's most beautiful Mediterranean coastal city.",
  onboarding_desc_2: 'From world-class beaches to cozy cafes — find everything you need in one place.',
  onboarding_desc_3: 'Save favorites, get directions, and book via WhatsApp. Your adventure starts here.',
  onboarding_start_btn: 'Get Started',
  skip: 'Skip',
  next: 'Next',
}

const ar: Record<string, string> = {
  onboarding_title_1: 'اكتشف مرسى مطروح',
  onboarding_title_2: 'اعثر على أفضل الأماكن',
  onboarding_title_3: 'خطط لرحلتك المثالية',
  onboarding_desc_1: 'استكشف الشواطئ الرائعة والجواهر الخفية في أجمل مدينة ساحلية على البحر الأبيض المتوسط في مصر.',
  onboarding_desc_2: 'من الشواطئ إلى المقاهي والمطاعم — اعثر على كل ما تحتاجه في مكان واحد.',
  onboarding_desc_3: 'احفظ مفضلاتك واحجز مباشرة عبر واتساب. مغامرتك تبدأ هنا.',
  onboarding_start_btn: 'ابدأ الآن',
  skip: 'تخطي',
  next: 'التالي',
}

export default function OnboardingModal({ locale }: OnboardingModalProps) {
  const [show, setShow] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const t = locale === 'ar' ? ar : en
  const isBot = typeof navigator !== 'undefined' && /bot|crawl|spider|google|bing/i.test(navigator.userAgent)

  useEffect(() => {
    if (isBot) return
    const seen = localStorage.getItem('explore_matrouh_onboarded')
    if (!seen) setShow(true)
  }, [])

  function dismiss() {
    localStorage.setItem('explore_matrouh_onboarded', '1')
    setShow(false)
  }

  function next() {
    if (activeIndex < slides.length - 1) {
      setActiveIndex(activeIndex + 1)
    } else {
      dismiss()
    }
  }

  if (!show) return null

  const slide = slides[activeIndex]

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button onClick={dismiss} className="text-sm font-semibold text-muted-foreground font-sans px-3 py-1.5 rounded-full hover:bg-muted transition-colors">
          {t.skip}
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-8xl mb-8 select-none">{slide.emoji}</div>
        <h2 className="text-2xl font-bold font-sans text-foreground mb-4 leading-tight">
          {t[slide.titleKey]}
        </h2>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed max-w-xs">
          {t[slide.descKey]}
        </p>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all',
              i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-muted'
            )}
          />
        ))}
      </div>

      {/* Action button */}
      <div className="px-6 pb-10">
        <PrimaryButton onClick={next} fullWidth>
          {activeIndex === slides.length - 1 ? t.onboarding_start_btn : t.next}
        </PrimaryButton>
      </div>
    </div>
  )
}
