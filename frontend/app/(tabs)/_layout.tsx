// 파일: app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Hairline, Palette } from "@/constants/theme";

/** 탭 아이콘: 선택되면 채워진 아이콘으로 바뀐다. */
// expo-router 의 Tabs 는 color 를 ColorValue 로 넘긴다. RN 0.88(SDK 58)부터
// ColorValue 에 null·number(처리된 색 정수)가 포함됐는데, Ionicons 는
// string | OpaqueColorValue 만 받으므로 그 둘은 걸러서 넘긴다.
const toIconColor = (color: ColorValue) =>
  color == null || typeof color === "number" ? undefined : color;

const tabIcon = (name: string) => {
  const TabBarIcon = ({
    color,
    focused,
  }: {
    color: ColorValue;
    focused: boolean;
  }) => (
    <Ionicons
      name={(focused ? name : `${name}-outline`) as any}
      size={24}
      color={toIconColor(color)}
    />
  );
  TabBarIcon.displayName = `TabBarIcon(${name})`;
  return TabBarIcon;
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        // 홈 인디케이터 높이를 인셋에서 직접 받아 기기별로 정확히 맞춘다
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: Palette.white,
          borderTopWidth: Hairline.height,
          borderTopColor: Hairline.color,
          // 토스/당근 탭바는 그림자 없이 헤어라인만 쓴다
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: -0.2,
          marginTop: 2,
        },
        tabBarItemStyle: { paddingTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "홈", tabBarIcon: tabIcon("home") }}
      />
      <Tabs.Screen
        name="my_team"
        options={{ title: "내 팀", tabBarIcon: tabIcon("people") }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: "활동", tabBarIcon: tabIcon("albums") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "마이", tabBarIcon: tabIcon("person") }}
      />
    </Tabs>
  );
}
