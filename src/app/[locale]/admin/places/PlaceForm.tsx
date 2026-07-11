'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, X, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FormField, InlineBanner } from '@/components/shared/FormFields'
import { PrimaryButton } from '@/components/shared/Buttons'
import type { Category, Place } from '@/types'
import { cn } from '@/lib/utils'

interface PlaceFormProps {
  locale: string
  categories: Category[]
  place?: Place
  isEdit?: boolean
}

const initialForm = {
  name: '', name_ar: '', category_id: '', description: '', description_ar: '',
  address: '', google_maps_url: '', phone: '', price_level: '' as '' | '$' | '$$' | '$$$',
  status: 'Open' as 'Open' | 'Closed' | 'Seasonal',
  whatsapp_number: '', whatsapp_message: '', is_featured: false, has_offers: false,
}

export default function PlaceForm({ locale, categories, place, isEdit }: PlaceFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    ...initialForm,
    ...(place ? {
      name: place.name || '',
      name_ar: place.name_ar || '',
      category_id: place.category_id || '',
      description: place.description || '',
      description_ar: place.description_ar || '',
      address: place.address || '',
      google_maps_url: place.google_maps_url || '',
      phone: place.phone || '',
      price_level: (place.price_level || '') as '' | '$' | '$$' | '$$$',
      status: place.status as 'Open' | 'Closed' | 'Seasonal',
      whatsapp_number: place.whatsapp_number || '',
      whatsapp_message: place.whatsapp_message || '',
      is_featured: place.is_featured || false,
      has_offers: place.has_offers || false,
    } : {}),
  })
  const [mainImage, setMainImage] = useState<string | null>(place?.image_url || null)
  const [gallery, setGallery] = useState<string[]>(Array.isArray(place?.image_gallery_url) ? place!.image_gallery_url : [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const mainImageRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const isRtl = locale === 'ar'

  function set(key: string, value: unknown) { setForm((f) => ({ ...f, [key]: value })) }

  async function uploadImage(file: File, path: string): Promise<string | null> {
    const supabase = createClient()
    const { error } = await supabase.storage.from('places').upload(path, file, { upsert: true })
    if (error) { toast.error(error.message); return null }
    const { data } = supabase.storage.from('places').getPublicUrl(path)
    return data.publicUrl + '?t=' + Date.now()
  }

  async function handleMainImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file, `${Date.now()}_main_${file.name}`)
    if (url) setMainImage(url)
    setUploading(false)
  }

  async function handleGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const url = await uploadImage(file, `${Date.now()}_gallery_${file.name}`)
      if (url) setGallery((g) => [...g, url])
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError(locale === 'ar' ? 'الاسم مطلوب' : 'Name is required'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const payload = {
      ...form,
      category_id: form.category_id || null,
      price_level: form.price_level || null,
      image_url: mainImage,
      image_gallery_url: gallery,
      updated_at: new Date().toISOString(),
    }

    if (isEdit && place) {
      const { error: dbError } = await supabase.from('places').update(payload).eq('id', place.id)
      if (dbError) setError(dbError.message)
      else { toast.success(locale === 'ar' ? 'تم تحديث المكان!' : 'Place updated!'); router.push(`/${locale}/place/${place.id}`) }
    } else {
      const { data, error: dbError } = await supabase.from('places').insert(payload).select().single()
      if (dbError) setError(dbError.message)
      else { toast.success(locale === 'ar' ? 'تم إضافة المكان!' : 'Place added!'); router.push(`/${locale}/place/${data.id}`) }
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!place) return
    setDeleting(true)
    const supabase = createClient()
    const { error: dbError } = await supabase.from('places').delete().eq('id', place.id)
    if (dbError) { setError(dbError.message); setDeleting(false) }
    else { toast.success(locale === 'ar' ? 'تم حذف المكان' : 'Place deleted'); router.push(`/${locale}/all-categories`) }
  }

  const t = {
    placeName: locale === 'ar' ? 'اسم المكان' : 'Place Name',
    placeNameAr: locale === 'ar' ? 'اسم المكان (عربي)' : 'Place Name (Arabic)',
    selectCategory: locale === 'ar' ? 'اختر الفئة' : 'Select Category',
    description: locale === 'ar' ? 'الوصف' : 'Description',
    descriptionAr: locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)',
    address: locale === 'ar' ? 'العنوان' : 'Address',
    googleMapsUrl: locale === 'ar' ? 'رابط خرائط Google' : 'Google Maps URL',
    phoneNumber: locale === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    priceLevel: locale === 'ar' ? 'مستوى السعر' : 'Price Level',
    status: locale === 'ar' ? 'الحالة' : 'Status',
    whatsappNumber: locale === 'ar' ? 'رقم واتساب' : 'WhatsApp Number',
    whatsappMessage: locale === 'ar' ? 'رسالة واتساب المخصصة' : 'Custom WhatsApp Message',
    featuredPlace: locale === 'ar' ? 'مكان مميز' : 'Featured Place',
    hasOffers: locale === 'ar' ? 'يحتوي على عروض' : 'Has Offers',
    mainImage: locale === 'ar' ? 'الصورة الرئيسية' : 'Main Image',
    gallery: locale === 'ar' ? 'صور المعرض' : 'Gallery Images',
    saveChanges: isEdit ? (locale === 'ar' ? 'تحديث المكان' : 'Update Place') : (locale === 'ar' ? 'إضافة المكان' : 'Add Place'),
    deletePlace: locale === 'ar' ? 'حذف المكان' : 'Delete Place',
    confirmDeleteMsg: locale === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا المكان؟' : 'Are you sure you want to delete this place?',
    cancel: locale === 'ar' ? 'إلغاء' : 'Cancel',
    delete: locale === 'ar' ? 'حذف' : 'Delete',
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      {error && <InlineBanner type="error" message={error} />}

      <FormField label={t.placeName} value={form.name} onChange={(e) => set('name', e.target.value)} />
      <FormField label={t.placeNameAr} value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} dir="rtl" />

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground font-sans">{t.selectCategory}</label>
        <select
          value={form.category_id}
          onChange={(e) => set('category_id', e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-border bg-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">{t.selectCategory}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground font-sans">{t.description}</label>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground font-sans">{t.descriptionAr}</label>
        <textarea value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} rows={3} dir="rtl" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      </div>

      <FormField label={t.address} value={form.address} onChange={(e) => set('address', e.target.value)} />
      <FormField label={t.googleMapsUrl} type="url" value={form.google_maps_url} onChange={(e) => set('google_maps_url', e.target.value)} />
      <FormField label={t.phoneNumber} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
      <FormField label={t.whatsappNumber} type="tel" value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} />

      {/* Price Level */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground font-sans">{t.priceLevel}</label>
        <select value={form.price_level} onChange={(e) => set('price_level', e.target.value)} className="w-full px-4 py-3.5 rounded-xl border border-border bg-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">—</option>
          <option value="$">$ (Budget)</option>
          <option value="$$">$$ (Mid-range)</option>
          <option value="$$$">$$$ (Luxury)</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground font-sans">{t.status}</label>
        <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full px-4 py-3.5 rounded-xl border border-border bg-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Seasonal">Seasonal</option>
        </select>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {[
          { key: 'is_featured', label: t.featuredPlace },
          { key: 'has_offers', label: t.hasOffers },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted cursor-pointer">
            <span className="text-sm font-semibold font-sans">{label}</span>
            <div
              onClick={() => set(key, !form[key as keyof typeof form])}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative cursor-pointer',
                form[key as keyof typeof form] ? 'bg-primary' : 'bg-border'
              )}
            >
              <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', form[key as keyof typeof form] ? 'left-7' : 'left-1')} />
            </div>
          </label>
        ))}
      </div>

      {/* Main image */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground font-sans">{t.mainImage}</label>
        <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
        {mainImage ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image src={mainImage} alt="Main" fill className="object-cover" />
            <button onClick={() => setMainImage(null)} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => mainImageRef.current?.click()} className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors">
            <Upload size={24} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-sans">{locale === 'ar' ? 'انقر لرفع الصورة' : 'Click to upload image'}</span>
          </button>
        )}
      </div>

      {/* Gallery */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground font-sans">{t.gallery}</label>
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryAdd} />
        <div className="flex flex-wrap gap-2">
          {gallery.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
              <Image src={img} alt="" fill className="object-cover" />
              <button onClick={() => setGallery(gallery.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                <X size={10} />
              </button>
            </div>
          ))}
          <button onClick={() => galleryRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors">
            <Plus size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <PrimaryButton onClick={handleSave} loading={saving || uploading} fullWidth>
        {t.saveChanges}
      </PrimaryButton>

      {isEdit && (
        <>
          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-sm text-center text-foreground font-sans font-semibold">{t.confirmDeleteMsg}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-xl border border-border font-semibold text-sm font-sans hover:bg-muted">{t.cancel}</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-destructive text-white font-bold text-sm font-sans disabled:opacity-50">{deleting ? '...' : t.delete}</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="w-full py-3 rounded-xl border border-destructive text-destructive font-semibold text-sm font-sans hover:bg-destructive-light transition-colors">
              {t.deletePlace}
            </button>
          )}
        </>
      )}
    </div>
  )
}
