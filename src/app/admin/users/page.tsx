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
  Users, 
  Search,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  display_name: string | null
  role: 'user' | 'editor' | 'admin'
  avatar_url: string | null
  created_at: string
  total_reviews?: number
  total_likes?: number
}

export default function UsersManagement() {
  const { isAdmin, loading } = useAdmin()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'editor' | 'admin'>('all')

  // 권한 체크
  useEffect(() => {
    if (!loading && !isAdmin) {
      alert('관리자 권한이 필요합니다.')
      router.push('/admin')
    }
  }, [isAdmin, loading, router])

  // 사용자 목록 불러오기
  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = users

    // 역할별 필터링
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, selectedRole])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          display_name,
          role,
          avatar_url,
          created_at,
          total_reviews,
          last_active_at,
          total_likes
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('사용자 목록 조회 오류:', error)
        alert('사용자 목록을 불러오는데 실패했습니다.')
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error)
      alert('사용자 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoadingUsers(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default'
      case 'editor': return 'secondary'
      default: return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '관리자'
      case 'editor': return '에디터'
      default: return '일반 사용자'
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
          
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          </div>
          <p className="text-gray-600">등록된 사용자 정보를 조회하고 관리합니다</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">관리자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">에디터</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'editor').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">일반 사용자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'user').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>사용자 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="이메일, 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedRole === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedRole('all')}
                  size="sm"
                >
                  전체
                </Button>
                <Button
                  variant={selectedRole === 'admin' ? 'default' : 'outline'}
                  onClick={() => setSelectedRole('admin')}
                  size="sm"
                >
                  관리자
                </Button>
                <Button
                  variant={selectedRole === 'editor' ? 'default' : 'outline'}
                  onClick={() => setSelectedRole('editor')}
                  size="sm"
                >
                  에디터
                </Button>
                <Button
                  variant={selectedRole === 'user' ? 'default' : 'outline'}
                  onClick={() => setSelectedRole('user')}
                  size="sm"
                >
                  일반
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>
              사용자 목록 ({filteredUsers.length}명)
            </CardTitle>
            <CardDescription>
              {searchTerm && `"${searchTerm}" 검색 결과`}
              {selectedRole !== 'all' && ` · ${getRoleLabel(selectedRole)} 필터`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>권한</TableHead>
                    <TableHead>활동</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>최종 로그인</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.name || user.email}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium">
                                {(user.name || user.email).charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.display_name || user.name || '이름 없음'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>리뷰 {user.total_reviews || 0}개</div>
                          <div>좋아요 {user.total_likes || 0}개</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(user.last_active_at).toLocaleDateString('ko-KR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loadingUsers && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">조건에 맞는 사용자가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}