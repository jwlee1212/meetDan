import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Palette, Radius, Spacing } from "@/constants/theme";

export interface SegmentItem<T extends string> {
  value: T;
  label: string;
  /** 라벨 뒤에 붙는 개수. 0이면 표시하지 않는다. */
  count?: number;
}

interface SegmentedProps<T extends string> {
  items: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * 알약 세그먼트 (회색 트랙 위에 흰 알약).
 *
 * 한동안 밑줄 탭이었다. 목록 화면이 흰 바탕이라 회색 트랙이 묻혔기 때문이다.
 * 이제 목록 화면도 회색 바탕 위에 흰 카드를 올리므로, 트랙(gray200)은 바탕
 * 위에서, 고른 알약(흰색)은 트랙 위에서 각각 한 단계씩 밝아져 또렷하게 읽힌다.
 * 토스가 회색 바탕 화면에서 탭을 나누는 방식이다.
 */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <View style={styles.track}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && !active && { opacity: 0.6 },
            ]}
          >
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {item.label}
              {!!item.count && (
                <Text style={active ? styles.countActive : styles.count}>
                  {"  "}
                  {item.count}
                </Text>
              )}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    marginHorizontal: Spacing.cardInset,
    marginBottom: Spacing.md,
    padding: 4,
    borderRadius: Radius.md,
    backgroundColor: Palette.gray200,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: Radius.sm,
  },
  segmentActive: {
    backgroundColor: Palette.white,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: Palette.gray600,
  },
  labelActive: { color: Palette.gray900, fontWeight: "700" },
  count: { color: Palette.gray500 },
  countActive: { color: Palette.brand },
});
