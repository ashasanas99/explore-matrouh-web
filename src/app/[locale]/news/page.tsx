import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import EmptyState from '@/components/shared/EmptyState'
import { stripHtml, formatDate } from '@/lib/utils'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'ar' ? 'أخبار مطروح' : 'Matrouh News',
    description: locale === 'ar' ? 'آخر أخبار مرسى مطروح' : 'Latest news from Marsa Matrouh',
  }
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })

  const isRtl = locale === 'ar'

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('matrouhNews')} locale={locale} backHref={`/${locale}`} />

      <main className="px-4 py-4 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {articles?.length ? articles.map((article) => {
          const excerpt = article.content ? stripHtml(article.content).slice(0, 160) : ''
          return (
            <div key={article.id} className="bg-white rounded-2xl overflow-hidden card-shadow border border-border/30">
              {article.image_url && (
                <div className="relative h-[160px] w-full bg-muted">
                  <Image src={article.image_url} alt={article.title} fill className="object-cover" sizes="100vw" />
                </div>
              )}
              <div className="p-4 space-y-2">
                {/* Source + date */}
                <div className="flex items-center justify-between text-xs text-muted-foreground font-sans">
                  <span className="font-semibold">{article.source_name || 'News'}</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{formatDate(article.published_at, locale)}</span>
                  </div>
                </div>

                <h3 className="font-bold font-sans text-foreground text-sm leading-snug line-clamp-2">
                  {article.title}
                </h3>

                {excerpt && (
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed line-clamp-3">{excerpt}</p>
                )}

                {article.source_url && (
                  <Link
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary font-sans hover:opacity-80 transition-opacity"
                  >
                    {t('readOriginal')} <ExternalLink size={11} />
                  </Link>
                )}
              </div>
            </div>
          )
        }) : (
          <EmptyState icon="📰" title={locale === 'ar' ? 'لا توجد أخبار' : 'No news available'} />
        )}
      </main>
    </>
  )
}
