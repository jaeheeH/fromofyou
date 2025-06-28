// src/app/admin/places/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AdminOnly } from '@/components/admin/AdminOnly'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Place, PlaceCategory } from '@/types/database'
import { Edit, Trash2, Plus, Search, MapPin, Phone, ArrowLeft } from 'lucide-react'

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [categories, setCategories] = useState<PlaceCategory[]>([])
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // 장소 목록 가져오기
  const fetchPlaces = async () => {
    try {
      setLoading(true)
      
      // 장소와 카테고리 정보 함께 가져오기
      const { data: placesData, error: placesError } = await supabase
        .from('places')
        .select(`
          *,
          category:place_categories(id, name, slug)
        `)
        .order('created_at', { ascending: false })

      if (placesError) throw placesError

      // 카테고리 목록 가져오기
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('place_categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      setPlaces(placesData || [])
      setCategories(categoriesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 장소 삭제
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 장소를 정말 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // 목록에서 제거
      setPlaces(prev => prev.filter(place => place.id !== id))
      alert('장소가 삭제되었습니다.')
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    }
  }

  // 검색 및 필터링
  useEffect(() => {
    let filtered = places

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.category_id === selectedCategory)
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPlaces(filtered)
  }, [places, searchTerm, selectedCategory])

  useEffect(() => {
    fetchPlaces()
  }, [])

  if (loading) {
    return (
      <AdminOnly>
        <div className="container mx-auto py-8">
          <LoadingSpinner size="lg" />
        </div>
      </AdminOnly>
    )
  }

  if (error) {
    return (
      <AdminOnly>
        <div className="container mx-auto py-8">
          <div className="text-center text-red-600">
            <p>오류가 발생했습니다: {error}</p>
            <Button onClick={fetchPlaces} className="mt-4">
              다시 시도
            </Button>
          </div>
        </div>
      </AdminOnly>
    )
  }

  return (
    <AdminOnly>
      <div className="container mx-auto py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                대시보드
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">장소 관리</h1>
              <p className="text-gray-600 mt-2">전시 장소 정보를 관리합니다</p>
            </div>
          </div>
          <Link href="/admin/places/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              새 장소 등록
            </Button>
          </Link>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">전체 장소</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{places.length}</div>
            </CardContent>
          </Card>
          
          {categories.slice(0, 3).map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {places.filter(p => p.category_id === category.id).length}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>장소 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색어 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="장소명, 주소로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* 카테고리 필터 */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  size="sm"
                >
                  전체
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 장소 목록 */}
        {filteredPlaces.length === 0 ? (
          <EmptyState
            title={searchTerm || selectedCategory !== 'all' ? "조건에 맞는 장소가 없습니다" : "등록된 장소가 없습니다"}
            description={searchTerm || selectedCategory !== 'all' ? "다른 검색어나 필터를 시도해보세요." : "새로운 장소를 등록해보세요."}
            action={
              <Link href="/admin/places/create">
                <Button>첫 장소 등록하기</Button>
              </Link>
            }
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>장소 목록 ({filteredPlaces.length}개)</CardTitle>
              <CardDescription>
                {searchTerm && `"${searchTerm}" 검색 결과`}
                {selectedCategory !== 'all' && ` · ${categories.find(c => c.id === selectedCategory)?.name} 필터`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>장소</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlaces.map((place) => (
                    <TableRow key={place.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {place.thumbnail_image ? (
                              <img 
                                src={place.thumbnail_image} 
                                alt={place.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <MapPin className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{place.name}</div>
                            {place.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {place.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(place as any).category?.name || '미분류'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">
                        {`${place.address}${place.address_detail ? ` ${place.address_detail}` : ''}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {place.phone ? (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {place.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(place.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/places/${place.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(place.id, place.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminOnly>
  )
}