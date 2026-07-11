'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Menu } from 'lucide-react'
import { useState } from 'react'
import GlobalDrawer from './GlobalDrawer'
import { cn } from '@/lib/utils'

interface TopAppBarProps {
  title: string
  locale: string
  backHref?: string
  onBack?: () => void
  className?: string
  rightElement?: React.ReactNode
}

export default function TopAppBar({
  title,
  locale,
  backHref,
  onBack,
  className,
  rightElement,
}: TopAppBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isRtl = locale === 'ar'
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <>
      <header
        className={cn(
          'flex items-center justify-between px-4 h-14 bg-white border-b border-border sticky top-0 z-40',
          className
        )}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Left: back button */}
        <div className="w-10">
          {backHref ? (
            <Link
              href={backHref}
              className="p-2 -ml-2 rounded-full transition-colors hover:bg-muted active:opacity-70 inline-flex"
              aria-label="Back"
            >
              <BackIcon size={22} className="text-primary" />
            </Link>
          ) : onBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full transition-colors hover:bg-muted active:opacity-70"
              aria-label="Back"
            >
              <BackIcon size={22} className="text-primary" />
            </button>
          ) : null}
        </div>

        {/* Center: title */}
        <h1 className="text-base font-bold text-foreground font-sans text-center flex-1 truncate px-2">
          {title}
        </h1>

        {/* Right: menu or custom element */}
        <div className="w-10 flex justify-end">
          {rightElement ?? (
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 -mr-2 rounded-full transition-colors hover:bg-muted active:opacity-70"
              aria-label="Open menu"
            >
              <Menu size={22} className="text-foreground" />
            </button>
          )}
        </div>
      </header>

      <GlobalDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} locale={locale} />
    </>
  )
}
