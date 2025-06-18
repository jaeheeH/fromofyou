'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EmailLoginForm } from '@/components/auth/email-login-form'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading } = useAuth()
  const redirectTo = searchParams.get('redirectTo') || '/'

  useEffect(() => {
    // 이미 로그인된 경우 리다이렉트
    if (isAuthenticated && !loading) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // 리다이렉트 중
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <EmailLoginForm onSuccess={() => router.push(redirectTo)} />
    </div>
  )
}