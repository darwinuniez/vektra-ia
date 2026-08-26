let currentUsername = "Compte VEK";

// Gestion modals compte
function openVekModal() {
  document.getElementById("vek-modal").style.display = "flex";
}
function closeVekModal() {
  document.getElementById("vek-modal").style.display = "none";
}
function saveVekAccount() {
  const val = document.getElementById("vek-username-input").value.trim();
  if (val) {
    currentUsername = val;
    document.getElementById("header-user-badge").innerText = currentUsername;
  }
  closeVekModal();
}

// Gestion modal ED-Corp
function openEdcModal() {
  document.getElementById("edc-modal").style.display = "flex";
}
function closeEdcModal() {
  document.getElementById("edc-modal").style.display = "none";
}

// Gestion des conversations
function createNewChat() {
  const list = document.getElementById("conv-list");
  const count = list.children.length + 1;
  const name = `Conversation #${count}`;

  const item = document.createElement("div");
  item.className = "conv-item active";
  item.onclick = function() { switchConv(this, name); };
  item.innerText = name;

  document.querySelectorAll(".conv-item").forEach(el => el.classList.remove("active"));
  list.appendChild(item);

  const messagesBox = document.getElementById("chat-messages");
  messagesBox.innerHTML = `
    <div class="msg bot">
      <div class="msg-avatar">🏴‍☠️</div>
      <div class="msg-content">
        <span class="msg-author">VEKTRA // SECURE CORE</span>
        <p>Nouvelle ${name} initialisée par ${currentUsername}. Prêt pour les instructions.</p>
      </div>
    </div>
  `;
}

function switchConv(el, name) {
  document.querySelectorAll(".conv-item").forEach(item => item.classList.remove("active"));
  el.classList.add("active");
}

// Envoi de message avec simulation de réflexion du robot
async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("chat-messages");
  const indicator = document.getElementById("typing-indicator");

  // Affichage message utilisateur
  const userMsg = document.createElement("div");
  userMsg.className = "msg user";
  userMsg.innerHTML = `
    <div class="msg-avatar">🏴‍☠️</div>
    <div class="msg-content">
      <span class="msg-author">${currentUsername.toUpperCase()}</span>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
  messagesBox.appendChild(userMsg);
  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Affichage de l'animation de réflexion du robot
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
        <p>${data.reply || data.error}</p>
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