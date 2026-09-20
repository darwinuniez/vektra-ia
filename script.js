/* =========================================================
   DELAMAIN IA — front-end logic (Connected to /api/chat)
   ========================================================= */

/* =========================================================
   Intro splash — short, skippable, respects reduced motion
   ========================================================= */
const introSplash   = document.getElementById("intro-splash");
const introEnterBtn = document.getElementById("intro-enter-btn");
const reducedMotion  = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  || (() => { try { return localStorage.getItem("delamain.reduceMotion") === "1"; } catch (_) { return false; } })();

let introDismissed = false;
function dismissIntro(){
  if (introDismissed) return;
  introDismissed = true;
  const logoEl = introSplash.querySelector(".intro-logo");
  if (logoEl) logoEl.classList.add("zoom-out");
  introSplash.classList.add("exiting");
  setTimeout(() => introSplash.classList.add("hidden"), 90);
  setTimeout(() => { introSplash.style.display = "none"; }, 620);
}

if (reducedMotion){
  introSplash.style.display = "none";
  introDismissed = true;
} else {
  setTimeout(dismissIntro, 950); // short & punchy — auto-dismiss fast
  introEnterBtn.addEventListener("click", dismissIntro);
  introSplash.addEventListener("click", (e) => {
    if (e.target === introSplash) dismissIntro();
  });
  document.addEventListener("keydown", (e) => {
    if (!introDismissed && (e.key === "Enter" || e.key === "Escape")) dismissIntro();
  });
}

/* =========================================================
   Logo sting — quick, non-blocking branding hit replayed
   every time a new conversation is created
   ========================================================= */
const logoSting = document.getElementById("logo-sting");
let stingTimeout;
function playLogoSting(){
  if (reducedMotion) return;
  clearTimeout(stingTimeout);
  logoSting.classList.remove("play");
  void logoSting.offsetWidth; // force reflow so the animation restarts cleanly
  logoSting.classList.add("play");
  stingTimeout = setTimeout(() => logoSting.classList.remove("play"), 820);
}

/* =========================================================
   Ambient cursor glow — subtle blue/violet drift, desktop only
   ========================================================= */
const cursorGlow = document.getElementById("cursor-glow");
if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches){
  let glowX = window.innerWidth / 2, glowY = window.innerHeight / 2;
  let targetX = glowX, targetY = glowY;
  let glowLoopRunning = false;

  function glowLoop(){
    glowX += (targetX - glowX) * 0.08;
    glowY += (targetY - glowY) * 0.08;
    cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
    const settled = Math.abs(targetX - glowX) < 0.4 && Math.abs(targetY - glowY) < 0.4;
    if (settled){ glowLoopRunning = false; return; } // stop once caught up — saves cycles at rest
    requestAnimationFrame(glowLoop);
  }
  window.addEventListener("pointermove", (e) => {
    targetX = e.clientX; targetY = e.clientY;
    cursorGlow.classList.add("active");
    if (!glowLoopRunning){ glowLoopRunning = true; requestAnimationFrame(glowLoop); }
  }, { passive: true });
  window.addEventListener("pointerleave", () => cursorGlow.classList.remove("active"), { passive: true });
}

/* =========================================================
   Elements
   ========================================================= */
const appEl          = document.getElementById("app");
const chatScrollEl   = document.getElementById("chat-scroll");
const threadEl       = document.getElementById("thread");
const formEl         = document.getElementById("composer-form");
const inputEl        = document.getElementById("composer-input");
const placeholderEl  = document.getElementById("composer-placeholder");
const sendBtn        = formEl.querySelector(".send-btn");
const chipsEl        = document.getElementById("chips");
const topbarTitleEl  = document.getElementById("topbar-title");
const avatarTemplate = document.getElementById("ai-avatar-template");
const typingTemplate = document.getElementById("typing-indicator-template");

const sidebarEl          = document.getElementById("sidebar");
const sidebarScrimEl     = document.getElementById("sidebar-scrim");
const sidebarCollapseBtn = document.getElementById("sidebar-collapse-btn");
const sidebarOpenBtn     = document.getElementById("sidebar-open-btn");
const convListEl         = document.getElementById("conv-list");
const newConvBtn         = document.getElementById("new-conv-btn");
const convLimitNote      = document.getElementById("conv-limit-note");
const convSearchInput    = document.getElementById("conv-search");
const limitUpgradeLink   = document.getElementById("limit-upgrade-link");

const upgradeBtn         = document.getElementById("upgrade-btn");
const upgradeModal       = document.getElementById("upgrade-modal");
const upgradeContextMsg  = document.getElementById("upgrade-context-msg");
const unlockCodeInput    = document.getElementById("unlock-code-input");
const unlockSubmitBtn    = document.getElementById("unlock-submit-btn");
const unlockStatus       = document.getElementById("unlock-status");

const termsLink  = document.getElementById("terms-link");
const termsModal = document.getElementById("terms-modal");

const confirmModal     = document.getElementById("confirm-modal");
const confirmBody      = document.getElementById("confirm-body");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

const modelPickerEl = document.getElementById("model-picker");
const modelBtn       = document.getElementById("model-btn");
const modelPopover   = document.getElementById("model-popover");
const modelLabelEl   = document.getElementById("model-label");

