'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FormField, InlineBanner } from '@/components/shared/FormFields'
import { PrimaryButton } from '@/components/shared/Buttons'
import type { AppSettings } from '@/types'

interface AdminSettingsFormProps {
  locale: string
  settings: AppSettings | null
}

const fields = [
  { key: 'whatsapp', labelEn: 'WhatsApp', labelAr: 'واتساب', type: 'tel' },
  { key: 'facebook', labelEn: 'Facebook', labelAr: 'فيسبوك', type: 'url' },
  { key: 'instagram', labelEn: 'Instagram', labelAr: 'إنستغرام', type: 'url' },
  { key: 'email', labelEn: 'Email', labelAr: 'البريد الإلكتروني', type: 'email' },
  { key: 'website', labelEn: 'Website', labelAr: 'الموقع الإلكتروني', type: 'url' },
  { key: 'tiktok', labelEn: 'TikTok', labelAr: 'تيك توك', type: 'url' },
  { key: 'playstore_link', labelEn: 'Google Play Store Link', labelAr: 'رابط Google Play', type: 'url' },
] as const

export default function AdminSettingsForm({ locale, settings }: AdminSettingsFormProps) {
  const [form, setForm] = useState({
    whatsapp: settings?.whatsapp || '',
    facebook: settings?.facebook || '',
    instagram: settings?.instagram || '',
    email: settings?.email || '',
    website: settings?.website || '',
    tiktok: settings?.tiktok || '',
    playstore_link: settings?.playstore_link || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isRtl = locale === 'ar'

  async function handleSave() {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('app_settings')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000001')
    if (dbError) setError(dbError.message)
    else toast.success(locale === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!')
    setSaving(false)
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {error && <InlineBanner type="error" message={error} />}
      {fields.map(({ key, labelEn, labelAr, type }) => (
        <FormField
          key={key}
          label={locale === 'ar' ? labelAr : labelEn}
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ))}
      <PrimaryButton onClick={handleSave} loading={saving} fullWidth>
        {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
      </PrimaryButton>
    </div>
  )
}
