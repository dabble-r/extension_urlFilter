// STORAGE_KEY, getBlockState() come from policy.js

const form = document.getElementById("add-form");
const input = document.getElementById("entry-input");
const list = document.getElementById("entry-list");
const emptyState = document.getElementById("empty-state");
const statusEl = document.getElementById("status");
const managedBanner = document.getElementById("managed-banner");
const subtitle = document.querySelector(".subtitle");

let state = null;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

async function saveUserEntries(entries) {
  // Re-check right before writing in case the admin policy changed.
  const fresh = await getBlockState();
  if (!fresh.canEdit) {
    throw new Error("locked");
  }
  await chrome.storage.sync.set({ [STORAGE_KEY]: entries });
}

function makeRow(entry, removable) {
  const li = document.createElement("li");

  const label = document.createElement("span");
  label.textContent = entry;
  li.appendChild(label);

  if (removable) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", async () => {
      const next = state.userEntries.filter(
        (item) => item.toLowerCase() !== entry.toLowerCase()
      );
      try {
        await saveUserEntries(next);
        setStatus(`Removed ${entry}`);
      } catch {
        setStatus("This list is managed by your administrator.", true);
      }
      await refresh();
    });
    li.appendChild(removeBtn);
  } else if (state.managed) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "Set by admin";
    li.appendChild(badge);
  }

  return li;
}

function render() {
  list.innerHTML = "";

  managedBanner.classList.toggle("hidden", !state.managed);
  form.classList.toggle("hidden", !state.canEdit);
  subtitle.classList.toggle("hidden", !state.canEdit);

  const adminKeys = new Set(state.adminEntries.map((e) => e.toLowerCase()));
  const rows = [
    ...state.adminEntries.map((e) => makeRow(e, false)),
    ...state.userEntries
      .filter((e) => !adminKeys.has(e.toLowerCase()))
      .map((e) => makeRow(e, state.canEdit))
  ];

  emptyState.classList.toggle("hidden", rows.length > 0);
  if (rows.length === 0) {
    emptyState.textContent =
      state.managed && !state.canEdit
        ? "No sites are blocked by your administrator right now."
        : "No blocked entries yet.";
  }
  rows.forEach((row) => list.appendChild(row));
}

async function refresh() {
  state = await getBlockState();
  render();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.canEdit) {
    setStatus("This list is managed by your administrator.", true);
    return;
  }

  const entry = input.value.trim();
  if (!entry) {
    setStatus("Enter a URL or domain.", true);
    return;
  }

  const exists = state.effectiveEntries.some(
    (item) => item.toLowerCase() === entry.toLowerCase()
  );
  if (exists) {
    setStatus("That entry is already blocked.", true);
    return;
  }

  try {
    await saveUserEntries([...state.userEntries, entry]);
    input.value = "";
    input.focus();
    setStatus(`Added ${entry}`);
  } catch {
    setStatus("This list is managed by your administrator.", true);
  }
  await refresh();
});

// Live-update if the admin pushes a new policy while the page is open.
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "managed" || areaName === "sync") {
    refresh().catch(console.error);
  }
});

refresh().catch((error) => {
  console.error(error);
  setStatus("Failed to load blocked entries.", true);
});