const accountMenuWrap    = document.getElementById("account-menu-wrap");
const accountTrigger     = document.getElementById("account-trigger");
const accountTriggerName = document.getElementById("account-trigger-name");
const accountAvatarEl    = document.getElementById("account-avatar");
const accountAvatarLgEl  = document.getElementById("account-avatar-lg");
const accountNameInput   = document.getElementById("account-name-input");
const avatarGridEl       = document.getElementById("avatar-grid");
const accountSettingsBtn = document.getElementById("account-settings-btn");
const accountHelpBtn     = document.getElementById("account-help-btn");
const accountResetBtn    = document.getElementById("account-reset-btn");

const settingsModal      = document.getElementById("settings-modal");
const settingsThemeGrid  = document.getElementById("settings-theme-grid");
const settingsTextSize   = document.getElementById("settings-textsize");
const settingsMotionSwitch = document.getElementById("settings-motion-switch");
const settingsResetBtn   = document.getElementById("settings-reset-btn");

const searchWrapEl    = document.getElementById("search-wrap");
const searchClearBtn  = document.getElementById("search-clear-btn");
const searchMicBtn    = document.getElementById("search-mic-btn");
const micTooltip      = document.getElementById("mic-tooltip");

const DEFAULT_UPGRADE_MSG = "Delamain Plus est encore en cours de développement. Conversations illimitées, réponses prioritaires et bien plus arrivent bientôt.";

/* =========================================================
   Live "connectés récemment" counter — oscillates 10-16
   ========================================================= */
const liveCountEl = document.getElementById("live-count-num");
let liveCount = 12;
function stepLiveCount(){
  const delta = Math.random() < 0.5 ? -1 : 1;
  liveCount = Math.min(16, Math.max(10, liveCount + delta));
  liveCountEl.style.opacity = "0";
  setTimeout(() => {
    liveCountEl.textContent = liveCount;
    liveCountEl.style.opacity = "1";
  }, 220);
}
setInterval(stepLiveCount, 3600 + Math.random() * 1400);

/* =========================================================
   Composer — rotating placeholder (hidden once input has text)
   ========================================================= */
const PLACEHOLDERS = [
  "Écrire à Delamain…",
  "Delamain vous écoute…",
  "Bienvenue sur Delamain…",
  "Posez votre question…",
  "Que puis-je faire pour vous ?"
];
let placeholderIdx = 0;
function rotatePlaceholder(){
  if (inputEl.value) return;
  placeholderEl.style.opacity = "0";
  setTimeout(() => {
    placeholderIdx = (placeholderIdx + 1) % PLACEHOLDERS.length;
    placeholderEl.textContent = PLACEHOLDERS[placeholderIdx];
    placeholderEl.style.opacity = inputEl.value ? "0" : "1";
  }, 350);
}
setInterval(rotatePlaceholder, 3200);
inputEl.addEventListener("input", () => {
  placeholderEl.style.opacity = inputEl.value ? "0" : "1";
  sendBtn.classList.toggle("ready", inputEl.value.trim().length > 0);
});

/* =========================================================
   AI model — purely cosmetic choice of which "model" answers
   (MAIN 1 / MAIN 1 PRO / MAIN 1 DARK), sent along with requests
   ========================================================= */
const MODELS = {
  main1: { label: "MAIN 1" },
  pro:   { label: "MAIN 1 PRO" },
  dark:  { label: "MAIN 1 DARK" }
};
const MODEL_STORAGE_KEY = "delamain.aiModel";

function loadModel(){
  const saved = localStorage.getItem(MODEL_STORAGE_KEY);
  return MODELS[saved] ? saved : "main1";
}
let currentModel = loadModel();

function applyModelUI(){
  modelLabelEl.textContent = MODELS[currentModel].label;
  modelPopover.querySelectorAll(".model-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.model === currentModel);
  });
}
applyModelUI();

function toggleModelPopover(open){
  const next = open !== undefined ? open : !modelPickerEl.classList.contains("open");
  modelPickerEl.classList.toggle("open", next);
  modelBtn.setAttribute("aria-expanded", String(next));
}
modelBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleModelPopover();
});
modelPopover.querySelectorAll(".model-option").forEach(btn => {
  btn.addEventListener("click", () => {
    currentModel = btn.dataset.model;
    try { localStorage.setItem(MODEL_STORAGE_KEY, currentModel); } catch (_) {}
    applyModelUI();
    toggleModelPopover(false);
  });
});
document.addEventListener("click", (e) => {
  if (modelPickerEl.classList.contains("open") && !e.target.closest("#model-picker")){
    toggleModelPopover(false);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modelPickerEl.classList.contains("open")) toggleModelPopover(false);
});

/* =========================================================
   Settings — site color, text size, motion, local data
   ========================================================= */
const THEMES = { main1: true, pro: true, dark: true };
const THEME_STORAGE_KEY = "delamain.theme";
function loadTheme(){
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES[saved] ? saved : "main1";
}
let currentTheme = loadTheme();
function applyTheme(){
  if (currentTheme === "main1") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", currentTheme);
  settingsThemeGrid.querySelectorAll(".settings-theme-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === currentTheme);
  });
}
settingsThemeGrid.querySelectorAll(".settings-theme-option").forEach(btn => {
  btn.addEventListener("click", () => {
    currentTheme = btn.dataset.theme;
    try { localStorage.setItem(THEME_STORAGE_KEY, currentTheme); } catch (_) {}
    applyTheme();
  });
});
applyTheme();

