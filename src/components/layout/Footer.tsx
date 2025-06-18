import Link from 'next/link';
import { Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-light text-gray-900 mb-4">
              FromOfYou
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              당신으로부터, 당신을 위한 예술 이야기.<br />
              모든 문화와 예술을 일상에 가까이.
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">둘러보기</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link 
                  href="/write" 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  글쓰기
                </Link>
              </li>
              <li>
                <Link 
                  href="/exhibitions" 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  전시
                </Link>
              </li>
              <li>
                <Link 
                  href="/gallery" 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  갤러리
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">고객지원</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  소개
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  문의
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 FromOfYou. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">
              Made with ♥ for art lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}