import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  seeAllHref?: string
  seeAllLabel?: string
  locale?: string
  className?: string
}

export default function SectionHeader({
  title,
  seeAllHref,
  seeAllLabel = 'See All',
  locale = 'en',
  className,
}: SectionHeaderProps) {
  const isRtl = locale === 'ar'
  return (
    <div className={cn('flex items-center justify-between mb-3', className)} dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-base font-bold text-foreground font-sans">{title}</h2>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="flex items-center gap-1 text-sm font-semibold text-primary font-sans hover:opacity-80 transition-opacity"
        >
          {seeAllLabel}
          <ChevronRight size={14} className={cn(isRtl && 'rotate-180')} />
        </Link>
      )}
    </div>
  )
}
