import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-destructive">인증 오류</h1>
          <p className="text-muted-foreground">
            로그인 처리 중 오류가 발생했습니다.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">다시 로그인하기</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}