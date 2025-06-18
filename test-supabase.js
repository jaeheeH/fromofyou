// ==============================================
// Supabase 연결 테스트 스크립트
// ==============================================

// 환경변수 로드 (dotenv 사용)
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 import
const { createClient } = require('@supabase/supabase-js');

// 환경변수에서 Supabase 설정 읽기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 환경변수 확인 중...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// URL 확인
if (supabaseUrl) {
  console.log('✅ Supabase URL:', supabaseUrl);
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다');
}

// 키 확인 (보안상 앞부분만 표시)
if (supabaseKey) {
  console.log('✅ Supabase Key 앞 30자:', supabaseKey.substring(0, 30) + '...');
  console.log('   Key 길이:', supabaseKey.length, '자');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 환경변수가 없으면 종료
if (!supabaseUrl || !supabaseKey) {
  console.error('💥 환경변수가 제대로 설정되지 않았습니다!');
  console.log('📋 체크리스트:');
  console.log('   1. .env.local 파일이 프로젝트 루트에 있나요?');
  console.log('   2. NEXT_PUBLIC_SUPABASE_URL이 정확한가요?');
  console.log('   3. NEXT_PUBLIC_SUPABASE_ANON_KEY가 정확한가요?');
  console.log('   4. 키 복사할 때 앞뒤 공백이 들어가지 않았나요?');
  process.exit(1);
}

// Supabase 클라이언트 생성
console.log('🔗 Supabase 클라이언트 생성 중...');
const supabase = createClient(supabaseUrl, supabaseKey);

// 실제 연결 테스트 함수
async function testConnection() {
  try {
    console.log('📡 Supabase 서버에 연결 시도 중...');
    
    // 1. 기본 세션 확인 (인증되지 않은 상태에서도 작동)
    console.log('   → 세션 상태 확인...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`세션 확인 실패: ${sessionError.message}`);
    }
    
    console.log('   ✅ 세션 확인 성공');
    
    // 2. 데이터베이스 연결 테스트 (간단한 쿼리)
    console.log('   → 데이터베이스 연결 확인...');
    const { data: dbData, error: dbError } = await supabase
      .from('profiles')  // 아직 테이블이 없어도 연결은 확인됨
      .select('count')
      .limit(1);
    
    // 테이블이 없어도 연결 자체는 성공으로 간주
    if (dbError && !dbError.message.includes('relation "public.profiles" does not exist')) {
      throw new Error(`데이터베이스 연결 실패: ${dbError.message}`);
    }
    
    console.log('   ✅ 데이터베이스 연결 성공');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 모든 연결 테스트 성공!');
    console.log('   Supabase 설정이 올바르게 완료되었습니다.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('💥 Supabase 연결 실패!');
    console.error('❌ 오류 내용:', error.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('🔧 문제 해결 방법:');
    console.log('   1. Supabase 프로젝트가 정상적으로 생성되었는지 확인');
    console.log('   2. API 키가 정확히 복사되었는지 확인');
    console.log('   3. URL 끝에 불필요한 슬래시(/)가 없는지 확인');
    console.log('   4. 네트워크 연결 상태 확인');
    console.log('   5. Supabase 서비스 상태 확인: https://status.supabase.com/');
    
    process.exit(1);
  }
}

// 테스트 실행
console.log('🚀 Supabase 연결 테스트 시작...');
testConnection();