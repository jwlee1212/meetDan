/**
 * constants/theme.ts
 * 밋단(MeetDan) 디자인 시스템 토큰
 *
 * 기준 세 가지 — 이 파일 밖에서 색을 새로 만들지 않는다.
 *
 * 1) 회색 바탕 위의 흰 카드 (토스 홈 문법)
 *    예전에는 "카드 대신 꽉 찬 흰 블록 + 헤어라인"이었다. 토스 설정 화면을
 *    본뜬 것인데, 홈처럼 성격이 다른 묶음이 쌓이는 화면에 쓰니 흰 줄이
 *    헤어라인으로만 나뉘어 화면 전체가 한 덩어리로 보였다 — 명암이 없었다.
 *    토스도 앱의 얼굴인 홈·혜택·자산 화면은 이렇게 그린다.
 *      · 바탕은 회색(canvas)
 *      · 묶음 하나가 흰 카드 하나 (모서리 Radius.card, 좌우 Spacing.cardInset)
 *      · 카드 안에는 헤어라인을 거의 쓰지 않는다. 줄 간격과 글자 위계로 나눈다
 *      · 카드 사이는 Spacing.cardGap 만큼 회색 바탕이 비친다
 *    그림자는 여전히 "진짜로 떠 있는 것"(FAB·하단 고정 버튼·모달)에만 쓴다.
 *    카드는 바탕과의 명도 차이로만 떠 보이게 한다.
 *
 *    채팅처럼 한 종류가 끝없이 이어지는 화면은 지금처럼 흰 바탕을 쓴다.
 *
 * 1-1) 글자 위계를 크게 벌린다
 *    명암의 절반은 글자다. 화면 제목(26)과 카드 제목(20), 목록 제목(17),
 *    보조 글자(14, 회색)의 차이가 커야 눈이 어디부터 읽을지 안다.
 *
 * 2) 파랑은 "누를 수 있는 것"에만
 *    채운 파랑 = 지금 눌러야 할 것. 옅은 색 알약 = 그냥 정보.
 *    이 규칙 하나로 캠퍼스·성별·상태 뱃지가 버튼처럼 보이던 문제를 없앤다.
 *
 * 3) 글자는 전부 WCAG AA(4.5:1) 이상
 *    아래 색들은 실제로 쓰이는 배경(흰색·canvas·gray100·각 weak 배경) 위에서
 *    대비를 계산해 통과한 값만 남긴 것이다. 회색을 더 밝게 바꾸지 말 것.
 */
import { Platform, StyleSheet } from "react-native";

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

