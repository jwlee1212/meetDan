// 파일: app/post/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { BottomSheet, SheetCancel } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { MemberProfileSheet } from "@/components/ui/member-profile-sheet";
import { PressScale } from "@/components/ui/press-scale";
import { NavHeader, Screen } from "@/components/ui/screen";
import { getAvatarSource } from "@/constants/avatars";
import {
  CampusColor,
  CardSurface,
  GenderColor,
  Palette,
  Radius,
  Shadow,
  Spacing,
  Typo,
} from "@/constants/theme";
import { MatchRequest, Team, TeamMember, useStore } from "@/store/useStore";

/**
 * 내 팀으로 이 게시글에 신청할 수 없는 이유. 신청할 수 있으면 null.
 *
 * 서버(마이그레이션 009 의 assert_match_request_valid, 대기중 중복 금지
 * 인덱스)가 막는 것과 같은 조건이다. 예전에는 시트에서 팀을 고른 뒤에야
 * Alert 으로 알려줬다 — 고를 수 없는 팀을 고르게 해놓고 혼내는 셈이었다.
 * 이제 시트에서 미리 흐리게 보여주고 이유를 그 줄에 적는다.
 */
function blockReason(
  team: Team,
  target: Team,
  waitingFrom: Set<string>,
): string | null {
  if (team.status === "MATCHED") return "매칭이 끝난 팀이에요";
  if (team.gender === target.gender) return "같은 성별 팀에는 신청할 수 없어요";
  if (team.count !== target.count)
    return `${team.count}명 팀이에요 · 상대는 ${target.count}명 팀`;
  if (team.currentCount < team.count)
    return `팀원이 ${team.count - team.currentCount}명 더 모여야 해요`;
  if (waitingFrom.has(team.id)) return "이미 신청했어요 · 수락 대기중";
  return null;
}

