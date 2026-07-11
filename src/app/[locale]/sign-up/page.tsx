import type { Metadata } from 'next'
import SignUpForm from './SignUpForm'

export const metadata: Metadata = {
  title: 'Sign Up',
  robots: { index: false },
}

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <SignUpForm locale={locale} />
}
