'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { InlineBanner } from '@/components/shared/FormFields'
import { Mail, Lock } from 'lucide-react'

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
    signIn: locale === 'ar' ? 'تسجيل الدخول' : 'Sign in',
    welcomeBack: locale === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back',
    signInToContinue: locale === 'ar' ? 'سجل الدخول لمتابعة رحلتك.' : 'Sign in to continue your journey.',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email address',
    password: locale === 'ar' ? 'كلمة المرور' : 'Password',
    forgotPassword: locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?',
    rememberMe: locale === 'ar' ? 'تذكرني' : 'Remember me',
    continueWithGoogle: locale === 'ar' ? 'المتابعة مع Google' : 'Google',
    or: locale === 'ar' ? 'أو المتابعة باستخدام' : 'Or continue with',
    dontHaveAccount: locale === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?",
    signUp: locale === 'ar' ? 'إنشاء حساب' : 'Sign up',
  }

  return (
    <div className="h-full font-body-md text-on-surface antialiased bg-surface" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBJhYrcNQkgRjzvqGmfI7mnWz-qXSp9qacamhbNdyJSfl2-0ovby3Rfxjr9NVTqJ7kLSyHltwyQZbCftTSRYqlRb08IajStOvpllfUd4ZNXNhdgBM1raRcWMI6lr5pHKVJtwfeV0pA0H_n9jlwKhutiAnkH_OoNRlk6-eOrk6ijZpYSWamROdF8nnwbSgRU_MUpXJdqm1D1sfIHKrh8uQ6nF6zyrPceY-US3uzu_nqoRZ7KAVh69vOoSP8qvSGHfWDfVuuJpp9wFrQ5')" }}
        ></div>
        {/* Dark blurred overlay */}
        <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-md"></div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-margin-desktop">
        {/* Glassmorphism Login Card */}
        <div className="w-full max-w-[420px] rounded-[16px] bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8 border border-white/50">
          
          {/* Logo Area */}
          <div className="mb-8 flex justify-center">
            <img 
              alt="Explore Matrouh Logo" 
              className="h-12 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLt-vWaFHkSlBQKBsLe6UyHYpcV3--lt66u5sbaEij48ftIcmZCDsEJenECUrB7hTmnKuvWfAFyrS4vLmSu8ApMDGcdhzsOnAyw80RxyLoS2uP8l8oQdmsxNep2o5O5ecELVo8Lv9www3thYTnH0pL3q1UdEHw0uqJpbCKMhkL0hL_b3I2Zfb7VrPgAwSW2gLUcwnt3rXrKCZETbpHRnSpq6wLxJrKFAQs7hQ0IeIDZje7Nynrgs2XicOeQ"
            />
          </div>

          {/* Header text */}
          <div className="text-center mb-8">
            <h1 className="font-headline-sm text-headline-sm text-on-surface mb-2">{t.welcomeBack}</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t.signInToContinue}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && <InlineBanner type="error" message={error} className="mb-4" />}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">{t.email}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3">
                  <Mail className="h-5 w-5 text-outline" />
                </div>
                <input 
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t.email}
                  className="block w-full rounded-lg border-0 py-3 pl-10 rtl:pl-3 rtl:pr-10 text-on-surface ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary bg-white/50 backdrop-blur-sm sm:font-body-md sm:text-body-md transition-all"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">{t.password}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3">
                  <Lock className="h-5 w-5 text-outline" />
                </div>
                <input 
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t.password}
                  className="block w-full rounded-lg border-0 py-3 pl-10 rtl:pl-3 rtl:pr-10 text-on-surface ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary bg-white/50 backdrop-blur-sm sm:font-body-md sm:text-body-md transition-all"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 rtl:ml-0 rtl:mr-2 block font-body-sm text-body-sm text-on-surface-variant">
                  {t.rememberMe}
                </label>
              </div>
              <div className="font-body-sm text-body-sm">
                <a href="#" className="font-semibold text-primary hover:text-primary-container transition-colors">
                  {t.forgotPassword}
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 font-label-md text-label-md text-on-primary shadow-sm hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? '...' : t.signIn}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/40"></div>
              </div>
              <div className="relative flex justify-center font-body-sm text-body-sm">
                <span className="bg-surface px-2 text-on-surface-variant rounded-full">{t.or}</span>
              </div>
            </div>

            {/* Google Button */}
            <div className="mt-6">
              <button 
                type="button" 
                onClick={handleGoogle}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-white/50 backdrop-blur-sm px-4 py-3 font-label-md text-label-md text-on-surface ring-1 ring-inset ring-outline-variant hover:bg-surface-container-low focus-visible:ring-transparent transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
                </svg>
                {googleLoading ? '...' : t.continueWithGoogle}
              </button>
            </div>
          </div>

          <p className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
            {t.dontHaveAccount}{' '}
            <Link href={`/${locale}/sign-up`} className="font-semibold text-primary hover:text-primary-container transition-colors">
              {t.signUp}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}