const TEXTSIZE_STORAGE_KEY = "delamain.textSize";
const TEXTSIZE_PX = { sm: "13.5px", md: "14.5px", lg: "16px" };
function loadTextSize(){
  const saved = localStorage.getItem(TEXTSIZE_STORAGE_KEY);
  return TEXTSIZE_PX[saved] ? saved : "md";
}
let currentTextSize = loadTextSize();
function applyTextSize(){
  document.documentElement.style.setProperty("--msg-font-size", TEXTSIZE_PX[currentTextSize]);
  settingsTextSize.querySelectorAll(".settings-segment").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.size === currentTextSize);
  });
}
settingsTextSize.querySelectorAll(".settings-segment").forEach(btn => {
  btn.addEventListener("click", () => {
    currentTextSize = btn.dataset.size;
    try { localStorage.setItem(TEXTSIZE_STORAGE_KEY, currentTextSize); } catch (_) {}
    applyTextSize();
  });
});
applyTextSize();

const MOTION_STORAGE_KEY = "delamain.reduceMotion";
function loadReduceMotion(){
  try { return localStorage.getItem(MOTION_STORAGE_KEY) === "1"; } catch (_) { return false; }
}
let reduceMotionOn = loadReduceMotion();
function applyReduceMotion(){
  document.documentElement.classList.toggle("reduce-motion", reduceMotionOn);
  settingsMotionSwitch.setAttribute("aria-checked", String(reduceMotionOn));
}
settingsMotionSwitch.addEventListener("click", () => {
  reduceMotionOn = !reduceMotionOn;
  try { localStorage.setItem(MOTION_STORAGE_KEY, reduceMotionOn ? "1" : "0"); } catch (_) {}
  applyReduceMotion();
});
applyReduceMotion();

settingsResetBtn.addEventListener("click", () => {
  pendingConfirmAction = () => {
    try { localStorage.clear(); } catch (_) {}
    window.location.reload();
  };
  confirmBody.textContent = "Vos conversations, votre profil et vos préférences seront définitivement effacés de cet appareil.";
  document.getElementById("confirm-title").textContent = "Réinitialiser les données locales";
  confirmDeleteBtn.textContent = "Réinitialiser";
  openModal(confirmModal);
});
function openSettingsModal(){
  toggleAccountMenu(false);
  openModal(settingsModal);
}
accountSettingsBtn.addEventListener("click", openSettingsModal);

/* =========================================================
   Account — real menu: editable name + a gallery of default
   profile pictures (Instagram/TikTok-style generic avatars)
   ========================================================= */
const ACCOUNT_NAME_KEY   = "delamain.profileName";
const ACCOUNT_AVATAR_KEY = "delamain.avatarPreset";

const AVATAR_PRESETS = [
  { id: "p1", from: "#7fa8ff", to: "#b98bff" },
  { id: "p2", from: "#ff9a8b", to: "#ff6a88" },
  { id: "p3", from: "#8effc1", to: "#2fb37f" },
  { id: "p4", from: "#ffd88a", to: "#ff9d5c" },
  { id: "p5", from: "#9ea6ff", to: "#5865f2" },
  { id: "p6", from: "#ff8ac8", to: "#c86bff" },
  { id: "p7", from: "#8ad9ff", to: "#3aa0ff" },
  { id: "p8", from: "#d9d9de", to: "#9c9ca6" }
];
const SILHOUETTE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8.2" r="4"/><path d="M3.5 20.2c0-4.7 3.8-8.4 8.5-8.4s8.5 3.7 8.5 8.4v.3H3.5v-.3Z"/></svg>`;

function loadAccountName(){
  try { return localStorage.getItem(ACCOUNT_NAME_KEY) || ""; } catch (_) { return ""; }
}
function loadAccountAvatarId(){
  try {
    const saved = localStorage.getItem(ACCOUNT_AVATAR_KEY);
    return AVATAR_PRESETS.some(p => p.id === saved) ? saved : AVATAR_PRESETS[0].id;
  } catch (_) { return AVATAR_PRESETS[0].id; }
}
let currentAvatarId = loadAccountAvatarId();

function paintAvatarEl(el, preset){
  el.style.background = `linear-gradient(135deg, ${preset.from}, ${preset.to})`;
  el.innerHTML = `<span class="avatar-silhouette">${SILHOUETTE_SVG}</span>`;
}
function applyAccountAvatar(){
  const preset = AVATAR_PRESETS.find(p => p.id === currentAvatarId) || AVATAR_PRESETS[0];
  paintAvatarEl(accountAvatarEl, preset);
  paintAvatarEl(accountAvatarLgEl, preset);
  avatarGridEl.querySelectorAll(".avatar-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.presetId === currentAvatarId);
  });
}
function buildAvatarGrid(){
  const frag = document.createDocumentFragment();
  AVATAR_PRESETS.forEach(preset => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-option";
    btn.dataset.presetId = preset.id;
    btn.setAttribute("aria-label", "Choisir cette photo de profil");
    paintAvatarEl(btn, preset);
    btn.addEventListener("click", () => {
      currentAvatarId = preset.id;
      try { localStorage.setItem(ACCOUNT_AVATAR_KEY, currentAvatarId); } catch (_) {}
      applyAccountAvatar();
    });
    frag.appendChild(btn);
  });
  avatarGridEl.appendChild(frag);
}

let accountSaveTimeout;
function applyAccountName(name){
  accountTriggerName.textContent = name.trim() || "Invité";
}
function initAccount(){
  const savedName = loadAccountName();
  accountNameInput.value = savedName;
  applyAccountName(savedName);
  buildAvatarGrid();
  applyAccountAvatar();
}
accountNameInput.addEventListener("input", () => {
  applyAccountName(accountNameInput.value);
  clearTimeout(accountSaveTimeout);
  accountSaveTimeout = setTimeout(() => {
    try { localStorage.setItem(ACCOUNT_NAME_KEY, accountNameInput.value.trim()); } catch (_) {}
  }, 300);
});
accountNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") accountNameInput.blur();
});
initAccount();

