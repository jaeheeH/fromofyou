'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Settings, 
  Calendar, 
  Heart, 
  Bookmark, 
  Edit3, 
  Save,
  X,
  Mail,
  MapPin,
  Globe,
  Camera
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'

export default function MyPage() {
  const router = useRouter()
  const { user, profile, updateProfile, loading, isAuthenticated } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    display_name: '',
    bio: '',
    website_url: '',
    location: '',
    birth_date: ''
  })
  

  // 로그인하지 않은 경우 리다이렉트
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      alert('로그인이 필요한 페이지입니다.')
      router.push('/')
    }
  }, [loading, isAuthenticated, router])

  // 프로필 정보로 폼 초기화
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        location: profile.location || '',
        birth_date: profile.birth_date || ''
      })
    }
  }, [profile])

  // 편집 모드 시작
  const startEditing = () => {
    setIsEditing(true)
  }

  // 편집 취소
  const cancelEditing = () => {
    setIsEditing(false)
    // 원래 값으로 복원
    if (profile) {
      setEditForm({
        name: profile.name || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        location: profile.location || '',
        birth_date: profile.birth_date || ''
      })
    }
  }

  // 프로필 저장
  const saveProfile = async () => {
    setSaving(true)
    
    try {
      const updateData = {
        name: editForm.name || null,
        display_name: editForm.display_name || null,
        bio: editForm.bio || null,
        website_url: editForm.website_url || null,
        location: editForm.location || null,
        birth_date: editForm.birth_date || null
      }

      const { error } = await updateProfile(updateData)
      
      if (error) {
        alert('저장 중 오류가 발생했습니다: ' + error.message)
        return
      }

      setIsEditing(false)
      alert('프로필이 성공적으로 업데이트되었습니다!')
      
    } catch (error: any) {
      alert('저장 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // 아바타 업로드
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true)
      
      // Supabase 클라이언트 생성
      const supabase = createClient()

      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
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

      // 기존 아바타 삭제 (있다면)
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        if (oldPath && oldPath.includes('avatar-')) {
          await supabase.storage
            .from('user-avatars')
            .remove([`${user.id}/${oldPath}`])
        }
      }

      // 새 파일명 생성
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.error('업로드 오류:', uploadError)
        alert('업로드에 실패했습니다: ' + uploadError.message)
        return
      }

      // 공개 URL 가져오기
      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath)

      const newAvatarUrl = data.publicUrl
      
      // 프로필 업데이트
      const { error } = await updateProfile({ avatar_url: newAvatarUrl })
      
      if (error) {
        alert('프로필 업데이트에 실패했습니다: ' + error.message)
        return
      }

      alert('프로필 사진이 성공적으로 업데이트되었습니다!')

    } catch (error: any) {
      console.error('아바타 업로드 오류:', error)
      alert('업로드 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setUploadingAvatar(false)
    }
  }


  // 로딩 중이거나 인증되지 않은 경우
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // 리다이렉트 중
  }

  // 사용자 표시 정보
  const displayName = profile?.display_name || profile?.name || user?.email?.split('@')[0] || '사용자'
  const avatarInitial = profile?.name?.charAt(0)?.toUpperCase() || 
                       user?.email?.charAt(0)?.toUpperCase() || 'U'

  // 프로필 완성도 계산
  const calculateCompleteness = () => {
    const fields = [
      profile?.name,
      profile?.display_name, 
      profile?.bio,
      profile?.location,
      profile?.avatar_url
    ]
    const completedFields = fields.filter(field => field && field.trim()).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const completeness = calculateCompleteness()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">프로필 정보를 관리하고 활동 내역을 확인하세요</p>
        </div>

        {/* 프로필 카드 */}
        <Card className="mb-8">
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 w-8 rounded-full p-0 relative overflow-hidden"
                      disabled={uploadingAvatar}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={uploadAvatar}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingAvatar}
                      />
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-gray-600"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                    <p className="text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={profile?.role === 'admin' ? 'default' : profile?.role === 'editor' ? 'secondary' : 'outline'}>
                      {profile?.role === 'admin' ? '관리자' : profile?.role === 'editor' ? '에디터' : '일반 사용자'}
                    </Badge>
                    <Badge variant="outline">
                      프로필 {completeness}% 완성
                    </Badge>
                  </div>
                </div>
              </div>

              <Button 
                onClick={isEditing ? cancelEditing : startEditing}
                variant={isEditing ? "outline" : "default"}
                size="sm"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    편집
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isEditing ? (
              // 편집 모드
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">실제 이름</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="실제 이름을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="display_name">표시 이름</Label>
                    <Input
                      id="display_name"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                      placeholder="표시될 이름을 입력하세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">거주 지역</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      placeholder="서울특별시"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birth_date">생일</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={editForm.birth_date}
                      onChange={(e) => setEditForm({...editForm, birth_date: e.target.value})}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="website_url">웹사이트</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={editForm.website_url}
                      onChange={(e) => setEditForm({...editForm, website_url: e.target.value})}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">자기소개</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="자신을 소개해보세요..."
                    rows={4}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        저장
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={cancelEditing}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <div className="space-y-4">
                {profile?.bio && (
                  <p className="text-gray-700">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {profile?.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  
                  {profile?.website_url && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a 
                        href={profile.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        웹사이트
                      </a>
                    </div>
                  )}
                  
                  {profile?.birth_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(profile.birth_date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                {!profile?.bio && !profile?.location && !profile?.website_url && !profile?.birth_date && (
                  <p className="text-gray-500 italic">
                    프로필을 완성해서 다른 사용자들에게 자신을 소개해보세요!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 탭 메뉴 */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>활동</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>즐겨찾기</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <span>북마크</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>설정</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>활동 내역</CardTitle>
                <CardDescription>
                  최근 활동과 통계를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profile?.total_reviews || 0}</div>
                    <div className="text-sm text-gray-600">작성한 리뷰</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profile?.total_likes || 0}</div>
                    <div className="text-sm text-gray-600">받은 좋아요</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profile?.total_series_created || 0}</div>
                    <div className="text-sm text-gray-600">만든 시리즈</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{profile?.total_visits || 0}</div>
                    <div className="text-sm text-gray-600">방문 횟수</div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="font-semibold mb-4">최근 활동</h3>
                  <p className="text-gray-500 text-center py-8">
                    아직 활동 내역이 없습니다.<br />
                    전시를 둘러보고 리뷰를 남겨보세요!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>즐겨찾기</CardTitle>
                <CardDescription>
                  좋아요를 누른 전시와 작품들
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  아직 즐겨찾기한 항목이 없습니다.<br />
                  마음에 드는 전시나 작품에 좋아요를 눌러보세요!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle>북마크</CardTitle>
                <CardDescription>
                  나중에 보기 위해 저장한 콘텐츠
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  아직 북마크한 항목이 없습니다.<br />
                  관심 있는 콘텐츠를 북마크해보세요!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>계정 설정</CardTitle>
                <CardDescription>
                  알림 및 개인정보 설정
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">이메일 알림</h4>
                      <p className="text-sm text-gray-600">새로운 전시와 업데이트 알림을 받습니다</p>
                    </div>
                    <input type="checkbox" defaultChecked={profile?.notification_enabled} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">뉴스레터 구독</h4>
                      <p className="text-sm text-gray-600">FromOfYou 뉴스레터를 받습니다</p>
                    </div>
                    <input type="checkbox" defaultChecked={profile?.newsletter_subscribed} />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-red-600">계정 삭제</h4>
                    <p className="text-sm text-gray-600 mb-2">계정을 영구적으로 삭제합니다</p>
                    <Button variant="destructive" size="sm">
                      계정 삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}