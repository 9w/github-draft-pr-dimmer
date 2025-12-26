let enabled = true;
const DIM_CLASS = "gdd-dim-draft-title";

// 스타일은 JS로 주입(간단 + 충돌 적음)
function ensureStyleTag() {
  if (document.getElementById("gdd-style")) return;
  const style = document.createElement("style");
  style.id = "gdd-style";
  style.textContent = `
    .${DIM_CLASS} {
      color: #6e7781 !important; /* GitHub muted gray */
    }
    .${DIM_CLASS}:hover {
      color: #57606a !important;
    }
  `;
  document.head.appendChild(style);
}

function isPullListPage() {
  // /pulls, /pulls?q=..., org/repo/pulls 등
  return /\/pulls(\?|$)/.test(location.pathname);
}

function rowLooksLikeDraft(rowEl) {
  // Draft 라벨은 보통 "Draft" 텍스트를 가진 badge가 존재
  // GitHub DOM이 종종 바뀌므로 텍스트 기반으로 최대한 유연하게
  const text = rowEl.innerText || "";
  if (!text.includes("Draft")) return false;

  // 너무 광범위하면 오탐 가능성 있어서, "Draft" 뱃지 요소를 좀 더 직접 탐색
  const badges = rowEl.querySelectorAll(
    'span.Label, span.IssueLabel, span[data-hovercard-type], span[class*="Label"]'
  );

  for (const b of badges) {
    const t = (b.textContent || "").trim();
    if (t === "Draft") return true;
  }

  // fallback: aria-label에 Draft 포함되는 케이스도 허용
  const ariaDraft = rowEl.querySelector('[aria-label*="Draft"], [title*="Draft"]');
  return !!ariaDraft;
}

function findTitleAnchor(rowEl) {
  // PR 리스트의 타이틀 링크: GitHub가 자주 쓰는 selector들 조합
  // 1) 일반적으로 Link--primary
  let a =
    rowEl.querySelector('a.Link--primary') ||
    rowEl.querySelector('a[data-hovercard-type="pull_request"]') ||
    rowEl.querySelector('a.markdown-title') ||
    rowEl.querySelector('a[id^="issue_"]');

  // 마지막 fallback: 첫 번째 a 중에서 /pull/ 포함 링크
  if (!a) {
    const candidates = Array.from(rowEl.querySelectorAll("a[href]"));
    a = candidates.find((x) => x.getAttribute("href")?.includes("/pull/"));
  }
  return a || null;
}

function applyDim() {
  ensureStyleTag();

  // 페이지가 PR 리스트가 아니면 아무것도 안 함
  if (!isPullListPage()) return;

  // PR row 후보: js-issue-row / Box-row 등
  const rows = document.querySelectorAll(
    'div[js-issue-row], div.Box-row'
  );

  rows.forEach((row) => {
    const title = findTitleAnchor(row);
    if (!title) return;

    const draft = rowLooksLikeDraft(row);

    if (!enabled) {
      title.classList.remove(DIM_CLASS);
      return;
    }

    if (draft) title.classList.add(DIM_CLASS);
    else title.classList.remove(DIM_CLASS);
  });
}

function setupObserver() {
  const observer = new MutationObserver(() => {
    // DOM 변동이 잦아서 과도 호출 방지: microtask 수준에서 한 번만
    queueMicrotask(applyDim);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  return observer;
}

// 메시지로 enabled 제어
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "GDD_SET_ENABLED") {
    enabled = !!msg.enabled;
    applyDim();
  }
});

// 초기 enabled 로드
(async function init() {
  const data = await chrome.storage.sync.get(["enabled"]);
  enabled = data.enabled ?? true;

  applyDim();
  setupObserver();

  // GitHub 내부 라우팅 대응(일부 환경에서 popstate로 바뀌는 경우)
  window.addEventListener("popstate", applyDim);
})();
