const STORAGE_KEY = "blockedEntries";

const form = document.getElementById("add-form");
const input = document.getElementById("entry-input");
const list = document.getElementById("entry-list");
const emptyState = document.getElementById("empty-state");
const statusEl = document.getElementById("status");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function normalizeEntry(value) {
  return value.trim();
}

async function getEntries() {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
}

async function saveEntries(entries) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: entries });
}

function renderEntries(entries) {
  list.innerHTML = "";

  if (entries.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  for (const entry of entries) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = entry;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", async () => {
      const current = await getEntries();
      const next = current.filter(
        (item) => item.toLowerCase() !== entry.toLowerCase()
      );
      await saveEntries(next);
      renderEntries(next);
      setStatus(`Removed ${entry}`);
    });

    li.appendChild(label);
    li.appendChild(removeBtn);
    list.appendChild(li);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const entry = normalizeEntry(input.value);
  if (!entry) {
    setStatus("Enter a URL or domain.", true);
    return;
  }

  const entries = await getEntries();
  const exists = entries.some(
    (item) => item.toLowerCase() === entry.toLowerCase()
  );

  if (exists) {
    setStatus("That entry is already blocked.", true);
    return;
  }

  const next = [...entries, entry];
  await saveEntries(next);
  renderEntries(next);
  input.value = "";
  input.focus();
  setStatus(`Added ${entry}`);
});

async function init() {
  const entries = await getEntries();
  renderEntries(entries);
}

init().catch((error) => {
  console.error(error);
  setStatus("Failed to load blocked entries.", true);
});
