// src/app/admin/places/[id]/edit/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Place, PlaceCategory, DaumPostcodeData, defaultPlaceLinks } from '@/types/database'
import { ArrowLeft, Save, MapPin, Plus, Upload, RotateCcw, Trash2 } from 'lucide-react'

export default function EditPlacePage() {
  const params = useParams()
  const placeId = params.id as string
  
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [categories, setCategories] = useState<PlaceCategory[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [place, setPlace] = useState<Place | null>(null)
  
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([])
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [deletedImages, setDeletedImages] = useState<string[]>([])
  
  // 이미지 교체 관련 상태
  const [replacingImageUrl, setReplacingImageUrl] = useState<string | null>(null)
  const [replaceImageFile, setReplaceImageFile] = useState<File | null>(null)

  // 새 카테고리 추가용
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    phone: '',
    address: '',
    address_detail: '',
    jibun_address: '',
    links: defaultPlaceLinks
  })
  
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  
  const router = useRouter()
  const supabase = createClient()

  // 장소 정보 가져오기
  const fetchPlace = async () => {
    try {
      setPageLoading(true)
      
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          category:place_categories(id, name, slug)
        `)
        .eq('id', placeId)
        .single()

      if (error) throw error
      
      setPlace(data)
      
      // 폼 데이터 설정
      setFormData({
        name: data.name || '',
        category_id: data.category_id || '',
        description: data.description || '',
        phone: data.phone || '',
        address: data.address || '',
        address_detail : data.address_detail || '',
        jibun_address: data.jibun_address || '',
        links: data.links || defaultPlaceLinks
      })
    } catch (err) {
      console.error('장소 정보 조회 오류:', err)
      alert('장소 정보를 불러오는데 실패했습니다.')
      router.push('/admin/places')
    } finally {
      setPageLoading(false)
    }
  }

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
        setFormData(prev => ({
          ...prev,
          address: data.roadAddress || data.address,
          jibun_address: data.jibunAddress
        }))
        
        if (errors.address) {
          setErrors(prev => ({ ...prev, address: undefined }))
        }
      },
      width: '100%',
      height: '100%'
    }).open()
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

      setCategories(prev => [...prev, data])
      setFormData(prev => ({ ...prev, category_id: data.id }))
      setShowCategoryModal(false)
      setNewCategory({ name: '', description: '' })
      
      alert('새 카테고리가 추가되었습니다.')
    } catch (err) {
      alert(err instanceof Error ? err.message : '카테고리 추가에 실패했습니다.')
    }
  }

  // Supabase Storage 이미지 업로드 함수
  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { data, error } = await supabase.storage
      .from('place')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('place')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // 기존 이미지 Storage에서 삭제
  const deleteImageFromStorage = async (url: string) => {
    try {
      const urlParts = url.split('/storage/v1/object/public/place/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        
        const { error } = await supabase.storage
          .from('place')
          .remove([filePath])

        if (error) {
          console.error('이미지 삭제 오류:', error)
        }
      }
    } catch (err) {
      console.error('이미지 삭제 중 오류:', err)
    }
  }

  // 추가 이미지 교체 시작
  const startAdditionalImageReplace = (index: number) => {
    if (place?.additional_images && place.additional_images[index]) {
      const imageUrl = place.additional_images[index]
      console.log('이미지 교체 시작:', imageUrl)
      setReplacingImageUrl(imageUrl)
      setReplaceImageFile(null)
    }
  }

  // 추가 이미지 교체 취소
  const cancelAdditionalImageReplace = () => {
    console.log('이미지 교체 취소')
    setReplacingImageUrl(null)
    setReplaceImageFile(null)
  }

  // 교체할 이미지 파일 선택
  const handleReplaceImageSelect = (files: File[]) => {
    if (files.length > 0 && replacingImageUrl) {
      console.log('교체 이미지 선택됨:', files[0].name)
      setReplaceImageFile(files[0])
    }
  }

  // 교체 확인
  const confirmImageReplace = async () => {
    if (!replaceImageFile || !replacingImageUrl) return

    try {
      console.log('이미지 교체 처리 중...')
      
      // 새 이미지 업로드
      const newImageUrl = await uploadImage(replaceImageFile, 'additional')
      console.log('새 이미지 업로드 완료:', newImageUrl)
      
      // 기존 이미지를 삭제 목록에 추가
      setDeletedImages(prev => [...prev, replacingImageUrl])
      
      // place 상태에서 기존 이미지를 새 이미지로 교체
      setPlace(prev => {
        if (!prev) return prev
        
        const updatedImages = prev.additional_images?.map(url => 
          url === replacingImageUrl ? newImageUrl : url
        ) || []
        
        return {
          ...prev,
          additional_images: updatedImages
        }
      })
      
      // 교체 상태 초기화
      setReplacingImageUrl(null)
      setReplaceImageFile(null)
      
      alert('이미지가 성공적으로 교체되었습니다.')
    } catch (error) {
      console.error('이미지 교체 오류:', error)
      alert('이미지 교체에 실패했습니다.')
    }
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Partial<Record<string, string>> = {}
    
    if (!formData.name.trim()) newErrors.name = '장소명을 입력해주세요'
    if (!formData.category_id) newErrors.category_id = '카테고리를 선택해주세요'
    if (!formData.address.trim()) newErrors.address = '주소를 입력해주세요'
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      setLoading(true)
  
      // 썸네일 이미지 처리
      let thumbnailUrl = place?.thumbnail_image || null
      
      // 새 썸네일이 업로드된 경우
      if (thumbnailFiles.length > 0) {
        // 기존 썸네일 삭제
        if (place?.thumbnail_image) {
          await deleteImageFromStorage(place.thumbnail_image)
        }
        // 새 썸네일 업로드
        thumbnailUrl = await uploadImage(thumbnailFiles[0], 'thumbnails')
      }
  
      // 추가 이미지 처리
      let additionalImageUrls = place?.additional_images || []
  
      // 삭제된 이미지들을 Storage에서도 삭제
      for (const deletedUrl of deletedImages) {
        await deleteImageFromStorage(deletedUrl)
      }
      
      // 삭제된 이미지들 제거
      additionalImageUrls = additionalImageUrls.filter(url => !deletedImages.includes(url))
  
      // 새 추가 이미지들 업로드
      if (additionalFiles.length > 0) {
        const uploadPromises = additionalFiles.map(file => 
          uploadImage(file, 'additional')
        )
        const newImageUrls = await Promise.all(uploadPromises)
        additionalImageUrls = [...additionalImageUrls, ...newImageUrls]
      }
  
      const { error } = await supabase
        .from('places')
        .update({
          name: formData.name.trim(),
          category_id: formData.category_id,
          description: formData.description.trim() || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim(),
          address_detail: formData.address_detail.trim() || null,
          jibun_address: formData.jibun_address?.trim() || null,
          links: formData.links,
          thumbnail_image: thumbnailUrl,
          additional_images: additionalImageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', placeId)
  
      if (error) throw error
  
      alert('장소 정보가 성공적으로 수정되었습니다.')
      router.push('/admin/places')
    } catch (err) {
      alert(err instanceof Error ? err.message : '장소 수정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
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

  // 썸네일 변경
  const handleThumbnailChange = (files: File[]) => {
    setThumbnailFiles(files)
  }

  // 추가 이미지 변경
  const handleAdditionalImagesChange = (files: File[]) => {
    setAdditionalFiles(files)
  }

  // 기존 썸네일 삭제
  const handleRemoveExistingThumbnail = () => {
    if (place?.thumbnail_image) {
      setDeletedImages(prev => [...prev, place.thumbnail_image!])
      // place 상태도 업데이트
      setPlace(prev => prev ? { ...prev, thumbnail_image: null } : null)
    }
  }

  // 기존 추가 이미지 삭제
  const handleRemoveExistingImage = (url: string) => {
    setDeletedImages(prev => [...prev, url])
  }

  useEffect(() => {
    fetchCategories()
    fetchPlace()
  }, [placeId])

  if (pageLoading) {
    return (
      <AdminOnly>
        <div className="container mx-auto py-8">
          <LoadingSpinner size="lg" />
        </div>
      </AdminOnly>
    )
  }

  if (!place) {
    return (
      <AdminOnly>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">장소를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">요청한 장소가 존재하지 않거나 삭제되었습니다.</p>
            <Link href="/admin/places">
              <Button>장소 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </AdminOnly>
    )
  }

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
            <h1 className="text-3xl font-bold">장소 수정</h1>
            <p className="text-gray-600 mt-1">{place.name} 정보를 수정합니다</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>장소의 기본 정보를 수정해주세요</CardDescription>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="주소를 직접 입력하거나 검색 버튼을 클릭하세요"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                </div>
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              {/* 지번 주소 */}
              <div className="space-y-2">
                <Label>지번 주소</Label>
                <Input 
                  value={formData.jibun_address} 
                  onChange={(e) => setFormData(prev => ({ ...prev, jibun_address: e.target.value }))}
                  placeholder="지번 주소 (선택사항)"
                  className="bg-gray-50" 
                />
              </div>

              {/* 상세주소 */}
              <div className="space-y-2">
                <Label htmlFor="address_detail">상세주소</Label>
                <Input
                  id="address_detail"
                  value={formData.address_detail}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address_detail: e.target.value 
                  }))}
                  placeholder="동/호수, 층수, 상세 위치 등을 입력하세요"
                />
                <p className="text-sm text-gray-500">
                  예: 3층, B1F 전시관, 101호 등
                </p>
              </div>

              {/* 전체 주소 미리보기 */}
              {(formData.address || formData.address_detail) && (
                <div className="space-y-2">
                  <Label>전체 주소</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-900">
                      {formData.address}
                      {formData.address_detail && ` ${formData.address_detail}`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>이미지</CardTitle>
              <CardDescription>장소의 사진을 관리해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 썸네일 이미지 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">썸네일 이미지</Label>
                    <p className="text-sm text-gray-500">장소를 대표하는 메인 이미지</p>
                  </div>
                  {place.thumbnail_image && !deletedImages.includes(place.thumbnail_image) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveExistingThumbnail}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  )}
                </div>

                {/* 현재 썸네일 표시 */}
                {place.thumbnail_image && !deletedImages.includes(place.thumbnail_image) && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img 
                      src={place.thumbnail_image} 
                      alt="현재 썸네일" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mt-2">현재 썸네일 이미지</p>
                  </div>
                )}

                {/* 새 썸네일 업로드 */}
                <ImageUpload
                  label={place.thumbnail_image && !deletedImages.includes(place.thumbnail_image) ? "썸네일 교체" : "썸네일 업로드"}
                  description=""
                  multiple={false}
                  maxFiles={1}
                  maxSize={10}
                  onFilesChange={handleThumbnailChange}
                  currentFiles={thumbnailFiles}
                  existingImages={[]}
                  showExistingControls={false}
                />
              </div>

              {/* 추가 이미지들 */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">추가 이미지</Label>
                  <p className="text-sm text-gray-500">장소의 다양한 모습을 보여주는 사진들</p>
                </div>

                {/* 기존 추가 이미지들 표시 */}
                {place.additional_images && place.additional_images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {place.additional_images
                      .filter(url => !deletedImages.includes(url))
                      .map((url, index) => (
                        <div key={url} className="relative border rounded-lg overflow-hidden">
                          <img 
                            src={url} 
                            alt={`추가 이미지 ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          
                          {/* 교체 중인 이미지 오버레이 */}
                          {replacingImageUrl === url && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-75 flex items-center justify-center">
                              <div className="bg-white p-4 rounded-lg shadow-lg text-center max-w-xs">
                                <p className="text-sm font-medium text-gray-900 mb-2">이미지 교체</p>
                                {replaceImageFile ? (
                                  <div className="space-y-2">
                                    <p className="text-xs text-gray-600 truncate">선택된 파일: {replaceImageFile.name}</p>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={confirmImageReplace}
                                      >
                                        확인
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelAdditionalImageReplace}
                                      >
                                        취소
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const files = e.target.files
                                        if (files) {
                                          handleReplaceImageSelect(Array.from(files))
                                        }
                                      }}
                                      className="text-xs"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={cancelAdditionalImageReplace}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* 일반 컨트롤 버튼들 */}
                          {replacingImageUrl !== url && (
                            <div className="absolute top-2 right-2 flex gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  console.log('교체 버튼 클릭됨:', url, index)
                                  startAdditionalImageReplace(index)
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  console.log('삭제 버튼 클릭됨:', url)
                                  handleRemoveExistingImage(url)
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* 새 추가 이미지 업로드 */}
                {!replacingImageUrl && (
                  <ImageUpload
                    label="새 이미지 추가"
                    description=""
                    multiple={true}
                    maxFiles={5}
                    maxSize={10}
                    onFilesChange={handleAdditionalImagesChange}
                    currentFiles={additionalFiles}
                    existingImages={[]}
                    showExistingControls={false}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* 링크 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>링크 정보</CardTitle>
              <CardDescription>관련 웹사이트와 SNS 링크를 수정해주세요</CardDescription>
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
                      value={formData.links.naver_map || ''}
                      onChange={(e) => updateLink('naver_map', e.target.value)}
                      placeholder="https://map.naver.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kakao_map">카카오맵</Label>
                    <Input
                      id="kakao_map"
                      value={formData.links.kakao_map || ''}
                      onChange={(e) => updateLink('kakao_map', e.target.value)}
                      placeholder="https://place.map.kakao.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="google_map">구글맵</Label>
                    <Input
                      id="google_map"
                      value={formData.links.google_map || ''}
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
                      value={formData.links.website || ''}
                      onChange={(e) => updateLink('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog">블로그</Label>
                    <Input
                      id="blog"
                      value={formData.links.blog || ''}
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
                      value={formData.links.instagram || ''}
                      onChange={(e) => updateLink('instagram', e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">유튜브</Label>
                    <Input
                      id="youtube"
                      value={formData.links.youtube || ''}
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
                <>수정 중...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  수정 완료
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminOnly>
  )
}