function openModal() {
  document.getElementById("account-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("account-modal").style.display = "none";
}

function clearChat() {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = `
    <div class="msg-row bot">
      <div class="msg-avatar">V</div>
      <div class="msg-bubble">
        <div class="msg-sender">VEKTRA IA</div>
        <div class="msg-text">Nouvelle session initialisée. Comment puis-je vous aider Ervin ?</div>
      </div>
    </div>
  `;
}

async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  const aiWaves = document.getElementById("ai-waves");

  // Message Utilisateur
  const userRow = document.createElement("div");
  userRow.className = "msg-row user";
  userRow.innerHTML = `
    <div class="msg-avatar">E</div>
    <div class="msg-bubble">
      <div class="msg-sender">ERVIN</div>
      <div class="msg-text">${escapeHtml(message)}</div>
    </div>
  `;
  chatBox.appendChild(userRow);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Active les ondes lumineuses IA pendant le chargement
  aiWaves.style.display = "flex";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();

    aiWaves.style.display = "none";

    // Message IA
    const botRow = document.createElement("div");
    botRow.className = "msg-row bot";
    botRow.innerHTML = `
      <div class="msg-avatar">V</div>
      <div class="msg-bubble">
        <div class="msg-sender">VEKTRA IA</div>
        <div class="msg-text">${data.reply || data.error}</div>
      </div>
    `;
    chatBox.appendChild(botRow);
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    aiWaves.style.display = "none";
    const errRow = document.createElement("div");
    errRow.className = "msg-row bot";
    errRow.innerHTML = `
      <div class="msg-avatar">V</div>
      <div class="msg-bubble">
        <div class="msg-sender">SYSTEM ERROR</div>
        <div class="msg-text">Erreur réseau lors de la communication avec le serveur.</div>
      </div>
    `;
    chatBox.appendChild(errRow);
  }
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}