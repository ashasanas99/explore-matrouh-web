import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://explore-matrouh.com'
  const supabase = await createClient()

  const [{ data: places }, { data: categories }, { data: news }] = await Promise.all([
    supabase.from('places').select('id, updated_at'),
    supabase.from('categories').select('slug, id'),
    supabase.from('news').select('id, published_at'),
  ])

  const staticPages: MetadataRoute.Sitemap = ['en', 'ar'].flatMap((locale) => [
    { url: `${baseUrl}/${locale}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/${locale}/all-categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/${locale}/offers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/${locale}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/${locale}/weather`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.6 },
    { url: `${baseUrl}/${locale}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ])

  const placePages: MetadataRoute.Sitemap = (places || []).flatMap((p) =>
    ['en', 'ar'].map((locale) => ({
      url: `${baseUrl}/${locale}/place/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  )

  const categoryPages: MetadataRoute.Sitemap = (categories || []).flatMap((c) =>
    ['en', 'ar'].map((locale) => ({
      url: `${baseUrl}/${locale}/category/${c.slug || c.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  const newsPages: MetadataRoute.Sitemap = (news || []).flatMap((n) =>
    ['en', 'ar'].map((locale) => ({
      url: `${baseUrl}/${locale}/news/${n.id}`,
      lastModified: new Date(n.published_at),
      changeFrequency: 'never' as const,
      priority: 0.6,
    }))
  )

  return [...staticPages, ...placePages, ...categoryPages, ...newsPages]
}
