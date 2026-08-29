let currentUser = JSON.parse(localStorage.getItem('edc_current_user')) || null;
let selectedAvatar = '🏴‍☠️';
let currentModel = 'EDC-Core v1';
let conversations = JSON.parse(localStorage.getItem('edc_conversations')) || [{ id: 1, title: 'Discussion #1', messages: [] }];
let activeConvId = conversations.length > 0 ? conversations[0].id : null;

function selectAvatar(emoji, element) {
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedAvatar = emoji;
}

function handleAuth() {
    const pseudo = document.getElementById('pseudoInput').value.trim();
    const pass = document.getElementById('passwordInput').value.trim();

    if (!pseudo || !pass) {
        alert("Entre un pseudo et un mot de passe valide !");
        return;
    }

    currentUser = { pseudo, avatar: selectedAvatar, pass };
    localStorage.setItem('edc_current_user', JSON.stringify(currentUser));
    
    updateHeaderUser();
    document.getElementById('authModal').style.display = 'none';
}

function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function updateHeaderUser() {
    if (currentUser) {
        document.getElementById('userAvatarHeader').innerText = currentUser.avatar;
        document.getElementById('userPseudoHeader').innerText = currentUser.pseudo;
    }
}

if (currentUser) {
    document.getElementById('authModal').style.display = 'none';
    updateHeaderUser();
}

function switchModel(modelName, element) {
    if (modelName.includes('ULTIMATE')) {
        document.getElementById('ultimateModal').style.display = 'flex';
        return;
    }
    document.querySelectorAll('.model-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    currentModel = modelName;
    setMascotExpression('curieux', 'Mode ' + modelName + ' activé !');
}

function closeUltimateModal() {
    document.getElementById('ultimateModal').style.display = 'none';
}

function verifyAccessCode() {
    const code = document.getElementById('accessCodeInput').value.trim();
    if (code === 'EDC-BETA-ULTIMATE') {
        alert('Accès Ultimate déverrouillé avec succès !');
        closeUltimateModal();
    } else {
        alert('Code invalide ! Ouvre un ticket Discord.');
    }
}

function renderConversations() {
    const list = document.getElementById('convList');
    list.innerHTML = '';
    conversations.forEach(conv => {
        const div = document.createElement('div');
        div.className = `conv-item ${conv.id === activeConvId ? 'active' : ''}`;
        div.innerText = conv.title;
        div.onclick = () => switchConversation(conv.id);
        list.appendChild(div);
    });
}

function createNewChat() {
    if (!currentUser) {
        alert("Tu dois te connecter pour créer une discussion !");
        openAuthModal();
        return;
    }

    if (conversations.length >= 5) {
        alert("Réservé à la version ULTIMATE : Limite de 5 discussions simultanées atteinte !");
        document.getElementById('ultimateModal').style.display = 'flex';
        return;
    }

    const newId = Date.now();
    const newConv = {
        id: newId,
        title: `Discussion #${conversations.length + 1}`,
        messages: [{ sender: 'ai', text: 'Nouvelle session initialisée. Que veux-tu faire ?' }]
    };

    conversations.unshift(newConv);
    activeConvId = newId;
    saveAndRender();
    setMascotExpression('enerve', 'Nouvelle game, on lâche rien !');
}

function switchConversation(id) {
    activeConvId = id;
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('edc_conversations', JSON.stringify(conversations));
    renderConversations();
    loadCurrentMessages();
}

function loadCurrentMessages() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
    const currentConv = conversations.find(c => c.id === activeConvId);
    if (currentConv && currentConv.messages) {
        currentConv.messages.forEach(m => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${m.sender}`;
            msgDiv.innerText = m.text;
            container.appendChild(msgDiv);
        });
    }
    container.scrollTop = container.scrollHeight;
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

function sendMessage() {
    if (!currentUser) {
        alert("Impossible d'utiliser le chatbot sans compte ! Connecte-toi.");
        openAuthModal();
        return;
    }

    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    let currentConv = conversations.find(c => c.id === activeConvId);
    if (!currentConv) {
        createNewChat();
        currentConv = conversations[0];
    }

    currentConv.messages.push({ sender: 'user', text: text });
    if (currentConv.title.startsWith('Discussion #')) {
        currentConv.title = text.substring(0, 20) + '...';
    }
    input.value = '';
    saveAndRender();

    setMascotExpression('curieux', 'Analyse en cours...');

    setTimeout(() => {
        const aiResponses = [
            "C'est noté mon reuf, le système traite ta demande avec une précision chirurgicale.",
            "J'ai vérifié les bases de données EDC, tout est ok sur le front.",
            "Bien reçu ! Regarde les voyants lumineux, le noyau tourne à plein régime.",
            "Excellent choix de sujet. On gère ça direct !"
        ];
        const randomReply = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        
        currentConv.messages.push({ sender: 'ai', text: randomReply });
        saveAndRender();
        setMascotExpression('emervaiiller', 'Propre, ça tourne nickel !');
    }, 800);
}

function setMascotExpression(mood, speechText) {
    const avatar = document.getElementById('mascotAvatar');
    const speech = document.getElementById('mascotSpeech');
    speech.innerText = speechText;

    switch(mood) {
        case 'enerve': avatar.innerText = '🏴‍☠️💢'; break;
        case 'curieux': avatar.innerText = '🏴‍☠️🔍'; break;
        case 'posee': avatar.innerText = '🏴‍☠️😎'; break;
        case 'ennuyer': avatar.innerText = '🏴‍☠️🥱'; break;
        case 'emervaiiller': avatar.innerText = '🏴‍☠️✨'; break;
        default: avatar.innerText = '🏴‍☠️';
    }
}

if (conversations.length === 0) {
    createNewChat();
} else {
    renderConversations();
    loadCurrentMessages();
}