'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FormField, InlineBanner } from '@/components/shared/FormFields'
import { PrimaryButton } from '@/components/shared/Buttons'

interface EditProfileFormProps {
  locale: string
  initialName: string
  email: string
  avatarUrl: string | null
  userId: string
}

export default function EditProfileForm({ locale, initialName, email, avatarUrl: initialAvatarUrl, userId }: EditProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initialName || '')
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const isRtl = locale === 'ar'

  const t = {
    fullName: locale === 'ar' ? 'الاسم الكامل' : 'Full Name',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
    emailReadOnly: locale === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed',
    tapToChangePhoto: locale === 'ar' ? 'انقر لتغيير الصورة' : 'Tap to change photo',
    saveChanges: locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes',
    profileUpdated: locale === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!',
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) {
      toast.error(uploadError.message)
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl + '?t=' + Date.now())
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!fullName.trim()) { setError(locale === 'ar' ? 'الاسم مطلوب' : 'Name is required'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const [profileRes, authRes] = await Promise.all([
      supabase.from('profiles').update({ full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq('id', userId),
      supabase.auth.updateUser({ data: { full_name: fullName, avatar_url: avatarUrl } }),
    ])
    if (profileRes.error) {
      setError(profileRes.error.message)
    } else {
      toast.success(t.profileUpdated)
      router.push(`/${locale}/profile`)
    }
    setSaving(false)
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {error && <InlineBanner type="error" message={error} />}

      {/* Avatar picker */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted ring-4 ring-primary/20 cursor-pointer" onClick={() => fileRef.current?.click()}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <User size={36} className="text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Camera size={20} className="text-white" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-sans mt-2">{uploading ? '...' : t.tapToChangePhoto}</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Fields */}
      <FormField
        label={t.fullName}
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="John Doe"
      />
      <FormField
        label={t.email}
        type="email"
        value={email}
        disabled
        readOnly
        className="opacity-60 cursor-not-allowed"
      />
      <p className="text-xs text-muted-foreground font-sans -mt-3">{t.emailReadOnly}</p>

      <PrimaryButton onClick={handleSave} loading={saving || uploading} fullWidth>
        {t.saveChanges}
      </PrimaryButton>
    </div>
  )
}
