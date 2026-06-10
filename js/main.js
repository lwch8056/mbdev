import { CATEGORIES, TYPES, MENUS } from "./data.js";
import { pickRandom } from "./recommend.js";
import { state, recomputeCandidates, resetFilters } from "./state.js";
import { searchNearby, isApiEnabled } from "./restaurants.js";

// 마지막으로 입력한 동네를 저장하는 localStorage 키
const DONG_STORAGE_KEY = "mbdev.dong";

// --- DOM 참조 ---
const els = {
  card: document.getElementById("result-card"),
  emoji: document.getElementById("result-emoji"),
  name: document.getElementById("result-name"),
  tags: document.getElementById("result-tags"),
  comment: document.getElementById("result-comment"),
  miniHint: document.getElementById("mini-hint"),
  emptyBanner: document.getElementById("empty-banner"),
  resetBtn: document.getElementById("reset-filters"),
  spinBtn: document.getElementById("spin-btn"),
  count: document.getElementById("candidate-count"),
  categoryChips: document.getElementById("category-chips"),
  typeChips: document.getElementById("type-chips"),
  soloSwitch: document.getElementById("solo-switch"),
  nearSection: document.getElementById("near-section"),
  nearTitle: document.getElementById("near-title"),
  dongInput: document.getElementById("dong-input"),
  nearBtn: document.getElementById("near-btn"),
  nearStatus: document.getElementById("near-status"),
  restoList: document.getElementById("resto-list"),
};

const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
const typeLabel = (id) => TYPES.find((t) => t.id === id)?.label ?? id;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// --- 칩 생성 ---
function buildChips(container, items, selectedSet) {
  items.forEach((item) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.id = item.id;
    chip.setAttribute("aria-pressed", "false");
    chip.textContent = item.label;
    if (container === els.categoryChips) {
      chip.classList.add(`chip--cat-${item.id}`);
    }
    chip.addEventListener("click", () => {
      if (selectedSet.has(item.id)) selectedSet.delete(item.id);
      else selectedSet.add(item.id);
      chip.setAttribute("aria-pressed", selectedSet.has(item.id) ? "true" : "false");
      chip.classList.toggle("is-active", selectedSet.has(item.id));
      onFilterChange();
    });
    container.appendChild(chip);
  });
}

// --- 렌더 ---
function render() {
  const count = state.candidates.length;
  els.count.textContent = `후보 ${count}개`;

  // 미니 안내 (후보 1개)
  if (count === 1) {
    els.miniHint.textContent = "후보가 1개뿐이에요.";
    els.miniHint.hidden = false;
  } else {
    els.miniHint.hidden = true;
  }

  // 후보 0개: 배너 노출 + 버튼 비활성
  const noCandidates = count === 0;
  els.emptyBanner.hidden = !noCandidates;

  if (noCandidates) {
    showEmptyState();
  }

  // 버튼 상태
  els.spinBtn.disabled = state.isSpinning || noCandidates;
  els.spinBtn.classList.toggle("is-dimmed", state.isSpinning || noCandidates);

  if (state.isSpinning) {
    els.spinBtn.textContent = "추천 중...";
  } else if (state.current && !noCandidates) {
    els.spinBtn.textContent = "🔄 다시 돌리기";
  } else {
    els.spinBtn.textContent = "🎲 메뉴 추천받기";
  }
}

function showEmptyState() {
  els.card.classList.remove("is-filled", "is-spinning");
  els.card.classList.add("is-empty");
  els.emoji.textContent = "🥲";
  els.name.textContent = "조건에 맞는 메뉴가 없어요";
  els.tags.innerHTML = "";
  els.comment.textContent = "";
  // 추천이 사라지면 근처 식당 섹션도 숨긴다.
  els.nearSection.hidden = true;
}

function renderResult(menu) {
  els.card.classList.remove("is-empty", "is-spinning");
  els.card.classList.add("is-filled");
  els.emoji.textContent = menu.emoji;
  els.name.textContent = menu.name;
  els.comment.textContent = menu.comment ?? "";

  els.tags.innerHTML = "";
  const catTag = document.createElement("span");
  catTag.className = `tag tag--cat tag--cat-${menu.category}`;
  catTag.textContent = categoryLabel(menu.category);
  const typeTag = document.createElement("span");
  typeTag.className = "tag tag--type";
  typeTag.textContent = typeLabel(menu.type);
  els.tags.append(catTag, typeTag);

  // scale-up 애니메이션 재시작
  els.card.classList.remove("pop");
  void els.card.offsetWidth;
  els.card.classList.add("pop");

  // 근처 식당 섹션 노출 (메뉴가 바뀌면 이전 결과는 비운다)
  revealNearSection(menu);
}

// --- 근처 식당 ---
function revealNearSection(menu) {
  els.nearTitle.textContent = `‘${menu.name}’ 파는 근처 식당`;
  els.restoList.innerHTML = "";
  els.nearStatus.hidden = true;
  els.nearSection.hidden = false;
}

function formatDistance(meters) {
  if (meters == null) return "";
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}

function setNearStatus(text) {
  els.nearStatus.textContent = text;
  els.nearStatus.hidden = !text;
}

