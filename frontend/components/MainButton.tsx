import React from "react";
import { StyleProp, ViewStyle } from "react-native";

import { Button } from "@/components/ui/button";

interface MainButtonProps {
  title: string;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * 폼 맨 아래의 큰 파란 버튼. 로그인·회원가입·프로필 저장이 쓴다.
 * 모양은 공통 Button(primary, lg)이 정한다 — 예전 TouchableOpacity 버전은
 * 모서리·글자 크기·누름 효과가 다른 버튼들과 달랐다.
 */
export const MainButton = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
}: MainButtonProps) => (
  <Button
    title={title}
    onPress={onPress}
    loading={isLoading}
    disabled={disabled}
    style={style}
  />
);
