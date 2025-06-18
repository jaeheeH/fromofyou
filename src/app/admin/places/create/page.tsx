// src/app/admin/places/create/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AdminOnly } from '@/components/admin/AdminOnly'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PlaceFormData, PlaceCategory, DaumPostcodeData, defaultOperatingHours, defaultPlaceLinks } from '@/types/database'
import { ArrowLeft, Save, MapPin, Plus, Upload } from 'lucide-react'

export default function CreatePlacePage() {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<PlaceCategory[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  
  // 새 카테고리 추가용
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  
  // 폼 데이터
  const [formData, setFormData] = useState<PlaceFormData>({
    name: '',
    category_id: '',
    description: '',
    phone: '',
    operating_hours: defaultOperatingHours,
    address: '',
    jibun_address: '',
    coordinates: { lat: 0, lng: 0 },
    thumbnail_file: undefined,
    additional_files: [],
    links: defaultPlaceLinks
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof PlaceFormData, string>>>({})
  
  const router = useRouter()
  const supabase = createClient()

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('place_categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('카테고리 로딩 오류:', err)
    }
  }

  // Daum 우편번호 검색
  const handleAddressSearch = () => {
    if (!scriptLoaded || !window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    new window.daum.Postcode({
      oncomplete: async (data: DaumPostcodeData) => {
        // 주소 정보 설정
        setFormData(prev => ({
          ...prev,
          address: data.roadAddress || data.address,
          jibun_address: data.jibunAddress
        }))

        // 좌표 변환 (Kakao Geocoding API 사용 시)
        await getCoordinatesFromAddress(data.roadAddress || data.address)
        
        // 에러 제거
        if (errors.address) {
          setErrors(prev => ({ ...prev, address: undefined }))
        }
      },
      width: '100%',
      height: '100%'
    }).open()
  }

  // 주소를 좌표로 변환 (향후 Kakao API 연동)
  const getCoordinatesFromAddress = async (address: string) => {
    // TODO: Kakao Geocoding API 연동
    // 임시로 기본 좌표 설정
    setFormData(prev => ({
      ...prev,
      coordinates: { lat: 37.5665, lng: 126.9780 } // 서울시청 좌표
    }))
  }

  // 새 카테고리 추가
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('카테고리 이름을 입력해주세요.')
      return
    }

    try {
      const slug = newCategory.name
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')

      const { data, error } = await supabase
        .from('place_categories')
        .insert([{
          name: newCategory.name.trim(),
          slug: slug,
          description: newCategory.description.trim() || null
        }])
        .select()
        .single()

      if (error) throw error

      // 카테고리 목록 업데이트
      setCategories(prev => [...prev, data])
      
      // 새로 생성된 카테고리 선택
      setFormData(prev => ({ ...prev, category_id: data.id }))
      
      // 모달 닫기 및 초기화
      setShowCategoryModal(false)
      setNewCategory({ name: '', description: '' })
      
      alert('새 카테고리가 추가되었습니다.')
    } catch (err) {
      alert(err instanceof Error ? err.message : '카테고리 추가에 실패했습니다.')
    }
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    const newErrors: Partial<Record<keyof PlaceFormData, string>> = {}
    
    if (!formData.name.trim()) newErrors.name = '장소명을 입력해주세요'
    if (!formData.category_id) newErrors.category_id = '카테고리를 선택해주세요'
    if (!formData.address.trim()) newErrors.address = '주소를 입력해주세요'
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      setLoading(true)

      // TODO: 이미지 업로드 로직 추가
      
      // 장소 데이터 저장
      const { error } = await supabase
        .from('places')
        .insert([{
          name: formData.name.trim(),
          category_id: formData.category_id,
          description: formData.description.trim() || null,
          phone: formData.phone.trim() || null,
          operating_hours: formData.operating_hours,
          address: formData.address.trim(),
          jibun_address: formData.jibun_address?.trim() || null,
          // coordinates: `POINT(${formData.coordinates.lng} ${formData.coordinates.lat})`,
          links: formData.links,
          thumbnail_image: null, // TODO: 업로드된 이미지 URL
          additional_images: []  // TODO: 업로드된 이미지 URLs
        }])

      if (error) throw error

      alert('장소가 성공적으로 등록되었습니다.')
      router.push('/admin/places')
    } catch (err) {
      alert(err instanceof Error ? err.message : '장소 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 운영시간 변경
  const updateOperatingHours = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day as keyof typeof prev.operating_hours],
          [field]: value
        }
      }
    }))
  }

  // 링크 변경
  const updateLink = (type: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [type]: value
      }
    }))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <AdminOnly>
      {/* Daum 우편번호 API 스크립트 */}
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />

      <div className="container mx-auto py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/places">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              장소 목록
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">새 장소 등록</h1>
            <p className="text-gray-600 mt-1">새로운 전시 장소를 등록합니다</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>장소의 기본 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 장소명 */}
              <div className="space-y-2">
                <Label htmlFor="name">장소명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 국립현대미술관"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* 카테고리 */}
              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* 새 카테고리 추가 버튼 */}
                  <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>새 카테고리 추가</DialogTitle>
                        <DialogDescription>
                          새로운 장소 카테고리를 만들어주세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="newCategoryName">카테고리 이름</Label>
                          <Input
                            id="newCategoryName"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="예: 복합문화공간"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newCategoryDesc">설명 (선택)</Label>
                          <Textarea
                            id="newCategoryDesc"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="카테고리에 대한 간단한 설명"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)}>
                            취소
                          </Button>
                          <Button type="button" onClick={handleCreateCategory}>
                            추가
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
              </div>

              {/* 설명 */}
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="장소에 대한 간단한 설명을 입력해주세요"
                  rows={3}
                />
              </div>

              {/* 전화번호 */}
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="예: 02-1234-5678"
                />
              </div>
            </CardContent>
          </Card>

          {/* 주소 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>주소 정보</CardTitle>
              <CardDescription>Daum 우편번호 서비스로 정확한 주소를 검색하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 주소 검색 */}
              <div className="space-y-2">
                <Label>주소 검색 *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddressSearch}
                    className="flex-shrink-0"
                    disabled={!scriptLoaded}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {scriptLoaded ? '주소 검색' : '로딩 중...'}
                  </Button>
                  <Input
                    value={formData.address}
                    placeholder="주소 검색 버튼을 클릭하세요"
                    readOnly
                    className={errors.address ? 'border-red-500' : ''}
                  />
                </div>
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              {/* 지번 주소 */}
              {formData.jibun_address && (
                <div className="space-y-2">
                  <Label>지번 주소</Label>
                  <Input value={formData.jibun_address} readOnly className="bg-gray-50" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>이미지</CardTitle>
              <CardDescription>장소의 사진을 업로드해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* TODO: 이미지 업로드 컴포넌트 구현 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">이미지 업로드 기능은 곧 추가될 예정입니다</p>
                <p className="text-sm text-gray-400">썸네일 이미지와 추가 이미지를 업로드할 수 있습니다</p>
              </div>
            </CardContent>
          </Card>

          {/* 링크 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>링크 정보</CardTitle>
              <CardDescription>관련 웹사이트와 SNS 링크를 추가해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="maps" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="maps">지도</TabsTrigger>
                  <TabsTrigger value="web">웹사이트</TabsTrigger>
                  <TabsTrigger value="sns">SNS</TabsTrigger>
                </TabsList>
                
                <TabsContent value="maps" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="naver_map">네이버맵</Label>
                    <Input
                      id="naver_map"
                      value={formData.links.naver_map}
                      onChange={(e) => updateLink('naver_map', e.target.value)}
                      placeholder="https://map.naver.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kakao_map">카카오맵</Label>
                    <Input
                      id="kakao_map"
                      value={formData.links.kakao_map}
                      onChange={(e) => updateLink('kakao_map', e.target.value)}
                      placeholder="https://place.map.kakao.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="google_map">구글맵</Label>
                    <Input
                      id="google_map"
                      value={formData.links.google_map}
                      onChange={(e) => updateLink('google_map', e.target.value)}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="web" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">공식 웹사이트</Label>
                    <Input
                      id="website"
                      value={formData.links.website}
                      onChange={(e) => updateLink('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog">블로그</Label>
                    <Input
                      id="blog"
                      value={formData.links.blog}
                      onChange={(e) => updateLink('blog', e.target.value)}
                      placeholder="https://blog.naver.com/..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="sns" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">인스타그램</Label>
                    <Input
                      id="instagram"
                      value={formData.links.instagram}
                      onChange={(e) => updateLink('instagram', e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">유튜브</Label>
                    <Input
                      id="youtube"
                      value={formData.links.youtube}
                      onChange={(e) => updateLink('youtube', e.target.value)}
                      placeholder="https://youtube.com/@channel"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/places">
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>등록 중...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  장소 등록
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminOnly>
  )
}