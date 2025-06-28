// src/types/database.ts
// FromOfYou 프로젝트 데이터베이스 타입 정의

// 1. 전시 상태
export type ExhibitionStatus = 'upcoming' | 'ongoing' | 'ended';

// 2. 사용자 권한 (auth.ts와 동일하게 유지)
export type UserRole = 'user' | 'editor' | 'admin';

// 3. 전시 정보
export interface Exhibition {
  id: string;
  title: string;
  location: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  thumbnail_url?: string | null;
  detailed_content?: string | null;  // 추가: 상세 설명
  status: ExhibitionStatus;          // 추가: 전시 상태
  created_at: string;
  updated_at: string;                // 추가: 수정 시간
}

// 기존 전시 정보
export interface ExhibitionForm {
  title: string
  location: string
  description: string
  start_date: string
  end_date: string
  thumbnail: File | null
  existing_thumbnail_url: string | null // 기존 썸네일 URL
}

// 4. 장소 카테고리
export interface PlaceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// 6. 운영시간 타입
export interface DaySchedule {
  open: string;  // "09:00"
  close: string; // "18:00"
  closed: boolean;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

// 7. 링크 정보 타입
export interface PlaceLinks {
  naver_map?: string;
  kakao_map?: string;
  google_map?: string;
  website?: string;
  blog?: string;
  instagram?: string;
  youtube?: string;
}

// 8. 좌표 타입
export interface Coordinates {
  lat: number;
  lng: number;
}

// 9. 장소 정보
export interface Place {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  phone?: string;
  operating_hours: OperatingHours;
  thumbnail_image?: string;
  additional_images: string[];
  address: string;
  address_detail?: string;  
  jibun_address?: string;
  coordinates?: Coordinates;
  links: PlaceLinks;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // 관계 데이터
  category?: PlaceCategory;
}

// 10. 폼 데이터 타입들
export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

export interface CategoryUpdateData extends Partial<CategoryFormData> {
  id: string;
}

export interface PlaceFormData {
  name: string;
  category_id: string;
  description: string;
  phone: string;
  operating_hours: OperatingHours;
  address: string;
  address_detail: string;
  jibun_address: string;
  coordinates: Coordinates;
  thumbnail_file?: File;
  additional_files: File[];
  links: PlaceLinks;
}

// 11. Daum 우편번호 API 응답 타입
export interface DaumPostcodeData {
  address: string;        // 도로명주소
  addressEnglish: string;
  addressType: string;    // 'R'(도로명), 'J'(지번)
  bname: string;         // 법정동명
  buildingCode: string;
  buildingName: string;
  jibunAddress: string;  // 지번주소
  postcode: string;      // 우편번호
  roadAddress: string;   // 도로명주소
  sido: string;          // 시도
  sigungu: string;       // 시군구
  zonecode: string;      // 우편번호
}

// 12. Kakao Geocoding API 응답 타입
export interface KakaoGeocodingResponse {
  documents: Array<{
    address_name: string;
    x: string; // 경도
    y: string; // 위도
  }>;
}

// 13. Storage 경로 헬퍼
export const getPlaceImagePath = (placeId: string, fileName: string) => 
  `place/${placeId}/${fileName}`;

export const getPlaceThumbnailPath = (placeId: string) => 
  `place/${placeId}/thumbnail.jpg`;

// 14. 기본값 템플릿
export const defaultOperatingHours: OperatingHours = {
  monday: { open: "10:00", close: "18:00", closed: false },
  tuesday: { open: "10:00", close: "18:00", closed: false },
  wednesday: { open: "10:00", close: "18:00", closed: false },
  thursday: { open: "10:00", close: "18:00", closed: false },
  friday: { open: "10:00", close: "18:00", closed: false },
  saturday: { open: "10:00", close: "18:00", closed: false },
  sunday: { open: "10:00", close: "18:00", closed: true }
};

export const defaultPlaceLinks: PlaceLinks = {
  naver_map: "",
  kakao_map: "",
  google_map: "",
  website: "",
  blog: "",
  instagram: "",
  youtube: ""
};