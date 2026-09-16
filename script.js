/* =========================================================
   DELAMAIN — front-end logic (Connected to /api/chat)
   ========================================================= */

/* ---------- Boot sequence ---------- */
const BOOT_LINES = [
  "initialisation du noyau…",
  "chargement des schémas urbains — Night City",
  "calibration vocale… ok",
  "connexion établie"
];

function runBoot(){
  const bootEl = document.getElementById("boot");
  const logEl  = document.getElementById("boot-log");
  let i = 0;

  function nextLine(){
    if (i >= BOOT_LINES.length){
      setTimeout(() => bootEl.classList.add("hidden"), 350);
      return;
    }
    const isLast = i === BOOT_LINES.length - 1;
    logEl.innerHTML = isLast
      ? `<span class="ok">${BOOT_LINES[i]}</span>`
      : BOOT_LINES[i];
    i++;
    setTimeout(nextLine, isLast ? 550 : 420);
  }
  setTimeout(nextLine, 400);
}
runBoot();

/* ---------- Ambient cursor glow (desktop only) ---------- */
const glow = document.getElementById("cursor-glow");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches){
  window.addEventListener("pointermove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    glow.classList.add("active");
  });
  window.addEventListener("pointerleave", () => glow.classList.remove("active"));
}

/* ---------- Elements ---------- */
const appEl        = document.getElementById("app");
const threadEl      = document.getElementById("thread");
const formEl        = document.getElementById("composer-form");
const inputEl       = document.getElementById("composer-input");
const sendBtn       = formEl.querySelector(".send-btn");
const faceEl        = document.getElementById("portrait-face");
const chipsEl       = document.getElementById("chips");
const topbarTitleEl = document.getElementById("topbar-title");

const sidebarEl          = document.getElementById("sidebar");
const sidebarScrimEl     = document.getElementById("sidebar-scrim");
const sidebarCollapseBtn = document.getElementById("sidebar-collapse-btn");
const sidebarOpenBtn     = document.getElementById("sidebar-open-btn");
const convListEl         = document.getElementById("conv-list");
const newConvBtn         = document.getElementById("new-conv-btn");

const changelogBtn   = document.getElementById("changelog-btn");
const changelogModal = document.getElementById("changelog-modal");
const changelogBody  = document.getElementById("changelog-body");

const profileBtn        = document.getElementById("profile-btn");
const profileModal      = document.getElementById("profile-modal");
const profileNameInput  = document.getElementById("profile-name-input");
const profileSaveBtn    = document.getElementById("profile-save-btn");
const profileNameDisplay= document.getElementById("profile-name-display");
const profileAvatarMini = document.getElementById("profile-avatar-mini");
const profileAvatarLg   = document.getElementById("profile-avatar-lg");

const confirmModal     = document.getElementById("confirm-modal");
const confirmBody      = document.getElementById("confirm-body");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

/* ---------- Sprite mouth control ----------
   .talking triggers a discrete two-step sprite animation
   (closed -> mid -> open, then reversed) with no interpolation
   between frames — see style.css for the frame math. */
function setTalking(isTalking){
  faceEl.classList.toggle("talking", isTalking);
}

/* =========================================================
   State: conversations, persisted to localStorage
   ========================================================= */
const STORAGE_KEYS = {
  conversations: "delamain.conversations",
  currentId:     "delamain.currentId",
  profileName:   "delamain.profileName"
};

let conversations = [];
let currentId = null;
let openMenuId = null;
let pendingDeleteId = null;

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

