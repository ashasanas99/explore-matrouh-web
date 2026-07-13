'use client'

import { useEffect, useState } from 'react'
import { Wind, Droplets, Waves, Flag } from 'lucide-react'
import { getWeatherInfo, getWaveStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'

const LAT = 31.3525
const LON = 27.2373

interface WeatherState {
  temperature: number
  weatherCode: number
  windSpeed: number
  humidity: number
  waveHeight: number | null
}

interface ForecastDay {
  date: string
  dayName: string
  weatherCode: number
  tempMax: number
  tempMin: number
}

export default function WeatherContent({ locale }: { locale: string }) {
  const [weather, setWeather] = useState<WeatherState | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isRtl = locale === 'ar'

  const t = {
    waveHeight: locale === 'ar' ? 'ارتفاع الأمواج' : 'Wave Height',
    windSpeed: locale === 'ar' ? 'سرعة الرياح' : 'Wind Speed',
    humidity: locale === 'ar' ? 'الرطوبة' : 'Humidity',
    seaStatus: locale === 'ar' ? 'حالة البحر' : 'Sea Status',
    safeToSwim: locale === 'ar' ? 'آمن للسباحة' : 'Safe to Swim',
    proceedCaution: locale === 'ar' ? 'تابع بحذر' : 'Proceed with Caution',
    dangerDoNotSwim: locale === 'ar' ? 'خطر: لا تسبح' : 'Danger: Do Not Swim',
    forecast: locale === 'ar' ? 'توقعات 7 أيام' : '7-Day Forecast',
    loading: locale === 'ar' ? 'جاري التحميل...' : 'Loading weather...',
    locationName: locale === 'ar' ? 'مرسى مطروح' : 'Mersa Matrouh',
    today: locale === 'ar' ? 'اليوم' : 'Today',
  }

  useEffect(() => {
    async function fetchWeather() {
      try {
        const [weatherRes, marineRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Africa%2FCairo&forecast_days=7`),
          fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}&current=wave_height&timezone=Africa%2FCairo`),
        ])

        const weatherData = await weatherRes.json()
        const marineData = await marineRes.json()

        setWeather({
          temperature: Math.round(weatherData.current.temperature_2m),
          weatherCode: weatherData.current.weather_code,
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
          humidity: weatherData.current.relative_humidity_2m,
          waveHeight: marineData.current?.wave_height ?? null,
        })

        const days = weatherData.daily.time.map((date: string, i: number) => ({
          date,
          dayName: new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
          weatherCode: weatherData.daily.weather_code[i],
          tempMax: Math.round(weatherData.daily.temperature_2m_max[i]),
          tempMin: Math.round(weatherData.daily.temperature_2m_min[i]),
        }))
        setForecast(days)
      } catch (err) {
        setError(locale === 'ar' ? 'تعذر تحميل بيانات الطقس' : 'Could not load weather data')
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [locale])

  if (loading) {
    return (
      <main className="flex-grow w-full">
        <div className="w-full h-[600px] bg-surface-dim animate-pulse" />
        <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-section-gap grid grid-cols-12 gap-gutter-desktop">
          <div className="col-span-12 lg:col-span-8 h-64 bg-surface-dim rounded-xl animate-pulse" />
          <div className="col-span-12 lg:col-span-4 h-64 bg-surface-dim rounded-xl animate-pulse" />
        </div>
      </main>
    )
  }

  if (error || !weather) {
    return <p className="text-center py-12 text-on-surface-variant font-body-md">{error}</p>
  }

  const { icon, label } = getWeatherInfo(weather.weatherCode)
  const waveStatus = getWaveStatus(weather.waveHeight)
  const waveLabel = weather.waveHeight && weather.waveHeight >= 1.5
    ? t.dangerDoNotSwim
    : weather.waveHeight && weather.waveHeight >= 1.0
    ? t.proceedCaution
    : t.safeToSwim

  return (
    <main className="flex-grow w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section 
        className="relative w-full h-[600px] flex items-center px-margin-mobile md:px-margin-desktop bg-cover bg-center" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDRpcqvES8Nd6-HXTzCGMWK_wKSTYZ31E0Kxgzhs4Ndc52td-s9u6Te6TkgIYh1F_TjboLUP-EroMTjVGnAGAicJg0czr4LljQU0jyXtvMyTnVMaYLu22wEtoB_7-d_9YQOE2AEKLo31CwGKzZqFqAgrshiYgi-9t9hygothpLpTpIJd1Gdx98G6i41iIq9eUhVUL5mRhHe1suaWEM98M7SaLuDLqHdbnlkysPCYt2OqtyRjqQFWlVuOap6RlLbixclQXigScr5iOv2')" }}
      >
        {/* Glassmorphism Weather Overlay */}
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full md:mx-12 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary mb-1">{t.locationName}</h2>
              <p className="font-body-md text-body-md text-secondary">{t.today}</p>
            </div>
            <span className="text-5xl">{icon}</span>
          </div>
          
          <div className="flex items-end gap-4 mb-6">
            <span className="font-display text-display text-on-background">{weather.temperature}°</span>
            <span className="font-headline-sm text-headline-sm text-secondary pb-2">{label}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant/30">
            <div className="flex items-center gap-2">
              <Droplets className="text-primary w-6 h-6" />
              <div>
                <p className="font-label-md text-label-md text-secondary uppercase tracking-wider">{t.humidity}</p>
                <p className="font-body-md text-body-md font-semibold">{weather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="text-primary w-6 h-6" />
              <div>
                <p className="font-label-md text-label-md text-secondary uppercase tracking-wider">{t.windSpeed}</p>
                <p className="font-body-md text-body-md font-semibold">{weather.windSpeed} km/h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-section-gap grid grid-cols-12 gap-gutter-desktop">
        
        {/* 7-Day Forecast (Spans 8 columns on desktop) */}
        <div className="col-span-12 lg:col-span-8">
          <h3 className="font-headline-lg text-headline-lg text-on-background mb-8">{t.forecast}</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-margin-mobile px-margin-mobile sm:mx-0 sm:px-0">
            {forecast.map((day, index) => {
              const { icon: dayIcon } = getWeatherInfo(day.weatherCode)
              return (
                <div key={day.date} className="bg-surface-container-lowest rounded-xl p-6 min-w-[140px] flex-shrink-0 flex flex-col items-center shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20 hover:-translate-y-1 transition-transform duration-300">
                  <p className="font-body-md text-body-md font-semibold mb-3">
                    {index === 0 ? t.today : day.dayName}
                  </p>
                  <span className="text-3xl mb-4">{dayIcon}</span>
                  <div className="flex gap-3 font-body-md text-body-md">
                    <span className="font-semibold text-on-background">{day.tempMax}°</span>
                    <span className="text-secondary">{day.tempMin}°</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sea Conditions Widget (Spans 4 columns on desktop) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <h3 className="font-headline-lg text-headline-lg text-on-background mb-8">{t.seaStatus}</h3>
          <div className="relative rounded-2xl overflow-hidden flex-grow shadow-[0px_10px_30px_rgba(0,0,0,0.08)] min-h-[300px]">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkDZG79Esgn9WLAFXt46d0sufBQCIhrH_d6bua_IWsEZ1asOjiaGcMoOtqKmNboGUAm8njJgSnoPf6bWG-b5iQwiHzWZq8v574Uo7vdyD02FK6nMh45q2sWFcOtGkDMzzLUFUFUs7caKy813rApPF-6Mpi_u4_CB26dy_GL_LVemCctF1BOfUsRVnmRKf3a9dJgZYqnxOpCDuo0jNSPH41hT4KhMXFNmQpRomQiwMAh07PZQA2ble0nfbtwDpENkg1InANX7PrVK0s')" }}
            ></div>
            <div className="absolute inset-0 bg-primary/20"></div>
            <div className="relative h-full w-full glass-panel flex flex-col justify-center p-8 border-none bg-white/60">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Waves className="text-primary w-6 h-6" />
                  <span className="font-headline-sm text-headline-sm text-on-background font-semibold">{t.waveHeight}</span>
                </div>
                <p className="font-display text-display text-primary">
                  {weather.waveHeight != null ? weather.waveHeight.toFixed(1) : 'N/A'} <span className="font-headline-sm text-headline-sm text-secondary">m</span>
                </p>
              </div>
              <div className="w-full h-[1px] bg-outline-variant/30 my-4"></div>
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <Flag className={cn("w-6 h-6", waveStatus.color)} />
                  <span className="font-headline-sm text-headline-sm text-on-background font-semibold">{t.seaStatus}</span>
                </div>
                <p className={cn("font-headline-sm text-headline-sm mt-1", waveStatus.color)}>{waveLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </main>
  )
}