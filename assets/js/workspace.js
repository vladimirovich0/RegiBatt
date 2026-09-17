const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeIcon = themeToggle?.querySelector("[data-theme-icon]");
const themeColor = document.querySelector('meta[name="theme-color"]');
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

const savedTheme = readSetting("rovnota.theme") || readSetting("regibatt.theme") || readSetting("theme");
if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;

function updateThemeButton() {
  if (!themeToggle || !themeIcon) return;
  const isDark = root.dataset.theme !== "light";
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeColor?.setAttribute("content", isDark ? "#0F172A" : "#F8FAFC");
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

function activateReviewPanel(button) {
  const target = button?.dataset.reviewTarget;
  if (!target) return;

  reviewButtons.forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });
  reviewPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.reviewPanel === target));
}

reviewButtons.forEach((button) => {
  button.addEventListener("click", () => activateReviewPanel(button));
});

const hashTarget = window.location.hash.slice(1);
const initialReviewButton = Array.from(reviewButtons).find((button) => button.dataset.reviewTarget === hashTarget)
  || Array.from(reviewButtons).find((button) => button.classList.contains("is-active"));
activateReviewPanel(initialReviewButton);

function initializeWorkspaceManager() {
  const workspaceControl = document.querySelector("[data-workspace-control]");
  const appContent = document.querySelector(".app-content");
  const appTopbar = document.querySelector(".app-topbar");
  const projectLabel = document.querySelector(".project-label");
  if (!workspaceControl || !appContent || !appTopbar) return;

  const WORKSPACES_KEY = "rovnota.demo.workspaces.v1";
  const ACTIVE_WORKSPACE_KEY = "rovnota.demo.activeWorkspaceId";
  const workspaceDefinitions = [
    {
      type: "lmt",
      name: "Аккумуляторы LMT",
      shortLabel: "LMT",
      avatar: "L",
      description: "Аккумуляторы лёгкого электротранспорта."
    },
    {
      type: "automotive",
      name: "Автомобильные аккумуляторы",
      shortLabel: "Автомобильные",
      avatar: "EV",
      description: "Тяговые аккумуляторы электромобилей и гибридов."
    },
    {
      type: "industrial",
      name: "Промышленные аккумуляторы",
      shortLabel: "Промышленные",
      avatar: "П",
      description: "Аккумуляторы для промышленного оборудования и систем накопления энергии."
    }
  ];
  const definitionByType = new Map(workspaceDefinitions.map((definition) => [definition.type, definition]));

  let workspaces = [];
  let activeWorkspaceId = null;
  let workspaceMenuOpen = false;
  let contextWorkspaceId = null;
  let contextReturnFocus = null;
  let modalReturnFocus = null;
  let creatingWorkspace = false;
  let deleteConfirmationWorkspaceId = null;
  let deleteConfirmationReturnFocus = null;
  let storageIssue = null;

  const originalProjectLabel = projectLabel ? {
    label: projectLabel.querySelector("small")?.textContent || "Проект",
    value: projectLabel.querySelector("strong")?.textContent || "PowerCell PC-4815"
  } : null;

  const storageWarning = document.createElement("div");
  storageWarning.className = "workspace-storage-warning";
  storageWarning.setAttribute("role", "status");
  storageWarning.hidden = true;
  storageWarning.innerHTML = `<span aria-hidden="true">!</span><p></p>`;
  appTopbar.insertAdjacentElement("afterend", storageWarning);

  const emptyState = document.createElement("section");
  emptyState.className = "workspace-empty-state";
  emptyState.hidden = true;
  emptyState.innerHTML = `
    <span class="workspace-empty-state__icon" aria-hidden="true">＋</span>
    <p class="page-heading__eyebrow">РАБОЧИЕ ПРОСТРАНСТВА</p>
    <h1>Создайте первое пространство</h1>
    <p>Выберите тип аккумуляторов, чтобы открыть тематический раздел и продолжить работу в демо.</p>
    <button class="button button--primary" type="button" data-empty-create>＋ Создать пространство</button>
  `;
  appContent.prepend(emptyState);

  const contextMenu = document.createElement("div");
  contextMenu.className = "workspace-context-menu";
  contextMenu.setAttribute("role", "menu");
  contextMenu.hidden = true;
  contextMenu.innerHTML = `
    <button type="button" role="menuitem" data-workspace-delete>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></svg>
      <span>Удалить пространство</span>
    </button>
  `;
  document.body.append(contextMenu);

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "workspace-modal-overlay";
  modalOverlay.hidden = true;
  modalOverlay.innerHTML = `
    <section class="workspace-modal" role="dialog" aria-modal="true" aria-labelledby="workspace-modal-title" aria-describedby="workspace-modal-description">
      <header class="workspace-modal__header">
        <div>
          <p class="card-kicker">НОВОЕ ПРОСТРАНСТВО</p>
          <h2 id="workspace-modal-title">Создать рабочее пространство</h2>
          <p id="workspace-modal-description">Выберите тематический раздел. В текущем демо доступно одно пространство каждого типа.</p>
        </div>
        <button class="workspace-modal__close" type="button" aria-label="Закрыть окно" data-workspace-modal-close>×</button>
      </header>
      <div class="workspace-modal__body">
        <h3>Аккумуляторы</h3>
        <div class="workspace-type-grid" data-workspace-type-grid></div>
        <p class="workspace-modal__error" role="alert" data-workspace-modal-error hidden></p>
      </div>
    </section>
  `;
  document.body.append(modalOverlay);

  const deleteConfirmationOverlay = document.createElement("div");
  deleteConfirmationOverlay.className = "workspace-modal-overlay workspace-delete-overlay";
  deleteConfirmationOverlay.hidden = true;
  deleteConfirmationOverlay.innerHTML = `
    <section class="workspace-delete-confirm" role="dialog" aria-modal="true" aria-labelledby="workspace-delete-title" aria-describedby="workspace-delete-description">
      <span class="workspace-delete-confirm__icon" aria-hidden="true">!</span>
      <h2 id="workspace-delete-title">Удалить рабочее пространство?</h2>
      <p id="workspace-delete-description"><strong data-workspace-delete-name></strong> будет удалено. Вернуть пространство после удаления будет невозможно.</p>
      <p class="workspace-delete-confirm__note">Документы и проекты в текущем демо не удаляются.</p>
      <div class="workspace-delete-confirm__actions">
        <button class="button button--ghost" type="button" data-workspace-delete-no>Нет</button>
        <button class="button workspace-delete-confirm__approve" type="button" data-workspace-delete-yes>Да</button>
      </div>
    </section>
  `;
  document.body.append(deleteConfirmationOverlay);

  const modal = modalOverlay.querySelector(".workspace-modal");
  const modalClose = modalOverlay.querySelector("[data-workspace-modal-close]");
  const modalError = modalOverlay.querySelector("[data-workspace-modal-error]");
  const workspaceTypeGrid = modalOverlay.querySelector("[data-workspace-type-grid]");
  const deleteAction = contextMenu.querySelector("[data-workspace-delete]");
  const deleteConfirmation = deleteConfirmationOverlay.querySelector(".workspace-delete-confirm");
  const deleteConfirmationName = deleteConfirmationOverlay.querySelector("[data-workspace-delete-name]");
  const deleteConfirmationNo = deleteConfirmationOverlay.querySelector("[data-workspace-delete-no]");
  const deleteConfirmationYes = deleteConfirmationOverlay.querySelector("[data-workspace-delete-yes]");
  const emptyCreateAction = emptyState.querySelector("[data-empty-create]");

  function setStorageIssue(message, kind = "write") {
    storageIssue = { message, kind };
    storageWarning.querySelector("p").textContent = message;
    storageWarning.hidden = false;
  }

  function clearStorageIssue(kind) {
    if (!storageIssue || storageIssue.kind !== kind) return;
    storageIssue = null;
    storageWarning.hidden = true;
    storageWarning.querySelector("p").textContent = "";
  }

  function readLocalValue(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      setStorageIssue("Браузер запретил локальное хранение. Изменения будут доступны только на этой странице.", "unavailable");
      return null;
    }
  }

  function writeLocalValue(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      setStorageIssue("Не удалось сохранить изменения в браузере. Демо продолжает работать без постоянного сохранения.", "write");
      return false;
    }
  }

  function removeLocalValue(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      setStorageIssue("Не удалось сохранить изменения в браузере. Демо продолжает работать без постоянного сохранения.", "write");
      return false;
    }
  }

  function sortWorkspaces(items) {
    return items.sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id));
  }

  function loadWorkspaces() {
    const rawValue = readLocalValue(WORKSPACES_KEY);
    if (rawValue === null) return [];

    try {
      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) throw new Error("Invalid workspace collection");

      const validItems = [];
      const ids = new Set();
      const types = new Set();
      let invalidItemFound = false;

      parsed.forEach((item) => {
        const definition = item && definitionByType.get(item.type);
        const isValid = definition
          && typeof item.id === "string"
          && item.id.length > 0
          && item.id.length <= 120
          && item.name === definition.name
          && typeof item.createdAt === "string"
          && Number.isFinite(Date.parse(item.createdAt))
          && !ids.has(item.id)
          && !types.has(item.type);

        if (!isValid) {
          invalidItemFound = true;
          return;
        }

        ids.add(item.id);
        types.add(item.type);
        validItems.push({ id: item.id, type: item.type, name: item.name, createdAt: item.createdAt });
      });

      if (invalidItemFound) {
        setStorageIssue("Часть сохранённых пространств повреждена и не была загружена.", "corrupt");
      }

      return sortWorkspaces(validItems);
    } catch {
      setStorageIssue("Сохранённые пространства повреждены. Демо открыто с пустым списком.", "corrupt");
      return [];
    }
  }

  function persistState() {
    const listSaved = writeLocalValue(WORKSPACES_KEY, JSON.stringify(workspaces));
    const activeSaved = activeWorkspaceId
      ? writeLocalValue(ACTIVE_WORKSPACE_KEY, activeWorkspaceId)
      : removeLocalValue(ACTIVE_WORKSPACE_KEY);

    if (listSaved && activeSaved) {
      clearStorageIssue("write");
      clearStorageIssue("corrupt");
    }

    return listSaved && activeSaved;
  }

  function persistActiveWorkspace() {
    const saved = activeWorkspaceId
      ? writeLocalValue(ACTIVE_WORKSPACE_KEY, activeWorkspaceId)
      : removeLocalValue(ACTIVE_WORKSPACE_KEY);
    if (saved) clearStorageIssue("write");
    return saved;
  }

  function createWorkspaceId(type) {
    if (globalThis.crypto?.randomUUID) return `workspace-${type}-${crypto.randomUUID()}`;
    return `workspace-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getActiveWorkspace() {
    return workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null;
  }

  function setWorkspaceMenuOpen(isOpen) {
    workspaceMenuOpen = Boolean(isOpen && workspaces.length);
    const trigger = workspaceControl.querySelector("[data-workspace-trigger]");
    const menu = workspaceControl.querySelector("[data-workspace-menu]");
    if (workspaceMenuOpen && menu) {
      const contentHeight = Array.from(menu.children).reduce(
        (height, element) => height + Math.max(element.scrollHeight, element.offsetHeight),
        0
      );
      const menuStyle = getComputedStyle(menu);
      const borderHeight = Number.parseFloat(menuStyle.borderTopWidth) + Number.parseFloat(menuStyle.borderBottomWidth);
      menu.style.setProperty("--workspace-menu-height", `${Math.ceil(contentHeight + borderHeight)}px`);
    }
    workspaceControl.classList.toggle("is-open", workspaceMenuOpen);
    trigger?.setAttribute("aria-expanded", String(workspaceMenuOpen));
    menu?.setAttribute("aria-hidden", String(!workspaceMenuOpen));
    if (!workspaceMenuOpen) closeContextMenu(false);
  }

  function renderWorkspaceControl() {
    workspaceMenuOpen = false;
    workspaceControl.classList.remove("is-open");
    workspaceControl.replaceChildren();

    if (!workspaces.length) {
      const createButton = document.createElement("button");
      createButton.className = "workspace-create-button";
      createButton.type = "button";
      createButton.textContent = "+ Создать пространство";
      createButton.addEventListener("click", () => openWorkspaceModal(createButton));
      workspaceControl.append(createButton);
      return;
    }

    const activeWorkspace = getActiveWorkspace() || workspaces[0];
    const activeDefinition = definitionByType.get(activeWorkspace.type);
    const trigger = document.createElement("button");
    trigger.className = "workspace-switcher";
    trigger.type = "button";
    trigger.dataset.workspaceTrigger = "";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "workspace-menu");
    trigger.innerHTML = `
      <span class="workspace-avatar" aria-hidden="true"></span>
      <span class="workspace-switcher__copy"><small>Рабочее пространство</small><strong></strong></span>
      <svg class="workspace-switcher__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>
    `;
    trigger.querySelector(".workspace-avatar").textContent = activeDefinition.avatar;
    trigger.querySelector("strong").textContent = activeWorkspace.name;
    trigger.title = activeWorkspace.name;
    trigger.addEventListener("click", () => setWorkspaceMenuOpen(!workspaceMenuOpen));

    const menu = document.createElement("div");
    menu.className = "workspace-menu";
    menu.id = "workspace-menu";
    menu.dataset.workspaceMenu = "";
    menu.setAttribute("aria-hidden", "true");

    const list = document.createElement("div");
    list.className = "workspace-menu__list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", "Рабочие пространства");

    workspaces.forEach((workspace) => {
      const definition = definitionByType.get(workspace.type);
      const isActive = workspace.id === activeWorkspace.id;
      const row = document.createElement("div");
      row.className = "workspace-option";
      row.classList.toggle("is-active", isActive);
      row.dataset.workspaceId = workspace.id;

      const selectButton = document.createElement("button");
      selectButton.className = "workspace-option__select";
      selectButton.type = "button";
      selectButton.setAttribute("role", "option");
      selectButton.setAttribute("aria-selected", String(isActive));
      selectButton.innerHTML = `
        <span class="workspace-option__avatar" aria-hidden="true"></span>
        <span class="workspace-option__name"></span>
      `;
      selectButton.querySelector(".workspace-option__avatar").textContent = definition.avatar;
      selectButton.querySelector(".workspace-option__name").textContent = workspace.name;
      selectButton.title = workspace.name;
      selectButton.addEventListener("click", () => selectWorkspace(workspace.id));

      row.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        openContextMenu(workspace.id, selectButton, { x: event.clientX, y: event.clientY });
      });
      row.append(selectButton);
      list.append(row);
    });

    const createButton = document.createElement("button");
    createButton.className = "workspace-menu__create";
    createButton.type = "button";
    createButton.textContent = "+ Создать пространство";
    createButton.addEventListener("click", () => {
      setWorkspaceMenuOpen(false);
      openWorkspaceModal(createButton);
    });

    menu.append(list, createButton);
    workspaceControl.append(trigger, menu);
  }

  function renderEmptyState() {
    const isEmpty = workspaces.length === 0;
    document.body.classList.toggle("workspace-is-empty", isEmpty);
    emptyState.hidden = !isEmpty;

    if (projectLabel && originalProjectLabel) {
      const label = projectLabel.querySelector("small");
      const value = projectLabel.querySelector("strong");
      if (label) label.textContent = isEmpty ? "Рабочее пространство" : originalProjectLabel.label;
      if (value) value.textContent = isEmpty ? "Не выбрано" : originalProjectLabel.value;
    }
  }

  function renderAll() {
    if (workspaces.length && !workspaces.some((workspace) => workspace.id === activeWorkspaceId)) {
      activeWorkspaceId = workspaces[0].id;
    }
    if (!workspaces.length) activeWorkspaceId = null;
    renderWorkspaceControl();
    renderEmptyState();
    if (!modalOverlay.hidden) renderWorkspaceTypeCards();
  }

  function selectWorkspace(workspaceId) {
    if (!workspaces.some((workspace) => workspace.id === workspaceId)) return;
    activeWorkspaceId = workspaceId;
    persistActiveWorkspace();
    const menu = workspaceControl.querySelector("[data-workspace-menu]");
    setWorkspaceMenuOpen(false);
    if (!menu) {
      renderAll();
      return;
    }

    let finished = false;
    const handleTransitionEnd = (event) => {
      if (event.propertyName === "max-height") finishSelection();
    };
    const finishSelection = () => {
      if (finished) return;
      finished = true;
      menu.removeEventListener("transitionend", handleTransitionEnd);
      renderAll();
    };
    menu.addEventListener("transitionend", handleTransitionEnd);
    window.setTimeout(finishSelection, 340);
  }

  function positionContextMenu(anchor, point) {
    contextMenu.style.left = "0px";
    contextMenu.style.top = "0px";
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const anchorRect = anchor.getBoundingClientRect();
    const requestedX = point?.x ?? anchorRect.right;
    const requestedY = point?.y ?? anchorRect.bottom;
    const left = Math.min(Math.max(8, requestedX - (point ? 0 : menuWidth)), window.innerWidth - menuWidth - 8);
    const top = Math.min(Math.max(8, requestedY), window.innerHeight - menuHeight - 8);
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
  }

  function openContextMenu(workspaceId, anchor, point = null) {
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (!workspace) return;
    contextWorkspaceId = workspaceId;
    contextReturnFocus = anchor;
    contextMenu.hidden = false;
    contextMenu.classList.add("is-open");
    positionContextMenu(anchor, point);
    deleteAction.focus();
  }

  function closeContextMenu(restoreFocus = true) {
    if (contextMenu.hidden) return;
    contextMenu.hidden = true;
    contextMenu.classList.remove("is-open");
    contextWorkspaceId = null;
    if (restoreFocus && contextReturnFocus?.isConnected) contextReturnFocus.focus();
    contextReturnFocus = null;
  }

  function deleteWorkspace(workspaceId) {
    const index = workspaces.findIndex((workspace) => workspace.id === workspaceId);
    if (index < 0) return;

    const [workspace] = workspaces.splice(index, 1);
    const wasActive = workspace.id === activeWorkspaceId;
    if (wasActive) activeWorkspaceId = workspaces[0]?.id || null;
    persistState();
    renderAll();
    workspaceControl.querySelector("button")?.focus();
  }

  function openDeleteConfirmation(workspaceId) {
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (!workspace) return;
    deleteConfirmationWorkspaceId = workspaceId;
    deleteConfirmationReturnFocus = contextReturnFocus;
    deleteConfirmationName.textContent = `Пространство «${workspace.name}»`;
    closeContextMenu(false);
    deleteConfirmationOverlay.hidden = false;
    document.body.classList.add("has-workspace-modal");
    deleteConfirmationNo.focus();
  }

  function closeDeleteConfirmation(restoreFocus = true) {
    if (deleteConfirmationOverlay.hidden) return;
    deleteConfirmationOverlay.hidden = true;
    if (modalOverlay.hidden) document.body.classList.remove("has-workspace-modal");
    if (restoreFocus) {
      const fallback = workspaceControl.querySelector("[data-workspace-trigger]");
      (deleteConfirmationReturnFocus?.isConnected ? deleteConfirmationReturnFocus : fallback)?.focus();
    }
    deleteConfirmationWorkspaceId = null;
    deleteConfirmationReturnFocus = null;
  }

  function setModalError(message = "") {
    modalError.textContent = message;
    modalError.hidden = !message;
  }

  function renderWorkspaceTypeCards() {
    workspaceTypeGrid.replaceChildren();

    workspaceDefinitions.forEach((definition) => {
      const existingWorkspace = workspaces.find((workspace) => workspace.type === definition.type);
      const button = document.createElement("button");
      button.className = "workspace-type-card";
      button.type = "button";
      button.disabled = creatingWorkspace;
      button.innerHTML = `
        <span class="workspace-type-card__icon" aria-hidden="true"></span>
        <span class="workspace-type-card__copy"><strong></strong><small></small></span>
        <span class="workspace-type-card__status"></span>
      `;
      button.querySelector(".workspace-type-card__icon").textContent = definition.avatar;
      button.querySelector("strong").textContent = definition.shortLabel;
      button.querySelector("small").textContent = definition.description;
      button.querySelector(".workspace-type-card__status").textContent = existingWorkspace
        ? "Уже создано · Открыть"
        : "Создать →";
      button.classList.toggle("is-existing", Boolean(existingWorkspace));
      button.addEventListener("click", () => {
        if (existingWorkspace) {
          selectWorkspace(existingWorkspace.id);
          closeWorkspaceModal();
          return;
        }
        createWorkspace(definition, button);
      });
      workspaceTypeGrid.append(button);
    });
  }

  function createWorkspace(definition, sourceButton) {
    if (creatingWorkspace) return;
    const existingWorkspace = workspaces.find((workspace) => workspace.type === definition.type);
    if (existingWorkspace) {
      selectWorkspace(existingWorkspace.id);
      closeWorkspaceModal();
      return;
    }

    creatingWorkspace = true;
    sourceButton.setAttribute("aria-busy", "true");
    Array.from(workspaceTypeGrid.querySelectorAll("button")).forEach((button) => { button.disabled = true; });
    setModalError();

    try {
      const workspace = {
        id: createWorkspaceId(definition.type),
        type: definition.type,
        name: definition.name,
        createdAt: new Date().toISOString()
      };
      workspaces.push(workspace);
      sortWorkspaces(workspaces);
      activeWorkspaceId = workspace.id;
      persistState();
      renderAll();
      closeWorkspaceModal();
    } catch {
      setModalError("Не удалось создать пространство. Попробуйте ещё раз.");
      renderWorkspaceTypeCards();
    } finally {
      creatingWorkspace = false;
      sourceButton.removeAttribute("aria-busy");
    }
  }

  function openWorkspaceModal(sourceElement = document.activeElement) {
    setWorkspaceMenuOpen(false);
    closeContextMenu(false);
    modalReturnFocus = sourceElement?.matches?.(".workspace-menu__create")
      ? workspaceControl.querySelector("[data-workspace-trigger]")
      : sourceElement;
    creatingWorkspace = false;
    setModalError();
    renderWorkspaceTypeCards();
    modalOverlay.hidden = false;
    document.body.classList.add("has-workspace-modal");
    const firstTypeCard = workspaceTypeGrid.querySelector("button");
    if (firstTypeCard) firstTypeCard.focus();
    else modalClose.focus();
  }

  function closeWorkspaceModal(restoreFocus = true) {
    if (modalOverlay.hidden) return;
    modalOverlay.hidden = true;
    document.body.classList.remove("has-workspace-modal");
    creatingWorkspace = false;
    setModalError();
    if (restoreFocus) {
      const fallback = workspaceControl.querySelector("button");
      (modalReturnFocus?.isConnected ? modalReturnFocus : fallback)?.focus();
    }
    modalReturnFocus = null;
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab" || modalOverlay.hidden) return;
    const focusable = Array.from(modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function trapDeleteConfirmationFocus(event) {
    if (event.key !== "Tab" || deleteConfirmationOverlay.hidden) return;
    const focusable = Array.from(deleteConfirmation.querySelectorAll("button:not([disabled])"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  workspaces = loadWorkspaces();
  const savedActiveWorkspaceId = readLocalValue(ACTIVE_WORKSPACE_KEY);
  activeWorkspaceId = workspaces.some((workspace) => workspace.id === savedActiveWorkspaceId)
    ? savedActiveWorkspaceId
    : workspaces[0]?.id || null;
  if (activeWorkspaceId !== savedActiveWorkspaceId) persistActiveWorkspace();

  emptyCreateAction.addEventListener("click", () => openWorkspaceModal(emptyCreateAction));
  modalClose.addEventListener("click", () => closeWorkspaceModal());
  modalOverlay.addEventListener("pointerdown", (event) => {
    if (event.target === modalOverlay) closeWorkspaceModal();
  });
  modal.addEventListener("keydown", trapModalFocus);
  deleteAction.addEventListener("click", () => {
    if (contextWorkspaceId) openDeleteConfirmation(contextWorkspaceId);
  });
  deleteConfirmationNo.addEventListener("click", () => closeDeleteConfirmation());
  deleteConfirmationYes.addEventListener("click", () => {
    const workspaceId = deleteConfirmationWorkspaceId;
    closeDeleteConfirmation(false);
    if (workspaceId) deleteWorkspace(workspaceId);
  });
  deleteConfirmationOverlay.addEventListener("pointerdown", (event) => {
    if (event.target === deleteConfirmationOverlay) closeDeleteConfirmation();
  });
  deleteConfirmation.addEventListener("keydown", trapDeleteConfirmationFocus);

  document.addEventListener("pointerdown", (event) => {
    if (!contextMenu.hidden && !contextMenu.contains(event.target)) {
      closeContextMenu(false);
    }
    if (workspaceMenuOpen && !workspaceControl.contains(event.target) && !contextMenu.contains(event.target)) {
      setWorkspaceMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!deleteConfirmationOverlay.hidden) {
      event.preventDefault();
      closeDeleteConfirmation();
    } else if (!modalOverlay.hidden) {
      event.preventDefault();
      closeWorkspaceModal();
    } else if (!contextMenu.hidden) {
      event.preventDefault();
      closeContextMenu();
    } else if (workspaceMenuOpen) {
      event.preventDefault();
      setWorkspaceMenuOpen(false);
      workspaceControl.querySelector("[data-workspace-trigger]")?.focus();
    }
  });

  window.addEventListener("resize", () => closeContextMenu(false));
  workspaceControl.addEventListener("scroll", () => closeContextMenu(false), true);
  renderAll();
}

initializeWorkspaceManager();
updateThemeButton();
