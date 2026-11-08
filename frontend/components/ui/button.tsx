// 파일: components/ui/button.tsx
// 앱의 모든 "버튼 모양 버튼"은 이 컴포넌트를 쓴다.
//
// 예전에는 화면마다 버튼을 직접 그렸다. 모서리가 12·14로, 글자가 15·16·17로,
// 누름 효과가 투명도·축소로 제각각이라 같은 앱인데 화면을 옮길 때마다
// 손에 닿는 느낌이 달랐다. 모양은 여기 한곳에서만 정한다.
//
// 변형(variant)
//   primary   채운 파랑. 화면에서 "지금 눌러야 할 것" 하나에만.
//   secondary 회색 채움. 취소·닫기처럼 primary 옆에 놓이는 보조 동작.
//   outline   흰 바탕 + 테두리. 목록 안에서 튀지 않게 놓는 동작(후기 남기기 등).
//   danger    채운 빨강. 신고처럼 되돌리기 부담이 있는 동작의 최종 확인에만.
//
// 크기(size)
//   lg 56 — 화면·시트 하단의 주 동작
//   md 48 — 블록 안의 동작
//   sm 36 — 한 줄 옆에 붙는 작은 동작
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { PressScale } from "@/components/ui/press-scale";
import { Palette, Radius } from "@/constants/theme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "lg" | "md" | "sm";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  disabled?: boolean;
  /** 부모 행에서 남은 폭을 나눠 가질 비율 (취소 1 : 확인 2 처럼) */
  flex?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const VARIANTS: Record<
  ButtonVariant,
  { bg: string; fg: string; border?: string }
> = {
  primary: { bg: Palette.brand, fg: Palette.white },
  secondary: { bg: Palette.gray100, fg: Palette.gray700 },
  outline: { bg: Palette.white, fg: Palette.gray700, border: Palette.gray300 },
  danger: { bg: Palette.red, fg: Palette.white },
};

/** 누를 수 없을 때. 파랑을 거둬서 "지금은 못 누른다"가 색으로 읽히게 한다. */
const DISABLED = { bg: Palette.gray200, fg: Palette.gray500 };

const SIZES: Record<
  ButtonSize,
  { height: number; fontSize: number; icon: number; padding: number }
> = {
  lg: { height: 56, fontSize: 17, icon: 20, padding: 20 },
  md: { height: 48, fontSize: 15, icon: 18, padding: 16 },
  sm: { height: 36, fontSize: 14, icon: 16, padding: 12 },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  icon,
  loading = false,
  disabled = false,
  flex,
  style,
  accessibilityLabel,
}: ButtonProps) {
  // 로딩 중에는 눌리지만 않을 뿐 색은 그대로 둔다. 회색으로 바뀌면 실패한 것처럼 보인다.
  const colors = disabled ? DISABLED : VARIANTS[variant];
  const s = SIZES[size];
  const inactive = disabled || loading;

  return (
    <PressScale
      scaleTo={0.97}
      disabled={inactive}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.padding,
          backgroundColor: colors.bg,
          borderColor: "border" in colors ? colors.border : "transparent",
        },
        flex != null && { flex },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <View style={styles.content}>
          {!!icon && <Ionicons name={icon} size={s.icon} color={colors.fg} />}
          <Text
            style={[styles.text, { fontSize: s.fontSize, color: colors.fg }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    // 테두리 없는 변형도 같은 두께의 투명 테두리를 둬서 높이가 똑같다
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});
