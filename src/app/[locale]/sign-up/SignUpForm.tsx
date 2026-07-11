'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { FormField, PasswordField, InlineBanner } from '@/components/shared/FormFields'
import { PrimaryButton, GoogleButton } from '@/components/shared/Buttons'

interface SignUpFormProps {
  locale: string
}

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export default function SignUpForm({ locale }: SignUpFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const isRtl = locale === 'ar'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setError('')
    setSuccess('')
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    })
    if (authError) {
      setError(authError.message)
      return
    }
    if (!data.session) {
      setSuccess(locale === 'ar' ? 'تحقق من بريدك الإلكتروني لتأكيد حسابك.' : 'Check your email to confirm your account.')
      return
    }
    router.push(`/${locale}`)
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/${locale}` },
    })
  }

  const t = {
    signUp: locale === 'ar' ? 'إنشاء حساب' : 'Sign Up',
    createAccount: locale === 'ar' ? 'أنشئ حسابك' : 'Create your account',
    fullName: locale === 'ar' ? 'الاسم الكامل' : 'Full Name',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
    phone: locale === 'ar' ? 'الهاتف' : 'Phone',
    password: locale === 'ar' ? 'كلمة المرور' : 'Password',
    confirmPassword: locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    continueWithGoogle: locale === 'ar' ? 'المتابعة مع Google' : 'Continue with Google',
    or: locale === 'ar' ? 'أو' : 'OR',
    alreadyHaveAccount: locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    signIn: locale === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    appName: locale === 'ar' ? 'استكشف مطروح' : 'Explore Matrouh',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-white flex flex-col items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold font-sans">M</span>
          </div>
          <h1 className="text-2xl font-bold font-sans text-foreground">{t.appName}</h1>
          <p className="text-muted-foreground font-sans mt-1 text-sm">{t.createAccount}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow space-y-4">
          {error && <InlineBanner type="error" message={error} />}
          {success && <InlineBanner type="success" message={success} />}

          {!success && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label={t.fullName} type="text" autoComplete="name" placeholder="John Doe" error={errors.fullName?.message} {...register('fullName')} />
              <FormField label={t.email} type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
              <FormField label={t.phone} type="tel" autoComplete="tel" placeholder="+20 xxx xxx xxxx" {...register('phone')} />
              <PasswordField label={t.password} autoComplete="new-password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
              <PasswordField label={t.confirmPassword} autoComplete="new-password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              <PrimaryButton type="submit" loading={isSubmitting} fullWidth>{t.signUp}</PrimaryButton>
            </form>
          )}

          {!success && (
            <>
              <div className="flex items-center gap-3">
                <hr className="flex-1 border-border" />
                <span className="text-xs text-muted-foreground font-sans">{t.or}</span>
                <hr className="flex-1 border-border" />
              </div>
              <GoogleButton label={t.continueWithGoogle} loading={googleLoading} onClick={handleGoogle} />
            </>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground font-sans">
          {t.alreadyHaveAccount}{' '}
          <Link href={`/${locale}/sign-in`} className="font-bold text-primary hover:opacity-80">{t.signIn}</Link>
        </p>
      </div>
    </div>
  )
}
