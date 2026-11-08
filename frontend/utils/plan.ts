// 파일: utils/plan.ts
// 확정 약속(ConfirmedPlan)을 화면에 보여줄 때 쓰는 계산·포맷 모음.
// 채팅방 배너와 활동 탭이 같은 규칙을 쓰도록 한곳에 모아둔다.
import type { ConfirmedPlan } from "@/store/useStore";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "YYYY-MM-DD"를 로컬 자정 Date로. 문자열 파싱은 엔진마다 달라서 직접 만든다. */
export function parsePlanDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** 약속 날짜 + 시각을 합친 Date */
export function parsePlanDateTime(plan: ConfirmedPlan): Date {
  const [h, min] = plan.time.split(":").map(Number);
  const d = parsePlanDate(plan.date);
  d.setHours(h ?? 0, min ?? 0, 0, 0);
  return d;
}

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** 오늘 자정. 날짜 비교는 시:분을 떼고 해야 "오늘 약속"이 지난 걸로 안 잡힌다. */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** 오늘 기준 남은 일수. 오늘이면 0, 어제였으면 -1. */
export function daysUntil(date: string): number {
  const diff = parsePlanDate(date).getTime() - startOfToday().getTime();
  return Math.round(diff / 86_400_000);
}

/** 약속 날짜가 오늘보다 이전인가 (= 지나간 만남인가) */
export function isPastPlan(date: string): boolean {
  return daysUntil(date) < 0;
}

/** "D-5" / "D-DAY" / "D+3" */
export function dDayLabel(date: string): string {
  const n = daysUntil(date);
  if (n === 0) return "D-DAY";
  return n > 0 ? `D-${n}` : `D+${Math.abs(n)}`;
}

/** "8/20(수)" */
export function formatPlanDate(date: string): string {
  const d = parsePlanDate(date);
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]})`;
}

/** "8/20(수) 19:00 · 죽전역 근처" */
export function formatPlanSummary(plan: ConfirmedPlan): string {
  const head = `${formatPlanDate(plan.date)} ${plan.time}`;
  return plan.place ? `${head} · ${plan.place}` : head;
}
