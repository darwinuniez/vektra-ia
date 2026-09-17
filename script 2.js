/* =========================================================
   DELAMAIN IA — front-end logic (Connected to /api/chat)
   ========================================================= */

/* =========================================================
   Intro splash
   ========================================================= */
const introSplash   = document.getElementById("intro-splash");
const introEnterBtn = document.getElementById("intro-enter-btn");
const reducedMotion  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let introDismissed = false;
function dismissIntro(){
  if (introDismissed) return;
  introDismissed = true;
  introSplash.classList.add("hidden");
  setTimeout(() => { introSplash.style.display = "none"; }, 950);
}

if (reducedMotion){
  dismissIntro();
  introSplash.style.display = "none";
} else {
  // auto-dismiss once the reveal sequence has played out
  setTimeout(dismissIntro, 4200);
  introEnterBtn.addEventListener("click", dismissIntro);
  introSplash.addEventListener("click", (e) => {
    if (e.target === introSplash) dismissIntro();
  });
  document.addEventListener("keydown", (e) => {
    if (!introDismissed && (e.key === "Enter" || e.key === "Escape")) dismissIntro();
  }, { once: false });
}

/* =========================================================
   Elements
   ========================================================= */
const appEl        = document.getElementById("app");
const threadEl      = document.getElementById("thread");
const formEl        = document.getElementById("composer-form");
const inputEl       = document.getElementById("composer-input");
const placeholderEl = document.getElementById("composer-placeholder");
const sendBtn       = formEl.querySelector(".send-btn");
const chipsEl       = document.getElementById("chips");
const topbarTitleEl = document.getElementById("topbar-title");
const avatarTemplate = document.getElementById("ai-avatar-template");

const sidebarEl          = document.getElementById("sidebar");
const sidebarScrimEl     = document.getElementById("sidebar-scrim");
const sidebarCollapseBtn = document.getElementById("sidebar-collapse-btn");
const sidebarOpenBtn     = document.getElementById("sidebar-open-btn");
const convListEl         = document.getElementById("conv-list");
const newConvBtn         = document.getElementById("new-conv-btn");
const convLimitNote      = document.getElementById("conv-limit-note");
const convSearchInput    = document.getElementById("conv-search");
const limitUpgradeLink   = document.getElementById("limit-upgrade-link");

const upgradeBtn      = document.getElementById("upgrade-btn");
const upgradeModal     = document.getElementById("upgrade-modal");
const upgradeContextMsg = document.getElementById("upgrade-context-msg");
const unlockCodeInput  = document.getElementById("unlock-code-input");
const unlockSubmitBtn  = document.getElementById("unlock-submit-btn");
const unlockStatus     = document.getElementById("unlock-status");

const termsLink  = document.getElementById("terms-link");
const termsModal = document.getElementById("terms-modal");

const confirmModal     = document.getElementById("confirm-modal");
const confirmBody      = document.getElementById("confirm-body");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

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
});

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
    convListEl.appendChild(item);
  });
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
  renderSidebar();
});

/* ---------- Sidebar open/collapse ---------- */
sidebarCollapseBtn.addEventListener("click", () => {
  appEl.classList.toggle("sidebar-collapsed");
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
  topbarTitleEl.textContent = conv ? conv.title : "Nouvelle conversation";
}

function addUserMessage(text){
  const msg = document.createElement("div");
  msg.className = "msg user";
  msg.innerHTML = `<div class="msg-col"><span class="msg-label">VOUS</span><div class="msg-bubble"></div></div>`;
  msg.querySelector(".msg-bubble").textContent = text;
  threadEl.appendChild(msg);
  scrollToBottom();
}

function buildAiAvatar(){
  return avatarTemplate.content.firstElementChild.cloneNode(true);
}

function addAiMessage(text){
  const msg = document.createElement("div");
  msg.className = "msg ai";
  const avatarWrap = document.createElement("div");
  avatarWrap.className = "msg-avatar";
  avatarWrap.appendChild(buildAiAvatar());
  msg.innerHTML = `<div class="msg-col"><span class="msg-label">DELAMAIN</span><div class="msg-bubble"></div></div>`;
  msg.prepend(avatarWrap);
  msg.querySelector(".msg-bubble").textContent = text;
  threadEl.appendChild(msg);
  scrollToBottom();
}

function addAiMessagePlaceholder(){
  const msg = document.createElement("div");
  msg.className = "msg ai";
  const avatarWrap = document.createElement("div");
  avatarWrap.className = "msg-avatar";
  avatarWrap.appendChild(buildAiAvatar());
  msg.innerHTML = `<div class="msg-col"><span class="msg-label">DELAMAIN</span><div class="msg-bubble"><span class="typed"></span><span class="cursor"></span></div></div>`;
  msg.prepend(avatarWrap);
  threadEl.appendChild(msg);
  scrollToBottom();
  return msg.querySelector(".typed");
}

function scrollToBottom(){
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
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
  conv.messages.forEach(m => {
    if (m.role === "user") addUserMessage(m.content);
    else addAiMessage(m.content);
  });
}

/* ---------- Typewriter ---------- */
function typeOut(targetEl, fullText, onDone){
  let idx = 0;
  function step(){
    if (idx < fullText.length){
      targetEl.textContent += fullText[idx];
      idx++;
      scrollToBottom();
      const delay = 10 + Math.random() * 16;
      setTimeout(step, delay);
    } else {
      const cursorEl = targetEl.parentElement.querySelector(".cursor");
      if (cursorEl) cursorEl.remove();
      if (onDone) onDone();
    }
  }
  step();
}

/* ---------- Response engine (Connected to /api/chat) ---------- */
async function getDelamainReply(userText, history){
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, history })
    });

    if (!response.ok) {
      throw new Error("Erreur de communication avec le noyau Delamain.");
    }

    const data = await response.json();
    return data.reply || data.message || "Requête traitée, mais aucun détail renvoyé par le serveur.";
  } catch (error) {
    console.error("Erreur API:", error);
    return "Connexion au sous-réseau instable. Mes capteurs indiquent une perturbation temporaire du signal.";
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
  addUserMessage(clean);
  inputEl.value = "";
  placeholderEl.style.opacity = "1";
  sendBtn.disabled = true;

  const reply = await getDelamainReply(clean, historyBeforeThisTurn);
  conv.messages.push({ role: "assistant", content: reply });
  saveState();

  const target = addAiMessagePlaceholder();

  setTimeout(() => {
    typeOut(target, reply, () => { sendBtn.disabled = false; });
  }, 350);
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
