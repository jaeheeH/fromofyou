'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  MapPin,
  Search,
  Filter,
  Grid,
  List,
  Clock
} from 'lucide-react'
import { ExhibitionsCalendar } from '@/components/exhibitions/ExhibitionsCalendar'



interface Exhibition {
  id: string
  title: string
  location: string
  description: string | null
  start_date: string
  end_date: string
  thumbnail_url: string | null
  created_at: string
}

export default function ExhibitionsPage() {
  const router = useRouter()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ongoing' | 'upcoming' | 'ended'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // state 추가
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  useEffect(() => {
    fetchExhibitions()
  }, [])

  useEffect(() => {
    filterExhibitions()
  }, [exhibitions, searchTerm, selectedStatus, selectedDate])


  const fetchExhibitions = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) {
        console.error('전시 조회 오류:', error)
        return
      }

      // 클라이언트에서 상태별 + 시작일별 정렬
      const sortedExhibitions = (data || []).sort((a, b) => {
        const statusA = getExhibitionStatus(a.start_date, a.end_date)
        const statusB = getExhibitionStatus(b.start_date, b.end_date)
        
        // 1순위: 상태별 정렬 (진행중 > 예정 > 종료)
        const statusOrder = { ongoing: 0, upcoming: 1, ended: 2 }
        const statusDiff = statusOrder[statusA] - statusOrder[statusB]
        
        if (statusDiff !== 0) {
          return statusDiff
        }
        
        // 2순위: 같은 상태 내에서 시작일 늦은 순 (최신순)
        const dateA = new Date(a.start_date).getTime()
        const dateB = new Date(b.start_date).getTime()
        return dateB - dateA
      })

      setExhibitions(data || [])
    } catch (error) {
      console.error('전시 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterExhibitions = () => {
    let filtered = exhibitions

    // 날짜별 필터링
    if (selectedDate) {
      filtered = filtered.filter(exhibition => {
        const start = new Date(exhibition.start_date)
        const end = new Date(exhibition.end_date)
        return selectedDate >= start && selectedDate <= end
      })
    }

    // 상태별 필터링
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(exhibition => {
        const status = getExhibitionStatus(exhibition.start_date, exhibition.end_date)
        return status === selectedStatus
      })
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(exhibition =>
        exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exhibition.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exhibition.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredExhibitions(filtered)
  }

  const getExhibitionStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return 'upcoming'
    if (now > end) return 'ended'
    return 'ongoing'
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ongoing': return '진행중'
      case 'upcoming': return '예정'
      case 'ended': return '종료'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ended': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getDate()}일`
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ongoingExhibitions = exhibitions.filter(e => getExhibitionStatus(e.start_date, e.end_date) === 'ongoing')
  const upcomingExhibitions = exhibitions.filter(e => getExhibitionStatus(e.start_date, e.end_date) === 'upcoming')
  const endedExhibitions = exhibitions.filter(e => getExhibitionStatus(e.start_date, e.end_date) === 'ended')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">전시</h1>
          <p className="text-lg text-gray-600 mb-6">
            예술가 자신의 이야기를 담은 곳,<br />
            이곳의 풍석과 이들을 담은은 존재을 위해
          </p>

          {/* 통계 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">진행중</p>
                    <p className="text-xl font-bold">{ongoingExhibitions.length}개</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">예정</p>
                    <p className="text-xl font-bold">{upcomingExhibitions.length}개</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">종료</p>
                    <p className="text-xl font-bold">{endedExhibitions.length}개</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="전시명, 장소, 설명으로 검색..."
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

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                size="sm"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* 전시 목록 */}
          <div className="lg:col-span-8">
            {filteredExhibitions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm || selectedStatus !== 'all' 
                    ? '조건에 맞는 전시가 없습니다.' 
                    : '등록된 전시가 없습니다.'
                  }
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {filteredExhibitions.map((exhibition) => {
                  const status = getExhibitionStatus(exhibition.start_date, exhibition.end_date)
                  
                  if (viewMode === 'grid') {
                    return (
                      <Card 
                        key={exhibition.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/exhibitions/${exhibition.id}`)}
                      >
                        <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                          {exhibition.thumbnail_url ? (
                            <img
                              src={exhibition.thumbnail_url}
                              alt={exhibition.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={`text-xs ${getStatusColor(status)}`}>
                              {getStatusLabel(status)}
                            </Badge>
                          </div>
                          
                          <h3 className="font-bold text-lg mb-2 line-clamp-2">
                            {exhibition.title}
                          </h3>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{exhibition.location}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="text-xs">
                                {formatDateRange(exhibition.start_date, exhibition.end_date)}
                              </span>
                            </div>
                          </div>
                          
                          {exhibition.description && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                              {exhibition.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  } else {
                    return (
                      <Card 
                        key={exhibition.id}
                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/exhibitions/${exhibition.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-27 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {exhibition.thumbnail_url ? (
                                <img
                                  src={exhibition.thumbnail_url}
                                  alt={exhibition.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Calendar className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg">{exhibition.title}</h3>
                                <Badge className={`text-xs ${getStatusColor(status)} ml-2`}>
                                  {getStatusLabel(status)}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>{exhibition.location}</span>
                                </div>
                                
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{formatDateRange(exhibition.start_date, exhibition.end_date)}</span>
                                </div>
                              </div>
                              
                              {exhibition.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                                  {exhibition.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <ExhibitionsCalendar 
              exhibitions={exhibitions}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}