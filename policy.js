// Shared by background.js (via importScripts) and options.html (via <script>).
// Source of truth:
//   1. chrome.storage.managed  -> set by the Google Admin console (read-only to the extension/user)
//   2. chrome.storage.sync     -> personal list, only used when no admin policy exists
//                                 (or when the admin sets allowUserEntries: true)

const STORAGE_KEY = "blockedEntries";
const ALLOW_USER_KEY = "allowUserEntries";

async function getManagedPolicy() {
  try {
    if (!chrome.storage.managed) {
      return {};
    }
    return (await chrome.storage.managed.get([STORAGE_KEY, ALLOW_USER_KEY])) || {};
  } catch (error) {
    // Unmanaged browsers on some platforms throw here; treat as "no policy".
    return {};
  }
}

function cleanList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/**
 * Returns the current mode and lists.
 * {
 *   managed: boolean,          // admin policy present
 *   canEdit: boolean,          // whether the options page may write to sync
 *   adminEntries: string[],    // enforced, never removable by the user
 *   userEntries: string[],     // personal entries (ignored when locked)
 *   effectiveEntries: string[] // what is actually blocked
 * }
 */
async function getBlockState() {
  const policy = await getManagedPolicy();
  const managed = Array.isArray(policy[STORAGE_KEY]);
  const adminEntries = managed ? cleanList(policy[STORAGE_KEY]) : [];
  const canEdit = !managed || policy[ALLOW_USER_KEY] === true;

  let userEntries = [];
  if (canEdit) {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    userEntries = cleanList(result[STORAGE_KEY]);
  }

  const effectiveEntries = cleanList([...adminEntries, ...userEntries]);
  return { managed, canEdit, adminEntries, userEntries, effectiveEntries };
}
