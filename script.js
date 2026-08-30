/* ============================================================
   STATE
   ============================================================ */
let currentUsername = null;   // display name, null = not logged in
let currentUserKey = null;    // lowercase storage key
let currentAvatar = "🏴‍☠️";
let activeConvId = null;
let convs = {};               // in-memory copy of the logged-in user's conversations
const MAX_CONVS = 5;

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ============================================================
   STORAGE HELPERS (localStorage — beta, per-browser only)
   ============================================================ */
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("Erreur de stockage local:", e);
    return false;
  }
}
function getUsers() { return lsGet("vektra_users", {}); }
function saveUsers(u) { lsSet("vektra_users", u); }

// SHA-256 via WebCrypto when available, with a functional fallback so
// registration/login never breaks even in restricted contexts.
async function hashPassword(pw) {
  const salted = pw + "::vektra-salt-2026";
  try {
    if (window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder().encode(salted);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) { /* fall through to fallback */ }
  let h = 0;
  for (let i = 0; i < salted.length; i++) { h = (h << 5) - h + salted.charCodeAt(i); h |= 0; }
  return "fallback_" + Math.abs(h).toString(16);
}

function renderAvatarInto(el, avatarValue) {
  if (!el) return;
  if (avatarValue === "EDC") {
    el.innerHTML = '<span class="mini-edc-badge">EDC</span>';
  } else {
    el.textContent = avatarValue || "🏴‍☠️";
  }
}

/* ============================================================
   0. BOOT SEQUENCE — cinematic intro
   ============================================================ */
(function bootSequence() {
  const bootSeq = document.getElementById("boot-sequence");
  const terminal = document.getElementById("boot-terminal");
  const linesEl = document.getElementById("boot-lines");
  const progressFill = document.getElementById("boot-progress-fill");
  const logoWrap = document.getElementById("boot-logo-wrap");
  const heroScene = document.getElementById("hero-scene");
  const wipe = document.getElementById("wipe-transition");
  const skipHint = document.getElementById("boot-skip");
  const flash = document.getElementById("boot-flash");
  const shockwave = document.getElementById("boot-shockwave");
  const app = document.getElementById("app");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const bootLines = [
    "> CONNEXION AU NOYAU VEKTRA...",
    "> DÉCHIFFREMENT DES CANAUX ERVIN CORP...",
    "> CALIBRAGE DU MODÈLE COGNITIF...",
    "> PROTOCOLES DE SÉCURITÉ : ACTIFS...",
    "> SYNCHRONISATION RÉSEAU ED-CORP...",
    "> ACCÈS AUTORISÉ."
  ];

  let finished = false;

  function revealApp() {
    app.classList.add("revealed");
    checkAuthAndShowGate();
  }

  function cleanupBoot() {
    bootSeq.remove();
    setTimeout(() => wipe.remove(), 750);
  }

  function runWipe() {
    wipe.classList.add("wipe-in");
    setTimeout(() => {
      bootSeq.style.display = "none";
      revealApp();
      wipe.classList.remove("wipe-in");
      wipe.classList.add("wipe-out");
      setTimeout(cleanupBoot, 750);
    }, 520);
  }

  function showHeroScene() {
    if (finished || !heroScene) { runWipe(); return; }
    logoWrap.classList.remove("show");
    heroScene.classList.add("show");
    setTimeout(runWipe, 2400);
  }

  function typeLines(index) {
    if (finished) return;
    if (index >= bootLines.length) {
      terminal.classList.add("fade-out");
      logoWrap.classList.add("show");
      if (flash) flash.classList.add("pulse");
      if (shockwave) shockwave.classList.add("burst");
      bootSeq.classList.add("shake");
      setTimeout(showHeroScene, 650);
      return;
    }
    const div = document.createElement("div");
    div.className = "boot-line";
    div.textContent = bootLines[index];
    linesEl.appendChild(div);
    progressFill.style.width = Math.round(((index + 1) / bootLines.length) * 100) + "%";
    setTimeout(() => typeLines(index + 1), prefersReducedMotion ? 20 : 190);
  }

  bootSeq.addEventListener("click", () => {
    if (finished) return;
    finished = true;
    bootSeq.style.display = "none";
    revealApp();
    wipe.remove();
  });

  if (prefersReducedMotion) {
    bootSeq.remove();
    wipe.remove();
    revealApp();
  } else {
    typeLines(0);
    setTimeout(() => { if (skipHint) skipHint.style.opacity = "0.6"; }, 800);
  }
})();

/* ============================================================
   1. ANIMATED BACKGROUND — particle network
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas || !canvas.getContext) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  const COUNT = window.innerWidth < 760 ? 20 : 46;
  let w, h, particles;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function seed() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      ctx.fillStyle = "rgba(41, 211, 255, 0.55)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(45, 255, 168, ${0.16 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    if (!reduced) requestAnimationFrame(step);
  }

  window.addEventListener("resize", () => { resize(); seed(); });
  resize();
  seed();
  step();
})();

/* ============================================================
   2. CURSOR GLOW (desktop, motion-safe only)
   ============================================================ */
(function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow) return;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return;

  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  let curX = targetX, curY = targetY;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.classList.add("active");
  });
  window.addEventListener("mouseleave", () => glow.classList.remove("active"));

  function raf() {
    curX += (targetX - curX) * 0.14;
    curY += (targetY - curY) * 0.14;
    glow.style.transform = `translate(${curX}px, ${curY}px)`;
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* ============================================================
   3. TOASTS
   ============================================================ */
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add("toast-out");
    setTimeout(() => el.remove(), 320);
  }, 2400);
}

