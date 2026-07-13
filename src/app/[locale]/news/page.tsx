import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Calendar, ArrowRight, ArrowLeft, TrendingUp } from 'lucide-react'
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

      <main className="container mx-auto max-w-7xl px-4 md:px-8 pt-24 md:pt-32 pb-16" dir={isRtl ? 'rtl' : 'ltr'}>
        {articles?.length ? (
          <>
            {/* Hero Featured Article */}
            {articles[0] && (() => {
              const featured = articles[0]
              const excerpt = featured.content ? stripHtml(featured.content).slice(0, 160) : ''
              return (
                <section className="mb-16 relative rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.04)] group cursor-pointer h-[500px]">
                  {featured.image_url && (
                    <Image 
                      src={featured.image_url} 
                      alt={featured.title} 
                      fill 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  )}
                  {/* Glassmorphism Card Overlay */}
                  <div className={`absolute bottom-8 md:bottom-12 max-w-2xl bg-white/85 backdrop-blur-xl p-8 rounded-xl shadow-lg border border-white/20 ${isRtl ? 'right-8 md:right-12' : 'left-8 md:left-12'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-primary text-primary-foreground font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                        {featured.source_name || 'Event'}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar size={16} /> {formatDate(featured.published_at, locale)}
                      </span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
                      {featured.title}
                    </h1>
                    <p className="text-lg text-muted-foreground line-clamp-2">
                      {excerpt}
                    </p>
                    {featured.source_url && (
                      <Link href={featured.source_url} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center gap-2 text-primary font-semibold text-lg">
                        {t('readOriginal')} 
                        {isRtl ? (
                          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                        ) : (
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        )}
                      </Link>
                    )}
                  </div>
                </section>
              )
            })()}

            {/* News Feed Grid */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-6">
                <h2 className="text-3xl font-bold text-foreground mb-8 border-b pb-4">
                  {locale === 'ar' ? 'أحدث الأخبار والفعاليات' : 'Latest News & Events'}
                </h2>
                
                {/* Article Rows */}
                {articles.slice(1).map((article) => {
                  const excerpt = article.content ? stripHtml(article.content).slice(0, 160) : ''
                  return (
                    <article key={article.id} className="flex flex-col md:flex-row gap-6 bg-card rounded-2xl p-4 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0px_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer border border-border/30">
                      {article.image_url && (
                        <div className="w-full md:w-1/3 aspect-[16/9] rounded-xl overflow-hidden relative">
                          <Image 
                            src={article.image_url} 
                            alt={article.title} 
                            fill 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      <div className="w-full md:w-2/3 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-primary font-semibold text-xs tracking-wider uppercase">
                            {article.source_name || 'News'}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar size={14} /> {formatDate(article.published_at, locale)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {excerpt && (
                          <p className="text-base text-muted-foreground line-clamp-2 mb-4">
                            {excerpt}
                          </p>
                        )}
                        {article.source_url && (
                          <Link
                            href={article.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:opacity-80 transition-opacity mt-auto"
                          >
                            {t('readOriginal')} <ExternalLink size={14} />
                          </Link>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Sidebar */}
              <aside className="md:col-span-4 space-y-8 mt-12 md:mt-0">
                {/* Trending Widget */}
                <div className="bg-card rounded-2xl p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-border/30">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <TrendingUp className="text-primary" size={24} /> {locale === 'ar' ? 'الشائع الآن' : 'Trending Now'}
                  </h3>
                  <ul className="space-y-4">
                    <li className="border-b border-border pb-4 last:border-0 last:pb-0 group cursor-pointer">
                      <span className="font-semibold text-xs text-primary mb-1 block">#01 {locale === 'ar' ? 'دليل محلي' : 'Local Guide'}</span>
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {locale === 'ar' ? 'أفضل 5 شواطئ مخفية يعرفها السكان المحليون فقط' : 'Top 5 Hidden Beaches Only Locals Know'}
                      </h4>
                    </li>
                    <li className="border-b border-border pb-4 last:border-0 last:pb-0 group cursor-pointer">
                      <span className="font-semibold text-xs text-primary mb-1 block">#02 {locale === 'ar' ? 'مواصلات' : 'Transport'}</span>
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {locale === 'ar' ? 'الإعلان عن جدول مسار القطار السريع الجديد' : 'New High-Speed Train Route Schedule Announced'}
                      </h4>
                    </li>
                    <li className="border-b border-border pb-4 last:border-0 last:pb-0 group cursor-pointer">
                      <span className="font-semibold text-xs text-primary mb-1 block">#03 {locale === 'ar' ? 'الطقس' : 'Weather'}</span>
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {locale === 'ar' ? 'توقع درجات حرارة معتدلة ومثالية طوال عطلة نهاية الأسبوع' : 'Perfect Mild Temperatures Expected All Weekend'}
                      </h4>
                    </li>
                  </ul>
                </div>

                {/* Newsletter Subscribe */}
                <div className="bg-primary/10 rounded-2xl p-6 text-primary-foreground shadow-lg relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                  <h3 className="text-2xl font-bold mb-2 relative z-10 text-foreground">{locale === 'ar' ? 'ابق على اطلاع' : 'Stay Updated'}</h3>
                  <p className="text-sm mb-6 opacity-90 relative z-10 text-muted-foreground">
                    {locale === 'ar' ? 'احصل على أفضل الفعاليات والأخبار المحلية مباشرة في بريدك الإلكتروني أسبوعياً.' : 'Get the best local events and news delivered straight to your inbox weekly.'}
                  </p>
                  <form className="relative z-10">
                    <div className="flex flex-col gap-3">
                      <input 
                        className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" 
                        placeholder={locale === 'ar' ? 'عنوان بريدك الإلكتروني' : 'Your email address'} 
                        type="email" 
                      />
                      <button 
                        className="w-full bg-primary text-primary-foreground font-semibold text-xs py-3 rounded-lg uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm" 
                        type="button"
                      >
                        {locale === 'ar' ? 'اشترك' : 'Subscribe'}
                      </button>
                    </div>
                  </form>
                </div>
              </aside>
            </section>
          </>
        ) : (
          <EmptyState icon="📰" title={locale === 'ar' ? 'لا توجد أخبار' : 'No news available'} />
        )}
      </main>
    </>
  )
}