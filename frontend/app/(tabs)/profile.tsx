// 파일 경로: app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { InputBox } from "@/components/InputBox";
import { MainButton } from "@/components/MainButton";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Divider,
  Screen,
  ScreenHeader,
} from "@/components/ui/screen";
import {
  CampusColor,
  CardSurface,
  Palette,
  Radius,
  Spacing,
  Typo,
} from "@/constants/theme";
import { useStore } from "@/store/useStore";
import { API } from "@/api/client";
import type { ProfilePatch } from "@/api/client";
import { profileImages } from "@/constants/avatars";

/** 편집 폼이 비어 있을 때의 기본값 */
const EMPTY_PROFILE: ProfilePatch = {
  nickname: "",
  bio: "",
  mbti: "",
  avatarIdx: 0,
};

const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
] as const;

const NICKNAME_MAX = 12;
const BIO_MAX = 40;

const MENU_ITEMS: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  /** 눌렀을 때 이동할 화면. 없으면 아직 준비 중인 메뉴 */
  route?: string;
}[] = [
  {
    icon: "notifications-outline",
    label: "알림 설정",
    route: "/settings/notifications",
  },
  { icon: "shield-checkmark-outline", label: "학생증 재인증" },
  { icon: "ban-outline", label: "차단 목록", route: "/settings/blocked" },
  { icon: "document-text-outline", label: "이용약관" },
];