function toggleAccountMenu(open){
  const next = open !== undefined ? open : !accountMenuWrap.classList.contains("open");
  accountMenuWrap.classList.toggle("open", next);
  accountTrigger.setAttribute("aria-expanded", String(next));
  if (next) setTimeout(() => accountNameInput.focus(), 60);
}
accountTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleAccountMenu();
});
document.addEventListener("click", (e) => {
  if (accountMenuWrap.classList.contains("open") && !e.target.closest("#account-menu-wrap")){
    toggleAccountMenu(false);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && accountMenuWrap.classList.contains("open")) toggleAccountMenu(false);
});

accountHelpBtn.addEventListener("click", () => {
  toggleAccountMenu(false);
  const discordLink = document.getElementById("discord-link");
  if (discordLink) window.open(discordLink.href, "_blank", "noopener");
});

accountResetBtn.addEventListener("click", () => {
  pendingConfirmAction = () => {
    currentAvatarId = AVATAR_PRESETS[0].id;
    try {
      localStorage.removeItem(ACCOUNT_NAME_KEY);
      localStorage.removeItem(ACCOUNT_AVATAR_KEY);
    } catch (_) {}
    accountNameInput.value = "";
    applyAccountName("");
    applyAccountAvatar();
  };
  document.getElementById("confirm-title").textContent = "Réinitialiser le profil";
  confirmBody.textContent = "Votre nom et votre photo de profil reviendront à leurs valeurs par défaut.";
  confirmDeleteBtn.textContent = "Réinitialiser";
  toggleAccountMenu(false);
  openModal(confirmModal);
});

/* =========================================================
   Search bar — clear button + "coming soon" voice search
   ========================================================= */
searchClearBtn.addEventListener("click", () => {
  convSearchInput.value = "";
  searchTerm = "";
  searchWrapEl.classList.remove("has-text");
  renderSidebar();
  convSearchInput.focus();
});
let micTooltipTimeout;
searchMicBtn.addEventListener("click", () => {
  micTooltip.classList.add("show");
  clearTimeout(micTooltipTimeout);
  micTooltipTimeout = setTimeout(() => micTooltip.classList.remove("show"), 2200);
});

/* =========================================================
   Chat scroll containment
   ------------------------------------------------------------
   Everything scrolls inside #chat-scroll only. The rest of the
   shell (sidebar, topbar, composer) never moves. We only auto-
   follow new content when the user is already near the bottom,
   so replying never yanks the page or interrupts someone who
   scrolled up to reread something.
   ========================================================= */
let stickToBottom = true;
chatScrollEl.addEventListener("scroll", () => {
  const distanceFromBottom = chatScrollEl.scrollHeight - chatScrollEl.scrollTop - chatScrollEl.clientHeight;
  stickToBottom = distanceFromBottom < 120;
}, { passive: true });

function scrollToBottom(smooth){
  if (!stickToBottom) return;
  chatScrollEl.scrollTo({ top: chatScrollEl.scrollHeight, behavior: smooth ? "smooth" : "auto" });
}

/* =========================================================
   State: conversations, persisted to localStorage
   ========================================================= */
const STORAGE_KEYS = {
  conversations: "delamain.conversations",
  currentId:     "delamain.currentId"
};
const FREE_CONVERSATION_LIMIT = 5;

let conversations = [];
let currentId = null;
let openMenuId = null;
let pendingConfirmAction = null;
let searchTerm = "";

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.conversations);
    conversations = raw ? JSON.parse(raw) : [];
  } catch (_) {
    conversations = [];
  }
  currentId = localStorage.getItem(STORAGE_KEYS.currentId) || null;
  if (!conversations.some(c => c.id === currentId)){
    currentId = conversations.length ? conversations[0].id : null;
  }
}

function saveState(){
  try {
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
    if (currentId) localStorage.setItem(STORAGE_KEYS.currentId, currentId);
  } catch (_) { /* storage unavailable — conversation still works this session */ }
}

function getCurrentConv(){
  return conversations.find(c => c.id === currentId) || null;
}

function truncateTitle(text){
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 42 ? clean.slice(0, 42).trimEnd() + "…" : clean;
}

function isAtFreeLimit(){
  return conversations.length >= FREE_CONVERSATION_LIMIT;
}

/* ---------- Conversation CRUD ---------- */
function createConversation({ focus = true } = {}){
  const existing = getCurrentConv();
  if (existing && existing.messages.length === 0){
    if (focus) inputEl.focus();
    return existing;
  }
  if (isAtFreeLimit()){
    openUpgradeModal("Vous avez atteint la limite de 5 conversations gratuites. Passez à Delamain Plus pour un historique illimité.");
    return null;
  }
  const conv = { id: uid(), title: "Nouvelle conversation", createdAt: Date.now(), messages: [] };
  conversations.unshift(conv);
  currentId = conv.id;
  saveState();
  renderSidebar();
  renderConversation();
  playLogoSting();
  if (focus) inputEl.focus();
  closeSidebarOnMobile();
  return conv;
}

function switchConversation(id){
  if (id === currentId) { closeSidebarOnMobile(); return; }
  currentId = id;
  saveState();
  renderSidebar();
  renderConversation();
  closeSidebarOnMobile();
}

