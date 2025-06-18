'use client'

import { useAdmin } from '@/hooks/use-admin'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  ImageIcon, 
  Palette, 
  FileText,
  BarChart3,
  Settings,
  Plus,
  MapPin,
  Building
} from 'lucide-react'

export default function AdminDashboard() {
  const { isAdmin, loading } = useAdmin()
  const router = useRouter()

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCurations: 0,
    totalArtworks: 0,
    totalExhibitions: 0,
    totalPlaces: 0,          // 🆕 장소 통계 추가
    totalPlaceCategories: 0, // 🆕 장소 카테고리 통계 추가
    loadingStats: true
  })

  useEffect(() => {
    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  // 통계 데이터 가져오기
  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loadingStats: true }))
      const supabase = createClient()

      // 병렬로 모든 통계 조회
      const [
        usersResult,
        exhibitionsResult,
        placesResult,        // 🆕 장소 통계 추가
        categoriesResult,    // 🆕 카테고리 통계 추가
        // curationsResult,  // 아직 테이블 없음
        // artworksResult,   // 아직 테이블 없음
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('exhibitions').select('id', { count: 'exact' }),
        supabase.from('places').select('id', { count: 'exact' }),
        supabase.from('place_categories').select('id', { count: 'exact' }),
        // supabase.from('curations').select('id', { count: 'exact' }),
        // supabase.from('artworks').select('id', { count: 'exact' }),
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        totalCurations: 0, // 임시로 0
        totalArtworks: 0,  // 임시로 0
        totalExhibitions: exhibitionsResult.count || 0,
        totalPlaces: placesResult.count || 0,
        totalPlaceCategories: categoriesResult.count || 0,
        loadingStats: false
      })

    } catch (error) {
      console.error('통계 조회 오류:', error)
      setStats(prev => ({ ...prev, loadingStats: false }))
    }
  }
  
  useEffect(() => {
    if (!loading && !isAdmin) {
      alert('관리자 권한이 필요합니다.')
      router.push('/')
    }
  }, [isAdmin, loading, router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!isAdmin) {
    return null // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">FromOfYou 콘텐츠 관리 시스템</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.totalUsers.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">등록된 사용자 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전시</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.totalExhibitions.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">등록된 전시</p>
            </CardContent>
          </Card>

          {/* 🆕 장소 통계 카드 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">장소</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.totalPlaces.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">등록된 장소</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">큐레이션</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.totalCurations.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">발행된 큐레이션 (예정)</p>
            </CardContent>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                사용자 관리
              </CardTitle>
              <CardDescription>
                회원 정보 조회 및 권한 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push('/admin/users')}>
                사용자 관리
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                전시 관리
              </CardTitle>
              <CardDescription>
                전시 정보 등록 및 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push('/admin/exhibitions/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  새 전시
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/exhibitions')}>
                  전시 목록
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 🆕 장소 관리 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                장소 관리
              </CardTitle>
              <CardDescription>
                전시 장소 및 카테고리 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push('/admin/places/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  새 장소
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/places')}>
                  장소 목록
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/categories/places')}>
                  <Building className="h-4 w-4 mr-2" />
                  카테고리 관리
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                큐레이션 관리
              </CardTitle>
              <CardDescription>
                큐레이션 생성 및 편집 (예정)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  새 큐레이션
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  큐레이션 목록
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                갤러리 관리
              </CardTitle>
              <CardDescription>
                작가 및 작품 등록 관리 (예정)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  작가 등록
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  작품 관리
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                통계 & 분석
              </CardTitle>
              <CardDescription>
                사이트 사용량 및 통계
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                통계 보기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 🆕 빠른 접근 통계 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">빠른 접근</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/places')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">등록된 장소</p>
                    <p className="text-2xl font-bold">{stats.totalPlaces}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/categories/places')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">장소 카테고리</p>
                    <p className="text-2xl font-bold">{stats.totalPlaceCategories}</p>
                  </div>
                  <Building className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/exhibitions')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">진행 중인 전시</p>
                    <p className="text-2xl font-bold">{stats.totalExhibitions}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/users')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">활성 사용자</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}