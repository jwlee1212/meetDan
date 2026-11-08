// 파일: app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Hairline, Palette } from "@/constants/theme";

/** 탭 아이콘: 선택되면 채워진 아이콘으로 바뀐다. */
// color 를 string 이 아니라 ColorValue 로 받는다. RN 0.86(SDK 57)부터
// tabBarIcon 이 넘겨주는 색이 ColorValue(= string | OpaqueColorValue)로 넓어졌다.
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
      color={color}
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