/* ============================================================
   3b. FAKE "ASSOCIÉS EN LIGNE" COUNTER
   ============================================================ */
(function initOnlineCounter() {
  const el = document.getElementById("online-count");
  if (!el) return;
  let count = 10 + Math.floor(Math.random() * 16); // 10–25
  el.textContent = count;

  function tick() {
    const delta = Math.floor(Math.random() * 5) - 2;
    count = Math.max(10, Math.min(25, count + delta));
    el.textContent = count;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
    setTimeout(tick, 3500 + Math.random() * 3000);
  }
  setTimeout(tick, 4000 + Math.random() * 2000);
})();

/* ============================================================
   3c. SPARKLE BURST (Ultimate modal)
   ============================================================ */
function spawnSparkleBurst(container, emoji, count) {
  if (!container) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "burst-spark";
    s.textContent = emoji;
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 90;
    s.style.setProperty("--bx", Math.cos(angle) * dist + "px");
    s.style.setProperty("--by", Math.sin(angle) * dist + "px");
    s.style.animationDelay = Math.random() * 0.15 + "s";
    container.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}

/* ============================================================
   4. MASCOT — floating widget, speech bubble, expressions
   ============================================================ */
const mascotTips = [
  "Astuce : clique une catégorie pour démarrer plus vite ⚡",
  "Le modèle Vision peut analyser des images 👁️",
  "Ton historique se trouve dans la barre latérale 📂",
  "VEKTRA ULTIME arrive bientôt — vois ce qu'elle débloque ✨",
  "Besoin d'aide ? Rejoins le Discord Ervin Corp 🏴‍☠️"
];
let mascotTipIndex = -1;

function toggleMascotBubble() {
  const bubble = document.getElementById("mascot-bubble");
  const textEl = document.getElementById("mascot-bubble-text");
  if (!bubble) return;
  if (bubble.classList.contains("show")) {
    bubble.classList.remove("show");
    return;
  }
  mascotTipIndex = (mascotTipIndex + 1) % mascotTips.length;
  textEl.textContent = mascotTips[mascotTipIndex];
  bubble.classList.add("show");
}
const mascotTrigger = document.getElementById("mascot-trigger");
if (mascotTrigger) mascotTrigger.addEventListener("click", toggleMascotBubble);

// expressions: posée (calm), curieuse, énervée, ennuyée, émerveillée
const mascotExpressions = {
  calm:    { eyebrow: "M56 40 Q60 38 64 40", mouth: "M38 68 Q53 75 66 65", ry: "8" },
  curious: { eyebrow: "M55 37 Q60 33 66 38", mouth: "M40 67 Q53 70 64 67", ry: "9" },
  annoyed: { eyebrow: "M55 43 Q60 45 66 43", mouth: "M40 70 Q53 66 64 70", ry: "6" },
  bored:   { eyebrow: "M56 41 Q60 40 64 41", mouth: "M42 69 L62 69",       ry: "5" },
  amazed:  { eyebrow: "M54 35 Q60 29 68 35", mouth: "M42 66 Q53 78 64 66", ry: "10" }
};
let currentExpression = "calm";

