'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PasswordField, InlineBanner } from '@/components/shared/FormFields'
import { PrimaryButton } from '@/components/shared/Buttons'
import { toast } from 'sonner'

export default function ChangePasswordForm({ locale }: { locale: string }) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isRtl = locale === 'ar'

  const t = {
    newPassword: locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    updatePassword: locale === 'ar' ? 'تحديث كلمة المرور' : 'Update Password',
    passwordUpdated: locale === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!',
    mismatch: locale === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match',
    tooShort: locale === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Password must be at least 6 characters',
  }

  async function handleSave() {
    setError('')
    if (newPassword.length < 6) { setError(t.tooShort); return }
    if (newPassword !== confirmPassword) { setError(t.mismatch); return }
    setSaving(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({ password: newPassword })
    if (authError) {
      setError(authError.message)
    } else {
      toast.success(t.passwordUpdated)
      router.push(`/${locale}/profile`)
    }
    setSaving(false)
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      {error && <InlineBanner type="error" message={error} />}
      <PasswordField label={t.newPassword} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
      <PasswordField label={t.confirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
      <PrimaryButton onClick={handleSave} loading={saving} fullWidth>{t.updatePassword}</PrimaryButton>
    </div>
  )
}
