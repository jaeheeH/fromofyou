'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '@/hooks/use-admin'

import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAdmin()

  // 인증 상태 가져오기
  const { user, profile, isAuthenticated, signOut, loading } = useAuth();

  // 외부 클릭 시 사용자 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/write', label: '글쓰기' },
    { href: '/exhibitions', label: '전시' },
    { href: '/gallery', label: '갤러리' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getLinkClassName = (href: string) => {
    const baseClass = "font-medium transition-colors";
    const activeClass = "text-blue-600 border-b-2 border-blue-600";
    const inactiveClass = "text-gray-700 hover:text-gray-900";
    return `${baseClass} ${isActive(href) ? activeClass : inactiveClass}`;
  };

  // 로그아웃 처리
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 사용자 표시 이름
  const displayName = profile?.name || user?.email?.split('@')[0] || '사용자';
  
  // 아바타 이니셜
  const avatarInitial = profile?.name?.charAt(0)?.toUpperCase() || 
                       user?.email?.charAt(0)?.toUpperCase() || 
                       'U';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-light text-gray-900">FromOfYou</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClassName(item.href)}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="admin-menu">
                관리자
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Search size={20} />
            </button>
            
            {/* 인증 상태에 따른 사용자 메뉴 */}
            {loading ? (
              // 로딩 중
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              // 로그인된 상태 - 사용자 드롭다운 메뉴
              <div className="relative" ref={userMenuRef}>
                <button 
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                      {avatarInitial}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">{displayName}</span>
                </button>

                {/* 사용자 드롭다운 메뉴 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                    {/* 사용자 정보 */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {profile?.role && profile.role !== 'user' && (
                        <p className="text-xs text-blue-600 font-medium">
                          {profile.role === 'admin' ? '관리자' : '에디터'}
                        </p>
                      )}
                    </div>

                    {/* 메뉴 항목들 */}
                    <Link
                      href="/mypage"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      마이페이지
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      설정
                    </Link>

                    {/* 에디터/관리자 전용 메뉴 */}
                    {(profile?.role === 'editor' || profile?.role === 'admin') && (
                      <>
                        <div className="border-t border-gray-100"></div>
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Menu className="mr-3 h-4 w-4" />
                          관리 패널
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 로그인되지 않은 상태
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  로그인
                </Link>
                <Link 
                  href="/login" 
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button 
              className="md:hidden p-2 text-gray-700 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700 hover:text-gray-900'
                  } font-medium transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* 모바일에서 사용자 메뉴 */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 pt-4"></div>
                  <Link
                    href="/mypage"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <Link
                    href="/settings"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    설정
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}