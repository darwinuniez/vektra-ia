function enterSystem() {
  document.getElementById("start-screen").style.display = "none";
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("bg-globe"), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.SphereGeometry(3, 24, 24);
const material = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.3 });
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);
camera.position.z = 6;

function animate() {
  requestAnimationFrame(animate);
  globe.rotation.y += 0.003;
  globe.rotation.x += 0.001;
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updatePolygonMatrix && camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  const userDiv = document.createElement("div");
  userDiv.className = "message user";
  userDiv.innerHTML = `<div class="msg-author">USER</div><div class="msg-content">${escapeHtml(message)}</div>`;
  chatBox.appendChild(userDiv);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    const botDiv = document.createElement("div");
    botDiv.className = "message bot";
    botDiv.innerHTML = `<div class="msg-author">VEKTRA_AI</div><div class="msg-content">${data.reply || data.error}</div>`;
    chatBox.appendChild(botDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    const errDiv = document.createElement("div");
    errDiv.className = "message bot";
    errDiv.innerHTML = `<div class="msg-author">SYSTEM_ERROR</div><div class="msg-content">Erreur de connexion au noyau.</div>`;
    chatBox.appendChild(errDiv);
  }
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
