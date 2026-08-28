/* ============================================================
   STATE
   ============================================================ */
let currentUsername = "Compte VEK";
let currentAvatar = "🏴‍☠️";

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ============================================================
   0. BOOT SEQUENCE — cinematic intro (behaviour unchanged)
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
  const COUNT = 46;
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
    const delta = Math.floor(Math.random() * 5) - 2; // -2..+2
    count = Math.max(10, Math.min(25, count + delta));
    el.textContent = count;
    el.classList.remove("bump");
    void el.offsetWidth; // restart animation
    el.classList.add("bump");
    setTimeout(tick, 3500 + Math.random() * 3000);
  }
  setTimeout(tick, 4000 + Math.random() * 2000);
})();

/* ============================================================
   3c. SPARKLE BURST (used by Ultimate + Ervin Corp modals)
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
   4. MASCOT — floating widget + speech bubble
   ============================================================ */
const mascotTips = [
  "Astuce : clique une catégorie pour démarrer plus vite ⚡",
  "Le modèle Vision peut analyser des images 👁️",
  "Ton historique se trouve dans la barre latérale 📂",
  "VEKTRA ULTIME arrive bientôt — inscris-toi en liste d'attente ✨",
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

/* ============================================================
   5. HEADER LOGO — click to return home
   ============================================================ */
function goHome() {
  hideHero(false);
  document.getElementById("chat-messages").innerHTML = buildHeroHTML();
  showToast("Retour à l'accueil");
}
const logoHomeBtn = document.getElementById("logo-home-btn");
if (logoHomeBtn) {
  logoHomeBtn.addEventListener("click", goHome);
  logoHomeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goHome(); }
  });
}

/* ============================================================
   6. MODALS — compte VEK, ED-Corp, Vektra Ultime
   ============================================================ */
function openVekModal() { document.getElementById("vek-modal").classList.add("open"); }
function closeVekModal() { document.getElementById("vek-modal").classList.remove("open"); }

function selectAvatar(el, emoji) {
  document.querySelectorAll(".avatar-opt").forEach((o) => o.classList.remove("active"));
  el.classList.add("active");
  currentAvatar = emoji;
  document.getElementById("header-user-avatar").textContent = emoji;
}

function saveVekAccount() {
  const val = document.getElementById("vek-username-input").value.trim();
  if (val) {
    currentUsername = val;
    document.getElementById("header-user-badge").textContent = currentUsername;
  }
  const heroGreeting = document.getElementById("hero-greeting");
  if (heroGreeting) heroGreeting.textContent = `Bonjour, ${currentUsername}.`;
  closeVekModal();
  showToast("Profil mis à jour");
}

function openUltimateModal() {
  document.getElementById("ultimate-modal").classList.add("open");
  const box = document.querySelector("#ultimate-modal .modal-box");
  spawnSparkleBurst(box, "✨", 16);
}
function closeUltimateModal() { document.getElementById("ultimate-modal").classList.remove("open"); }

function joinWaitlist(e) {
  e.preventDefault();
  const emailInput = document.getElementById("waitlist-email");
  const email = emailInput.value.trim();
  if (!email) return;
  emailInput.value = "";
  closeUltimateModal();
  showToast("Tu es sur la liste d'attente ✨");
}

document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.remove("open");
  });
});

/* ============================================================
   7. MODELS
   ============================================================ */
function selectModel(el, icon, name) {
  if (!el) return;
  document.querySelectorAll(".model-card").forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  const badge = document.getElementById("model-badge");
  if (badge) badge.textContent = `${icon} ${name}`;
  showToast(`Modèle activé : ${name}`);
}

/* ============================================================
   8. CATEGORY / FEATURE CHIPS
   ============================================================ */
function fillPrompt(text) {
  const input = document.getElementById("user-input");
  input.value = text;
  input.focus();
  input.setSelectionRange(text.length, text.length);
}

/* ============================================================
   9. CONVERSATIONS
   ============================================================ */
function createConvItem(name) {
  const item = document.createElement("div");
  item.className = "conv-item";

  const span = document.createElement("span");
  span.className = "conv-name";
  span.textContent = name;

  const del = document.createElement("button");
  del.className = "conv-delete";
  del.setAttribute("aria-label", "Supprimer la conversation");
  del.textContent = "×";
  del.addEventListener("click", (e) => deleteConv(e, del));

  item.appendChild(span);
  item.appendChild(del);
  item.addEventListener("click", () => switchConv(item, name));

  return item;
}

function createNewChat() {
  const list = document.getElementById("conv-list");
  const empty = document.getElementById("conv-empty");
  if (empty) empty.remove();

  const count = list.children.length + 1;
  const name = `Conversation #${count}`;
  const item = createConvItem(name);

  document.querySelectorAll(".conv-item").forEach((el) => el.classList.remove("active"));
  item.classList.add("active");
  list.appendChild(item);

  document.getElementById("chat-area-title").textContent = name;
  document.getElementById("chat-messages").innerHTML = buildHeroHTML();
  showToast("Nouvelle conversation créée");
}

