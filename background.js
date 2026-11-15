const STORAGE_KEY = "blockedEntries";
const DEFAULT_ENTRIES = ["example.com"];

/**
 * Normalize a user-entered domain or URL into a DNR urlFilter.
 * - Domain-like: example.com -> ||example.com^
 * - URL/path-like: https://badsite.org/page -> ||badsite.org/page
 */
function entryToUrlFilter(entry) {
  const trimmed = entry.trim();
  if (!trimmed) {
    return null;
  }

  let hostname = "";
  let pathname = "";

  try {
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
    const url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
    hostname = url.hostname;
    pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
  } catch {
    // Fallback for plain host/path strings URL cannot parse.
    const withoutScheme = trimmed.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex === -1) {
      hostname = withoutScheme.replace(/\/+$/, "");
      pathname = "";
    } else {
      hostname = withoutScheme.slice(0, slashIndex);
      pathname = withoutScheme.slice(slashIndex).replace(/\/+$/, "");
    }
  }

  if (!hostname) {
    return null;
  }

  if (!pathname) {
    return `||${hostname}^`;
  }

  return `||${hostname}${pathname}`;
}

function entriesToRules(entries) {
  const rules = [];
  let nextId = 1;

  for (const entry of entries) {
    const urlFilter = entryToUrlFilter(entry);
    if (!urlFilter) {
      continue;
    }

    rules.push({
      id: nextId++,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter,
        resourceTypes: ["main_frame", "sub_frame"]
      }
    });
  }

  return rules;
}

async function getBlockedEntries() {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  const entries = result[STORAGE_KEY];

  if (!Array.isArray(entries) || entries.length === 0) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULT_ENTRIES });
    return [...DEFAULT_ENTRIES];
  }

  return entries;
}

async function syncDynamicRules(entries) {
  if (!chrome.declarativeNetRequest) {
    console.error("declarativeNetRequest API is not available.");
    return;
  }

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((rule) => rule.id);
  const addRules = entriesToRules(entries);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules
  });
}

async function initialize() {
  const entries = await getBlockedEntries();
  await syncDynamicRules(entries);
}

chrome.runtime.onInstalled.addListener(() => {
  initialize().catch((error) => {
    console.error("Failed to initialize on install:", error);
  });
});

chrome.runtime.onStartup.addListener(() => {
  initialize().catch((error) => {
    console.error("Failed to initialize on startup:", error);
  });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes[STORAGE_KEY]) {
    return;
  }

  const nextEntries = changes[STORAGE_KEY].newValue;
  const entries = Array.isArray(nextEntries) ? nextEntries : [];

  syncDynamicRules(entries).catch((error) => {
    console.error("Failed to sync dynamic rules:", error);
  });
});

initialize().catch((error) => {
  console.error("Failed to initialize service worker:", error);
});