export const Palette = {
  /* 브랜드 (단국대 블루)
     예전 #3288FF 는 흰 글씨를 얹으면 대비가 3.44:1 이라 기본 버튼 글씨부터
     기준 미달이었다. 한 단계 눌러 5.20:1 로 맞췄다. */
  brand: "#1668DB",
  brandPressed: "#1257BC",
  brandWeak: "#E8F3FF", // 옅은 브랜드 배경
  brandText: "#175FC0", // brandWeak 위 글자 (5.37:1)

  /* 그레이 스케일 — 토스 그레이 계열.
     토스 원본(600 #6B7684, 500 #8B95A1)은 회색 바탕 위에서 4.5:1 을 못 넘어서
     글자용 두 단계(600·500)만 한 칸씩 진하게 잡았다. 나머지는 토스 값 그대로.
     gray500 위쪽은 전부 글자로 써도 되는 색이다 (canvas 위에서도 4.6:1 이상).
     gray400 아래는 글자로 쓰지 않는다 — 아이콘·테두리·비활성 전용. */
  gray900: "#191F28", // 제목
  gray800: "#333D4B",
  gray700: "#4E5968", // 본문
  gray600: "#5F6B7A", // 보조 설명 (canvas 위 4.92:1)
  gray500: "#646F7C", // 흐린 메타 — 여기까지가 글자 하한선 (canvas 위 4.64:1)
  gray400: "#8B95A1", // 아이콘·비활성 (흰 바탕 3.04:1, 비텍스트 기준 통과)
  gray300: "#D1D6DB", // 테두리
  gray200: "#E5E8EB", // 구분선
  gray100: "#F2F4F6", // 채움 배경
  gray50: "#F9FAFB",
  /**
   * 카드 화면의 바탕. 흰 카드가 이 위에 놓인다.
   * gray100 과 같은 값이라, 카드 밖(회색 바탕 위)에 gray100 채움 버튼·칩을
   * 두면 사라진다. 카드 밖에는 흰 채움이나 테두리 있는 것만 둔다.
   */
  canvas: "#F2F4F6",
  white: "#FFFFFF",

  /* 시맨틱 — solid 는 흰 배경 위 글자/아이콘용,
     weak 는 배경용, text 는 그 weak 배경 위 글자용 */
  red: "#D42B39",
  redWeak: "#FDEBEC",
  redText: "#C0272E",

  green: "#08804A",
  greenWeak: "#E3F6EC",
  greenText: "#08703F",

  orange: "#B45B00",
  orangeWeak: "#FFF2DF",
  orangeText: "#9A4E00",

  pink: "#CE3563",
  pinkWeak: "#FFECF1",
  pinkText: "#B92543",
  // 브랜드 블루 위에 얹는 핑크. pink는 blue 위에서 1.07:1이라 형체가 사라진다.
  pinkOnBrand: "#FF9EB8", // brand 위에서 2.68:1
} as const;

/* ------------------------------------------------------------------ */
/* Spacing / Radius                                                    */
/* ------------------------------------------------------------------ */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  /** 화면 좌우 기본 여백. 블록 안쪽 여백도 이 값을 써서 글자 시작선을 맞춘다. */
  screen: 16,
  /** 블록과 블록 사이 회색 띠의 높이 */
  gap: 10,
  /** 카드와 화면 가장자리 사이 (회색 바탕이 비치는 폭) */
  cardInset: 12,
  /** 카드 안쪽 여백 */
  cardPadding: 20,
  /** 카드와 카드 사이 */
  cardGap: 12,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 24,
  /** 회색 바탕 위 흰 카드 */
  card: 20,
  /** 목록 줄 앞의 색 타일·아바타 사각형 */
  tile: 16,
  full: 999,
} as const;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const Typo = {
  /** 화면 대표 제목 */
  display: {
    fontSize: 26,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
    color: Palette.gray900,
  },
  /** 헤더·시트 제목 */
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    color: Palette.gray900,
  },
  /** 카드 맨 위 제목 ("지금 열린 팀") */
  cardTitle: {
    fontSize: 19,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    color: Palette.gray900,
  },
  /** 카드/리스트 제목 */
  subtitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    letterSpacing: -0.4,
    color: Palette.gray900,
  },
  /** 섹션 라벨 */
  section: {
    fontSize: 14,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
    color: Palette.gray800,
  },
  /** 본문 */
  body: {
    fontSize: 15,
    fontWeight: "500" as const,
    letterSpacing: -0.3,
    color: Palette.gray700,
  },
  /** 보조 설명 */
  caption: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: -0.2,
    color: Palette.gray600,
  },
  /** 아주 작은 라벨 (뱃지 등) */
  label: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: -0.2,
    color: Palette.gray600,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Elevation                                                           */
/* ------------------------------------------------------------------ */

/**
 * 그림자는 진짜로 떠 있는 것에만 쓴다 — FAB, 하단 고정 버튼, 모달.
 *
 * 목록 행이나 섹션 블록에는 쓰지 않는다. 토스도 당근도 안 쓴다.
 * 평평한 블록을 헤어라인과 회색 띠로 나누는 편이 훨씬 정돈돼 보이고,
 * 그림자가 겹치기 시작하면 화면이 금방 지저분해진다.
 */
