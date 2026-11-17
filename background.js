importScripts("policy.js");

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

/**
 * Seed the personal list with a starter entry, but only for unmanaged installs.
 * Never touch storage when an admin policy is present.
 */
async function seedDefaultsIfNeeded() {
  const policy = await getManagedPolicy();
  if (Array.isArray(policy[STORAGE_KEY])) {
    return;
  }
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  if (!Array.isArray(result[STORAGE_KEY])) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULT_ENTRIES });
  }
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

async function applyCurrentState() {
  const state = await getBlockState();
  await syncDynamicRules(state.effectiveEntries);
}

async function initialize() {
  await seedDefaultsIfNeeded();
  await applyCurrentState();
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

// Re-apply whenever the admin policy (managed) or personal list (sync) changes.
// Always rebuild from getBlockState() so a sync write can never override
// or remove admin entries.
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "managed" && areaName !== "sync") {
    return;
  }
  if (!changes[STORAGE_KEY] && !changes[ALLOW_USER_KEY]) {
    return;
  }
  applyCurrentState().catch((error) => {
    console.error("Failed to sync dynamic rules:", error);
  });
});

// Runs every time the service worker wakes, re-asserting the rules.
initialize().catch((error) => {
  console.error("Failed to initialize service worker:", error);
});