function renderRestaurants(places, usingDummy) {
  els.restoList.innerHTML = "";

  if (places.length === 0) {
    setNearStatus("근처에서 결과를 찾지 못했어요. 동네 이름을 바꿔 보세요.");
    return;
  }

  setNearStatus(
    usingDummy
      ? "샘플 데이터예요. config.js에 카카오 JS 키를 넣으면 실제 식당이 나와요."
      : ""
  );

  places.forEach((place) => {
    const li = document.createElement("li");
    li.className = "resto-item";

    const main = document.createElement("div");
    main.className = "resto-main";

    const nameEl = place.url
      ? document.createElement("a")
      : document.createElement("span");
    nameEl.className = "resto-name";
    nameEl.textContent = place.name;
    if (place.url) {
      nameEl.href = place.url;
      nameEl.target = "_blank";
      nameEl.rel = "noopener noreferrer";
    }
    main.appendChild(nameEl);

    if (place.category) {
      const cat = document.createElement("span");
      cat.className = "resto-cat";
      cat.textContent = place.category;
      main.appendChild(cat);
    }
    li.appendChild(main);

    const meta = document.createElement("div");
    meta.className = "resto-meta";
    const dist = formatDistance(place.distance);
    meta.textContent = [dist, place.address].filter(Boolean).join(" · ");
    if (meta.textContent) li.appendChild(meta);

    els.restoList.appendChild(li);
  });
}

async function handleNearSearch() {
  const dong = els.dongInput.value.trim();
  const menu = state.current;
  if (!menu) return;

  if (!dong) {
    setNearStatus("동네를 입력해 주세요.");
    return;
  }

  saveDong(dong);
  els.restoList.innerHTML = "";
  els.nearBtn.disabled = true;
  setNearStatus(isApiEnabled() ? "근처 식당을 찾는 중…" : "샘플 데이터 불러오는 중…");

  try {
    const { usingDummy, places } = await searchNearby({ dong, keyword: menu.name });
    renderRestaurants(places, usingDummy);
  } catch (err) {
    setNearStatus(err?.message ?? "검색 중 문제가 생겼어요.");
  } finally {
    els.nearBtn.disabled = false;
  }
}

function saveDong(dong) {
  try {
    localStorage.setItem(DONG_STORAGE_KEY, dong);
  } catch {
    /* 저장 실패는 무시 (시크릿 모드 등) */
  }
}

function loadDong() {
  try {
    return localStorage.getItem(DONG_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

// --- 룰렛 연출 ---
function rollOnce() {
  const pool = state.candidates;
  const peek = pool[Math.floor(Math.random() * pool.length)];
  els.emoji.textContent = peek.emoji;
  els.name.textContent = peek.name;
}

function spin() {
  if (state.isSpinning) return;
  if (state.candidates.length === 0) return;

  const result = pickRandom(state.candidates, state.lastId);
  if (!result) return;

  state.isSpinning = true;
  els.card.classList.remove("is-empty", "is-filled");
  els.card.classList.add("is-spinning");
  els.tags.innerHTML = "";
  els.comment.textContent = "";
  render();

  const finish = () => {
    state.isSpinning = false;
    state.current = result;
    state.lastId = result.id;
    renderResult(result);
    render();
  };

  if (prefersReducedMotion || state.candidates.length === 1) {
    // 모션 최소화: 빠른 페이드로 대체
    els.emoji.textContent = result.emoji;
    els.name.textContent = result.name;
    setTimeout(finish, 250);
    return;
  }

  // 룰렛: 빠르게 교체하다 정지
  const duration = 700;
  const interval = 70;
  const start = Date.now();
  const timer = setInterval(() => {
    if (Date.now() - start >= duration) {
      clearInterval(timer);
      finish();
    } else {
      rollOnce();
    }
  }, interval);
}

// --- 필터 변경 ---
function onFilterChange() {
  recomputeCandidates();
  // 후보가 줄어 current가 더 이상 유효하지 않을 수 있으나, 표시는 유지.
  render();
}

function handleReset() {
  resetFilters();
  syncFilterUI();
  render();
}

function toggleSolo() {
  state.filters.soloOnly = !state.filters.soloOnly;
  els.soloSwitch.setAttribute("aria-checked", state.filters.soloOnly ? "true" : "false");
  els.soloSwitch.classList.toggle("is-on", state.filters.soloOnly);
  onFilterChange();
}

// 상태 → 칩/스위치 UI 동기화 (초기화 시 사용)
function syncFilterUI() {
  els.categoryChips.querySelectorAll(".chip").forEach((chip) => {
    const active = state.filters.categories.has(chip.dataset.id);
    chip.setAttribute("aria-pressed", active ? "true" : "false");
    chip.classList.toggle("is-active", active);
  });
  els.typeChips.querySelectorAll(".chip").forEach((chip) => {
    const active = state.filters.types.has(chip.dataset.id);
    chip.setAttribute("aria-pressed", active ? "true" : "false");
    chip.classList.toggle("is-active", active);
  });
  els.soloSwitch.setAttribute("aria-checked", state.filters.soloOnly ? "true" : "false");
  els.soloSwitch.classList.toggle("is-on", state.filters.soloOnly);
}

// --- 초기화 ---
function init() {
  buildChips(els.categoryChips, CATEGORIES, state.filters.categories);
  buildChips(els.typeChips, TYPES, state.filters.types);

  els.spinBtn.addEventListener("click", spin);
  els.resetBtn.addEventListener("click", handleReset);
  els.soloSwitch.addEventListener("click", toggleSolo);

  // 근처 식당 검색
  els.dongInput.value = loadDong();
  els.nearBtn.addEventListener("click", handleNearSearch);
  els.dongInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleNearSearch();
  });

  recomputeCandidates();
  syncFilterUI();
  render();
}

init();
