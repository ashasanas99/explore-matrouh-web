import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, User, Heart, Star, MapPin, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import TopAppBar from '@/components/layout/TopAppBar'
import DesktopNav from '@/components/layout/DesktopNav'
import LogoutButton from './LogoutButton'

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false },
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isRtl = locale === 'ar'

  if (!user) {
    return (
      <>
        <DesktopNav locale={locale} />
        <TopAppBar title={t('profile')} locale={locale} backHref={`/${locale}`} />
        <main className="flex-grow pt-8 md:pt-12 px-gutter-mobile md:px-gutter-desktop pb-section-gap max-w-container-max-width mx-auto w-full" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-dim flex items-center justify-center mb-4">
              <Lock size={28} className="text-on-surface-variant" />
            </div>
            <h2 className="text-headline-md font-headline-md text-on-surface mb-2">{t('loginRequired')}</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mb-6 max-w-xs">{t('loginRequiredMsg')}</p>
            <Link
              href={`/${locale}/sign-in`}
              className="bg-primary-container text-on-primary font-label-md text-label-md py-3 px-8 rounded-lg hover:bg-primary transition-colors shadow-sm active:scale-95 duration-150"
            >
              {t('logIn')}
            </Link>
          </div>
        </main>
      </>
    )
  }

  const [
    { data: profile },
    { data: favorites },
    { count: reviewsCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('favorites').select('*, places(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  ])

  return (
    <>
      <DesktopNav locale={locale} />
      <TopAppBar title={t('profile')} locale={locale} backHref={`/${locale}`} />

      <main className="flex-grow pt-8 md:pt-12 px-gutter-mobile md:px-gutter-desktop pb-section-gap max-w-container-max-width mx-auto w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Profile Header */}
        <section className="bg-surface rounded-[16px] shadow-[0px_10px_30px_rgba(0,0,0,0.04)] p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt={profile.full_name || ''} 
                width={128} 
                height={128} 
                className="w-32 h-32 rounded-full object-cover shadow-sm" 
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-surface-dim flex items-center justify-center shadow-sm">
                <User className="w-12 h-12 text-on-surface-variant" />
              </div>
            )}
          </div>
          <div className="text-center md:text-start flex-grow">
            <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">
              {profile?.full_name || user.email}
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant">
              {locale === 'ar' ? 'مسافر' : 'Traveler'} • {reviewsCount || 0} {locale === 'ar' ? 'تقييمات' : 'Reviews'} • {locale === 'ar' ? 'انضم' : 'Joined'} {new Date(user.created_at).getFullYear()}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Link 
              href={`/${locale}/profile/edit`} 
              className="bg-primary-container text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-primary transition-colors shadow-sm active:scale-95 duration-150 flex items-center justify-center gap-2"
            >
              <Pencil className="w-[18px] h-[18px]" />
              {t('editProfile')}
            </Link>
            <LogoutButton locale={locale} label={t('logout')} />
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b border-outline-variant/30 mb-8 overflow-x-auto scrollbar-hide">
          <ul className="flex space-x-8 rtl:space-x-reverse min-w-max">
            <li className="pb-3 border-b-2 border-primary-container text-primary-container font-headline-sm text-headline-sm cursor-pointer">
              {t('myFavorites')}
            </li>
            <li className="pb-3 text-on-surface-variant font-headline-sm text-headline-sm cursor-pointer hover:text-on-surface transition-colors">
              <Link href={`/${locale}/profile/change-password`}>{t('changePassword')}</Link>
            </li>
            {profile?.is_admin && (
              <li className="pb-3 text-on-surface-variant font-headline-sm text-headline-sm cursor-pointer hover:text-on-surface transition-colors">
                <Link href={`/${locale}/admin`}>{t('adminDashboard')}</Link>
              </li>
            )}
          </ul>
        </div>

        {/* Saved Places Grid */}
        <section>
          <h2 className="text-headline-md font-headline-md mb-6">{locale === 'ar' ? 'الأماكن المحفوظة' : 'Saved Places'}</h2>
          
          {favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((fav) => {
                const place = fav.places
                if (!place) return null
                const name = locale === 'ar' && place.name_ar ? place.name_ar : place.name

                return (
                  <div key={fav.id} className="bg-surface rounded-[16px] shadow-[0px_10px_30px_rgba(0,0,0,0.04)] overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <Link href={`/${locale}/place/${place.id}`}>
                      <div className="relative h-48">
                        {place.image_url ? (
                          <Image 
                            src={place.image_url} 
                            alt={name} 
                            fill 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" 
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-dim flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md rounded-full p-2 flex items-center justify-center shadow-sm">
                          <Heart className="w-5 h-5 text-primary-container fill-current" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-headline-sm font-headline-sm truncate pr-2">{name}</h3>
                          {place.rating > 0 && (
                            <div className="flex items-center gap-1 text-label-md font-label-md shrink-0">
                              <Star className="w-4 h-4 text-[#F59E0B] fill-current" />
                              {place.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                        {place.address && (
                          <div className="flex items-center gap-1 text-on-surface-variant text-body-sm font-body-sm mb-3">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{place.address}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-on-surface-variant text-body-md font-body-md">
              {locale === 'ar' ? 'لم تقم بحفظ أي أماكن بعد.' : 'You haven\'t saved any places yet.'}
            </p>
          )}
        </section>
      </main>
    </>
  )
}