import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalizedField(
  item: Record<string, unknown>,
  field: string,
  locale: string
): string {
  const arField = field + '_ar'
  if (locale === 'ar' && item[arField]) {
    return item[arField] as string
  }
  return (item[field] as string) || ''
}

export function getTimeGreeting(locale: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good Morning'
  if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good Afternoon'
  return locale === 'ar' ? 'مساء النور' : 'Good Evening'
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
}

export function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getWaveStatus(waveHeight: number | null): {
  color: string
  bg: string
  label: string
  flag: string
} {
  if (!waveHeight || waveHeight < 1.0) {
    return { color: 'text-green-700', bg: 'bg-green-100', label: 'Safe to Swim', flag: 'green' }
  }
  if (waveHeight < 1.5) {
    return { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Proceed with Caution', flag: 'amber' }
  }
  return { color: 'text-red-700', bg: 'bg-red-100', label: 'Danger: Do Not Swim', flag: 'red' }
}

export const WEATHER_CONDITIONS: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Icy Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy Drizzle', icon: '🌦️' },
  61: { label: 'Light Rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Light Snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  80: { label: 'Rain Showers', icon: '🌦️' },
  81: { label: 'Rain Showers', icon: '🌦️' },
  82: { label: 'Violent Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Hail Storm', icon: '⛈️' },
  99: { label: 'Heavy Hail Storm', icon: '⛈️' },
}

export function getWeatherInfo(code: number): { label: string; icon: string } {
  return WEATHER_CONDITIONS[code] || { label: 'Unknown', icon: '🌡️' }
}
