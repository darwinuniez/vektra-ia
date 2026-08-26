let currentUsername = "Invité Beta";
let currentSlideIndex = 0;

// Splash Screen Timer
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    splash.style.opacity = "0";
    setTimeout(() => { splash.style.display = "none"; }, 800);
  }, 2200);
});

// Modals
function openCarouselModal() {
  document.getElementById("carousel-modal").style.display = "flex";
}

function closeCarouselModal() {
  document.getElementById("carousel-modal").style.display = "none";
}

function openAccountModal() {
  document.getElementById("account-modal").style.display = "flex";
}

function closeAccountModal() {
  document.getElementById("account-modal").style.display = "none";
}

function saveAccount() {
  const inputVal = document.getElementById("input-username").value.trim();
  if (inputVal) {
    currentUsername = inputVal;
    document.getElementById("user-display-name").innerText = currentUsername;
    document.getElementById("user-btn-label").innerText = currentUsername;
    document.getElementById("avatar-initial").innerText = currentUsername.charAt(0).toUpperCase();
  }
  closeAccountModal();
}

// Carousel Controls
function showSlide(index) {
  const slides = document.querySelectorAll(".carousel-slide");
  if (index >= slides.length) currentSlideIndex = 0;
  else if (index < 0) currentSlideIndex = slides.length - 1;
  else currentSlideIndex = index;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentSlideIndex);
  });
}

function nextSlide() { showSlide(currentSlideIndex + 1); }
function prevSlide() { showSlide(currentSlideIndex - 1); }

// Sessions
function createNewSession() {
  const list = document.getElementById("sessions-list");
  const count = list.children.length + 1;
  const sessionName = `Session Vice #${count}`;

  const item = document.createElement("div");
  item.className = "session-item active";
  item.onclick = function() { switchSession(this, sessionName); };
  item.innerHTML = `<span>${sessionName}</span>`;

  document.querySelectorAll(".session-item").forEach(el => el.classList.remove("active"));
  list.appendChild(item);

  const workspace = document.getElementById("chat-messages");
  workspace.innerHTML = `
    <div class="msg-row bot">
      <div class="avatar-bot">V</div>
      <div class="msg-bubble">
        <div class="msg-author">VEKTRA IA // VICE CORE</div>
        <div class="msg-text">Nouvelle **${sessionName}** initialisée. Je t'écoute, ${currentUsername}.</div>
      </div>
    </div>
  `;
}

function switchSession(el, name) {
  document.querySelectorAll(".session-item").forEach(item => item.classList.remove("active"));
  el.classList.add("active");
}

// Sending Message
async function handleSend(e) {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const msg = input.value.trim();
  if (!msg) return;

  const chatBox = document.getElementById("chat-messages");
  const indicator = document.getElementById("ai-typing");

  // User Message
  const userRow = document.createElement("div");
  userRow.className = "msg-row user";
  userRow.innerHTML = `
    <div class="avatar-user">${currentUsername.charAt(0).toUpperCase()}</div>
    <div class="msg-bubble">
      <div class="msg-author">${currentUsername.toUpperCase()}</div>
      <div class="msg-text">${escapeHtml(msg)}</div>
    </div>
  `;
  chatBox.appendChild(userRow);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  indicator.style.display = "flex";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();

    indicator.style.display = "none";

    // Bot Message
    const botRow = document.createElement("div");
    botRow.className = "msg-row bot";
    botRow.innerHTML = `
      <div class="avatar-bot">V</div>
      <div class="msg-bubble">
        <div class="msg-author">VEKTRA IA // VICE CORE</div>
        <div class="msg-text">${data.reply || data.error}</div>
      </div>
    `;
    chatBox.appendChild(botRow);
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    indicator.style.display = "none";
    const errRow = document.createElement("div");
    errRow.className = "msg-row bot";
    errRow.innerHTML = `
      <div class="avatar-bot">V</div>
      <div class="msg-bubble">
        <div class="msg-author">SYSTEM ERROR</div>
        <div class="msg-text">Erreur de connexion au noyau.</div>
      </div>
    `;
    chatBox.appendChild(errRow);
  }
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}