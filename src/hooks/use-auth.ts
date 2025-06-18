'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
        await updateLastActive(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
          await updateLastActive(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const fetchProfile = async (userId: string) => {
    //console.log('🔍 프로필 조회 시작:', userId)
    
    try {
      //console.log('📡 Supabase 프로필 쿼리 실행 중...')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
  
      //console.log('📊 프로필 쿼리 결과:', { data, error })
  
      if (error) {
        console.error('❌ 프로필 쿼리 오류:', error)
        
        // 구체적인 오류 처리
        if (error.code === 'PGRST116') {
          console.log('🆕 프로필이 존재하지 않음 - 새 사용자일 수 있음')
          // 프로필이 없는 경우 null로 설정하되 오류로 처리하지 않음
          setProfile(null)
          return
        }
        
        throw error
      }
  
      //console.log('✅ 프로필 로딩 성공:', data)
      setProfile(data)
      
    } catch (error: any) {
      console.error('💥 프로필 로딩 실패:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // 오류가 있어도 앱이 멈추지 않도록 null 설정
      setProfile(null)
    }
  }

  const updateLastActive = async (userId: string) => {
    try {
      await supabase.rpc('update_last_active', { user_id: userId })
    } catch (error) {
      console.error('마지막 활동 시간 업데이트 오류:', error)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('인증되지 않은 사용자') }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      
      // 로컬 상태 업데이트
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      
      return { error: null }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      return { error }
    }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    fetchProfile,
    isAuthenticated: !!user,
    isEditor: profile?.role === 'editor' || profile?.role === 'admin',
    isAdmin: profile?.role === 'admin'
  }
}