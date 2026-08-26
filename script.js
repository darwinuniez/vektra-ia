let currentUsername = "Ervin DEMIR";

// Splash Screen Timer Gemini Style
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.style.display = "none";
    }, 800);
  }, 1800);
});

// Modal Account
function openAccountModal() {
  document.getElementById("account-modal").style.display = "flex";
}

function closeAccountModal() {
  document.getElementById("account-modal").style.display = "none";
}

function saveAccountInfo() {
  const val = document.getElementById("user-input-id").value.trim();
  if (val) {
    currentUsername = val.split("@")[0];
    document.getElementById("display-username").innerText = currentUsername;
    document.getElementById("avatar-initial").innerText = currentUsername.charAt(0).toUpperCase();
  }
  closeAccountModal();
}

// Session Management
function startNewSession() {
  const list = document.getElementById("history-list");
  const count = list.children.length + 1;
  const sessionName = `Session #${count}`;

  const item = document.createElement("div");
  item.className = "history-item active";
  item.onclick = function() { selectSession(this); };
  item.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    <span>${sessionName}</span>
  `;

  document.querySelectorAll(".history-item").forEach(el => el.classList.remove("active"));
  list.appendChild(item);

  const workspace = document.getElementById("chat-messages");
  workspace.innerHTML = `
    <div class="message-row bot-row">
      <div class="msg-avatar">V</div>
      <div class="msg-content">
        <div class="msg-author">VEKTRA IA</div>
        <div class="msg-text">Nouvelle session **${sessionName}** ouverte. En quoi puis-je t'aider ?</div>
      </div>
    </div>
  `;
}

function selectSession(element) {
  document.querySelectorAll(".history-item").forEach(el => el.classList.remove("active"));
  element.classList.add("active");
}

// Sending Messages
async function handleSend(e) {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  const workspace = document.getElementById("chat-messages");
  const loader = document.getElementById("ai-loading");

  // User Message Row
  const userRow = document.createElement("div");
  userRow.className = "message-row user-row";
  userRow.innerHTML = `
    <div class="msg-avatar">${currentUsername.charAt(0).toUpperCase()}</div>
    <div class="msg-content">
      <div class="msg-author">${currentUsername.toUpperCase()}</div>
      <div class="msg-text">${escapeHtml(message)}</div>
    </div>
  `;
  workspace.appendChild(userRow);

  input.value = "";
  workspace.scrollTop = workspace.scrollHeight;

  // Show Loading
  loader.style.display = "flex";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();

    loader.style.display = "none";

    // Bot Message Row
    const botRow = document.createElement("div");
    botRow.className = "message-row bot-row";
    botRow.innerHTML = `
      <div class="msg-avatar">V</div>
      <div class="msg-content">
        <div class="msg-author">VEKTRA IA</div>
        <div class="msg-text">${data.reply || data.error}</div>
      </div>
    `;
    workspace.appendChild(botRow);
    workspace.scrollTop = workspace.scrollHeight;
  } catch (err) {
    loader.style.display = "none";
    const errRow = document.createElement("div");
    errRow.className = "message-row bot-row";
    errRow.innerHTML = `
      <div class="msg-avatar">V</div>
      <div class="msg-content">
        <div class="msg-author">ERREUR SYSTÈME</div>
        <div class="msg-text">Connexion interrompue.</div>
      </div>
    `;
    workspace.appendChild(errRow);
  }
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}