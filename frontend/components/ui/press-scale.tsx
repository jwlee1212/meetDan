import React, { useState } from "react";
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressScaleProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  /** 눌렀을 때 줄어드는 정도. 큰 카드일수록 작게 준다. */
  scaleTo?: number;
  children: React.ReactNode;
}

/**
 * 토스/당근처럼 "누르면 살짝 들어가는" 촉감을 주는 터치 영역.
 * activeOpacity로 흐려지는 것보다 훨씬 반응이 좋아 보인다.
 */
export function PressScale({
  style,
  scaleTo = 0.97,
  children,
  ...props
}: PressScaleProps) {
  // useState 의 지연 초기화로 만든다. useRef(new Animated.Value(1)) 은
  // 렌더마다 Animated.Value 를 새로 만들어 버리고(첫 개만 쓰이고 나머지는
  // 버려진다), .current 를 렌더 중에 읽는 것도 규칙 위반이다.
  const [scale] = useState(() => new Animated.Value(1));

  const animate = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();

  return (
    // 터치 영역과 스타일이 같은 노드여야 한다. 안쪽 View에 style을 주면
    // flex/position/margin 같은 레이아웃 속성이 부모 대신 Pressable 기준으로
    // 계산돼서 크기가 접히거나 위치가 어긋난다.
    <AnimatedPressable
      {...props}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