function setMascotExpression(name) {
  const ex = mascotExpressions[name] || mascotExpressions.calm;
  if (name === currentExpression) return;
  currentExpression = name;
  const eyebrow = document.getElementById("mascot-eyebrow");
  const mouth = document.getElementById("mascot-mouth");
  const eyeWhite = document.getElementById("mascot-eye-white");
  const svg = document.querySelector(".mascot-svg");
  if (eyebrow) eyebrow.setAttribute("d", ex.eyebrow);
  if (mouth) mouth.setAttribute("d", ex.mouth);
  if (eyeWhite) eyeWhite.setAttribute("ry", ex.ry);
  if (svg) {
    svg.classList.remove("reacting");
    void svg.offsetWidth;
    svg.classList.add("reacting");
  }
}

let idleBoredTimer = null;
function resetIdleBoredTimer() {
  clearTimeout(idleBoredTimer);
  idleBoredTimer = setTimeout(() => setMascotExpression("bored"), 25000);
}
document.addEventListener("click", () => {
  resetIdleBoredTimer();
  if (currentExpression === "bored") setMascotExpression("calm");
});
resetIdleBoredTimer();

/* ============================================================
   4b. MOBILE SIDEBAR DRAWER
   ============================================================ */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebar-backdrop").classList.toggle("open");
  document.getElementById("hamburger-btn").classList.toggle("open");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-backdrop").classList.remove("open");
  document.getElementById("hamburger-btn").classList.remove("open");
}

/* ============================================================
   5. HEADER LOGO — click feedback (never destroys conversation data)
   ============================================================ */
function goHome() {
  const box = document.getElementById("chat-messages");
  if (box) box.scrollTo({ top: 0, behavior: "smooth" });
  showToast("Tu es au cœur du noyau Vektra 🏴‍☠️");
}
const logoHomeBtn = document.getElementById("logo-home-btn");
if (logoHomeBtn) {
  logoHomeBtn.addEventListener("click", goHome);
  logoHomeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goHome(); }
  });
}

/* ============================================================
   6. AUTH — register, login, logout, session hydration
   ============================================================ */