export default function ProfileTab() {
  const router = useRouter();

  // 로그인한 내 정보 (전역). Supabase profiles 한 줄이 그대로 들어있다.
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  // 편집 중인 임시 값. 취소하면 그냥 버린다.
  const [draft, setDraft] = useState<ProfilePatch>(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [tempSelectedIdx, setTempSelectedIdx] = useState(0);

  // _layout.tsx 가 세션 복원 직후 채워준다. 그 전 아주 잠깐만 비어 있다.
  const isLoading = currentUser == null;

  // 저장된 값만 뽑아낸 편집용 조각
  const profile: ProfilePatch = currentUser
    ? {
        nickname: currentUser.nickname,
        bio: currentUser.bio,
        mbti: currentUser.mbti,
        avatarIdx: currentUser.avatarIdx,
      }
    : EMPTY_PROFILE;

  const startEditing = () => {
    setDraft(profile); // 현재 저장된 값에서 시작
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(profile);
  };

  const handleSave = async () => {
    const nickname = draft.nickname.trim();
    const bio = draft.bio.trim();

    if (nickname.length > NICKNAME_MAX) {
      Alert.alert("알림", `닉네임은 ${NICKNAME_MAX}자까지 입력할 수 있어요.`);
      return;
    }

    try {
      setIsSaving(true);
      const result = await API.updateMyProfile({ ...draft, nickname, bio });
      if (result.code !== 200 || !result.data) {
        Alert.alert("오류", result.message ?? "프로필 저장에 실패했어요.");
        return;
      }
      // 서버가 돌려준 값으로 전역 상태를 갱신한다 (displayName 도 여기서 다시 계산됨)
      setCurrentUser(result.data);
      setIsEditing(false);
      toast.show("프로필을 저장했어요");
    } catch (e) {
      Alert.alert("오류", "프로필 저장 중 문제가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const openAvatarModal = () => {
    setTempSelectedIdx(draft.avatarIdx);
    setModalVisible(true);
  };

  const confirmAvatar = () => {
    setDraft((prev) => ({ ...prev, avatarIdx: tempSelectedIdx }));
    setModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert("로그아웃할까요?", "다시 로그인해야 앱을 이용할 수 있어요.", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          // 세션을 지우면 _layout.tsx 의 onAuthStateChange 가
          // 전역 유저 정보를 비우고 로그인 화면으로 보낸다.
          await API.logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * 회원 탈퇴. 되돌릴 수 없어서 두 번 묻는다.
   * 무엇이 지워지고 무엇이 남는지는 마이그레이션 018 과 맞춰 적었다.
   */
  const handleDeleteAccount = () => {
    if (isDeleting) return;

    Alert.alert(
      "정말 탈퇴할까요?",
      "프로필과 알림이 삭제되고, 참여 중인 팀에서 나가게 돼요. " +
        "내가 팀장인 팀은 함께 삭제돼요.\n\n" +
        "매칭이 성사된 팀의 대화는 상대방을 위해 '밋단 회원'으로 남고, " +
        "같은 학교 메일로는 다시 가입할 수 없어요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: () =>
            Alert.alert("마지막으로 확인할게요", "탈퇴하면 되돌릴 수 없어요.", [
              { text: "취소", style: "cancel" },
              {
                text: "탈퇴",
                style: "destructive",
                onPress: async () => {
                  setIsDeleting(true);
                  const result = await API.deleteAccount();
                  setIsDeleting(false);

                  if (result.code !== 200) {
                    Alert.alert("탈퇴하지 못했어요", result.message);
                    return;
                  }
                  router.replace("/login");
                  toast.show("탈퇴가 완료됐어요. 그동안 고마웠어요");
                },
              },
            ]),
        },
      ],
    );
  };

  // 편집 중에는 미리보기가 바로 보이도록 draft 값을 쓴다
  const shown = isEditing ? draft : profile;

  /** 화면에 뿌릴 내 정보. 전부 서버 profiles 에서 온다. */
  const info = {
    name: currentUser?.name ?? null,
    gender: currentUser?.gender ?? null,
    campus: currentUser?.campus ?? null,
    dept: currentUser?.dept ?? null,
    email: currentUser?.email ?? null,
    userId: currentUser?.loginId ?? null,
  };
  const hasInfo = !!(info.name || info.dept || info.campus);

  const displayName = shown.nickname.trim() || info.name || "밋단 회원";
  // 저장된 인덱스가 에셋 개수를 벗어나도 화면이 깨지지 않게
  const avatarSource =
    profileImages[shown.avatarIdx] ?? profileImages[0];
  const campusColor = info.campus
    ? CampusColor[info.campus as keyof typeof CampusColor]
    : undefined;

  if (isLoading) {
    return (
      <Screen tone="grouped">
        <ScreenHeader title="마이" />
        <View style={styles.loading}>
          <ActivityIndicator color={Palette.brand} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen tone="grouped">
      <ScreenHeader title="마이" />

      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 20 : 40}
        enableAutomaticScroll
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 프로필 요약 / 편집 ─────────────────────────── */}
        <View style={styles.profileSection}>
          <Pressable
            style={styles.avatarWrap}
            disabled={!isEditing}
            onPress={openAvatarModal}
          >
            <Image source={avatarSource} style={styles.avatar} />
            {isEditing && (
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={13} color={Palette.white} />
              </View>
            )}
          </Pressable>

          {isEditing ? (
            <View style={styles.editForm}>
              <InputBox
                label="닉네임"
                value={draft.nickname}
                onChangeText={(text) =>
                  setDraft((prev) => ({ ...prev, nickname: text }))
                }
                placeholder={info.name ?? "닉네임을 입력하세요"}
                maxLength={NICKNAME_MAX}
              />

              <InputBox
                label="한 줄 소개"
                value={draft.bio}
                onChangeText={(text) =>
                  setDraft((prev) => ({ ...prev, bio: text }))
                }
                placeholder="나를 한 줄로 소개해보세요"
                style={styles.bioInput}
                multiline
                maxLength={BIO_MAX}
              />
              <Text style={styles.counter}>
                {draft.bio.length}/{BIO_MAX}
              </Text>

              <Text style={styles.fieldLabel}>MBTI</Text>
              <View style={styles.mbtiGrid}>
                {MBTI_TYPES.map((type) => {
                  const active = draft.mbti === type;
                  return (
                    <Pressable
                      key={type}
                      // 이미 고른 걸 다시 누르면 선택 해제
                      onPress={() =>
                        setDraft((prev) => ({
                          ...prev,
                          mbti: prev.mbti === type ? "" : type,
                        }))
                      }
                      style={[styles.mbtiCell, active && styles.mbtiCellActive]}
                    >
                      <Text
                        style={[
                          styles.mbtiText,
                          active && styles.mbtiTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.helperText}>
                선택한 항목을 다시 누르면 해제돼요.
              </Text>

              <MainButton
                title="저장하기"
                onPress={handleSave}
                isLoading={isSaving}
              />
              <Button
                title="취소"
                variant="secondary"
                onPress={cancelEditing}
                disabled={isSaving}
                style={styles.cancelButton}
              />
            </View>
          ) : (
            <View style={styles.summary}>
              <Text style={styles.name}>{displayName}</Text>

              <Text
                style={[styles.bio, !shown.bio && styles.bioEmpty]}
                numberOfLines={2}
              >
                {shown.bio || "한 줄 소개를 추가해보세요"}
              </Text>

              <View style={styles.summaryMetaRow}>
                {!!info.campus && (
                  <Badge label={`${info.campus} 캠퍼스`} colors={campusColor} />
                )}
                {!!shown.mbti && <Badge label={shown.mbti} tone="brand" />}
                {!!info.dept && <Text style={styles.major}>{info.dept}</Text>}
              </View>

              <Button
                title="프로필 수정"
                icon="create-outline"
                variant="secondary"
                size="sm"
                onPress={startEditing}
                style={styles.editButton}
              />
            </View>
          )}
        </View>

        {/* ── 회원가입 때 인증한 정보 (수정 불가) ─────────── */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>가입 정보</Text>
            <Ionicons
              name="lock-closed"
              size={13}
              color={Palette.gray400}
            />
          </View>
          <Text style={styles.infoDesc}>
            학교 인증에 쓰인 정보라 직접 바꿀 수 없어요.{"\n"}
            변경이 필요하면 학생증 재인증을 진행해주세요.
          </Text>

          {hasInfo ? (
            <View style={styles.infoList}>
              {!!info.name && <InfoRow label="이름" value={info.name} />}
              {!!info.gender && (
                <InfoRow
                  label="성별"
                  value={info.gender === "M" ? "남성" : "여성"}
                />
              )}
              {!!info.campus && (
                <InfoRow label="캠퍼스" value={`${info.campus}캠퍼스`} />
              )}
              {!!info.dept && <InfoRow label="학과" value={info.dept} />}
              {!!info.email && (
                <InfoRow label="학교 이메일" value={info.email} />
              )}
              {!!info.userId && <InfoRow label="아이디" value={info.userId} />}
            </View>
          ) : (
            <Text style={styles.infoEmpty}>
              저장된 가입 정보가 없어요. 회원가입을 먼저 완료해주세요.
            </Text>
          )}
        </View>

        {/* ── 메뉴 ─────────────────────────────────────── */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <View key={item.label}>
              {index > 0 && <Divider inset={Spacing.cardPadding + 34} />}
              <Pressable
                onPress={() =>
                  item.route
                    ? router.push(item.route as any)
                    : toast.show("곧 열릴 기능이에요", { icon: "time-outline" })
                }
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { backgroundColor: Palette.gray100 },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={Palette.gray600} />
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Palette.gray300}
                />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutRow,
            pressed && { backgroundColor: Palette.gray100 },
          ]}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>

        <Pressable
          onPress={handleDeleteAccount}
          disabled={isDeleting}
          hitSlop={8}
          style={styles.withdrawRow}
        >
          <Text style={styles.withdrawText}>
            {isDeleting ? "탈퇴 처리 중…" : "회원 탈퇴"}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>

      {/* ── 아바타 선택 시트 ───────────────────────────── */}
      <BottomSheet
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="프로필 캐릭터"
        description="마음에 드는 캐릭터를 골라주세요."
      >
        <View style={styles.avatarGrid}>
          {profileImages.map((img, index) => (
            <Pressable
              key={index}
              onPress={() => setTempSelectedIdx(index)}
              style={[
                styles.thumbWrap,
                tempSelectedIdx === index && styles.thumbSelected,
              ]}
            >
              <Image source={img} style={styles.thumb} />
            </Pressable>
          ))}
        </View>

        <View style={styles.sheetActions}>
          <Button
            title="취소"
            variant="secondary"
            flex={1}
            onPress={() => setModalVisible(false)}
          />
          <Button title="확인" flex={2} onPress={confirmAvatar} />
        </View>
      </BottomSheet>
    </Screen>
  );
}

/** 가입 정보 한 줄. 자물쇠로 "여긴 못 바꾼다"를 분명히 보여준다. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
      <Ionicons name="lock-closed" size={13} color={Palette.gray300} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },

  // 묶음마다 흰 카드 한 장. 카드 사이로 회색 바탕이 비쳐 경계가 된다.
  profileSection: {
    ...CardSurface,
    alignItems: "center",
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  avatarWrap: { position: "relative", marginBottom: Spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    backgroundColor: Palette.gray100,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Palette.brand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Palette.white,
  },

  summary: { alignItems: "center" },
  name: { ...Typo.title, fontSize: 21 },
  bio: {
    ...Typo.body,
    marginTop: 6,
    textAlign: "center",
  },
  bioEmpty: { color: Palette.gray500 },
  summaryMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
  },
  major: { ...Typo.caption, fontSize: 14 },
  editButton: { marginTop: Spacing.xl },

  editForm: { width: "100%" },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: Palette.gray600,
    marginBottom: Spacing.sm,
  },
  bioInput: {
    height: 84,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  counter: {
    ...Typo.caption,
    color: Palette.gray500,
    alignSelf: "flex-end",
    marginTop: -12,
    marginBottom: Spacing.lg,
  },
  helperText: {
    ...Typo.caption,
    color: Palette.gray600,
    marginBottom: Spacing.xl,
  },

  mbtiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  mbtiCell: {
    width: "22%",
    flexGrow: 1,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: Palette.gray100,
    alignItems: "center",
  },
  mbtiCellActive: {
    backgroundColor: Palette.brandWeak,
    borderColor: Palette.brand,
  },
  mbtiText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: Palette.gray500,
  },
  mbtiTextActive: { color: Palette.brandText, fontWeight: "700" },

  cancelButton: { marginTop: Spacing.sm },

  infoSection: {
    ...CardSurface,
    padding: Spacing.cardPadding,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoTitle: Typo.cardTitle,
  infoDesc: {
    ...Typo.caption,
    marginTop: 6,
    lineHeight: 19,
  },
  infoList: {
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Palette.gray100,
    paddingHorizontal: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: 14,
  },
  infoLabel: {
    width: 78,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: Palette.gray600,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: Palette.gray800,
  },
  infoEmpty: {
    ...Typo.caption,
    marginTop: Spacing.lg,
  },

  menuSection: {
    ...CardSurface,
    paddingVertical: Spacing.xs,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.cardPadding,
    paddingVertical: Spacing.lg,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.3,
    color: Palette.gray800,
  },

  logoutRow: {
    ...CardSurface,
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: Palette.gray600,
  },

  // 로그아웃보다 한 단계 약하게. 실수로 누르기 어렵게 작고 흐린 글씨로 둔다.
  withdrawRow: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  withdrawText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.2,
    color: Palette.gray400,
    textDecorationLine: "underline",
  },

  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  thumbWrap: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: Radius.full,
    borderWidth: 2.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbSelected: { borderColor: Palette.brand },
  thumb: { width: "88%", height: "88%", borderRadius: Radius.full },

  sheetActions: { flexDirection: "row", gap: Spacing.sm },
});