function deleteConversation(id){
  const idx = conversations.findIndex(c => c.id === id);
  if (idx === -1) return;
  conversations.splice(idx, 1);
  if (currentId === id){
    currentId = conversations.length ? conversations[0].id : null;
  }
  saveState();
  renderSidebar();
  renderConversation();
}

function renameConversation(id, title){
  const conv = conversations.find(c => c.id === id);
  if (!conv) return;
  const clean = title.trim();
  conv.title = clean || "Sans titre";
  saveState();
  renderSidebar();
  if (id === currentId) updateTopbarTitle();
}

/* ---------- Sidebar rendering ---------- */
function closeAllMenus(){
  openMenuId = null;
  convListEl.querySelectorAll(".conv-item.menu-open").forEach(el => el.classList.remove("menu-open"));
}

function renderSidebar(){
  convListEl.innerHTML = "";

  const atLimit = isAtFreeLimit();
  newConvBtn.classList.toggle("at-limit", atLimit);
  convLimitNote.classList.toggle("show", atLimit);

  const term = searchTerm.trim().toLowerCase();
  const visible = term
    ? conversations.filter(c => c.title.toLowerCase().includes(term))
    : conversations;

  if (conversations.length === 0){
    const empty = document.createElement("div");
    empty.className = "sidebar-empty";
    empty.textContent = "Aucune conversation pour l'instant. Lancez-en une nouvelle pour commencer.";
    convListEl.appendChild(empty);
    return;
  }
  if (visible.length === 0){
    const empty = document.createElement("div");
    empty.className = "sidebar-empty";
    empty.textContent = "Aucun résultat pour cette recherche.";
    convListEl.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  visible.forEach(conv => {
    const item = document.createElement("div");
    item.className = "conv-item" + (conv.id === currentId ? " current" : "");
    item.dataset.id = conv.id;

    const titleBtn = document.createElement("button");
    titleBtn.className = "conv-title";
    titleBtn.textContent = conv.title;
    titleBtn.addEventListener("click", () => switchConversation(conv.id));

    const menuBtn = document.createElement("button");
    menuBtn.className = "conv-menu-btn";
    menuBtn.setAttribute("aria-label", "Options de la conversation");
    menuBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>`;
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = openMenuId === conv.id;
      closeAllMenus();
      if (!isOpen){
        openMenuId = conv.id;
        item.classList.add("menu-open");
      }
    });

    const popover = document.createElement("div");
    popover.className = "conv-popover";

    const renameBtn = document.createElement("button");
    renameBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Renommer`;
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllMenus();
      startRename(item, conv);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>Supprimer`;
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllMenus();
      pendingConfirmAction = () => deleteConversation(conv.id);
      document.getElementById("confirm-title").textContent = "Supprimer la conversation";
      confirmDeleteBtn.textContent = "Supprimer";
      confirmBody.textContent = `« ${conv.title} » sera définitivement supprimée avec tout son historique.`;
      openModal(confirmModal);
    });

    popover.appendChild(renameBtn);
    popover.appendChild(deleteBtn);

    item.appendChild(titleBtn);
    item.appendChild(menuBtn);
    item.appendChild(popover);
    frag.appendChild(item);
  });
  convListEl.appendChild(frag);
}

function startRename(itemEl, conv){
  const titleBtn = itemEl.querySelector(".conv-title");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "conv-title-input";
  input.value = conv.title;
  input.maxLength = 60;
  itemEl.replaceChild(input, titleBtn);
  input.focus();
  input.select();

  let settled = false;
  function commit(){
    if (settled) return;
    settled = true;
    renameConversation(conv.id, input.value);
  }
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){ e.preventDefault(); input.blur(); }
    if (e.key === "Escape"){ settled = true; renderSidebar(); }
  });
}

document.addEventListener("click", (e) => {
  if (openMenuId && !e.target.closest(".conv-popover") && !e.target.closest(".conv-menu-btn")){
    closeAllMenus();
  }
});

convSearchInput.addEventListener("input", () => {
  searchTerm = convSearchInput.value;
  searchWrapEl.classList.toggle("has-text", searchTerm.length > 0);
  renderSidebar();
});

/* ---------- Sidebar open/collapse ---------- */
sidebarCollapseBtn.addEventListener("click", () => {
  const collapsed = appEl.classList.toggle("sidebar-collapsed");
  sidebarCollapseBtn.classList.toggle("rotated", collapsed);
});
sidebarOpenBtn.addEventListener("click", () => {
  if (window.matchMedia("(max-width:860px)").matches){
    appEl.classList.add("sidebar-open");
  } else {
    appEl.classList.remove("sidebar-collapsed");
  }
});
sidebarScrimEl.addEventListener("click", () => appEl.classList.remove("sidebar-open"));
function closeSidebarOnMobile(){
  if (window.matchMedia("(max-width:860px)").matches){
    appEl.classList.remove("sidebar-open");
  }
}

newConvBtn.addEventListener("click", () => createConversation());

/* =========================================================
   Message rendering
   ========================================================= */
function updateTopbarTitle(){
  const conv = getCurrentConv();
  const nextTitle = conv ? conv.title : "Nouvelle conversation";
  if (topbarTitleEl.textContent === nextTitle) return;
  topbarTitleEl.style.opacity = "0";
  setTimeout(() => {
    topbarTitleEl.textContent = nextTitle;
    topbarTitleEl.style.opacity = "1";
  }, 160);
}

function addUserMessage(text){
  const msg = document.createElement("div");
  msg.className = "msg user";
  msg.innerHTML = `<div class="msg-col"><span class="msg-label">VOUS</span><div class="msg-bubble"></div></div>`;
  msg.querySelector(".msg-bubble").textContent = text;
  threadEl.appendChild(msg);
  scrollToBottom(true);
}

function buildAiAvatar(){
  return avatarTemplate.content.firstElementChild.cloneNode(true);
}

function addAiMessage(text, index){
  const msg = document.createElement("div");
  msg.className = "msg ai";
  msg.dataset.msgIndex = index;
  const avatarWrap = document.createElement("div");
  avatarWrap.className = "msg-avatar";
  avatarWrap.appendChild(buildAiAvatar());
  msg.innerHTML = `<div class="msg-col"><span class="msg-label">DELAMAIN</span><div class="msg-bubble"></div></div>`;
  msg.prepend(avatarWrap);
  msg.querySelector(".msg-bubble").textContent = text;
  msg.querySelector(".msg-col").appendChild(buildMessageActionsEl(index));
  threadEl.appendChild(msg);
  scrollToBottom(false);
}

/* ---------- Message actions: feedback, retry, copy ---------- */
function buildMessageActionsEl(index){
  const wrap = document.createElement("div");
  wrap.className = "msg-actions";

  const upBtn = document.createElement("button");
  upBtn.type = "button"; upBtn.className = "msg-action"; upBtn.dataset.action = "up";
  upBtn.setAttribute("aria-label", "Bonne réponse"); upBtn.title = "Bonne réponse";
  upBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v9H4v-9h3Zm0 0 4.5-7.5a1.7 1.7 0 0 1 3 1l-1 5.5h5.8a2 2 0 0 1 1.95 2.4l-1.35 6.5A2 2 0 0 1 18 20H8.5"/></svg>`;

  const downBtn = document.createElement("button");
  downBtn.type = "button"; downBtn.className = "msg-action"; downBtn.dataset.action = "down";
  downBtn.setAttribute("aria-label", "Mauvaise réponse"); downBtn.title = "Mauvaise réponse";
  downBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 13V4h3v9h-3Zm0 0-4.5 7.5a1.7 1.7 0 0 1-3-1l1-5.5H4.7a2 2 0 0 1-1.95-2.4l1.35-6.5A2 2 0 0 1 6 4h9.5"/></svg>`;

  const retryBtn = document.createElement("button");
  retryBtn.type = "button"; retryBtn.className = "msg-action"; retryBtn.dataset.action = "retry";
  retryBtn.setAttribute("aria-label", "Réessayer"); retryBtn.title = "Réessayer";
  retryBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.9-6.6"/><path d="M21 3v6h-6"/></svg>`;

  const copyBtn = document.createElement("button");
  copyBtn.type = "button"; copyBtn.className = "msg-action"; copyBtn.dataset.action = "copy";
  copyBtn.setAttribute("aria-label", "Copier"); copyBtn.title = "Copier";
  const copyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/></svg>`;
  const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
  copyBtn.innerHTML = copyIcon;

  function refreshFeedbackUI(){
    const conv = getCurrentConv();
    const entry = conv && conv.messages[index];
    const fb = entry ? entry.feedback : null;
    upBtn.classList.toggle("active", fb === "up");
    downBtn.classList.toggle("active", fb === "down");
  }
  refreshFeedbackUI();

  function setFeedback(value){
    const conv = getCurrentConv();
    if (!conv || !conv.messages[index]) return;
    const entry = conv.messages[index];
    entry.feedback = entry.feedback === value ? null : value;
    saveState();
    refreshFeedbackUI();
  }
  upBtn.addEventListener("click", () => setFeedback("up"));
  downBtn.addEventListener("click", () => setFeedback("down"));

  copyBtn.addEventListener("click", async () => {
    const conv = getCurrentConv();
    const entry = conv && conv.messages[index];
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(entry.content);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = entry.content;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (_) { /* clipboard unavailable */ }
      ta.remove();
    }
    copyBtn.classList.add("copied");
    copyBtn.innerHTML = checkIcon;
    setTimeout(() => { copyBtn.innerHTML = copyIcon; copyBtn.classList.remove("copied"); }, 1300);
  });

  retryBtn.addEventListener("click", () => retryMessage(index, retryBtn));

  wrap.appendChild(upBtn);
  wrap.appendChild(downBtn);
  wrap.appendChild(retryBtn);
  wrap.appendChild(copyBtn);
  return wrap;
}

async function retryMessage(index, retryBtn){
  const conv = getCurrentConv();
  if (!conv) return;
  const userIndex = index - 1;
  if (userIndex < 0 || !conv.messages[userIndex] || conv.messages[userIndex].role !== "user") return;

  const msgEl = threadEl.querySelector(`.msg.ai[data-msg-index="${index}"]`);
  if (!msgEl) return;

  retryBtn.classList.add("retrying");
  retryBtn.disabled = true;

  const userText = conv.messages[userIndex].content;
  const historyBefore = toHistory(conv.messages.slice(0, userIndex));
  const { text: reply, error: replyFailed } = await getDelamainReply(userText, historyBefore);

  conv.messages[index] = { role: "assistant", content: reply, feedback: null, error: replyFailed };
  saveState();

  const bubbleEl = msgEl.querySelector(".msg-bubble");
  const avatarEl = msgEl.querySelector(".msg-avatar");
  const oldActions = msgEl.querySelector(".msg-actions");
  if (oldActions) oldActions.remove();
  bubbleEl.innerHTML = `<span class="typed"></span><span class="cursor"></span>`;
  const typedEl = bubbleEl.querySelector(".typed");
  stickToBottom = true;

  typeOut(typedEl, reply, avatarEl, () => {
    const newActions = buildMessageActionsEl(index);
    newActions.classList.add("enter");
    msgEl.querySelector(".msg-col").appendChild(newActions);
  });
}

function addTypingIndicator(){
  const msg = document.createElement("div");
  msg.className = "msg ai";
  const avatarWrap = document.createElement("div");
  avatarWrap.className = "msg-avatar";
  avatarWrap.appendChild(buildAiAvatar());
  const col = document.createElement("div");
  col.className = "msg-col";
  col.appendChild(typingTemplate.content.firstElementChild.cloneNode(true));
  msg.appendChild(avatarWrap);
  msg.appendChild(col);
  threadEl.appendChild(msg);
  scrollToBottom(true);
  return msg;
}

function addAiMessagePlaceholder(index){
  const msg = document.createElement("div");
  msg.className = "msg ai";
  msg.dataset.msgIndex = index;
  const avatarWrap = document.createElement("div");
  avatarWrap.className = "msg-avatar";
  avatarWrap.appendChild(buildAiAvatar());
  msg.innerHTML = `<div class="msg-col"><span class="msg-label">DELAMAIN</span><div class="msg-bubble"><span class="typed"></span><span class="cursor"></span></div></div>`;
  msg.prepend(avatarWrap);
  threadEl.appendChild(msg);
  scrollToBottom(false);
  return { typedEl: msg.querySelector(".typed"), avatarEl: avatarWrap, msgColEl: msg.querySelector(".msg-col") };
}

/* Render the full stored history of the active conversation instantly
   (no typewriter — that's reserved for freshly-arrived replies). */
function renderConversation(){
  threadEl.innerHTML = "";
  const conv = getCurrentConv();
  const hasMessages = !!(conv && conv.messages.length);

  appEl.classList.toggle("chat-active", hasMessages);
  updateTopbarTitle();

  if (!conv) return;
  conv.messages.forEach((m, i) => {
    if (m.role === "user") addUserMessage(m.content);
    else addAiMessage(m.content, i);
  });
  stickToBottom = true;
  chatScrollEl.scrollTop = chatScrollEl.scrollHeight;
}

/* ---------- Typewriter — rAF-driven, batches characters per frame
   for smoothness instead of one setTimeout per character. Also
   toggles a "speaking" pulse on the avatar for the duration. ---------- */
function typeOut(targetEl, fullText, avatarEl, onDone){
  const CHARS_PER_SECOND = 55;
  let start = null;
  let shown = 0;

  if (avatarEl) avatarEl.classList.add("speaking");

  function frame(ts){
    if (start === null) start = ts;
    const elapsed = (ts - start) / 1000;
    const targetChars = Math.min(fullText.length, Math.floor(elapsed * CHARS_PER_SECOND));
    if (targetChars > shown){
      shown = targetChars;
      targetEl.textContent = fullText.slice(0, shown);
      scrollToBottom(false);
    }
    if (shown < fullText.length){
      requestAnimationFrame(frame);
    } else {
      const cursorEl = targetEl.parentElement.querySelector(".cursor");
      if (cursorEl) cursorEl.remove();
      if (avatarEl) avatarEl.classList.remove("speaking");
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- Response engine (Connected to /api/chat) ----------
   Renvoie { text, error }. Les réponses d'erreur sont marquées (error: true)
   et JAMAIS renvoyées au serveur comme historique : sinon elles polluent
   les tours suivants. */
const LEGACY_ERROR_TEXTS = [
  "Connexion au sous-réseau instable. Mes capteurs indiquent une perturbation temporaire du signal.",
  "Le noyau met trop de temps à répondre. Réessayez dans un instant."
];

function toHistory(messages){
  return messages
    .filter(m => m && !m.error && !LEGACY_ERROR_TEXTS.includes(m.content))
    .map(m => ({ role: m.role, content: m.content }));
}

async function getDelamainReply(userText, history){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, history, model: currentModel }),
      signal: controller.signal
    });

    let data = null;
    try { data = await response.json(); } catch (_) { /* réponse non-JSON (page d'erreur) */ }

    if (!response.ok) {
      console.error("Erreur API /api/chat :", response.status, data);
      if (response.status === 404){
        return { error: true, text: "Le service de discussion est introuvable : la route /api/chat n'est pas déployée." };
      }
      const detail = data && typeof data.error === "string" ? data.error : null;
      return { error: true, text: detail || `Le noyau Delamain a renvoyé une erreur (code ${response.status}). Consultez les journaux du serveur.` };
    }

    return { error: false, text: (data && (data.reply || data.message)) || "Requête traitée, mais aucun détail renvoyé par le serveur." };
  } catch (error) {
    console.error("Erreur API:", error);
    if (error.name === "AbortError"){
      return { error: true, text: "Le noyau met trop de temps à répondre. Réessayez dans un instant." };
    }
    // Vraie coupure réseau (fetch impossible)
    return { error: true, text: "Connexion au sous-réseau instable. Mes capteurs indiquent une perturbation temporaire du signal." };
  } finally {
    clearTimeout(timeout);
  }
}

/* ---------- Send flow ---------- */
async function sendMessage(text){
  const clean = text.trim();
  if (!clean) return;

  const conv = getCurrentConv() || createConversation({ focus: false });
  if (!conv) return; // blocked by the free-tier limit, upgrade modal already shown

  const historyBeforeThisTurn = toHistory(conv.messages);
  const isFirstMessage = conv.messages.length === 0;

  conv.messages.push({ role: "user", content: clean });
  if (isFirstMessage) conv.title = truncateTitle(clean);
  saveState();
  renderSidebar();

  appEl.classList.add("chat-active");
  updateTopbarTitle();
  stickToBottom = true;
  addUserMessage(clean);
  inputEl.value = "";
  placeholderEl.style.opacity = "1";
  sendBtn.classList.remove("ready");
  sendBtn.disabled = true;

  const typingMsgEl = addTypingIndicator();
  const { text: reply, error: replyFailed } = await getDelamainReply(clean, historyBeforeThisTurn);
  conv.messages.push({ role: "assistant", content: reply, feedback: null, error: replyFailed });
  saveState();
  const aiIndex = conv.messages.length - 1;

  typingMsgEl.remove();
  const { typedEl, avatarEl, msgColEl } = addAiMessagePlaceholder(aiIndex);
  typeOut(typedEl, reply, avatarEl, () => {
    sendBtn.disabled = false;
    const actions = buildMessageActionsEl(aiIndex);
    actions.classList.add("enter");
    msgColEl.appendChild(actions);
  });
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(inputEl.value);
});

chipsEl.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  sendMessage(chip.dataset.prompt);
});

/* =========================================================
   Modals — shared open/close helpers
   ========================================================= */
function openModal(modalEl){
  modalEl.classList.add("open");
  document.addEventListener("keydown", escCloses);
}
function closeModal(modalEl){
  modalEl.classList.remove("open");
  document.removeEventListener("keydown", escCloses);
  if (modalEl.id === "upgrade-modal") clearInterval(plusAutoTimer);
}
function escCloses(e){
  if (e.key === "Escape"){
    document.querySelectorAll(".modal-scrim.open").forEach(closeModal);
  }
}
document.querySelectorAll(".modal-scrim").forEach(scrim => {
  scrim.addEventListener("click", (e) => { if (e.target === scrim) closeModal(scrim); });
  scrim.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(scrim));
  });
});

/* ---------- Plus feature carousel — auto-advance + manual nav ---------- */
const plusCarouselEl = document.getElementById("plus-carousel");
const plusTrackEl    = document.getElementById("plus-carousel-track");
const plusPrevBtn    = document.getElementById("plus-carousel-prev");
const plusNextBtn    = document.getElementById("plus-carousel-next");
const plusDotsEl     = document.getElementById("plus-carousel-dots");
const plusSlideCount = plusTrackEl.children.length;
let plusSlideIndex = 0;
let plusAutoTimer;

function buildPlusDots(){
  plusDotsEl.innerHTML = "";
  for (let i = 0; i < plusSlideCount; i++){
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "plus-carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Diapositive ${i + 1}`);
    dot.addEventListener("click", () => goToPlusSlide(i, true));
    plusDotsEl.appendChild(dot);
  }
}
buildPlusDots();

function goToPlusSlide(index, manual){
  plusSlideIndex = (index + plusSlideCount) % plusSlideCount;
  plusTrackEl.style.transform = `translateX(-${plusSlideIndex * 100}%)`;
  plusDotsEl.querySelectorAll(".plus-carousel-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === plusSlideIndex);
  });
  if (manual) restartPlusAuto();
}
function restartPlusAuto(){
  clearInterval(plusAutoTimer);
  plusAutoTimer = setInterval(() => goToPlusSlide(plusSlideIndex + 1), 3800);
}
plusPrevBtn.addEventListener("click", () => goToPlusSlide(plusSlideIndex - 1, true));
plusNextBtn.addEventListener("click", () => goToPlusSlide(plusSlideIndex + 1, true));
plusCarouselEl.addEventListener("mouseenter", () => clearInterval(plusAutoTimer));
plusCarouselEl.addEventListener("mouseleave", restartPlusAuto);

