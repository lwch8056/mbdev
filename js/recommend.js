// 순수 함수 모듈: 외부 상태에 의존하지 않음

// filters: { categories:Set, types:Set, soloOnly:boolean }
// 빈 Set은 "전체 허용"으로 취급한다.
export function filterMenus(menus, filters) {
  const { categories, types, soloOnly } = filters;
  return menus.filter((menu) => {
    if (categories.size > 0 && !categories.has(menu.category)) return false;
    if (types.size > 0 && !types.has(menu.type)) return false;
    if (soloOnly && menu.soloFriendly !== true) return false;
    return true;
  });
}

// 후보 중 하나를 균등 랜덤 선택. lastId와 다른 결과를 보장(후보 2개+일 때).
// 0개 → null, 1개 → 그것, 2개+ → lastId 제외 풀에서 랜덤.
export function pickRandom(candidates, lastId) {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const pool = candidates.filter((menu) => menu.id !== lastId);
  // lastId가 후보에 없었으면 pool === candidates 길이 동일, 그대로 사용.
  const source = pool.length > 0 ? pool : candidates;
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}
