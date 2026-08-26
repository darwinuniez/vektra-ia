// Global State
let currentUser = "Ervin DEMIR";
let currentSession = "Session Principale";

// Custom Glow Cursor & Mouse Follower
document.addEventListener("mousemove", (e) => {
  const cursor = document.getElementById("custom-cursor");
  const cursorBlur = document.getElementById("cursor-blur");
  
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
  
  cursorBlur.style.left = `${e.clientX}px`;
  cursorBlur.style.top = `${e.clientY}px`;
});

// 3D Tilt Effect on Hover (Rockstar / Apple Style)
document.querySelectorAll(".tilt-element").forEach((element) => {
  element.addEventListener("mousemove", (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  });
});

// Modals Handler
function openModal(type) {
  const modal = document.getElementById("account-modal");
  modal.style.display = "flex";
  if (type === "register") {
    switchModalTab("register");
  } else {
    switchModalTab("login");
  }
}

function openSubscriptionModal() {
  document.getElementById("subscription-modal").style.display = "flex";
}

function openRoadmapModal() {
  document.getElementById("roadmap-modal").style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function switchModalTab(tab) {
  const loginView = document.getElementById("login-form-view");
  const regView = document.getElementById("register-form-view");
  const loginBtn = document.getElementById("tab-login-btn");
  const regBtn = document.getElementById("tab-register-btn");

  if (tab === "login") {
    loginView.style.display = "block";
    regView.style.display = "none";
    loginBtn.classList.add("active");
    regBtn.classList.remove("active");
  } else {
    loginView.style.display = "none";
    regView.style.display = "block";
    regBtn.classList.add("active");
    loginBtn.classList.remove("active");
  }
}

function handleAccountLogin() {
  const inputVal = document.getElementById("login-id").value.trim();
  if (inputVal) {
    currentUser = inputVal.split("@")[0];
    updateUserInterface();
  }
  closeModal("account-modal");
}

function handleAccountRegister() {
  const nameVal = document.getElementById("reg-name").value.trim();
  if (nameVal) {
    currentUser = nameVal;
    updateUserInterface();
  }
  closeModal("account-modal");
}

function updateUserInterface() {
  document.getElementById("user-display-name").innerText = currentUser;
  document.getElementById("account-btn-text").innerText = currentUser;
  document.getElementById("user-avatar-initial").innerText = currentUser.charAt(0).toUpperCase();
}

function notifySubscription() {
  alert("L'abonnement EDC VIP sera ouvert très prochainement ! Merci pour votre intérêt.");
  closeModal("subscription-modal");
}

// Sessions & Models
function startNewSession() {
  const chatList = document.getElementById("chat-list");
  const sessionCount = chatList.children.length + 1;
  const sessionName = `Session #${sessionCount}`;

  const newItem = document.createElement("div");
  newItem.className = "chat-item active";
  newItem.onclick = function() { switchSession(this, sessionName); };
  newItem.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    <span>${sessionName}</span>
  `;

  document.querySelectorAll(".chat-item").forEach(item => item.classList.remove("active"));
  chatList.appendChild(newItem);

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = `
    <div class="msg-row bot">
      <div class="msg-avatar">V</div>
      <div class="msg-bubble">
        <div class="msg-sender">VEKTRA IA // EDC CORE</div>
        <div class="msg-text">Nouvelle session **${sessionName}** démarrée. En quoi puis-je t'aider ${currentUser} ?</div>
      </div>
    </div>
  `;
}

function switchSession(element, name) {
  document.querySelectorAll(".chat-item").forEach(item => item.classList.remove("active"));
  element.classList.add("active");
  currentSession = name;
}

function selectModel(element, modelName) {
  document.getElementById("system-status-text").innerText = `Système Opérationnel • ${modelName}`;
}

// Send Message Handler
async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  const aiWaves = document.getElementById("ai-waves");

  // Add User Message
  const userRow = document.createElement("div");
  userRow.className = "msg-row user";
  userRow.innerHTML = `
    <div class="msg-avatar">${currentUser.charAt(0).toUpperCase()}</div>
    <div class="msg-bubble">
      <div class="msg-sender">${currentUser.toUpperCase()}</div>
      <div class="msg-text">${escapeHtml(message)}</div>
    </div>
  `;
  chatBox.appendChild(userRow);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Show Waves Animation
  aiWaves.style.display = "flex";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();

    aiWaves.style.display = "none";

    // Add Bot Message
    const botRow = document.createElement("div");
    botRow.className = "msg-row bot";
    botRow.innerHTML = `
      <div class="msg-avatar">V</div>
      <div class="msg-bubble">
        <div class="msg-sender">VEKTRA IA // EDC CORE</div>
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
        <div class="msg-text">Erreur de connexion avec le noyau Vektra.</div>
      </div>
    `;
    chatBox.appendChild(errRow);
  }
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}