function switchAuthTab(tab) {
  document.querySelectorAll(".auth-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  document.getElementById("login-form").classList.toggle("hidden", tab !== "login");
  document.getElementById("register-form").classList.toggle("hidden", tab !== "register");
  document.getElementById("login-error").textContent = "";
  document.getElementById("register-error").textContent = "";
}

let registerAvatar = "🏴‍☠️";
function pickRegisterAvatar(el) {
  document.querySelectorAll("#register-avatar-picker .avatar-opt").forEach((o) => o.classList.remove("active"));
  el.classList.add("active");
  registerAvatar = el.dataset.avatar;
}

async function handleRegister(e) {
  e.preventDefault();
  const errorEl = document.getElementById("register-error");
  errorEl.textContent = "";

  const usernameRaw = document.getElementById("register-username").value.trim();
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("register-password-confirm").value;

  if (!/^[a-zA-Z0-9_\-À-ÿ ]{3,20}$/.test(usernameRaw)) {
    errorEl.textContent = "Pseudo invalide (3 à 20 caractères : lettres, chiffres, espaces, - ou _).";
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = "Le mot de passe doit faire au moins 6 caractères.";
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = "Les mots de passe ne correspondent pas.";
    return;
  }

  const key = usernameRaw.toLowerCase();
  const users = getUsers();
  if (users[key]) {
    errorEl.textContent = "Ce pseudo est déjà pris.";
    return;
  }

  const passwordHash = await hashPassword(password);
  users[key] = { username: usernameRaw, passwordHash, avatar: registerAvatar, createdAt: Date.now() };
  saveUsers(users);

  loginSuccess(usernameRaw, key, registerAvatar);
  showToast(`Bienvenue à bord, ${usernameRaw} ⚡`);
}

async function handleLogin(e) {
  e.preventDefault();
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";

  const usernameRaw = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const key = usernameRaw.toLowerCase();

  const users = getUsers();
  const user = users[key];
  if (!user) {
    errorEl.textContent = "Aucun compte avec ce pseudo sur cet appareil.";
    return;
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    errorEl.textContent = "Mot de passe incorrect.";
    return;
  }

  loginSuccess(user.username, key, user.avatar);
  showToast(`Content de te revoir, ${user.username} 👋`);
}

function loginSuccess(username, key, avatar) {
  currentUsername = username;
  currentUserKey = key;
  currentAvatar = avatar || "🏴‍☠️";
  lsSet("vektra_session", key);

  document.getElementById("login-form").reset();
  document.getElementById("register-form").reset();
  document.getElementById("auth-gate").classList.remove("show");
  hydrateAppForUser();
}

function logoutUser() {
  localStorage.removeItem("vektra_session");
  currentUsername = null;
  currentUserKey = null;
  activeConvId = null;
  convs = {};
  closeVekModal();
  switchAuthTab("login");
  document.getElementById("auth-gate").classList.add("show");
  showToast("Déconnecté. À bientôt ! 🏴‍☠️");
}

function checkAuthAndShowGate() {
  const session = lsGet("vektra_session", null);
  if (session) {
    const users = getUsers();
    const user = users[session];
    if (user) {
      currentUsername = user.username;
      currentUserKey = session;
      currentAvatar = user.avatar || "🏴‍☠️";
      hydrateAppForUser();
      return;
    }
  }
  document.getElementById("auth-gate").classList.add("show");
}

function hydrateAppForUser() {
  renderAvatarInto(document.getElementById("header-user-avatar"), currentAvatar);
  document.getElementById("header-user-badge").textContent = currentUsername;
  document.getElementById("profile-username-display").textContent = `Connecté en tant que ${currentUsername}`;
  document.querySelectorAll("#avatar-picker .avatar-opt").forEach((o) => o.classList.toggle("active", o.dataset.avatar === currentAvatar));

  convs = lsGet(`vektra_convs_${currentUserKey}`, {});
  let active = lsGet(`vektra_active_${currentUserKey}`, null);

  if (Object.keys(convs).length === 0) {
    active = createConvRecord("Conversation #1");
  }
  if (!active || !convs[active]) {
    active = Object.keys(convs)[0];
  }

  renderConvSidebar();
  loadConv(active);
}

/* ============================================================
   7. PROFILE MODAL (avatar + logout)
   ============================================================ */
function openVekModal() { document.getElementById("vek-modal").classList.add("open"); }
function closeVekModal() { document.getElementById("vek-modal").classList.remove("open"); }

function selectAvatar(el) {
  const emoji = el.dataset.avatar;
  document.querySelectorAll("#avatar-picker .avatar-opt").forEach((o) => o.classList.remove("active"));
  el.classList.add("active");
  currentAvatar = emoji;
}

function saveVekAccount() {
  if (currentUserKey) {
    const users = getUsers();
    if (users[currentUserKey]) {
      users[currentUserKey].avatar = currentAvatar;
      saveUsers(users);
    }
  }
  renderAvatarInto(document.getElementById("header-user-avatar"), currentAvatar);
  closeVekModal();
  showToast("Profil mis à jour");
}

/* ============================================================
   8. ULTIMATE MODAL — Discord CTA + access code (coming soon)
   ============================================================ */
function openUltimateModal() {
  document.getElementById("ultimate-modal").classList.add("open");
  const box = document.querySelector("#ultimate-modal .modal-box");
  spawnSparkleBurst(box, "✨", 16);
}
function closeUltimateModal() { document.getElementById("ultimate-modal").classList.remove("open"); }

function redeemAccessCode() {
  const input = document.getElementById("access-code-input");
  const val = input.value.trim();
  if (!val) { showToast("Entre d'abord un code."); return; }
  input.value = "";
  showToast("Cette fonctionnalité arrive bientôt 🔒");
}

document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.remove("open");
  });
});

/* ============================================================
   9. MODELS
   ============================================================ */
function selectModel(el, icon, name) {
  if (!el) return;
  document.querySelectorAll(".model-card").forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  const badge = document.getElementById("model-badge");
  if (badge) badge.textContent = `${icon} ${name}`;
  if (activeConvId && convs[activeConvId]) {
    convs[activeConvId].modelIcon = icon;
    convs[activeConvId].modelName = name;
    persistConvs();
  }
  showToast(`Modèle activé : ${name}`);
}

/* ============================================================
   10. CATEGORY / FEATURE CHIPS
   ============================================================ */
function fillPrompt(text) {
  const input = document.getElementById("user-input");
  input.value = text;
  input.focus();
  input.setSelectionRange(text.length, text.length);
}

/* ============================================================
   11. CONVERSATIONS — persisted per account, capped at 5
   ============================================================ */
