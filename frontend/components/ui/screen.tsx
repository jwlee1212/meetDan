import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewProps, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CardSurface,
  Colors,
  Hairline,
  Palette,
  Radius,
  Spacing,
  Typo,
} from "@/constants/theme";

interface ScreenProps extends ViewProps {
  /**
   * 바탕을 무엇으로 깔지.
   *
   * "surface"(기본) — 흰 바탕. 목록이 죽 이어지는 화면에 쓴다.
   *   당근 피드처럼 행을 헤어라인으로만 나누면 스크롤이 매끄럽다.
   *   홈·활동·알림처럼 "한 종류가 계속 나오는" 화면.
   *
   * "grouped" — 회색 바탕. 성격이 다른 블록을 회색 띠로 끊어 보여주는
   *   화면에 쓴다. 토스 설정 화면 문법이다.
   *   마이·설정·상세처럼 "서로 다른 묶음이 쌓이는" 화면.
   */
  tone?: "surface" | "grouped";
}

/** 화면 컨테이너. 상단 노치 여백을 직접 계산해서 넣어준다. */
export function Screen({
  tone = "surface",
  style,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        tone === "grouped" && styles.screenGrouped,
        { paddingTop: insets.top },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

interface ScreenHeaderProps {
  /** 문자열이면 대표 제목 스타일로 그린다. 로고처럼 직접 그린 걸 넘겨도 된다. */
  title: React.ReactNode;
  /** 제목 아래 한 줄 설명 */
  subtitle?: string;
  /** 우측 액션 버튼 영역 */
  right?: React.ReactNode;
  /** 아래에 헤어라인을 그릴지 (스크롤 콘텐츠와 붙을 때만 true) */
  bordered?: boolean;
}

/** 좌측 정렬 큰 제목 + 우측 아이콘. */
export function ScreenHeader({
  title,
  subtitle,
  right,
  bordered = false,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.header, bordered && styles.headerBordered]}>
      <View style={styles.headerTextGroup}>
        {typeof title === "string" ? (
          <Text style={styles.headerTitle}>{title}</Text>
        ) : (
          title
        )}
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {!!right && <View style={styles.headerRight}>{right}</View>}
    </View>
  );
}

interface NavHeaderProps {
  title: string;
  /** 제목 아래 작은 보조 정보 (참여 인원 등) */
  subtitle?: string;
  onBack: () => void;
  right?: React.ReactNode;
  bordered?: boolean;
}

/**
 * 뒤로가기가 있는 상세 화면용 헤더.
 * 제목을 가운데 두되, 좌우 버튼 폭을 같게 잡아 제목이 흔들리지 않게 한다.
 */
