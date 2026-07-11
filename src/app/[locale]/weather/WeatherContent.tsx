'use client'

import { useEffect, useState } from 'react'
import { Wind, Droplets, Waves, Flag, Calendar } from 'lucide-react'
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
    locationName: locale === 'ar' ? 'مرسى مطروح، مصر' : 'Marsa Matrouh, Egypt',
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
      <div className="px-4 py-6 space-y-4">
        <div className="h-48 bg-muted rounded-3xl animate-pulse" />
        <div className="h-32 bg-muted rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !weather) {
    return <p className="text-center py-12 text-muted-foreground font-sans">{error}</p>
  }

  const { icon, label } = getWeatherInfo(weather.weatherCode)
  const waveStatus = getWaveStatus(weather.waveHeight)
  const waveLabel = weather.waveHeight && weather.waveHeight >= 1.5
    ? t.dangerDoNotSwim
    : weather.waveHeight && weather.waveHeight >= 1.0
    ? t.proceedCaution
    : t.safeToSwim

  return (
    <main className="px-4 py-4 space-y-4 max-w-lg mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero weather card */}
      <div className="bg-gradient-to-br from-primary to-emerald-700 rounded-3xl p-6 text-white">
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{icon}</div>
          <div className="text-5xl font-bold font-sans">{weather.temperature}°C</div>
          <p className="text-white/80 font-sans mt-1 text-sm">{label}</p>
          <p className="text-white/60 font-sans text-xs mt-0.5">{t.locationName}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
          <div className="text-center">
            <Wind size={18} className="mx-auto mb-1 text-white/70" />
            <p className="text-sm font-bold font-sans">{weather.windSpeed} km/h</p>
            <p className="text-xs text-white/60 font-sans">{t.windSpeed}</p>
          </div>
          <div className="text-center">
            <Droplets size={18} className="mx-auto mb-1 text-white/70" />
            <p className="text-sm font-bold font-sans">{weather.humidity}%</p>
            <p className="text-xs text-white/60 font-sans">{t.humidity}</p>
          </div>
          <div className="text-center">
            <Waves size={18} className="mx-auto mb-1 text-white/70" />
            <p className="text-sm font-bold font-sans">
              {weather.waveHeight != null ? `${weather.waveHeight.toFixed(1)}m` : 'N/A'}
            </p>
            <p className="text-xs text-white/60 font-sans">{t.waveHeight}</p>
          </div>
        </div>
      </div>

      {/* Sea Status */}
      <div className={cn('rounded-2xl p-4 border', waveStatus.bg)}>
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', waveStatus.bg)}>
            <Flag size={20} className={waveStatus.color} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground font-sans">{t.seaStatus}</p>
            <p className={cn('font-bold font-sans text-sm', waveStatus.color)}>{waveLabel}</p>
          </div>
        </div>
      </div>

      {/* 7-day forecast */}
      {forecast.length > 0 && (
        <div className="bg-white rounded-2xl card-shadow border border-border/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <h2 className="font-bold font-sans text-sm">{t.forecast}</h2>
            </div>
          </div>
          <div className="divide-y divide-border">
            {forecast.map((day) => {
              const { icon: dayIcon, label: dayLabel } = getWeatherInfo(day.weatherCode)
              return (
                <div key={day.date} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold font-sans w-16">{day.dayName}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xl">{dayIcon}</span>
                    <span className="text-xs text-muted-foreground font-sans">{dayLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-sans">
                    <span className="font-bold">{day.tempMax}°</span>
                    <span className="text-muted-foreground">{day.tempMin}°</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
