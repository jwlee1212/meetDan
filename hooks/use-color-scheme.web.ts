import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 *
 * 반환 타입은 네이티브 쪽 use-color-scheme.ts 와 같아야 한다 — 같은 이름으로
 * 플랫폼에 따라 갈라지는 모듈이라, 한쪽만 'unspecified' 를 흘리면 화면에서 터진다.
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);

  // "그려진 뒤"를 알아내는 게 목적이라 effect 여야 한다. 서버가 그린 첫
  // HTML 은 항상 light 로 나가고, 브라우저가 붙은 뒤에야 실제 색 모드를
  // 따라갈 수 있다. 렌더 중에 정하면 서버와 결과가 달라져 hydration 이 깨진다.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme === 'dark' ? 'dark' : 'light';
  }

  return 'light';
}
