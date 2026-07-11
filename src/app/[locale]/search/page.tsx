import type { Metadata } from 'next'
import SearchPageClient from './SearchPageClient'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false },
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <SearchPageClient locale={locale} />
}