/* ---------- Conversation CRUD ---------- */
function createConversation({ focus = true } = {}){
  const existing = getCurrentConv();
  if (existing && existing.messages.length === 0){
    if (focus) inputEl.focus();
    return existing;
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

  if (conversations.length === 0){
    const empty = document.createElement("div");
    empty.className = "sidebar-empty";
    empty.textContent = "Aucune conversation pour l'instant. Lancez-en une nouvelle pour commencer.";
    convListEl.appendChild(empty);
    return;
  }

  conversations.forEach(conv => {
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

/* ---------- Sidebar open/collapse ---------- */
sidebarCollapseBtn.addEventListener("click", () => {
  appEl.classList.toggle("sidebar-collapsed");
});
sidebarOpenBtn.addEventListener("click", () => {
  appEl.classList.add("sidebar-open");
  appEl.classList.remove("sidebar-collapsed");
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
  msg.innerHTML = `<span class="msg-label">VOUS</span><div class="msg-bubble"></div>`;
  msg.querySelector(".msg-bubble").textContent = text;
  threadEl.appendChild(msg);
  scrollToBottom();
}

function addAiMessage(text){
  const msg = document.createElement("div");
  msg.className = "msg ai";
  msg.innerHTML = `<span class="msg-label">DELAMAIN</span><div class="msg-bubble"></div>`;
  msg.querySelector(".msg-bubble").textContent = text;
  threadEl.appendChild(msg);
  scrollToBottom();
}

function addAiMessagePlaceholder(){
  const msg = document.createElement("div");
  msg.className = "msg ai";
  msg.innerHTML = `<span class="msg-label">DELAMAIN</span><div class="msg-bubble"><span class="typed"></span><span class="cursor"></span></div>`;
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

/* ---------- Typewriter, synced with mouth animation ---------- */
function typeOut(targetEl, fullText, onDone){
  let idx = 0;
  setTalking(true);

  function step(){
    if (idx < fullText.length){
      targetEl.textContent += fullText[idx];
      idx++;
      scrollToBottom();
      const delay = 14 + Math.random() * 22;
      setTimeout(step, delay);
    } else {
      setTalking(false);
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
  sendBtn.disabled = true;

  const reply = await getDelamainReply(clean, historyBeforeThisTurn);
  conv.messages.push({ role: "assistant", content: reply });
  saveState();

  const target = addAiMessagePlaceholder();

  setTimeout(() => {
    typeOut(target, reply, () => { sendBtn.disabled = false; });
  }, 400);
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

/* ---------- Changelog ---------- */
const CHANGELOG = [
  {
    version: "v1.4",
    date: "12 sept. 2026",
    title: "Historique des conversations",
    desc: "Delamain garde désormais chaque discussion en mémoire locale : reprenez un fil, renommez-le ou supprimez-le à tout moment depuis la barre latérale."
  },
  {
    version: "v1.3",
    date: "28 août 2026",
    title: "Calibration du portrait",
    desc: "Refonte complète de l'animation faciale : le calage image par image est désormais parfaitement synchronisé avec la synthèse vocale simulée."
  },
  {
    version: "v1.2",
    date: "14 août 2026",
    title: "Veille réseau étendue",
    desc: "Le noyau interroge désormais des sources externes en temps réel pour les questions sensibles au temps — trafic, activité des gangs, météo."
  },
  {
    version: "v1.1",
    date: "2 août 2026",
    title: "Lancement de l'instance locale",
    desc: "Premier déploiement public du noyau Delamain pour Ervin Digital Corp, avec conduite assistée et diagnostic véhicule embarqué."
  }
];

function renderChangelog(){
  changelogBody.innerHTML = "";
  CHANGELOG.forEach(entry => {
    const el = document.createElement("div");
    el.className = "changelog-entry";
    el.innerHTML = `
      <div class="changelog-version-row">
        <span class="changelog-version">${entry.version}</span>
        <span class="changelog-date">${entry.date}</span>
      </div>
      <p class="changelog-title">${entry.title}</p>
      <p class="changelog-desc">${entry.desc}</p>
    `;
    changelogBody.appendChild(el);
  });
}
renderChangelog();
changelogBtn.addEventListener("click", () => openModal(changelogModal));

/* ---------- Profile ---------- */
function loadProfileName(){
  return localStorage.getItem(STORAGE_KEYS.profileName) || "Invité";
}
function applyProfileName(name){
  const display = name.trim() || "Invité";
  profileNameDisplay.textContent = display;
  const initial = display.trim().charAt(0).toUpperCase() || "?";
  profileAvatarMini.textContent = initial;
  profileAvatarLg.textContent = initial;
}
profileBtn.addEventListener("click", () => {
  profileNameInput.value = loadProfileName();
  openModal(profileModal);
  setTimeout(() => profileNameInput.focus(), 50);
});
profileSaveBtn.addEventListener("click", () => {
  const name = profileNameInput.value.trim() || "Invité";
  try { localStorage.setItem(STORAGE_KEYS.profileName, name); } catch (_) {}
  applyProfileName(name);
  closeModal(profileModal);
});
profileNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter"){ e.preventDefault(); profileSaveBtn.click(); }
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
applyProfileName(loadProfileName());
renderSidebar();
renderConversation();
