// hooks/use-admin.ts
import { useAuth } from '@/hooks/use-auth'

export function useAdmin() {
  const { profile, loading, user } = useAuth()
  
  const isAdmin = profile?.role === 'admin'
  const isEditor = profile?.role === 'editor' || isAdmin
  const isUser = !!profile
  
  return {
    isAdmin,
    isEditor, 
    isUser,
    role: profile?.role,
    loading,
    user,
    profile
  }
}