function persistConvs() {
  if (!currentUserKey) return;
  lsSet(`vektra_convs_${currentUserKey}`, convs);
}
function setActiveConvId(id) {
  activeConvId = id;
  if (currentUserKey) lsSet(`vektra_active_${currentUserKey}`, id);
}

function createConvRecord(name) {
  const id = "conv_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  convs[id] = { id, name, modelIcon: "🛡️", modelName: "Vektra Core", messages: [] };
  persistConvs();
  setActiveConvId(id);
  return id;
}

function createNewChat() {
  if (!currentUserKey) return;
  const count = Object.keys(convs).length;
  if (count >= MAX_CONVS) {
    showToast("Réservé à la version ULTIMATE ✨");
    openUltimateModal();
    return;
  }
  const name = `Conversation #${count + 1}`;
  const id = createConvRecord(name);
  renderConvSidebar();
  loadConv(id);
  showToast("Nouvelle conversation créée");
}

function createConvItemEl(conv) {
  const item = document.createElement("div");
  item.className = "conv-item";
  item.dataset.convId = conv.id;

  const span = document.createElement("span");
  span.className = "conv-name";
  span.textContent = conv.name;

  const del = document.createElement("button");
  del.className = "conv-delete";
  del.setAttribute("aria-label", "Supprimer la conversation");
  del.textContent = "×";
  del.addEventListener("click", (e) => { e.stopPropagation(); deleteConvById(conv.id); });

  item.appendChild(span);
  item.appendChild(del);
  item.addEventListener("click", () => loadConv(conv.id));
  return item;
}

function renderConvSidebar() {
  const list = document.getElementById("conv-list");
  if (!list) return;
  list.innerHTML = "";
  const ids = Object.keys(convs);
  ids.forEach((id) => {
    const item = createConvItemEl(convs[id]);
    if (id === activeConvId) item.classList.add("active");
    list.appendChild(item);
  });
  if (ids.length === 0) {
    const p = document.createElement("p");
    p.id = "conv-empty";
    p.className = "conv-empty";
    p.textContent = 'Aucune conversation — clique sur "Nouvelle conversation".';
    list.appendChild(p);
  }
  updateConvLimitNote();
}

function updateConvLimitNote() {
  const note = document.getElementById("conv-limit-note");
  if (!note) return;
  const count = Object.keys(convs).length;
  note.textContent = `${count} / ${MAX_CONVS} conversations utilisées`;
  note.classList.toggle("limit-reached", count >= MAX_CONVS);
}

function loadConv(id) {
  if (!convs[id]) return;
  setActiveConvId(id);
  document.querySelectorAll("#conv-list .conv-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.convId === id);
  });

  const conv = convs[id];
  document.getElementById("chat-area-title").textContent = conv.name;
  document.getElementById("model-badge").textContent = `${conv.modelIcon} ${conv.modelName}`;
  document.querySelectorAll(".model-card").forEach((c) => {
    const nameEl = c.querySelector(".model-name");
    c.classList.toggle("active", nameEl && conv.modelName.toLowerCase().includes(nameEl.textContent.toLowerCase()));
  });

  renderMessagesForConv(conv);
  closeSidebar();
}

function deleteConvById(id) {
  if (!convs[id]) return;
  const wasActive = id === activeConvId;
  delete convs[id];
  persistConvs();
  renderConvSidebar();

  if (wasActive) {
    const remaining = Object.keys(convs);
    if (remaining.length > 0) {
      loadConv(remaining[0]);
    } else {
      activeConvId = null;
      document.getElementById("chat-area-title").textContent = "Conversation";
      const box = document.getElementById("chat-messages");
      box.innerHTML = "";
      box.appendChild(buildHeroNode());
    }
  }
  showToast("Conversation supprimée");
}

/* ============================================================
   12. HERO (empty-state welcome screen)
   ============================================================ */
function buildHeroNode() {
  const tpl = document.getElementById("hero-template");
  const node = tpl.content.cloneNode(true);
  const greetingEl = node.querySelector("#hero-greeting");
  if (greetingEl) greetingEl.textContent = `Bonjour, ${currentUsername || "l'associé"}.`;
  return node;
}

function hideHero() {
  const hero = document.getElementById("chat-hero");
  if (hero) hero.remove();
}

