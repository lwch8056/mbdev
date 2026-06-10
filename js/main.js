import { CATEGORIES, TYPES, MENUS } from "./data.js";
import { pickRandom } from "./recommend.js";
import { state, recomputeCandidates, resetFilters } from "./state.js";

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

  recomputeCandidates();
  syncFilterUI();
  render();
}

init();