export function NavHeader({
  title,
  subtitle,
  onBack,
  right,
  bordered = true,
}: NavHeaderProps) {
  return (
    <View style={[styles.nav, bordered && styles.headerBordered]}>
      <Pressable
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => [styles.navButton, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name="chevron-back" size={26} color={Palette.gray800} />
      </Pressable>

      <View style={styles.navCenter}>
        <Text style={styles.navTitle} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.navSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.navRight}>{right}</View>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  /** 제목 옆에 붙는 개수 */
  count?: number;
  /** 우측 텍스트 버튼 */
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * 블록 위에 붙는 작은 제목.
 * "무엇의 목록인지" 한 줄 알려주는 것만으로 화면이 훨씬 덜 비어 보인다.
 */
export function SectionHeader({
  title,
  count,
  actionLabel,
  onAction,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>
        {title}
        {count != null && <Text style={styles.sectionCount}>  {count}</Text>}
      </Text>
      {!!actionLabel && !!onAction && (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => pressed && { opacity: 0.6 }}
        >
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * 블록과 블록 사이를 끊는 회색 띠.
 *
 * 토스가 성격이 다른 묶음을 가를 때 쓰는 방법이다. 헤어라인 한 줄보다
 * "여기서 이야기가 바뀐다"가 훨씬 분명하게 읽히고, 카드처럼 여백을
 * 잡아먹지도 않는다.
 */
export function SectionGap({ height = Spacing.gap }: { height?: number }) {
  return <View style={{ height, backgroundColor: Colors.light.background }} />;
}

/* ------------------------------------------------------------------ */
/* 카드 (회색 바탕 위의 흰 카드)                                        */
/* ------------------------------------------------------------------ */

interface CardProps extends ViewProps {
  /** 안쪽 여백을 줄지. 목록처럼 줄이 직접 여백을 갖는 내용이면 false */
  padded?: boolean;
}

/**
 * 묶음 하나를 담는 흰 카드. grouped 화면에서 쓴다.
 *
 * 그림자 없이 회색 바탕과의 명도 차이만으로 떠 보이게 한다. 카드끼리는
 * 아래 여백(Spacing.cardGap)으로 떨어진다.
 */
export function Card({ padded = true, style, children, ...props }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.cardPadded, style]} {...props}>
      {children}
    </View>
  );
}

interface CardHeaderProps {
  title: string;
  count?: number;
  /** 우측 텍스트 버튼 */
  actionLabel?: string;
  onAction?: () => void;
  /** 제목 아래 한 줄 설명 */
  description?: string;
  style?: ViewStyle;
}

/** 카드 맨 위의 굵은 제목. "무엇의 묶음인지"를 크게 말한다. */
export function CardHeader({
  title,
  count,
  actionLabel,
  onAction,
  description,
  style,
}: CardHeaderProps) {
  return (
    <View style={[styles.cardHeader, style]}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>
          {title}
          {count != null && <Text style={styles.cardCount}> {count}</Text>}
        </Text>
        {!!actionLabel && !!onAction && (
          <Pressable
            onPress={onAction}
            hitSlop={8}
            style={({ pressed }) => pressed && { opacity: 0.6 }}
          >
            <Text style={styles.sectionAction}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
      {!!description && (
        <Text style={styles.cardDescription}>{description}</Text>
      )}
    </View>
  );
}

/*
 * FlatList 를 카드 하나에 담는 조각들.
 *
 * FlatList 는 줄을 하나씩 그리므로 카드 하나로 감쌀 수 없다. 그래서 카드를
 * 위 뚜껑(ListHeaderComponent 끝) · 줄(각 renderItem) · 아래 뚜껑
 * (ListFooterComponent)으로 잘라서 이어 붙인다. 셋 다 좌우 여백과 흰 바탕이
 * 같아서 이어 붙이면 둥근 카드 한 장으로 보인다.
 */
export function CardListTop({ children }: { children?: React.ReactNode }) {
  return <View style={[styles.cardSlice, styles.cardTop]}>{children}</View>;
}

export function CardListItem({ children }: { children: React.ReactNode }) {
  return <View style={styles.cardSlice}>{children}</View>;
}

export function CardListBottom() {
  return <View style={[styles.cardSlice, styles.cardBottom]} />;
}

/** 리스트 항목 사이 얇은 구분선 */
export function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={[styles.divider, { marginLeft: inset }]} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  screenGrouped: {
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // 카드 화면에서 제목이 카드 글자 시작선(12+20)보다 조금 바깥에 오도록
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerBordered: {
    borderBottomWidth: Hairline.height,
    borderBottomColor: Hairline.color,
  },
  headerTextGroup: { flex: 1 },
  headerTitle: Typo.display,
  headerSubtitle: {
    ...Typo.caption,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },

  nav: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.light.surface,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navCenter: { flex: 1, alignItems: "center" },
  navTitle: {
    ...Typo.subtitle,
    fontSize: 16,
  },
  navSubtitle: {
    ...Typo.caption,
    fontSize: 12,
    marginTop: 1,
  },
  navRight: {
    minWidth: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    // 배경을 칠하지 않는다. 흰 블록 안에 놓이면 희게, 회색 띠 위에 놓이면
    // 회색으로 — 자기가 얹힌 면을 그대로 따라간다.
  },
  sectionTitle: Typo.section,
  sectionCount: { color: Palette.brand, fontWeight: "700" },
  sectionAction: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: Palette.gray600,
  },

  card: CardSurface,
  cardPadded: { padding: Spacing.cardPadding },
  cardHeader: {
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.cardPadding,
    paddingBottom: Spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: Typo.cardTitle,
  cardCount: { color: Palette.brand },
  cardDescription: { ...Typo.caption, marginTop: 4 },

  cardSlice: {
    marginHorizontal: Spacing.cardInset,
    backgroundColor: Palette.white,
  },
  cardTop: {
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
  },
  cardBottom: {
    height: Spacing.md,
    marginBottom: Spacing.cardGap,
    borderBottomLeftRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
  },

  divider: {
    height: Hairline.height,
    backgroundColor: Hairline.color,
  },
});
