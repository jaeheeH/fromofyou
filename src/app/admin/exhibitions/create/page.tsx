'use client'

import { useState } from 'react'
import { useAdmin } from '@/hooks/use-admin'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Save,
  Upload,
  Calendar,
  MapPin,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

interface ExhibitionForm {
  title: string
  location: string
  description: string      // 간단한 설명
  start_date: string
  end_date: string
  thumbnail: File | null
  // detailed_content는 나중에 에디터로 추가
}

export default function CreateExhibition() {
  const { isAdmin, loading } = useAdmin()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  
  const [form, setForm] = useState<ExhibitionForm>({
    title: '',
    location: '',
    description: '',
    start_date: '',
    end_date: '',
    thumbnail: null
  })

  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

  // 권한 체크
  if (!loading && !isAdmin) {
    router.push('/admin')
    return null
  }

  // 썸네일 업로드 처리
  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 형식 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    setForm({ ...form, thumbnail: file })

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 전시 저장
  const saveExhibition = async () => {
    try {
      setSaving(true)

      // 필수 필드 검증
      if (!form.title.trim()) {
        alert('전시 제목을 입력해주세요.')
        return
      }

      if (!form.location.trim()) {
        alert('전시 장소를 입력해주세요.')
        return
      }

      if (!form.start_date) {
        alert('시작일을 선택해주세요.')
        return
      }

      if (!form.end_date) {
        alert('종료일을 선택해주세요.')
        return
      }

      // 날짜 검증
      if (new Date(form.start_date) >= new Date(form.end_date)) {
        alert('종료일은 시작일보다 늦어야 합니다.')
        return
      }

      const supabase = createClient()
      let thumbnailUrl = null

      // 썸네일 업로드
      if (form.thumbnail) {
        setUploadingThumbnail(true)
        
        const fileExt = form.thumbnail.name.split('.').pop()
        const fileName = `exhibition-${Date.now()}.${fileExt}`
        const filePath = `exhibitions/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('exhibitions')
          .upload(filePath, form.thumbnail)

        if (uploadError) {
          console.error('썸네일 업로드 오류:', uploadError)
          alert('썸네일 업로드에 실패했습니다: ' + uploadError.message)
          return
        }

        const { data } = supabase.storage
          .from('exhibitions')
          .getPublicUrl(filePath)

        thumbnailUrl = data.publicUrl
      }

      // 전시 정보 저장
      const { error: insertError } = await supabase
        .from('exhibitions')
        .insert({
          title: form.title.trim(),
          location: form.location.trim(),
          description: form.description.trim() || null,
          start_date: form.start_date,
          end_date: form.end_date,
          thumbnail_url: thumbnailUrl,
          status: 'upcoming' // 기본값
        })

      if (insertError) {
        console.error('전시 저장 오류:', insertError)
        alert('전시 저장에 실패했습니다: ' + insertError.message)
        return
      }

      alert('전시가 성공적으로 등록되었습니다!')
      router.push('/admin/exhibitions')

    } catch (error: any) {
      console.error('전시 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setSaving(false)
      setUploadingThumbnail(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/admin/exhibitions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              전시 목록으로
            </Button>
          </div>
          
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">새 전시 등록</h1>
          </div>
          <p className="text-gray-600">새로운 전시 정보를 등록합니다</p>
        </div>

        {/* 전시 등록 폼 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 정보 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>전시의 기본 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">전시 제목 *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="전시 제목을 입력하세요"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location">전시 장소 *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="전시 장소를 입력하세요"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">시작일 *</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="start_date"
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="end_date">종료일 *</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="end_date"
                        type="date"
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                        className="pl-10"
                        min={form.start_date}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>전시 설명</CardTitle>
                <CardDescription>전시에 대한 간단한 소개를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="전시에 대한 간단한 설명을 입력하세요... (예: 현대 미술의 새로운 시각을 제시하는 전시)"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  상세한 내용은 등록 후 <strong>상세설명 편집</strong>에서 에디터로 작성할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>전시 썸네일</CardTitle>
                <CardDescription>전시 대표 이미지를 업로드하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="썸네일 미리보기"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setForm({ ...form, thumbnail: null })
                          setThumbnailPreview('')
                        }}
                        className="absolute top-2 right-2"
                      >
                        제거
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        썸네일 이미지를 업로드하세요
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        JPG, PNG 파일 / 최대 5MB
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full relative overflow-hidden"
                    disabled={uploadingThumbnail}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingThumbnail}
                    />
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingThumbnail ? '업로드 중...' : '이미지 선택'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>저장 옵션</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={saveExhibition}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      전시 등록
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 mt-2">
                  * 필수 항목을 모두 입력해주세요
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}