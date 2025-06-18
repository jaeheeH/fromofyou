'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'  // ← 4단계: shadcn Form 추가

interface EmailLoginFormProps {
  onSuccess?: () => void
}

// 3단계: Zod 스키마 정의
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
})

const signUpSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해주세요')
    .min(2, '이름은 최소 2자 이상이어야 합니다'),
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      '비밀번호는 영문과 숫자를 포함해야 합니다'
    ),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

// 타입 자동 생성
type LoginData = z.infer<typeof loginSchema>
type SignUpData = z.infer<typeof signUpSchema>

export function EmailLoginForm({ onSuccess }: EmailLoginFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // useAuth Hook
  const { signIn, signUp } = useAuth()

  // 3단계: Zod resolver 추가
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),  // ← Zod resolver 사용
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),  // ← Zod resolver 사용
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  console.log('4단계: shadcn Form 컴포넌트 추가됨')
  console.log('Form 컴포넌트:', typeof Form)
  console.log('FormField 컴포넌트:', typeof FormField)

  const handleLogin = async (data: LoginData) => {
    setError('')
    setLoading(true)

    console.log('로그인 데이터:', data)

    try {
      const { error } = await signIn(data.email, data.password)
      if (error) {
        setError(error.message)
        return
      }
      console.log('로그인 성공!')
      onSuccess?.()
    } catch (error: any) {
      setError('로그인 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpData) => {
    setError('')
    setLoading(true)

    console.log('회원가입 데이터:', data)

    // 간단한 validation
    if (data.password !== data.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(data.email, data.password, data.name)
      if (error) {
        setError(error.message)
        return
      }
      console.log('회원가입 성공!')
      alert('가입 확인 이메일을 발송했습니다!')
    } catch (error: any) {
      setError('회원가입 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {mode === 'signin' ? '로그인' : '회원가입'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'signin' 
            ? 'FromOfYou에 다시 오신 것을 환영합니다' 
            : 'FromOfYou와 함께 예술 여행을 시작하세요'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {mode === 'signin' ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              {/* 단순 테스트: 이메일 필드만 */}
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@fromofyou.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 임시로 일반 input으로 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 (일반)</Label>
                <Input
                  id="password"
                  type="password"
                  {...loginForm.register('password')}
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </Form>
        ) : (
          // 회원가입은 일단 3단계 방식으로
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                {...signUpForm.register('name')}
                placeholder="홍길동"
              />
              {signUpForm.formState.errors.name && (
                <p className="text-red-500 text-sm">{signUpForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                {...signUpForm.register('email')}
                placeholder="example@fromofyou.com"
              />
              {signUpForm.formState.errors.email && (
                <p className="text-red-500 text-sm">{signUpForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                {...signUpForm.register('password')}
                placeholder="••••••••"
              />
              {signUpForm.formState.errors.password && (
                <p className="text-red-500 text-sm">{signUpForm.formState.errors.password.message}</p>
              )}
              
              {/* 비밀번호 강도 표시 */}
              {signUpForm.watch('password') && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={signUpForm.watch('password').length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                      {signUpForm.watch('password').length >= 6 ? '✅' : '○'} 6자 이상
                    </span>
                    <span className={/[a-zA-Z]/.test(signUpForm.watch('password')) ? 'text-green-600' : 'text-gray-400'}>
                      {/[a-zA-Z]/.test(signUpForm.watch('password')) ? '✅' : '○'} 영문 포함
                    </span>
                    <span className={/\d/.test(signUpForm.watch('password')) ? 'text-green-600' : 'text-gray-400'}>
                      {/\d/.test(signUpForm.watch('password')) ? '✅' : '○'} 숫자 포함
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...signUpForm.register('confirmPassword')}
                placeholder="••••••••"
              />
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm">{signUpForm.formState.errors.confirmPassword.message}</p>
              )}
              
              {/* 실시간 비밀번호 일치 확인 */}
              {signUpForm.watch('password') && signUpForm.watch('confirmPassword') && (
                <div className="flex items-center gap-2 text-sm">
                  {signUpForm.watch('password') === signUpForm.watch('confirmPassword') ? (
                    <>
                      <span className="text-green-600">✅</span>
                      <span className="text-green-600">비밀번호가 일치합니다</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-500">❌</span>
                      <span className="text-red-500">비밀번호가 일치하지 않습니다</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>
        )}

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => {
              console.log('모드 전환:', mode === 'signin' ? 'signup' : 'signin')
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
              // React Hook Form 초기화
              loginForm.reset()
              signUpForm.reset()
            }}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            {mode === 'signin' 
              ? '계정이 없으신가요? 회원가입' 
              : '이미 계정이 있으신가요? 로그인'
            }
          </button>
        </div>
      </CardContent>
    </Card>
  )
}