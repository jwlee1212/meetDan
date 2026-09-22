import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * 앱 안에서 색 모드는 light / dark 둘뿐이다.
 *
 * RN 0.86(SDK 57)부터 ColorSchemeName 에 null 과 'unspecified' 가 함께 들어온다.
 * 팔레트(constants/theme 의 Colors)는 light·dark 두 벌만 있어서 그 값을 그대로
 * 키로 쓰면 타입이 깨진다. 그래서 여기서 한 번만 좁혀 두고, 화면들은 이 훅만 쓴다.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
