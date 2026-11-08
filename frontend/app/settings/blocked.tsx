// 파일: app/settings/blocked.tsx
//
// 차단 목록. 마이 탭 → "차단 목록"으로 들어온다.
//
// 목록의 출처는 서버(blocks)다. 스토어의 blockedUsers 는 채팅방이
// 메시지를 가릴 때 쓰는 사본이라, 이 화면은 들어올 때마다 서버로 한 번
// 맞춰 둔다 — 다른 기기에서 푼 차단이 여기 남아 있으면 안 된다.
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { API } from "@/api/client";
import { EmptyState } from "@/components/ui/empty-state";
import { Divider, NavHeader, Screen } from "@/components/ui/screen";
import { Palette, Radius, Spacing, Typo } from "@/constants/theme";
import { BlockedUser, useStore } from "@/store/useStore";

export default function BlockedListScreen() {
  const router = useRouter();

  const blockedUsers = useStore((state) => state.blockedUsers);
  const setBlockedUsers = useStore((state) => state.setBlockedUsers);
  const unblockLocally = useStore((state) => state.unblockUser);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  /** 해제 요청이 날아가 있는 사람. 응답 오기 전 두 번 누르는 걸 막는다. */
  const [pendingId, setPendingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await API.getBlockedUsers();
    if (result.code !== 200 || !result.data) {
      // 401(세션 만료)은 _layout.tsx 가 로그인 화면으로 보내므로 조용히 둔다.
      if (result.code !== 401) {
        Alert.alert("오류", result.message ?? "차단 목록을 불러오지 못했어요.");
      }
      return;
    }
    setBlockedUsers(result.data);
  }, [setBlockedUsers]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        await reload();
        if (alive) setIsLoading(false);
      })();
      return () => {
        alive = false;
      };
    }, [reload]),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await reload();
    setIsRefreshing(false);
  };

  /**
   * 해제는 서버에 먼저 쓴다. 성공해야 목록에서 지운다 — 반대로 하면
   * 실패했을 때 '풀린 줄 알았는데 상대 메시지가 여전히 안 보이는'
   * 상태가 된다(진짜 차단 여부는 서버가 쥐고 있다).
   */
  const handleUnblock = async (user: BlockedUser) => {
    setPendingId(user.id);
    const result = await API.unblockUser(user.id);
    setPendingId(null);

    if (result.code !== 200) {
      Alert.alert("오류", result.message ?? "차단을 해제하지 못했어요.");
      return;
    }
    unblockLocally(user.id);
  };

  const confirmUnblock = (user: BlockedUser) =>
    Alert.alert(
      `${user.name} 님의 차단을 해제할까요?`,
      "해제하면 다시 메시지를 주고받을 수 있고, 매칭에서도 만날 수 있어요.",
      [
        { text: "취소", style: "cancel" },
        { text: "차단 해제", onPress: () => handleUnblock(user) },
      ],
    );

  const renderItem = ({ item }: { item: BlockedUser }) => {
    const pending = pendingId === item.id;

    return (
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[item.dept, `${item.blockedAt} 차단`].filter(Boolean).join(" · ")}
          </Text>
        </View>

        <Pressable
          disabled={pending}
          onPress={() => confirmUnblock(item)}
          style={({ pressed }) => [
            styles.unblock,
            (pressed || pending) && { opacity: 0.6 },
          ]}
        >
          {pending ? (
            <ActivityIndicator size="small" color={Palette.gray600} />
          ) : (
            <Text style={styles.unblockText}>차단 해제</Text>
          )}
        </Pressable>
      </View>
    );
  };

  if (isLoading) {
    return (
      <Screen tone="grouped">
        <NavHeader title="차단 목록" onBack={() => router.back()} />
        <View style={styles.loading}>
          <ActivityIndicator color={Palette.brand} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen tone="grouped">
      <NavHeader title="차단 목록" onBack={() => router.back()} />

      <FlatList
        data={blockedUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider inset={68} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.brand}
          />
        }
        ListHeaderComponent={
          blockedUsers.length > 0 ? (
            <View style={styles.notice}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={Palette.gray500}
              />
              <Text style={styles.noticeText}>
                차단한 사용자의 메시지는 보이지 않고, 매칭 상대로도 다시
                만나지 않아요.
              </Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            icon="shield-checkmark-outline"
            title="차단한 사용자가 없어요"
            description={
              "채팅방에서 상대를 길게 누르거나\n채팅방 정보에서 차단할 수 있어요."
            }
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: Spacing.xxxl },

  loading: { flex: 1, alignItems: "center", justifyContent: "center" },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.gap,
    backgroundColor: Palette.brandWeak,
  },
  noticeText: {
    ...Typo.caption,
    flex: 1,
    lineHeight: 19,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    backgroundColor: Palette.white,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Palette.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: Palette.gray600,
  },
  body: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: Palette.gray900,
  },
  meta: { ...Typo.caption, fontSize: 12, marginTop: 2 },

  unblock: {
    // 스피너로 바뀌어도 버튼이 줄어들지 않게 폭·높이를 잡아 둔다.
    minWidth: 80,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    backgroundColor: Palette.gray100,
  },
  unblockText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: Palette.gray700,
  },
});
