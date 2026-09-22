import { useState } from "react";

/**
 * 마지막으로 들어온 "있는" 값을 붙잡아 둔다.
 *
 * 바텀시트를 닫을 때 쓴다. 시트는 `visible={!!member}` 로 여닫는데, 닫는
 * 애니메이션이 도는 0.2초 동안 member 는 이미 null 이다. 그대로 그리면
 * 시트가 내려가면서 내용만 먼저 사라져 빈 판이 미끄러져 내려간다.
 *
 * 원래는 ref 로 했었다 —
 *
 *     const last = useRef(null);
 *     if (member) last.current = member;      // 렌더 중 쓰기
 *     const shown = member ?? last.current;   // 렌더 중 읽기
 *
 * 둘 다 렌더 중에 일어나서 react-hooks/refs 에 걸린다. 규칙이 까다로운 게
 * 아니라, ref 에 쓰는 것은 리렌더를 일으키지 않아서 실제로 어긋날 수 있다.
 * state 로 두면 값이 바뀔 때 React 가 한 번 더 그려주므로 항상 맞는다.
 *
 * 렌더 중 setState 는 React 가 권장하는 형태다(같은 컴포넌트의 state 를
 * 조건부로 고치는 경우). effect 로 미루면 한 프레임 늦어서 시트가 열릴 때
 * 내용이 깜빡인다.
 */
export function useLastPresent<T>(value: T | null | undefined): T | null {
  const [last, setLast] = useState<T | null>(value ?? null);

  if (value != null && value !== last) setLast(value);

  return value ?? last;
}
