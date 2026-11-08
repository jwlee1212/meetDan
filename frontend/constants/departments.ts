/**
 * constants/departments.ts
 *
 * 캠퍼스(Campus) → 단과대(College) → 세부 학과(departments) 목록.
 * 아래 배열에 실제 학과를 하드코딩해서 채워 넣으면 회원가입 화면에 그대로 반영됩니다.
 *
 * - id: 내부 식별자 (중복되지 않게)
 * - name: 화면에 보여줄 단과대 이름
 * - campus: 소속 캠퍼스. 회원가입에서 캠퍼스로 먼저 걸러내므로 반드시 지정해야 합니다.
 *   (빠뜨리면 그 단과대는 어느 캠퍼스에서도 보이지 않습니다)
 * - departments: 해당 단과대의 세부 학과 이름 목록
 */

export type Campus = "죽전" | "천안";

/** 캠퍼스 선택 화면에 보여줄 순서 */
export const CAMPUS_LIST: Campus[] = ["죽전", "천안"];

export interface College {
  id: string;
  name: string;
  campus: Campus;
  departments: string[];
}

export const COLLEGES: College[] = [
  // ==========================================
  // 죽전캠퍼스 (Jukjeon Campus)
  // ==========================================
  {
    id: "liberal_arts",
    name: "문과대학",
    campus: "죽전",
    departments: ["국어국문학과", "사학과", "철학과", "영미인문학과"],
  },
  {
    id: "law",
    name: "법과대학",
    campus: "죽전",
    departments: ["법학과"],
  },
  {
    id: "social_sciences",
    name: "사회과학대학",
    campus: "죽전",
    departments: [
      "정치외교학과",
      "행정학과",
      "도시계획·부동산학부",
      "미디어커뮤니케이션학부",
      "상담학과",
    ],
  },
  {
    id: "business",
    name: "경영경제대학",
    campus: "죽전",
    departments: ["경제학과", "무역학과", "경영학부", "산업경영학과(야)"],
  },
  {
    id: "engineering",
    name: "공과대학",
    campus: "죽전",
    departments: [
      "전자전기공학과",
      "융합반도체공학과",
      "고분자시스템공학부",
      "인프라건설공학과",
      "기계공학과",
      "화학공학과",
      "건축학부",
    ],
  },
  {
    id: "software",
    name: "AI융합대학",
    campus: "죽전",
    departments: [
      "소프트웨어학과",
      "인공지능학과",
      "컴퓨터공학과",
      "통계데이터사이언스학과",
      "사이버보안학과",
      "AI건축융합학과",
      "SW융합학부",
    ],
  },
  {
    id: "education",
    name: "사범대학",
    campus: "죽전",
    departments: [
      "한문교육과",
      "특수교육과",
      "수학교육과",
      "과학교육과",
      "체육교육과",
    ],
  },
  {
    id: "music_and_arts",
    name: "음악·예술대학",
    campus: "죽전",
    departments: ["도예과", "디자인학부", "공연영화학부", "무용과", "음악학부"],
  },
  {
    id: "primus_international",
    name: "프리무스국제대학",
    campus: "죽전",
    departments: [
      "국제경영학과",
      "모바일시스템공학과",
      "바이오소재융합공학과",
      "한국학과",
      "연기영상예술학과",
      "글로벌기초교육학부",
    ],
  },

  // ==========================================
  // 천안캠퍼스 (Cheonan Campus)
  // ==========================================
  {
    id: "foreign_languages",
    name: "외국어대학",
    campus: "천안",
    departments: [
      "아시아중동학부",
      "유럽중남미학부",
      "영어과",
      "글로벌한국어과",
    ],
  },
  {
    id: "public_service",
    name: "공공인재대학",
    campus: "천안",
    departments: [
      "공공정책학과",
      "공공정책학과(야)",
      "사회복지학과",
      "해병대군사학과",
      "식품자원경제학과",
    ],
  },
  {
    id: "science_and_technology",
    name: "과학기술대학",
    campus: "천안",
    departments: [
      "수학과",
      "물리학과",
      "화학과",
      "식품영양학과",
      "신소재공학과",
      "에너지공학과",
      "경영공학과",
      "제약공학과",
    ],
  },
  {
    id: "bio_convergence",
    name: "바이오융합대학",
    campus: "천안",
    departments: [
      "생명공학부",
      "의생명과학부",
      "식품공학과",
      "코스메디컬소재학과",
    ],
  },
  {
    id: "health_sciences",
    name: "보건과학대학",
    campus: "천안",
    departments: [
      "보건행정학과",
      "임상병리학과",
      "물리치료학과",
      "치위생학과",
      "심리학과",
    ],
  },
  {
    id: "nursing",
    name: "간호대학",
    campus: "천안",
    departments: ["간호학과"],
  },
  {
    id: "medicine",
    name: "의과대학",
    campus: "천안",
    departments: ["의예과", "의학과"],
  },
  {
    id: "dentistry",
    name: "치과대학",
    campus: "천안",
    departments: ["치의예과", "치의학과"],
  },
  {
    id: "pharmacy",
    name: "약학대학",
    campus: "천안",
    departments: ["약학과"],
  },
  {
    id: "arts_cheonan",
    name: "예술대학",
    campus: "천안",
    departments: ["미술학부", "문예창작과", "뉴뮤직학부"],
  },
  {
    id: "sports_sciences",
    name: "스포츠과학대학",
    campus: "천안",
    departments: ["생활체육학과", "스포츠경영학과", "국제스포츠학부"],
  },
];

/** 해당 캠퍼스에 속한 단과대만 골라냅니다. */
export const getCollegesByCampus = (campus: Campus): College[] =>
  COLLEGES.filter((college) => college.campus === campus);

/** 학과 이름으로 소속 단과대를 찾습니다. (프로필 수정 등에서 초기값 복원용) */
export const findCollegeByDept = (dept: string): College | undefined =>
  COLLEGES.find((college) => college.departments.includes(dept));