export default function PostDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const posts = useStore((state) => state.posts);
  const myTeams = useStore((state) => state.myTeams);
  const setMyTeams = useStore((state) => state.setMyTeams);
  const setRequests = useStore((state) => state.setRequests);

  const targetPost = posts.find((p) => p.id.toString() === id);
  const [modalVisible, setModalVisible] = useState(false);
  /** 지금 신청을 보내는 중인 내 팀. 그 줄에만 스피너를 띄운다. */
  const [sendingTeamId, setSendingTeamId] = useState<string | null>(null);
  const isSending = sendingTeamId != null;
  /**
   * 이 팀과 이미 오간 신청. 못 읽으면 null 로 두고 평소처럼 신청을 받는다 —
   * 중복은 어차피 서버가 막는다. 이것 때문에 신청 자체를 막지는 않는다.
   */
  const [requests, setLocalRequests] = useState<{
    received: MatchRequest[];
    sent: MatchRequest[];
  } | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(
    null,
  );
  /** 내 팀 목록을 아직 읽는 중 / 읽지 못했음 */
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teamsFailed, setTeamsFailed] = useState(false);

  /**
   * 내 팀 목록은 [내 팀] 탭이 화면에 들어올 때 채운다. 그런데 여기는 홈에서
   * 바로 들어올 수 있어서, 앱을 켜자마자 신청을 누르면 팀이 있는데도
   * myTeams 가 비어 있다 — "팀이 없어요" 가 그래서 떴다.
   * 신청은 이 화면의 본론이니 목록을 직접 읽는다. 겸사겸사 인원 수·상태도
   * 최신값이 되어, 아래 검사들이 오래된 값으로 판단하지 않는다.
   */
  useEffect(() => {
    let alive = true;
    (async () => {
      const [result, reqs] = await Promise.all([
        API.getMyTeams(),
        API.getMatchRequests(),
      ]);
      if (!alive) return;
      if (reqs.code === 200 && reqs.data) {
        setLocalRequests(reqs.data);
        setRequests(reqs.data);
      }
      if (result.code === 200 && result.data) {
        setMyTeams(result.data);
      } else if (result.code !== 401) {
        // 401(세션 만료)은 _layout.tsx 가 로그인 화면으로 보낸다.
        // 그 밖의 실패는 '팀이 없다'와 구분해야 한다 — 있는 팀을 없다고
        // 말하면 사용자는 팀을 하나 더 만들러 간다.
        setTeamsFailed(true);
      }
      setIsLoadingTeams(false);
    })();
    return () => {
      alive = false;
    };
  }, [setMyTeams, setRequests]);

  const targetId = targetPost?.id;

  /** 이 팀이 내 팀에게 먼저 보낸, 아직 답하지 않은 신청 */
  const incoming = useMemo(
    () =>
      requests?.received.find(
        (r) => r.partnerTeam.id === targetId && r.status === "WAITING",
      ),
    [requests, targetId],
  );

  /** 내 팀 중 이 팀에게 신청을 보내고 답을 기다리는 팀 */
  const waitingFrom = useMemo(
    () =>
      new Set(
        (requests?.sent ?? [])
          .filter((r) => r.partnerTeam.id === targetId && r.status === "WAITING")
          .map((r) => r.myTeamId),
      ),
    [requests, targetId],
  );

  /** 시트에 놓을 순서: 신청할 수 있는 팀이 위, 막힌 팀은 이유와 함께 아래 */
  const teamOptions = useMemo(() => {
    if (!targetPost) return [];
    return myTeams
      .map((team) => ({ team, reason: blockReason(team, targetPost, waitingFrom) }))
      .sort((a, b) => Number(a.reason != null) - Number(b.reason != null));
  }, [myTeams, targetPost, waitingFrom]);
  const eligibleCount = teamOptions.filter((o) => o.reason == null).length;

  if (!targetPost) {
    return (
      <Screen tone="grouped">
        <NavHeader title="게시글" onBack={() => router.back()} bordered />
        <View style={styles.center}>
          <Text style={styles.emptyText}>삭제된 게시글이에요.</Text>
        </View>
      </Screen>
    );
  }

  const handlePressRequest = () => {
    if (isLoadingTeams) return;

    if (teamsFailed) {
      Alert.alert(
        "잠시 후 다시 시도해주세요",
        "내 팀 목록을 불러오지 못했어요.",
      );
      return;
    }

    if (myTeams.length === 0) {
      Alert.alert("아직 팀이 없어요", "팀을 만들고 친구를 모으면 신청할 수 있어요.", [
        { text: "닫기", style: "cancel" },
        { text: "팀 만들기", onPress: () => router.push("/write") },
      ]);
      return;
    }
    setModalVisible(true);
  };

  /**
   * 신청은 서버에 한 줄(matches)을 넣는 것이다.
   *
   * 아래 세 가지 검사는 서버도 똑같이 한다(마이그레이션 009 의
   * assert_match_request_valid). 여기서 먼저 보는 건 왕복 없이 바로
   * 이유를 알려주기 위해서고, 최종 판단은 서버가 한다.
   */
  const confirmRequest = async (myTeam: Team) => {
    if (isSending) return;

    // 막힌 팀은 시트에서 눌리지 않는다. 그래도 목록이 바뀌는 사이에 눌렸다면
    // 이유를 그대로 알려준다. 최종 판단은 어차피 서버가 한다.
    const reason = blockReason(myTeam, targetPost, waitingFrom);
    if (reason) {
      Alert.alert("신청할 수 없어요", reason);
      return;
    }

    setSendingTeamId(myTeam.id);
    try {
      const result = await API.sendMatchRequest(myTeam.id, targetPost.id);
      if (result.code !== 200) {
        // 중복 신청·매칭 완료·정책 위반 — 막힌 이유를 그대로 보여준다
        Alert.alert("신청할 수 없어요", result.message ?? "다시 시도해주세요.");
        return;
      }

      setModalVisible(false);
      toast.show("신청을 보냈어요. 상대가 수락하면 채팅방이 열려요", {
        icon: "paper-plane",
      });
      router.back();
    } finally {
      setSendingTeamId(null);
    }
  };

  const genderColor = GenderColor[targetPost.gender];
  const campusColor = CampusColor[targetPost.campus];

  return (
    <Screen tone="grouped">
      <NavHeader title="게시글" onBack={() => router.back()} bordered />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ─────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <Badge label={`${targetPost.campus} 캠퍼스`} colors={campusColor} />
            <Badge label={targetPost.dept} />
          </View>
          <Text style={styles.title}>{targetPost.title}</Text>
          <View style={styles.tags}>
            {targetPost.tags.map((tag: string, i: number) => (
              <Text key={i} style={styles.tagText}>
                {tag}
              </Text>
            ))}
          </View>

          {/* ── 요약 정보 ───────────────────────────────── */}
          <View style={styles.statRow}>
          <StatCard
            icon="people"
            label="인원"
            value={`${targetPost.currentCount}/${targetPost.count}명`}
          />
          <StatCard
            icon="calendar"
            label="평균 나이"
            value={targetPost.age != null ? `${targetPost.age}세` : "—"}
          />
          <StatCard
            icon={genderColor.icon}
            label="성별"
            value={targetPost.gender === "F" ? "여자" : "남자"}
            tint={genderColor}
          />
          </View>
        </View>

        {/* ── 소개글 ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소개</Text>
          <Text style={styles.content}>{targetPost.content}</Text>
        </View>

        {/* ── 팀원 ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            팀원 {targetPost.members.length}/{targetPost.count}
          </Text>
          <Text style={styles.sectionDesc}>
            눌러서 프로필을 확인할 수 있어요
          </Text>

          <View style={styles.memberList}>
            {targetPost.members.map((member, i) => (
              <PressScale
                key={`${member.name}-${i}`}
                scaleTo={0.98}
                style={styles.memberRow}
                onPress={() => setSelectedMember(member)}
              >
                <Image
                  source={getAvatarSource(member.avatarIdx)}
                  style={styles.memberAvatar}
                />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberMeta} numberOfLines={1}>
                    {[member.dept, member.mbti].filter(Boolean).join(" · ") ||
                      "프로필 보기"}
                  </Text>
                </View>
                {member.role === "LEADER" && (
                  <Badge label="팀장" tone="brand" />
                )}
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Palette.gray300}
                />
              </PressScale>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── 하단 신청 버튼 ───────────────────────────────── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {incoming ? (
          // 상대가 먼저 신청했다면 새로 신청할 게 아니라 받은 신청에 답하면 된다
          <Button
            title="이 팀이 먼저 신청했어요 · 확인하기"
            onPress={() => router.push(`/match/party/${incoming.id}` as any)}
          />
        ) : waitingFrom.size > 0 ? (
          <Button title="신청을 보냈어요 · 수락을 기다리는 중" disabled />
        ) : (
          <Button
            title="이 팀에게 과팅 신청하기 👋"
            loading={isLoadingTeams}
            onPress={handlePressRequest}
          />
        )}
      </View>

      {/* ── 신청할 내 팀 고르기 ───────────────────────────── */}
      <BottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="어떤 팀으로 신청할까요?"
        description={
          eligibleCount > 0
            ? `신청할 수 있는 팀 ${eligibleCount}개`
            : `지금 신청할 수 있는 팀이 없어요. 상대는 ${targetPost.count}명 ${targetPost.gender === "F" ? "여자" : "남자"} 팀이에요.`
        }
      >
        <ScrollView style={styles.teamSelectList}>
          {teamOptions.map(({ team, reason }) => {
            const blocked = reason != null;
            const sendingThis = sendingTeamId === team.id;
            return (
              <PressScale
                key={team.id}
                scaleTo={0.98}
                style={[styles.teamSelectCard, blocked && styles.teamSelectCardBlocked]}
                disabled={blocked || isSending}
                onPress={() => confirmRequest(team)}
              >
                <View style={styles.flexShrink}>
                  <Text
                    style={[styles.teamSelectTitle, blocked && styles.teamSelectTitleBlocked]}
                    numberOfLines={1}
                  >
                    {team.title}
                  </Text>
                  <Text style={styles.teamSelectInfo} numberOfLines={1}>
                    {reason ?? `${team.count}명 · ${team.gender === "F" ? "여자" : "남자"} 팀 · 신청 가능`}
                  </Text>
                </View>
                {sendingThis ? (
                  <ActivityIndicator color={Palette.gray400} />
                ) : blocked ? (
                  <Ionicons name="remove-circle-outline" size={18} color={Palette.gray300} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={Palette.gray400} />
                )}
              </PressScale>
            );
          })}
        </ScrollView>
        <SheetCancel onPress={() => setModalVisible(false)} />
      </BottomSheet>

      {/* ── 팀원 프로필 ───────────────────────────────────── */}
      <MemberProfileSheet
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </Screen>
  );
}