export const Shadow = {
  none: {},
  soft: Platform.select({
    ios: {
      shadowColor: "#0B1220",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  modal: Platform.select({
    ios: {
      shadowColor: "#0B1220",
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 24,
    },
    android: { elevation: 12 },
    default: {},
  }),
} as const;

/**
 * 회색 바탕 위 흰 카드의 겉모양. <Card> 를 못 쓰는 곳(FlatList 행 자체가
 * 카드인 경우, 기존 블록 스타일을 카드로 바꾸는 경우)에서 펼쳐 쓴다.
 */
export const CardSurface = {
  marginHorizontal: Spacing.cardInset,
  marginBottom: Spacing.cardGap,
  borderRadius: Radius.card,
  backgroundColor: Palette.white,
  overflow: "hidden" as const,
};

/** 1px 헤어라인 (기기 픽셀 밀도와 무관하게 얇게) */
export const Hairline = {
  height: StyleSheet.hairlineWidth,
  color: Palette.gray200,
} as const;

/* ------------------------------------------------------------------ */
/* Colors (시맨틱 매핑)                                                 */
/* ------------------------------------------------------------------ */

const tintColorLight = Palette.brand;
const tintColorDark = "#7FB2FF";

export const Colors = {
  light: {
    primary: Palette.brand,
    primaryPressed: Palette.brandPressed,
    primaryMuted: Palette.brandWeak,

    text: Palette.gray900,
    textSecondary: Palette.gray600,
    textBody: Palette.gray700,
    disabled: Palette.gray400,

    /** grouped 화면의 바탕이자 블록 사이 회색 띠의 색 */
    background: Palette.canvas,
    backgroundMuted: Palette.gray100,
    /** 내용을 담는 흰 면 (블록·시트·목록 화면 바탕) */
    surface: Palette.white,

    tint: tintColorLight,
    icon: Palette.gray600,
    tabIconDefault: Palette.gray400,
    tabIconSelected: tintColorLight,

    border: Palette.gray200,
    divider: Palette.gray200,
    inputBackground: Palette.gray100,

    danger: Palette.red,
    success: Palette.green,
  },
  dark: {
    primary: "#4B96FF",
    primaryPressed: "#3288FF",
    primaryMuted: "#17263B",

    text: "#ECEDEE",
    textSecondary: "#A7AEB6",
    textBody: "#C4C9CE",
    disabled: "#5A6068",

    background: "#101315",
    backgroundMuted: "#1A1E21",
    surface: "#1A1E21",

    tint: tintColorDark,
    icon: "#A7AEB6",
    tabIconDefault: "#78818B",
    tabIconSelected: tintColorDark,

    border: "#2C3033",
    divider: "#232628",
    inputBackground: "#222",

    danger: "#FF6B76",
    success: "#2ED18B",
  },
};

/* ------------------------------------------------------------------ */
/* 도메인 컬러 (캠퍼스 / 성별)                                           */
/* ------------------------------------------------------------------ */

/**
 * 캠퍼스는 중립색이다.
 *
 * 예전엔 죽전=파랑, 천안=초록이었는데 파랑은 이미 성별(남)과 버튼이 쓰고
 * 있었다. 한 줄 안에서 파란 타일(남자팀)과 파란 뱃지(죽전)가 서로 다른 뜻으로
 * 나란히 놓이니 색이 아무 정보도 못 줬다. 캠퍼스는 글자만으로 충분히 읽히므로
 * 색을 회수하고, 파랑은 성별과 버튼에만 남긴다.
 */
export const CampusColor = {
  죽전: { fg: Palette.gray700, bg: Palette.gray100 },
  천안: { fg: Palette.gray700, bg: Palette.gray100 },
} as const;

/** 성별은 목록에서 가장 먼저 읽히는 정보라 색을 준다 (남=파랑 / 여=분홍) */
export const GenderColor = {
  M: { fg: Palette.brandText, bg: Palette.brandWeak, icon: "male" as const },
  F: { fg: Palette.pinkText, bg: Palette.pinkWeak, icon: "female" as const },
} as const;
