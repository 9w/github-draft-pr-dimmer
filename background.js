const STORAGE_KEY = "enabled";

// Storage helpers
async function getEnabled() {
  const data = await chrome.storage.sync.get([STORAGE_KEY]);
  return data[STORAGE_KEY] ?? true; // 기본 ON
}

async function setEnabled(value) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: value });
}

// Icon settings
function getIconPath(enabled) {
  return enabled
    ? {
        16: "icons/on16.png",
        32: "icons/on32.png",
        48: "icons/on48.png",
        128: "icons/on128.png"
      }
    : {
        16: "icons/off16.png",
        32: "icons/off32.png",
        48: "icons/off48.png",
        128: "icons/off128.png"
      };
}

/**
 * Set icon for:
 * - specific tab (tabId provided)
 * - or global default icon (tabId omitted)
 */
async function applyActionUI(enabled, tabId) {
  const path = getIconPath(enabled);

  if (typeof tabId === "number") {
    await chrome.action.setIcon({ tabId, path });
    await chrome.action.setBadgeText({ tabId, text: "" });
  } else {
    await chrome.action.setIcon({ path });
    await chrome.action.setBadgeText({ text: "" });
  }
}

async function notifyTab(tabId, enabled) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "GDD_SET_ENABLED", enabled });
  } catch {
    // content script가 아직 붙지 않았거나, 해당 탭이 github가 아닐 수 있음
  }
}

function isGithubUrl(url) {
  return typeof url === "string" && url.startsWith("https://github.com/");
}

async function initForCurrentContext() {
  const enabled = await getEnabled();

  // 전역 기본 아이콘부터 설정
  await applyActionUI(enabled);

  // 현재 활성 탭에도 한 번 더 적용 (탭별 아이콘 우선 적용 안정화)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await applyActionUI(enabled, tab.id);
    if (isGithubUrl(tab.url)) await notifyTab(tab.id, enabled);
  }
}

// Lifecycle events
chrome.runtime.onInstalled.addListener(() => {
  // service worker에서는 async 직접 못 붙이니 wrapper 호출
  initForCurrentContext();
});

chrome.runtime.onStartup.addListener(() => {
  initForCurrentContext();
});

// User action: click to toggle
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;

  const current = await getEnabled();
  const next = !current;

  await setEnabled(next);

  // 클릭한 탭에 아이콘 즉시 반영
  await applyActionUI(next, tab.id);

  // 전역 기본 아이콘도 같이 갱신 (다른 탭에서도 일관된 기본 아이콘 유지)
  await applyActionUI(next);

  if (isGithubUrl(tab.url)) {
    await notifyTab(tab.id, next);
  }
});

// Keep UI in sync when switching tabs
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const enabled = await getEnabled();

  await applyActionUI(enabled, tabId);

  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab?.id && isGithubUrl(tab.url)) {
    await notifyTab(tab.id, enabled);
  }
});

// Keep UI in sync when a tab finishes loading
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  const enabled = await getEnabled();
  await applyActionUI(enabled, tabId);

  if (isGithubUrl(tab?.url)) {
    await notifyTab(tabId, enabled);
  }
});
