export interface AppSettings {
  id: string
  whatsapp: string | null
  facebook: string | null
  instagram: string | null
  email: string | null
  website: string | null
  tiktok: string | null
  playstore_link: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  name_ar: string
  slug: string | null
  image_url: string | null
  sort_order: number
  created_at: string
}

export interface Place {
  id: string
  name: string
  name_ar: string
  category_id: string | null
  description: string | null
  description_ar: string | null
  address: string | null
  google_maps_url: string | null
  phone: string | null
  price_level: '$' | '$$' | '$$$' | null
  status: 'Open' | 'Closed' | 'Seasonal'
  image_url: string | null
  image_gallery_url: string[]
  whatsapp_number: string | null
  whatsapp_message: string | null
  is_featured: boolean
  has_offers: boolean
  rating: number
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
  categories?: Category | null
}

export interface Favorite {
  id: string
  user_id: string
  place_id: string
  created_at: string
  places?: Place | null
}

export interface Review {
  id: string
  user_id: string
  place_id: string
  rating: number
  comment: string | null
  user_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface NewsArticle {
  id: string
  title: string
  content: string | null
  image_url: string | null
  source_name: string | null
  source_url: string | null
  published_at: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface WeatherData {
  temperature: number
  weatherCode: number
  windSpeed: number
  humidity: number
  waveHeight: number | null
  condition: string
  icon: string
}

export interface ForecastDay {
  date: string
  dayName: string
  weatherCode: number
  tempMax: number
  tempMin: number
  condition: string
  icon: string
}
