let currentUsername = "Compte VEK";

/* ============================================================
   0. BOOT SEQUENCE — cinematic intro
   ============================================================ */
(function bootSequence() {
  const bootSeq = document.getElementById("boot-sequence");
  const terminal = document.getElementById("boot-terminal");
  const linesEl = document.getElementById("boot-lines");
  const progressFill = document.getElementById("boot-progress-fill");
  const logoWrap = document.getElementById("boot-logo-wrap");
  const wipe = document.getElementById("wipe-transition");
  const skipHint = document.getElementById("boot-skip");
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

  function finishBoot() {
    if (finished) return;
    finished = true;
    logoWrap.classList.add("show");
    setTimeout(runWipe, 620);
  }

  function typeLines(index) {
    if (finished) return;
    if (index >= bootLines.length) {
      terminal.classList.add("fade-out");
      logoWrap.classList.add("show");
      setTimeout(runWipe, prefersReducedMotion ? 50 : 620);
      return;
    }
    const div = document.createElement("div");
    div.className = "boot-line";
    div.textContent = bootLines[index];
    linesEl.appendChild(div);
    progressFill.style.width = Math.round(((index + 1) / bootLines.length) * 100) + "%";
    setTimeout(() => typeLines(index + 1), prefersReducedMotion ? 20 : 190);
  }

  // Skip on click anywhere in the boot sequence
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
   1. MODALS — compte VEK & ED-Corp
   ============================================================ */
function openVekModal() {
  document.getElementById("vek-modal").classList.add("open");
}
function closeVekModal() {
  document.getElementById("vek-modal").classList.remove("open");
}
function saveVekAccount() {
  const val = document.getElementById("vek-username-input").value.trim();
  if (val) {
    currentUsername = val;
    document.getElementById("header-user-badge").innerText = currentUsername;
  }
  closeVekModal();
}

function openEdcModal() {
  document.getElementById("edc-modal").classList.add("open");
}
function closeEdcModal() {
  document.getElementById("edc-modal").classList.remove("open");
}

// Close modals when clicking outside the box
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.remove("open");
  });
});

/* ============================================================
   2. CONVERSATIONS
   ============================================================ */
function createNewChat() {
  const list = document.getElementById("conv-list");
  const count = list.children.length + 1;
  const name = `Conversation #${count}`;

  const item = document.createElement("div");
  item.className = "conv-item active";
  item.onclick = function () { switchConv(this, name); };
  item.innerText = name;

  document.querySelectorAll(".conv-item").forEach((el) => el.classList.remove("active"));
  list.appendChild(item);

  const messagesBox = document.getElementById("chat-messages");
  messagesBox.innerHTML = `
    <div class="msg bot">
      <div class="msg-avatar">🏴‍☠️</div>
      <div class="msg-content">
        <span class="msg-author">VEKTRA // SECURE CORE</span>
        <p>Nouvelle ${name} initialisée par ${escapeHtml(currentUsername)}. Prêt pour les instructions.</p>
      </div>
    </div>
  `;
}

function switchConv(el, name) {
  document.querySelectorAll(".conv-item").forEach((item) => item.classList.remove("active"));
  el.classList.add("active");
}

/* ============================================================
   3. ENVOI DE MESSAGE
   ============================================================ */
async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("chat-messages");
  const indicator = document.getElementById("typing-indicator");

  const userMsg = document.createElement("div");
  userMsg.className = "msg user";
  userMsg.innerHTML = `
    <div class="msg-avatar">🏴‍☠️</div>
    <div class="msg-content">
      <span class="msg-author">${escapeHtml(currentUsername.toUpperCase())}</span>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
  messagesBox.appendChild(userMsg);
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

    const botMsg = document.createElement("div");
    botMsg.className = "msg bot";
    botMsg.innerHTML = `
      <div class="msg-avatar">🏴‍☠️</div>
      <div class="msg-content">
        <span class="msg-author">VEKTRA // SECURE CORE</span>
        <p>${escapeHtml(data.reply || data.error || "Erreur inconnue.")}</p>
      </div>
    `;
    messagesBox.appendChild(botMsg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  } catch (err) {
    indicator.style.display = "none";
    const errMsg = document.createElement("div");
    errMsg.className = "msg bot";
    errMsg.innerHTML = `
      <div class="msg-avatar">🏴‍☠️</div>
      <div class="msg-content">
        <span class="msg-author">SYSTEM ERROR</span>
        <p>Erreur de liaison avec le noyau EDC.</p>
      </div>
    `;
    messagesBox.appendChild(errMsg);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
