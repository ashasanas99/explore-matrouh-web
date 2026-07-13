'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { InlineBanner } from '@/components/shared/FormFields'
import { User, Mail, Lock } from 'lucide-react'

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
    signUp: locale === 'ar' ? 'إنشاء حساب' : 'Create Account',
    createAccount: locale === 'ar' ? 'انضم إلينا لاستكشاف جواهر مطروح الخفية.' : 'Join us to explore the hidden gems of Matrouh.',
    fullName: locale === 'ar' ? 'الاسم الكامل' : 'Full Name',
    email: locale === 'ar' ? 'البريد الإلكتروني' : 'Email address',
    password: locale === 'ar' ? 'كلمة المرور' : 'Password',
    confirmPassword: locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    continueWithGoogle: locale === 'ar' ? 'Google' : 'Google',
    or: locale === 'ar' ? 'أو المتابعة باستخدام' : 'or continue with',
    alreadyHaveAccount: locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    signIn: locale === 'ar' ? 'تسجيل الدخول' : 'Sign in',
  }

  return (
    <div className="h-full bg-surface text-on-surface font-body-md antialiased overflow-hidden min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Image with Dark Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center absolute inset-0" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6qPDtT5EGdHKFpykd-m41Q4lzzQbplpe70VK-RAUxgz2f3-iTiTu5jPjUsopi7Dy_clwyTqRkImIf9pJIUYM2YwY1ByUYD7jrgxAJ2Z5Yv1cLobt3fb8wtL5L7N7CiDIegRWjrwT1YBDzyJWpl_Jhwa5XSY0gvvH7h7MwGLz-nx5UyAPj-ssoOUPdRQkWvk_rzcG8Z9T9S-0UUBt0las1DZF5M2C76dtILjymusWyk5aBOTvSws5xehpQEtGSaHVwtW9vEiUN7xAC')" }}
        ></div>
        <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <img 
            alt="Explore Matrouh Logo" 
            className="mx-auto h-12 w-auto mb-8 drop-shadow-md" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLt-vWaFHkSlBQKBsLe6UyHYpcV3--lt66u5sbaEij48ftIcmZCDsEJenECUrB7hTmnKuvWfAFyrS4vLmSu8ApMDGcdhzsOnAyw80RxyLoS2uP8l8oQdmsxNep2o5O5ecELVo8Lv9www3thYTnH0pL3q1UdEHw0uqJpbCKMhkL0hL_b3I2Zfb7VrPgAwSW2gLUcwnt3rXrKCZETbpHRnSpq6wLxJrKFAQs7hQ0IeIDZje7Nynrgs2XicOeQ"
          />
        </div>

        <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="glass-panel rounded-[24px] px-8 py-10 sm:px-12 mx-4 sm:mx-0">
            <h2 className="font-headline-md text-headline-md text-on-surface text-center mb-2">{t.signUp}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center mb-8">{t.createAccount}</p>

            {error && <InlineBanner type="error" message={error} className="mb-4" />}
            {success && <InlineBanner type="success" message={success} className="mb-4" />}

            {!success && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="sr-only">{t.fullName}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-4 rtl:pl-0 rtl:pr-4">
                      <User className="text-outline w-5 h-5" />
                    </div>
                    <input 
                      id="name" 
                      type="text" 
                      autoComplete="name" 
                      placeholder={t.fullName} 
                      className="input-glass block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 rtl:pl-4 rtl:pr-11 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-sm text-body-sm"
                      {...register('fullName')}
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-xs text-error">{errors.fullName.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="sr-only">{t.email}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-4 rtl:pl-0 rtl:pr-4">
                      <Mail className="text-outline w-5 h-5" />
                    </div>
                    <input 
                      id="email" 
                      type="email" 
                      autoComplete="email" 
                      placeholder={t.email} 
                      className="input-glass block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 rtl:pl-4 rtl:pr-11 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-sm text-body-sm"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="sr-only">{t.password}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-4 rtl:pl-0 rtl:pr-4">
                      <Lock className="text-outline w-5 h-5" />
                    </div>
                    <input 
                      id="password" 
                      type="password" 
                      autoComplete="new-password" 
                      placeholder={t.password} 
                      className="input-glass block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 rtl:pl-4 rtl:pr-11 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-sm text-body-sm"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="sr-only">{t.confirmPassword}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-4 rtl:pl-0 rtl:pr-4">
                      <Lock className="text-outline w-5 h-5" />
                    </div>
                    <input 
                      id="confirm-password" 
                      type="password" 
                      autoComplete="new-password" 
                      placeholder={t.confirmPassword} 
                      className="input-glass block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 rtl:pl-4 rtl:pr-11 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-sm text-body-sm"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex w-full justify-center rounded-xl bg-primary px-4 py-3.5 font-label-md text-label-md text-on-primary shadow-md hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? '...' : t.signUp}
                  </button>
                </div>
              </form>
            )}

            {!success && (
              <>
                {/* Divider */}
                <div className="mt-8 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-outline-variant/40"></div>
                    </div>
                    <div className="relative flex justify-center text-sm leading-6">
                      <span className="bg-surface-container-lowest/80 px-4 text-outline font-body-sm text-body-sm backdrop-blur-sm rounded-full">{t.or}</span>
                    </div>
                  </div>
                </div>

                {/* Google Button */}
                <div className="mt-6">
                  <button 
                    type="button"
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-on-surface shadow-sm ring-1 ring-inset ring-outline-variant/50 hover:bg-surface-container-low transition-colors duration-200 focus-visible:ring-transparent disabled:opacity-70"
                  >
                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                      <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                      <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                      <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
                    </svg>
                    <span className="font-body-sm text-body-sm font-semibold">{googleLoading ? '...' : t.continueWithGoogle}</span>
                  </button>
                </div>
              </>
            )}

            {/* Login Link */}
            <p className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
              {t.alreadyHaveAccount}{' '}
              <Link href={`/${locale}/sign-in`} className="font-semibold text-primary hover:text-primary-container transition-colors">
                {t.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Custom styles for glass inputs */}
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .input-glass {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(0, 107, 85, 0.1);
            transition: all 0.3s ease;
        }
        .input-glass:focus {
            background: rgba(255, 255, 255, 0.95);
            border-color: #006b55;
            box-shadow: 0 4px 12px rgba(0, 107, 85, 0.1);
        }
      `}} />
    </div>
  )
}