function switchConv(el, name) {
  document.querySelectorAll(".conv-item").forEach((item) => item.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("chat-area-title").textContent = name;
}

function deleteConv(e, btn) {
  e.stopPropagation();
  const item = btn.closest(".conv-item");
  const list = document.getElementById("conv-list");
  const wasActive = item.classList.contains("active");
  item.remove();

  if (wasActive) {
    const next = list.querySelector(".conv-item");
    if (next) {
      next.classList.add("active");
      const nameEl = next.querySelector(".conv-name");
      document.getElementById("chat-area-title").textContent = nameEl ? nameEl.textContent : "Conversation";
    }
  }

  if (list.children.length === 0) {
    const p = document.createElement("p");
    p.id = "conv-empty";
    p.className = "conv-empty";
    p.textContent = 'Aucune conversation — clique sur "Nouvelle conversation".';
    list.appendChild(p);
  }

  showToast("Conversation supprimée");
}

/* ============================================================
   10. HERO (empty-state welcome screen)
   ============================================================ */
function buildHeroHTML() {
  const name = escapeHtml(currentUsername);
  return `
    <div class="chat-hero" id="chat-hero">
      <svg class="hero-mascot" viewBox="0 0 100 122"><use href="#vektra-mascot"></use></svg>
      <h2 class="hero-greeting" id="hero-greeting">Bonjour, ${name}.</h2>
      <p class="hero-sub">Le noyau Vektra est en ligne. Choisis une catégorie ou lance directement une conversation.</p>

      <div class="category-chips">
        <button class="chip" onclick="fillPrompt('Parlons de ')">💬 Discussion libre</button>
        <button class="chip" onclick="fillPrompt('Aide-moi à corriger ce code : ')">💻 Code &amp; debug</button>
        <button class="chip" onclick="fillPrompt('Imagine une idée originale pour ')">🎨 Créativité</button>
        <button class="chip" onclick="fillPrompt('Analyse ces données : ')">📊 Analyse</button>
        <button class="chip" onclick="fillPrompt('Explique-moi en détail ')">🔍 Recherche</button>
      </div>

      <div class="feature-grid">
        <button class="feature-card" onclick="fillPrompt('Parlons de ')">
          <svg class="feature-icon" viewBox="0 0 32 32"><path d="M6 8h20a2 2 0 012 2v10a2 2 0 01-2 2H14l-6 5v-5H6a2 2 0 01-2-2V10a2 2 0 012-2z" fill="none" stroke="url(#gradIcon)" stroke-width="2" stroke-linejoin="round"/></svg>
          <span class="feature-title">Conversation naturelle</span>
          <span class="feature-desc">Un dialogue fluide, en français, sans détour.</span>
        </button>
        <button class="feature-card" onclick="fillPrompt('Aide-moi à corriger ce code : ')">
          <svg class="feature-icon" viewBox="0 0 32 32"><path d="M11 9l-7 7 7 7M21 9l7 7-7 7" fill="none" stroke="url(#gradIcon)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span class="feature-title">Code &amp; scripts</span>
          <span class="feature-desc">Génère, corrige et explique du code.</span>
        </button>
        <button class="feature-card" onclick="selectModel(document.querySelector('[data-model=vision]'),'👁️','Vektra Vision')">
          <svg class="feature-icon" viewBox="0 0 32 32"><path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9-14-9-14-9z" fill="none" stroke="url(#gradIcon)" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="16" r="4" fill="none" stroke="url(#gradIcon)" stroke-width="2"/></svg>
          <span class="feature-title">Vision</span>
          <span class="feature-desc">Analyse des images, décrit ce qu'elles montrent.</span>
        </button>
        <button class="feature-card" onclick="selectModel(document.querySelector('[data-model=rapide]'),'⚡','Vektra Rapide')">
          <svg class="feature-icon" viewBox="0 0 32 32"><path d="M18 2L6 18h8l-2 12 14-18h-9l1-10z" fill="url(#gradIcon)"/></svg>
          <span class="feature-title">Réponses rapides</span>
          <span class="feature-desc">Latence minimale, propulsé par Vektra Rapide.</span>
        </button>
      </div>
    </div>`;
}

function hideHero(toast) {
  const hero = document.getElementById("chat-hero");
  if (hero) hero.remove();
  if (toast) showToast("Conversation démarrée");
}

/* ============================================================
   11. MESSAGES — send, render, typewriter
   ============================================================ */
function createMsgEl(sender, authorText) {
  const wrap = document.createElement("div");
  wrap.className = "msg " + sender;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  if (sender === "bot") {
    avatar.innerHTML = '<svg viewBox="0 0 100 122"><use href="#vektra-mascot"></use></svg>';
  } else {
    avatar.textContent = currentAvatar;
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
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("chat-messages");
  const indicator = document.getElementById("typing-indicator");

  hideHero(false);

  const { wrap: userWrap, p: userP } = createMsgEl("user", currentUsername.toUpperCase());
  userP.textContent = text;
  messagesBox.appendChild(userWrap);
  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;

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
    messagesBox.appendChild(botWrap);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    const replyText = data.reply || data.error || "Erreur inconnue.";
    const speed = Math.max(8, Math.min(30, 1600 / Math.max(replyText.length, 1)));
    typeText(botP, replyText, speed, () => { messagesBox.scrollTop = messagesBox.scrollHeight; });
  } catch (err) {
    indicator.style.display = "none";
    const { wrap: errWrap, p: errP } = createMsgEl("bot", "SYSTEM ERROR");
    errP.textContent = "Erreur de liaison avec le noyau EDC.";
    messagesBox.appendChild(errWrap);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }
}
