// 파일: components/ui/toast.tsx
// 화면 아래에 잠깐 떴다 사라지는 한 줄 안내.
//
// 왜 Alert 대신 토스트인가
//   "참가 완료", "저장했어요" 같은 말은 사용자가 대답할 게 없는 소식이다.
//   그걸 시스템 Alert 으로 띄우면 화면이 멈추고 "확인"을 한 번 더 눌러야
//   다음으로 갈 수 있다. 토스트는 흐름을 끊지 않고 알려주고 알아서 사라진다.
//
//   반대로 사용자가 골라야 하는 것(삭제할까요? / 취소·확인)이나 놓치면 안
//   되는 오류는 지금처럼 Alert 으로 둔다.
//
// 쓰는 법
//   toast.show("팀에 합류했어요")
//   toast.show("곧 열릴 기능이에요", { icon: "time-outline" })
//
// 띄우는 쪽은 화면 어디서든 부르기만 하면 되고, 그리는 건 루트 레이아웃의
// <ToastHost /> 한 곳이다. 화면을 옮겨도(저장 후 뒤로가기 등) 토스트가
// 끊기지 않는다.
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";

import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface ToastItem {
  /** 같은 문구를 연달아 띄워도 다시 나타나게 하는 고유값 */
  id: number;
  message: string;
  icon: IconName;
}

interface ToastState {
  current: ToastItem | null;
  show: (message: string, options?: { icon?: IconName }) => void;
  hide: () => void;
}

let nextId = 1;

const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, options) =>
    set({
      current: {
        id: nextId++,
        message,
        icon: options?.icon ?? "checkmark-circle",
      },
    }),
  hide: () => set({ current: null }),
}));

/** 컴포넌트 밖(이벤트 핸들러, 비동기 함수)에서도 부를 수 있게 꺼내둔다. */
export const toast = {
  show: (message: string, options?: { icon?: IconName }) =>
    useToastStore.getState().show(message, options),
};

const VISIBLE_MS = 2200;
const FADE_MS = 180;

/**
 * 탭바(56)와 하단 고정 버튼 위에 뜨도록 띄우는 높이.
 * 탭바가 없는 화면에서는 조금 높아 보이지만, 탭 화면에서 탭바를 가리는 것보다 낫다.
 */
const BOTTOM_OFFSET = 72;

/** 루트 레이아웃에 한 번만 둔다. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const current = useToastStore((state) => state.current);
  const hide = useToastStore((state) => state.hide);

  // 사라지는 애니메이션 동안에도 문구가 남아 있어야 해서 따로 들고 있는다.
  const [shown, setShown] = useState<ToastItem | null>(null);
  const [progress] = useState(() => new Animated.Value(0));

  if (current && current.id !== shown?.id) setShown(current);

  useEffect(() => {
    if (!current) return;

    // 화면 낭독기 사용자는 토스트를 볼 수 없으니 소리로 알려준다
    AccessibilityInfo.announceForAccessibility(current.message);

    Animated.timing(progress, {
      toValue: 1,
      duration: FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) hide();
      });
    }, VISIBLE_MS);

    // 새 토스트가 오면 이전 타이머는 버린다 — 이전 것이 새 것을 지우면 안 된다
    return () => clearTimeout(timer);
  }, [current, progress, hide]);

  if (!shown) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          bottom: insets.bottom + BOTTOM_OFFSET,
          opacity: progress,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={shown.icon} size={18} color={Palette.white} />
      <Text style={styles.text} numberOfLines={2}>
        {shown.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: Spacing.screen,
    right: Spacing.screen,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: Palette.gray800,
    ...Shadow.modal,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.3,
    lineHeight: 21,
    color: Palette.white,
  },
});
