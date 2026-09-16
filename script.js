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
  const bootEl   = document.getElementById("boot");
  const logEl    = document.getElementById("boot-log");
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
const appEl      = document.getElementById("app");
const threadEl   = document.getElementById("thread");
const formEl     = document.getElementById("composer-form");
const inputEl    = document.getElementById("composer-input");
const sendBtn    = formEl.querySelector(".send-btn");
const faceEl     = document.getElementById("portrait-face");
const chipsEl    = document.getElementById("chips");

/* ---------- Sprite mouth control ----------
   .talking triggers the CSS steps() animation that cycles
   through the 3 stacked frames (closed / mid / open).
   Removing the class snaps straight back to frame 0 (closed). */
function setTalking(isTalking){
  faceEl.classList.toggle("talking", isTalking);
}

/* ---------- Message rendering ---------- */
function addUserMessage(text){
  const msg = document.createElement("div");
  msg.className = "msg user";
  msg.innerHTML = `<span class="msg-label">VOUS</span><div class="msg-bubble"></div>`;
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
async function getDelamainReply(userText){
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userText })
    });

    if (!response.ok) {
      throw new Error("Erreur de communication avec le noyau Delamain.");
    }

    const data = await response.json();
    // Ajuste selon la structure JSON renvoyée par ton backend (ex: data.reply ou data.message)
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

  if (!appEl.classList.contains("active")) appEl.classList.add("active");

  addUserMessage(clean);
  inputEl.value = "";
  sendBtn.disabled = true;

  // Récupération de la vraie réponse de l'API
  const reply = await getDelamainReply(clean);
  const target = addAiMessagePlaceholder();

  // brief "thinking" pause before Delamain starts speaking
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