'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/hooks/use-admin'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface AdminOnlyProps {
  children: ReactNode
  allowEditor?: boolean // 에디터 권한도 허용할지 여부
}

export function AdminOnly({ children, allowEditor = true }: AdminOnlyProps) {
  const { isAdmin, isEditor, loading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const hasPermission = isAdmin || (allowEditor && isEditor)
      
      if (!hasPermission) {
        alert('관리자 권한이 필요합니다.')
        router.push('/admin')
      }
    }
  }, [isAdmin, isEditor, loading, allowEditor, router])

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // 권한이 없을 때
  const hasPermission = isAdmin || (allowEditor && isEditor)
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-4">관리자 권한이 필요한 페이지입니다.</p>
          <button 
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // 권한이 있을 때
  return <>{children}</>
}