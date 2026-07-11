import type { Metadata } from 'next'
import SignInForm from './SignInForm'

export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false },
}

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <SignInForm locale={locale} />
}
