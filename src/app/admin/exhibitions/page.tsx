'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/hooks/use-admin'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  FileText, 
  Search,
  Plus,
  Calendar,
  MapPin,
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react'

interface Exhibition {
  id: string
  title: string
  location: string
  description: string | null
  start_date: string
  end_date: string
  thumbnail_url: string | null
  status: string
  created_at: string
}

export default function ExhibitionsManagement() {
  const { isAdmin, loading } = useAdmin()
  const router = useRouter()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingExhibitions, setLoadingExhibitions] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'ended'>('all')

  // 권한 체크
  useEffect(() => {
    if (!loading && !isAdmin) {
      alert('관리자 권한이 필요합니다.')
      router.push('/admin')
    }
  }, [isAdmin, loading, router])

  // 전시 목록 불러오기
  useEffect(() => {
    if (isAdmin) {
      fetchExhibitions()
    }
  }, [isAdmin])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = exhibitions
  
    // 상태별 필터링 - 실시간 계산된 status 사용
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(exhibition => {
        const currentStatus = getExhibitionStatus(exhibition.start_date, exhibition.end_date)
        return currentStatus === selectedStatus
      })
    }
  
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(exhibition => 
        exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exhibition.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  
    setFilteredExhibitions(filtered)
  }, [exhibitions, searchTerm, selectedStatus])

  const fetchExhibitions = async () => {
    try {
      setLoadingExhibitions(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) {
        console.error('전시 목록 조회 오류:', error)
        // 테이블이 없을 수 있으니 빈 배열로 설정
        setExhibitions([])
        return
      }

      setExhibitions(data || [])
    } catch (error) {
      console.error('전시 목록 조회 오류:', error)
      setExhibitions([])
    } finally {
      setLoadingExhibitions(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ongoing': return 'default'
      case 'upcoming': return 'secondary'
      case 'ended': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ongoing': return '진행중'
      case 'upcoming': return '예정'
      case 'ended': return '종료'
      default: return status
    }
  }

  const getExhibitionStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return 'upcoming'
    if (now > end) return 'ended'
    return 'ongoing'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  // 삭제 함수 
  const deleteExhibition = async (id: string, title: string) => {
    if (!confirm(`"${title}" 전시를 정말 삭제하시겠습니까?`)) {
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('exhibitions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('전시 삭제 오류:', error)
        alert('전시 삭제에 실패했습니다: ' + error.message)
        return
      }

      alert('전시가 삭제되었습니다.')
      fetchExhibitions() // 목록 새로고침
    } catch (error: any) {
      console.error('전시 삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다: ' + error.message)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              대시보드로
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">전시 관리</h1>
              </div>
              <p className="text-gray-600">전시 정보를 등록하고 관리합니다</p>
            </div>
            
            <Button onClick={() => router.push('/admin/exhibitions/create')}>
              <Plus className="h-4 w-4 mr-2" />
              새 전시 등록
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">전체 전시</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exhibitions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">진행중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {exhibitions.filter(e => getExhibitionStatus(e.start_date, e.end_date) === 'ongoing').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">예정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {exhibitions.filter(e => getExhibitionStatus(e.start_date, e.end_date) === 'upcoming').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">종료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {exhibitions.filter(e => getExhibitionStatus(e.start_date, e.end_date) === 'ended').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>전시 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="전시명, 장소로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('all')}
                  size="sm"
                >
                  전체
                </Button>
                <Button
                  variant={selectedStatus === 'ongoing' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('ongoing')}
                  size="sm"
                >
                  진행중
                </Button>
                <Button
                  variant={selectedStatus === 'upcoming' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('upcoming')}
                  size="sm"
                >
                  예정
                </Button>
                <Button
                  variant={selectedStatus === 'ended' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('ended')}
                  size="sm"
                >
                  종료
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전시 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>
              전시 목록 ({filteredExhibitions.length}개)
            </CardTitle>
            <CardDescription>
              {searchTerm && `"${searchTerm}" 검색 결과`}
              {selectedStatus !== 'all' && ` · ${getStatusLabel(selectedStatus)} 필터`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingExhibitions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>전시 정보</TableHead>
                    <TableHead>기간</TableHead>
                    <TableHead>장소</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExhibitions.map((exhibition) => {
                    const currentStatus = getExhibitionStatus(exhibition.start_date, exhibition.end_date)
                    return (
                      <TableRow key={exhibition.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                              {exhibition.thumbnail_url ? (
                                <img 
                                  src={exhibition.thumbnail_url} 
                                  alt={exhibition.title}
                                  className="w-12 h-16 object-cover"
                                />
                              ) : (
                                <FileText className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{exhibition.title}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(exhibition.created_at).toLocaleDateString('ko-KR')} 등록
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              시작: {formatDate(exhibition.start_date)}
                            </div>
                            <div className="flex items-center text-gray-600 mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              종료: {formatDate(exhibition.end_date)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {exhibition.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(currentStatus)}>
                            {getStatusLabel(currentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/admin/exhibitions/${exhibition.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteExhibition(exhibition.id, exhibition.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}

            {!loadingExhibitions && filteredExhibitions.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchTerm || selectedStatus !== 'all' 
                    ? '조건에 맞는 전시가 없습니다.' 
                    : '등록된 전시가 없습니다.'
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/exhibitions/create')}
                >
                  첫 전시 등록하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}