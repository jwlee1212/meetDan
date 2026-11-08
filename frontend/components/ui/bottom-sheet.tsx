import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Palette, Radius, Shadow, Spacing, Typo } from "@/constants/theme";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const OPEN_MS = 260;
const CLOSE_MS = 200;

/**
 * 아래에서 올라오는 시트. 앱의 모든 시트는 이 컴포넌트를 쓴다.
 *
 * 왜 Modal 의 animationType="slide" 를 안 쓰는가
 *   slide 는 Modal 전체를 밀어 올린다. 어두운 배경까지 시트와 함께 아래에서
 *   올라와서, 화면 아래쪽이 한동안 덜 어두운 채로 띠처럼 보인다. 배경은
 *   제자리에서 서서히 어두워지고 시트만 올라와야 한다. 그래서 Modal 은
 *   애니메이션 없이 띄우고, 배경(투명도)과 시트(위치)를 따로 움직인다.
 *
 * 닫을 때도 애니메이션이 끝난 뒤에 Modal 을 내린다. visible 이 false 가
 * 되자마자 Modal 을 내리면 시트가 내려가는 모습 없이 툭 사라진다.
 *
 * 키보드
 *   iOS 는 padding 으로 시트를 밀어 올린다. Android 는 edge-to-edge 라 창이
 *   리사이즈되지 않으므로 height 방식으로 키보드만큼 줄인다. 키보드가 떠
 *   있으면 홈 인디케이터는 가려지므로 그 여백은 뺀다.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  // Modal 이 실제로 떠 있는지. 닫는 애니메이션 동안은 visible 이 false 여도 떠 있다.
  const [mounted, setMounted] = useState(visible);
  const [progress] = useState(() => new Animated.Value(0));
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // 열라는 신호는 렌더 중에 바로 반영한다(effect 에서 setState 하면 한 번 더 그린다).
  // 닫을 때는 애니메이션이 끝난 뒤 아래 effect 의 콜백이 내린다.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, progress]);

  useEffect(() => {
    if (!mounted) return;
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardOpen(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
      setIsKeyboardOpen(false);
    };
  }, [mounted]);

  // 시트 높이를 몰라도 화면 높이만큼 내려두면 항상 화면 밖에서 출발한다.
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get("window").height, 0],
  });

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable style={styles.fillAbsolute} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: isKeyboardOpen
                ? Spacing.lg
                : insets.bottom + Spacing.lg,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!description && (
            <Text style={styles.description}>{description}</Text>
          )}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface SheetActionProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  description?: string;
  /** danger는 신고·차단처럼 되돌리기 부담이 있는 항목에만 */
  tone?: "default" | "danger";
  onPress: () => void;
}

/** 시트 안에 들어가는 액션 한 줄. */
export function SheetAction({
  icon,
  label,
  description,
  tone = "default",
  onPress,
}: SheetActionProps) {
  const color = tone === "danger" ? Palette.red : Palette.gray800;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        pressed && { backgroundColor: Palette.gray50 },
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: tone === "danger" ? Palette.redWeak : Palette.gray100 },
        ]}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.actionText}>
        <Text style={[styles.actionLabel, { color }]}>{label}</Text>
        {!!description && (
          <Text style={styles.actionDesc}>{description}</Text>
        )}
      </View>
    </Pressable>
  );
}

/** 시트를 그냥 닫는 회색 버튼. */
export function SheetCancel({ onPress }: { onPress: () => void }) {
  return (
    <Button
      title="닫기"
      variant="secondary"
      onPress={onPress}
      style={styles.cancel}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: "flex-end" },
  fillAbsolute: StyleSheet.absoluteFill,
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(11,18,32,0.5)",
  },
  sheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    ...Shadow.modal,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.gray200,
    marginBottom: Spacing.xl,
  },
  title: Typo.title,
  description: {
    ...Typo.caption,
    marginTop: 6,
    lineHeight: 19,
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { flex: 1 },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  actionDesc: { ...Typo.caption, fontSize: 12, marginTop: 2 },

  cancel: { marginTop: Spacing.md },
});