/* ---------- Upgrade / Delamain Plus ---------- */
function openUpgradeModal(contextMessage){
  upgradeContextMsg.textContent = contextMessage || DEFAULT_UPGRADE_MSG;
  unlockCodeInput.value = "";
  unlockStatus.textContent = "";
  goToPlusSlide(0);
  restartPlusAuto();
  openModal(upgradeModal);
  setTimeout(() => unlockCodeInput.focus(), 50);
}
upgradeBtn.addEventListener("click", () => openUpgradeModal());
limitUpgradeLink.addEventListener("click", (e) => {
  e.preventDefault();
  openUpgradeModal();
});
unlockSubmitBtn.addEventListener("click", () => {
  const code = unlockCodeInput.value.trim();
  if (!code){
    unlockStatus.textContent = "Entrez un code pour continuer.";
    return;
  }
  unlockStatus.textContent = "Delamain Plus n'est pas encore ouvert au public : votre code a été enregistré et sera vérifié dès son lancement.";
});
unlockCodeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter"){ e.preventDefault(); unlockSubmitBtn.click(); }
});

/* ---------- Terms ---------- */
termsLink.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(termsModal);
});

/* ---------- Generic confirm modal (delete conversation, reset data…) ---------- */
confirmDeleteBtn.addEventListener("click", () => {
  if (pendingConfirmAction){
    pendingConfirmAction();
    pendingConfirmAction = null;
  }
  closeModal(confirmModal);
});

/* =========================================================
   Init
   ========================================================= */
loadState();
renderSidebar();
renderConversation();
