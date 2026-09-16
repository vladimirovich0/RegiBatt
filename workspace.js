const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeIcon = themeToggle?.querySelector("[data-theme-icon]");
const fileInput = document.querySelector("[data-file-input]");
const fileList = document.querySelector("[data-file-list]");
const fileCount = document.querySelector("[data-file-count]");
const reviewButtons = document.querySelectorAll("[data-review-target]");
const reviewPanels = document.querySelectorAll("[data-review-panel]");

function readSetting(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ }
}

const savedTheme = readSetting("rovnota.theme");
if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;

function updateThemeButton() {
  if (!themeToggle || !themeIcon) return;
  const isDark = root.dataset.theme !== "light";
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

themeToggle?.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  saveSetting("rovnota.theme", root.dataset.theme);
  updateThemeButton();
});

fileInput?.addEventListener("change", () => {
  const files = Array.from(fileInput.files || []);
  if (!files.length || !fileList) return;

  files.reverse().forEach((file) => {
    const row = document.createElement("div");
    row.className = "file-table-row";
    row.innerHTML = `<span class="file-icon" aria-hidden="true">+</span><span><strong></strong><small></small></span><span class="file-table-row__count">Ещё не анализировался</span><span class="status status--blue">Готов к анализу</span>`;
    row.querySelector("strong").textContent = file.name;
    row.querySelector("small").textContent = `${file.name.split(".").pop()?.toUpperCase() || "FILE"} · ${Math.max(1, Math.round(file.size / 1024))} КБ · Только что`;
    fileList.prepend(row);
  });

  if (fileCount) fileCount.textContent = `${fileList.children.length} файлов`;
  fileInput.value = "";
});

reviewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.reviewTarget;
    reviewButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    reviewPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.reviewPanel === target));
  });
});

updateThemeButton();