/** 인원/나이/성별처럼 짧은 통계 하나를 보여주는 카드. */
function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  tint?: { fg: string; bg: string };
}) {
  const bg = tint?.bg ?? Palette.gray100;
  const fg = tint?.fg ?? Palette.gray700;
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={fg} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { ...Typo.body, color: Palette.gray500 },

  scrollContent: { paddingTop: Spacing.md, paddingBottom: 120 },

  // 제목·태그·요약 / 소개 / 팀원을 각자 흰 카드 한 장에 담는다.
  heroCard: {
    ...CardSurface,
    padding: Spacing.cardPadding,
  },
  badgeRow: { flexDirection: "row", gap: Spacing.xs, marginBottom: Spacing.md },
  title: { ...Typo.display, fontSize: 22, marginBottom: Spacing.md },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  tagText: {
    backgroundColor: Palette.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    color: Palette.gray600,
    fontSize: 12,
    fontWeight: "600",
  },

  statRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.gray100,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: Palette.gray900,
  },
  statLabel: { ...Typo.caption, fontSize: 12 },

  section: {
    ...CardSurface,
    padding: Spacing.cardPadding,
  },
  sectionTitle: { ...Typo.cardTitle, marginBottom: Spacing.sm },
  sectionDesc: { ...Typo.caption, marginTop: 4 },
  content: { ...Typo.body, lineHeight: 24 },

  memberList: { gap: Spacing.sm, marginTop: Spacing.md },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.gray100,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Palette.gray200,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: Palette.gray900,
  },
  memberMeta: { ...Typo.caption, marginTop: 2 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    backgroundColor: Palette.white,
    borderTopWidth: 1,
    borderTopColor: Palette.gray200,
    ...Shadow.soft,
  },

  flexShrink: { flex: 1 },
  teamSelectList: { maxHeight: 300, marginTop: Spacing.lg },
  teamSelectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.gray200,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
  },
  teamSelectCardBlocked: {
    backgroundColor: Palette.gray50,
    borderColor: Palette.gray100,
  },
  teamSelectTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: Palette.gray900,
    marginBottom: 2,
  },
  teamSelectTitleBlocked: { color: Palette.gray600 },
  teamSelectInfo: { ...Typo.caption },
});
