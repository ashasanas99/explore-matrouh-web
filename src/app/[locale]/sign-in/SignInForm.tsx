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

interface SignInFormProps {
  locale: string
}

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function SignInForm({ locale }: SignInFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const isRtl = locale === 'ar'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (authError) {
      setError(authError.message)
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
    signIn: locale === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    welcomeBack: locale === 'ar' ? 'مرحباً بعودتك' : 'Welcome back',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
    password: locale === 'ar' ? 'كلمة المرور' : 'Password',
    forgotPassword: locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?',
    continueWithGoogle: locale === 'ar' ? 'المتابعة مع Google' : 'Continue with Google',
    or: locale === 'ar' ? 'أو' : 'OR',
    dontHaveAccount: locale === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?",
    signUp: locale === 'ar' ? 'إنشاء حساب' : 'Sign Up',
    appName: locale === 'ar' ? 'استكشف مطروح' : 'Explore Matrouh',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-white flex flex-col items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold font-sans">M</span>
          </div>
          <h1 className="text-2xl font-bold font-sans text-foreground">{t.appName}</h1>
          <p className="text-muted-foreground font-sans mt-1 text-sm">{t.welcomeBack}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow space-y-4">
          {error && <InlineBanner type="error" message={error} />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label={t.email}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <PasswordField
              label={t.password}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <button type="button" className="text-xs font-semibold text-primary font-sans hover:opacity-80">
                {t.forgotPassword}
              </button>
            </div>

            <PrimaryButton type="submit" loading={isSubmitting} fullWidth>
              {t.signIn}
            </PrimaryButton>
          </form>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-border" />
            <span className="text-xs text-muted-foreground font-sans">{t.or}</span>
            <hr className="flex-1 border-border" />
          </div>

          <GoogleButton
            label={t.continueWithGoogle}
            loading={googleLoading}
            onClick={handleGoogle}
          />
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground font-sans">
          {t.dontHaveAccount}{' '}
          <Link href={`/${locale}/sign-up`} className="font-bold text-primary hover:opacity-80">
            {t.signUp}
          </Link>
        </p>
      </div>
    </div>
  )
}
