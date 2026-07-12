import { MENUS } from "./data.js";
import { filterMenus } from "./recommend.js";

// 앱 전역 상태. main.js가 읽고 갱신한다.
export const state = {
  filters: {
    categories: new Set(),
    types: new Set(),
    meals: new Set(),
    soloOnly: true,
  },
  candidates: [],
  current: null,
  lastId: null,
  isSpinning: false,
};

// filters를 기준으로 candidates를 다시 계산한다.
export function recomputeCandidates() {
  state.candidates = filterMenus(MENUS, state.filters);
}

// 필터를 초기 상태로 되돌린다(혼밥친화는 기본 ON 유지).
export function resetFilters() {
  state.filters.categories.clear();
  state.filters.types.clear();
  state.filters.meals.clear();
  state.filters.soloOnly = true;
  recomputeCandidates();
}

// 초기 후보 계산
recomputeCandidates();