function renderMessagesForConv(conv) {
  const box = document.getElementById("chat-messages");
  box.innerHTML = "";
  if (!conv.messages || conv.messages.length === 0) {
    box.appendChild(buildHeroNode());
    return;
  }
  conv.messages.forEach((m) => {
    const { wrap, p } = createMsgEl(m.sender, m.author);
    p.textContent = m.text;
    if (m.sender === "bot") wrap.querySelector(".msg-content").classList.add("glow-settled");
    box.appendChild(wrap);
  });
  box.scrollTop = box.scrollHeight;
}

function pushMessageToActiveConv(sender, author, text) {
  if (!activeConvId || !convs[activeConvId]) return;
  convs[activeConvId].messages.push({ sender, author, text });
  persistConvs();
}

/* ============================================================
   13. MESSAGES — send, render, typewriter, glow
   ============================================================ */
function createMsgEl(sender, authorText) {
  const wrap = document.createElement("div");
  wrap.className = "msg " + sender;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  if (sender === "bot") {
    avatar.innerHTML = '<svg viewBox="0 0 100 122"><use href="#vektra-mascot"></use></svg>';
  } else {
    renderAvatarInto(avatar, currentAvatar);
  }

  const content = document.createElement("div");
  content.className = "msg-content";

  const author = document.createElement("span");
  author.className = "msg-author";
  author.textContent = authorText;

  const p = document.createElement("p");

  content.appendChild(author);
  content.appendChild(p);
  wrap.appendChild(avatar);
  wrap.appendChild(content);

  return { wrap, p };
}

function typeText(el, text, speed, onTick) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !text) {
    el.textContent = text;
    if (onTick) onTick();
    return;
  }
  el.classList.add("typing-cursor");
  let i = 0;
  const timer = setInterval(() => {
    i++;
    el.textContent = text.slice(0, i);
    if (onTick) onTick();
    if (i >= text.length) {
      clearInterval(timer);
      el.classList.remove("typing-cursor");
    }
  }, speed);
}

async function sendMessage(e) {
  e.preventDefault();

  if (!currentUserKey || !activeConvId) {
    showToast("Connecte-toi pour discuter avec Vektra.");
    return;
  }

  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("chat-messages");
  const indicator = document.getElementById("typing-indicator");

  hideHero();

  const { wrap: userWrap, p: userP } = createMsgEl("user", currentUsername.toUpperCase());
  userP.textContent = text;
  messagesBox.appendChild(userWrap);
  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;
  pushMessageToActiveConv("user", currentUsername.toUpperCase(), text);

  setMascotExpression("curious");
  indicator.style.display = "flex";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    indicator.style.display = "none";

    const { wrap: botWrap, p: botP } = createMsgEl("bot", "VEKTRA // SECURE CORE");
    const contentEl = botWrap.querySelector(".msg-content");
    contentEl.classList.add("glow-active");
    messagesBox.appendChild(botWrap);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    const replyText = data.reply || data.error || "Erreur inconnue.";
    const speed = Math.max(8, Math.min(30, 1600 / Math.max(replyText.length, 1)));
    typeText(botP, replyText, speed, () => { messagesBox.scrollTop = messagesBox.scrollHeight; });

    setTimeout(() => {
      contentEl.classList.remove("glow-active");
      contentEl.classList.add("glow-settled");
    }, speed * replyText.length + 300);

    pushMessageToActiveConv("bot", "VEKTRA // SECURE CORE", replyText);
    setMascotExpression("amazed");
    setTimeout(() => setMascotExpression("calm"), 2200);
  } catch (err) {
    indicator.style.display = "none";
    const { wrap: errWrap, p: errP } = createMsgEl("bot", "SYSTEM ERROR");
    errP.textContent = "Erreur de liaison avec le noyau EDC.";
    messagesBox.appendChild(errWrap);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    pushMessageToActiveConv("bot", "SYSTEM ERROR", "Erreur de liaison avec le noyau EDC.");
    setMascotExpression("annoyed");
    setTimeout(() => setMascotExpression("calm"), 2200);
  }
}

/* ============================================================
   14. INPUT — typing triggers the "curious" expression
   ============================================================ */
(function wireInputExpressions() {
  const input = document.getElementById("user-input");
  if (!input) return;
  let typingIdleTimer = null;
  input.addEventListener("input", () => {
    setMascotExpression("curious");
    clearTimeout(typingIdleTimer);
    typingIdleTimer = setTimeout(() => setMascotExpression("calm"), 1200);
    resetIdleBoredTimer();
  });
  input.addEventListener("focus", resetIdleBoredTimer);
})();
