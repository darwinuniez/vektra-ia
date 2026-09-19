/* =========================================================
   DELAMAIN IA — front-end logic (Connected to /api/chat)
   ========================================================= */

/* =========================================================
   Intro splash — short, skippable, respects reduced motion
   ========================================================= */
const introSplash   = document.getElementById("intro-splash");
const introEnterBtn = document.getElementById("intro-enter-btn");
const reducedMotion  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let introDismissed = false;
function dismissIntro(){
  if (introDismissed) return;
  introDismissed = true;
  introSplash.classList.add("hidden");
  setTimeout(() => { introSplash.style.display = "none"; }, 650);
}

if (reducedMotion){
  introSplash.style.display = "none";
  introDismissed = true;
} else {
  setTimeout(dismissIntro, 1750); // short & intense — auto-dismiss quickly
  introEnterBtn.addEventListener("click", dismissIntro);
  introSplash.addEventListener("click", (e) => {
    if (e.target === introSplash) dismissIntro();
  });
  document.addEventListener("keydown", (e) => {
    if (!introDismissed && (e.key === "Enter" || e.key === "Escape")) dismissIntro();
  });
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

const stylePickerEl = document.getElementById("version-picker");
const styleBtn       = document.getElementById("version-btn");
const stylePopover   = document.getElementById("version-popover");
const styleLabelEl   = document.getElementById("version-label");

const accountAvatarEl    = document.getElementById("account-avatar");
const accountNameInput   = document.getElementById("account-name-input");

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
   Visual version — purely cosmetic theme switcher
   (MAIN 1 / MAIN 1 PRO / MAIN 1 DARK)
   ========================================================= */
const VERSIONS = {
  main1: { label: "MAIN 1" },
  pro:   { label: "MAIN 1 PRO" },
  dark:  { label: "MAIN 1 DARK" }
};
const THEME_STORAGE_KEY = "delamain.theme";

function loadTheme(){
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return VERSIONS[saved] ? saved : "main1";
}
let currentTheme = loadTheme();

function applyTheme(){
  if (currentTheme === "main1") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", currentTheme);
  styleLabelEl.textContent = VERSIONS[currentTheme].label;
  stylePopover.querySelectorAll(".version-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === currentTheme);
  });
}
applyTheme();

function toggleStylePopover(open){
  const next = open !== undefined ? open : !stylePickerEl.classList.contains("open");
  stylePickerEl.classList.toggle("open", next);
  styleBtn.setAttribute("aria-expanded", String(next));
}
styleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleStylePopover();
});
stylePopover.querySelectorAll(".version-option").forEach(btn => {
  btn.addEventListener("click", () => {
    currentTheme = btn.dataset.theme;
    try { localStorage.setItem(THEME_STORAGE_KEY, currentTheme); } catch (_) {}
    applyTheme();
    toggleStylePopover(false);
  });
});
document.addEventListener("click", (e) => {
  if (stylePickerEl.classList.contains("open") && !e.target.closest("#version-picker")){
    toggleStylePopover(false);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && stylePickerEl.classList.contains("open")) toggleStylePopover(false);
});

/* =========================================================
   Account — editable display name, avatar is just its initial
   ========================================================= */
const ACCOUNT_NAME_KEY = "delamain.profileName";
function loadAccountName(){
  try { return localStorage.getItem(ACCOUNT_NAME_KEY) || ""; } catch (_) { return ""; }
}
function applyAccountAvatar(name){
  const trimmed = name.trim();
  accountAvatarEl.textContent = trimmed ? trimmed.charAt(0) : "?";
}
let accountSaveTimeout;
function initAccount(){
  const saved = loadAccountName();
  accountNameInput.value = saved;
  applyAccountAvatar(saved);
}
accountNameInput.addEventListener("input", () => {
  applyAccountAvatar(accountNameInput.value);
  clearTimeout(accountSaveTimeout);
  accountSaveTimeout = setTimeout(() => {
    try { localStorage.setItem(ACCOUNT_NAME_KEY, accountNameInput.value.trim()); } catch (_) {}
  }, 300);
});
accountNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") accountNameInput.blur();
});
initAccount();

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
let pendingDeleteId = null;
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
      pendingDeleteId = conv.id;
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
  const historyBefore = conv.messages.slice(0, userIndex).map(m => ({ role: m.role, content: m.content }));
  const reply = await getDelamainReply(userText, historyBefore);

  conv.messages[index] = { role: "assistant", content: reply, feedback: null };
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

/* ---------- Response engine (Connected to /api/chat) ---------- */
async function getDelamainReply(userText, history){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, history }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("Erreur de communication avec le noyau Delamain.");
    }

    const data = await response.json();
    return data.reply || data.message || "Requête traitée, mais aucun détail renvoyé par le serveur.";
  } catch (error) {
    console.error("Erreur API:", error);
    if (error.name === "AbortError"){
      return "Le noyau met trop de temps à répondre. Réessayez dans un instant.";
    }
    return "Connexion au sous-réseau instable. Mes capteurs indiquent une perturbation temporaire du signal.";
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

  const historyBeforeThisTurn = conv.messages.map(m => ({ role: m.role, content: m.content }));
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
  const reply = await getDelamainReply(clean, historyBeforeThisTurn);
  conv.messages.push({ role: "assistant", content: reply, feedback: null });
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

/* ---------- Upgrade / Delamain Plus ---------- */
function openUpgradeModal(contextMessage){
  upgradeContextMsg.textContent = contextMessage || DEFAULT_UPGRADE_MSG;
  unlockCodeInput.value = "";
  unlockStatus.textContent = "";
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

/* ---------- Delete confirmation ---------- */
confirmDeleteBtn.addEventListener("click", () => {
  if (pendingDeleteId){
    deleteConversation(pendingDeleteId);
    pendingDeleteId = null;
  }
  closeModal(confirmModal);
});

/* =========================================================
   Init
   ========================================================= */
loadState();
renderSidebar();
renderConversation();
