'use client';
import { useRouter } from 'next/navigation'; // ✅ App Router에서는 이걸 사용

export default function Home() {
  const router = useRouter(); // ✅ 이 줄을 반드시 추가!
  return (
    <div className="py-12">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
            Welcome to <span className="font-normal">FromOfYou</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            당신으로부터, 당신을 위한 예술 이야기.<br />
            모든 문화와 예술을 일상에 가까이.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {/* Feature Cards */}
            <div className="p-6 bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">전시</h3>
              <p className="text-gray-600 text-sm">
                전국의 다양한 전시 정보를 한 곳에서 확인하세요.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">갤러리</h3>
              <p className="text-gray-600 text-sm">
                세계의 명화와 현대 작품들을 감상해보세요.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">글쓰기</h3>
              <p className="text-gray-600 text-sm">
                예술에 대한 생각과 감상을 글로 남겨보세요.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">큐레이션</h3>
              <p className="text-gray-600 text-sm">
                취향에 맞는 예술 작품을 추천받아보세요.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
