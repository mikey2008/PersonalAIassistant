// DOM Elements
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const micButton = document.getElementById('mic-button');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chatList = document.getElementById('chat-list');
const startupPage = document.getElementById('startup-page');
const mainLayout = document.getElementById('main-layout');
const startChatBtn = document.getElementById('start-chat-btn');
const logoutBtn = document.getElementById('logout-btn');

// Auth DOM Elements
const authPage = document.getElementById('auth-page');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const authMessage = document.getElementById('auth-message');

// API Config
const CLIENT_API_KEY = 'jarvis-local-secret-2024';
const baseURL = window.location.origin; // Explicit origin for mobile reliability
const clearAllBtn = document.getElementById('clear-all-btn');
const personaSelect = document.getElementById('persona-select');
const customPersonaBox = document.getElementById('custom-persona-box');
const customPersonaDesc = document.getElementById('custom-persona-desc');
const customPersonaName = document.getElementById('custom-persona-name');
const customAvatarInput = document.getElementById('custom-avatar-input');
const saveCustomPersonaBtn = document.getElementById('save-custom-persona-btn');
const appHeaderTitle = document.getElementById('app-header-title');

let currentBotName = "AI Assistant";
let currentBotAvatar = "baymax.png";

const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CLIENT_API_KEY}`
};

const PERSONA_AVATARS = {
    "Friendly Assistant": "baymax.png",
    "Professional & Concise": "avatars/professional.jpg",
    "JARVIS (Iron Man)": "avatars/jarvis.jpg",
    "Sarcastic & Witty": "avatars/sarcastic.jpg",
    "Pirate Captain": "avatars/pirate.jpg",
    "Samay": "avatars/samay.jpg"
};

function getPersonaAvatar(persona) {
    return PERSONA_AVATARS[persona] || "baymax.png";
}
const fetchOptions = {
    headers: authHeaders,
    credentials: 'include'
};

let currentChatId = null;
let isCreatingChat = false;

// --- 0. INITIALIZATION & AUTH FLOW ---

async function checkSession() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('token');

        if (resetToken) {
            authPage.style.display = 'flex';
            loginForm.style.display = 'none';
            resetPasswordForm.style.display = 'block';
            return;
        }

        const res = await fetch(`${baseURL}/session-status`, fetchOptions);
        const data = await res.json();
        
        if (data.authenticated) {
            authPage.style.display = 'none';
            startupPage.style.display = 'flex';
            loadPersona(); // Load user persona after auth
        } else {
            authPage.style.display = 'flex';
            startupPage.style.display = 'none';
        }
    } catch (e) {
        console.error("Session check failed", e);
        authPage.style.display = 'flex';
    }
}

function showAuthMessage(msg, isError=false) {
    authMessage.textContent = msg;
    authMessage.style.color = isError ? '#ff4444' : '#4CAF50';
}

function switchForm(hideId, showId) {
    document.getElementById(hideId).style.display = 'none';
    document.getElementById(showId).style.display = 'block';
    authMessage.textContent = '';
}

// Form Toggles
document.getElementById('show-register')?.addEventListener('click', (e) => { e.preventDefault(); switchForm('login-form', 'register-form'); });
document.getElementById('show-login')?.addEventListener('click', (e) => { e.preventDefault(); switchForm('register-form', 'login-form'); });
document.getElementById('show-forgot-password')?.addEventListener('click', (e) => { e.preventDefault(); switchForm('login-form', 'forgot-password-form'); });
document.getElementById('show-login-from-forgot')?.addEventListener('click', (e) => { e.preventDefault(); switchForm('forgot-password-form', 'login-form'); });
// Guest Login
const guestLoginBtn = document.getElementById('guest-login-btn');
guestLoginBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${baseURL}/auth/guest-login`, {
            method: 'POST',
            headers: authHeaders,
            credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        authPage.style.display = 'none';
        startupPage.style.display = 'flex';
    } catch (err) {
        showAuthMessage(err.message, true);
    }
});

// Login
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const res = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: authHeaders,
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        authPage.style.display = 'none';
        startupPage.style.display = 'flex';
        loginForm.reset();
    } catch (err) {
        showAuthMessage(err.message, true);
    }
});

// Register
registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
        const res = await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: authHeaders,
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showAuthMessage(data.message);
        registerForm.reset();
    } catch (err) {
        showAuthMessage(err.message, true);
    }
});

// Forgot Password
forgotPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    try {
        const res = await fetch(`${baseURL}/auth/forgot-password`, {
            method: 'POST',
            headers: authHeaders,
            credentials: 'include',
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showAuthMessage(data.message);
        forgotPasswordForm.reset();
    } catch (err) {
        showAuthMessage(err.message, true);
    }
});

// Reset Password
resetPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('reset-password').value;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    try {
        const res = await fetch(`${baseURL}/auth/reset-password/${token}`, {
            method: 'POST',
            headers: authHeaders,
            credentials: 'include',
            body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showAuthMessage(data.message);
        resetPasswordForm.reset();
        setTimeout(() => {
            window.location.href = window.location.pathname; // Remove token from URL
        }, 2000);
    } catch (err) {
        showAuthMessage(err.message, true);
    }
});

// Logout
logoutBtn?.addEventListener('click', async () => {
    try {
        await fetch(`${baseURL}/auth/logout`, { method: 'POST', headers: authHeaders, credentials: 'include' });
        mainLayout.style.display = 'none';
        authPage.style.display = 'flex';
        chatBox.innerHTML = '';
        currentChatId = null;
    } catch (err) {
        console.error("Logout failed", err);
    }
});

// Initialize
checkSession();

async function loadPersona() {
    if (!personaSelect) return;
    try {
        const res = await fetch(`${baseURL}/persona`, fetchOptions);
        const data = await res.json();
        if (data.persona) {
            personaSelect.value = data.persona;
            if (data.persona === 'Custom') {
                customPersonaBox.style.display = 'block';
                if (data.custom_name) {
                    currentBotName = data.custom_name;
                    appHeaderTitle.textContent = currentBotName;
                }
                if (data.avatar_data) {
                    currentBotAvatar = data.avatar_data;
                }
            } else {
                if (data.persona === 'Friendly Assistant') {
                    currentBotName = 'AI Assistant';
                } else if (data.persona === 'Sarcastic & Witty') {
                    currentBotName = 'Daya Ben';
                } else {
                    currentBotName = data.persona;
                }
                appHeaderTitle.textContent = currentBotName;
                currentBotAvatar = getPersonaAvatar(data.persona);
            }
        }
        if (data.custom_description) {
            customPersonaDesc.value = data.custom_description;
        }
        if (data.custom_name) {
            customPersonaName.value = data.custom_name;
        }
    } catch (e) {
        console.error("Load persona failed", e);
    }
}

if (personaSelect) {
    personaSelect.addEventListener('change', async () => {
        const newPersona = personaSelect.value;
        if (newPersona === 'Custom') {
            customPersonaBox.style.display = 'block';
            if (customPersonaName.value) {
                currentBotName = customPersonaName.value;
                appHeaderTitle.textContent = currentBotName;
            }
        } else {
            customPersonaBox.style.display = 'none';
            if (newPersona === 'Friendly Assistant') {
                currentBotName = 'AI Assistant';
            } else if (newPersona === 'Sarcastic & Witty') {
                currentBotName = 'Daya Ben';
            } else {
                currentBotName = newPersona;
            }
            appHeaderTitle.textContent = currentBotName;
            currentBotAvatar = getPersonaAvatar(newPersona);
            
            // Clear current chat to reflect persona change visually
            chatBox.innerHTML = '';
            addMessageToUI(`Hello! I am now in ${newPersona} mode. How can I help you?`, "bot");
        }
        
        try {
            await fetch(`${baseURL}/persona`, {
                method: 'POST',
                ...fetchOptions,
                body: JSON.stringify({ persona: newPersona })
            });
        } catch (e) {
            console.error("Update persona failed", e);
        }
    });
}

if (saveCustomPersonaBtn) {
    saveCustomPersonaBtn.addEventListener('click', async () => {
        const desc = customPersonaDesc.value;
        const name = customPersonaName.value;
        const file = customAvatarInput.files[0];
        
        saveCustomPersonaBtn.textContent = 'Saving...';
        
        let avatarBase64 = null;
        if (file) {
            avatarBase64 = await toBase64(file);
        }

        try {
            const body = { 
                custom_description: desc,
                custom_name: name
            };
            if (avatarBase64) body.avatar_data = avatarBase64;

            await fetch(`${baseURL}/persona`, {
                method: 'POST',
                ...fetchOptions,
                body: JSON.stringify(body)
            });
            
            if (name) {
                currentBotName = name;
                appHeaderTitle.textContent = currentBotName;
            }
            if (avatarBase64) {
                currentBotAvatar = avatarBase64;
            }

            saveCustomPersonaBtn.textContent = 'Saved Identity!';
            setTimeout(() => { saveCustomPersonaBtn.textContent = 'Save Identity'; }, 2000);
        } catch (e) {
            console.error("Save custom persona failed", e);
            saveCustomPersonaBtn.textContent = 'Error';
        }
    });
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


// --- 1. SIDEBAR TOGGLE ---
if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
    });
}

async function loadSidebarChats() {
    try {
        const res = await fetch(`${baseURL}/chats`, fetchOptions);
        if(res.status === 401) { window.location.reload(); return; }
        const data = await res.json();
        if (!res.ok) {
            console.error("Load chats error:", data.error);
            return;
        }
        const chats = Array.isArray(data) ? data : [];
        chatList.innerHTML = '';
        chats.forEach(chat => {
            const li = document.createElement('li');
            li.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
            
            li.innerHTML = `
                <span class="chat-title">${escapeHTML(chat.title || 'New Conversation')}</span>
                <button class="delete-chat-btn" title="Delete Chat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            
            // Handle clicking the chat item (load history)
            li.onclick = () => {
                loadChatHistory(chat.id);
            };
            
            // Handle clicking the delete button
            li.querySelector('.delete-chat-btn').onclick = (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            };

            chatList.appendChild(li);
        });
    } catch (e) {
        console.error("Failed to load sidebar chats", e);
    }
}

async function deleteChat(chatId) {
    const confirmed = await showConfirm("Delete Chat?", "Are you sure you want to delete this chat?");
    if (!confirmed) return;
    try {
        const res = await fetch(`${baseURL}/chats/${chatId}`, { method: 'DELETE', ...fetchOptions });
        if (res.status === 401) { window.location.reload(); return; }
        
        if (currentChatId === chatId) {
            currentChatId = null;
            chatBox.innerHTML = '';
            addMessageToUI("Hello! How can I help you today?", "bot");
        }
        loadSidebarChats();
    } catch (e) {
        console.error("Delete failed", e);
    }
}

async function clearAllChats() {
    const confirmed = await showConfirm("Clear All?", "Are you sure you want to delete ALL chats? This cannot be undone.");
    if (!confirmed) return;
    try {
        const res = await fetch(`${baseURL}/chats/clear-all`, { method: 'DELETE', ...fetchOptions });
        if (res.status === 401) { window.location.reload(); return; }
        
        currentChatId = null;
        chatBox.innerHTML = '';
        addMessageToUI("Hello! How can I help you today?", "bot");
        loadSidebarChats();
    } catch (e) {
        console.error("Clear all failed", e);
    }
}

if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllChats);
}

async function loadChatHistory(chatId) {
    try {
        currentChatId = chatId;
        const res = await fetch(`${baseURL}/chats/${chatId}`, fetchOptions);
        if(res.status === 401) { window.location.reload(); return; }
        const data = await res.json();
        if (!res.ok) {
            console.error("Load history error:", data.error);
            if (res.status === 404) {
                // If chat not found, reset currentChatId and refresh sidebar
                currentChatId = null;
                chatBox.innerHTML = '';
                addMessageToUI("Hello! How can I help you today?", "bot");
                loadSidebarChats();
            }
            return;
        }
        const messages = Array.isArray(data) ? data : [];
        
        chatBox.innerHTML = '';
        
        if (messages.length === 0) {
            addMessageToUI("Hello! How can I help you today?", "bot");
        } else {
            messages.forEach(msg => {
                addMessageToUI(msg.content, msg.role);
            });
        }
        
        loadSidebarChats();
    } catch (e) {
        console.error("Failed to load chat history", e);
    }
}

async function createNewChat() {
    if (isCreatingChat) return null;
    isCreatingChat = true;
    try {
        const res = await fetch(`${baseURL}/chats/new`, { method: 'POST', ...fetchOptions });
        if (res.status === 401) { window.location.reload(); return null; }
        const data = await res.json();
        if (!data.chat_id) throw new Error('No chat_id returned');

        currentChatId = data.chat_id;

        // Clear the chat area and show a fresh greeting
        chatBox.innerHTML = '';
        addMessageToUI("Hello! How can I help you today?", "bot");

        // Refresh sidebar to show the new (empty) chat
        await loadSidebarChats();

        return data.chat_id;
    } catch (e) {
        console.error("Failed to create new chat", e);
        return null;
    } finally {
        isCreatingChat = false;
    }
}

if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
        createNewChat();
    });
}

// --- 2. SEND MESSAGE ---
async function sendMessage(isVoice = false) {
    const text = messageInput.value.trim();
    if (text === '') return;

    // If no chat is active (e.g. user types on home screen), auto-create one first
    if (!currentChatId) {
        const newId = await createNewChat();
        if (!newId) {
            addMessageToUI("Couldn't start a chat. Is the server running?", 'bot');
            return;
        }
    }

    addMessageToUI(text, 'user');
    messageInput.value = '';

    const typingId = showTypingIndicator();

    try {
        let response;
        let attempts = 0;
        const maxAttempts = 2;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for cold starts

        while (attempts < maxAttempts) {
            try {
                response = await fetch(`${baseURL}/chat`, {
                    method: 'POST',
                    ...fetchOptions,
                    signal: controller.signal,
                    body: JSON.stringify({ message: text, chat_id: currentChatId })
                });
                if (response.ok || response.status === 401) break;
            } catch (err) {
                attempts++;
                if (err.name === 'AbortError') break;
                if (attempts >= maxAttempts) throw err;
                await new Promise(r => setTimeout(r, 1000));
            }
        }
        clearTimeout(timeoutId);

        if (response.status === 401) { window.location.reload(); return; }
        const data = await response.json();

        removeElement(typingId);
        
        if (!response.ok || data.error) {
            if (response.status === 404) {
                // Chat was lost (e.g. server restart/session cleared)
                currentChatId = null;
                // Try sending again (it will auto-create a new chat)
                return sendMessage(isVoice);
            }
            addMessageToUI(data.error || "An error occurred.", 'bot');
            return;
        }

        addMessageToUI(data.reply, 'bot');
        loadSidebarChats(); // Refresh sidebar (updates title after first message)

        if (isVoice === true) {
            speakText(data.reply);
        }

    } catch (error) {
        console.error("Error communicating with backend:", error);
        removeElement(typingId);
        addMessageToUI("Sorry, I couldn't connect to the server.", 'bot');
    }
}

function escapeHTML(str) {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

function addMessageToUI(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    
    let innerHTML = '';
    if (sender === 'bot') {
        innerHTML += `<div class="avatar"><img src="${currentBotAvatar}" alt="Bot Avatar"></div>`;
    }
    innerHTML += `<div class="message-content">${escapeHTML(text)}</div>`;
    
    messageElement.innerHTML = innerHTML;
    chatBox.appendChild(messageElement);
    
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

function showTypingIndicator() {
    const typingElement = document.createElement('div');
    const uniqueId = 'typing-' + Date.now();
    typingElement.id = uniqueId;
    typingElement.classList.add('message', 'bot-message', 'typing');
    typingElement.innerHTML = `
        <div class="avatar"><img src="${currentBotAvatar}" alt="Bot Avatar"></div>
        <div class="message-content">AI is typing...</div>
    `;
    
    chatBox.appendChild(typingElement);
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    
    return uniqueId;
}

function removeElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// --- VOICE FEATURES ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        sendMessage(true);
    };

    recognition.onstart = function() {
        isListening = true;
        micButton.classList.add('listening');
        messageInput.placeholder = "Listening...";
    };

    recognition.onend = function() {
        isListening = false;
        micButton.classList.remove('listening');
        messageInput.placeholder = "Message AI Assistant...";
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
        isListening = false;
        micButton.classList.remove('listening');
        
        if (event.error === 'no-speech') {
            messageInput.placeholder = "Didn't hear anything. Try again.";
            setTimeout(() => {
                if (messageInput.placeholder === "Didn't hear anything. Try again.") {
                    messageInput.placeholder = "Message AI Assistant...";
                }
            }, 3000);
        } else if (event.error === 'network') {
            alert("Network Error: browser speech services offline.");
            messageInput.placeholder = "Message AI Assistant...";
        } else {
            alert("Microphone error: " + event.error);
            messageInput.placeholder = "Message AI Assistant...";
        }
    };
}

if (micButton) {
    micButton.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (recognition) {
            if (isListening) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                } catch(e) {
                    console.log("Recognition already started.");
                }
            }
        } else {
            alert("Speech recognition is not supported in your browser.");
        }
    });
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US';
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    } else {
        console.warn("Text-to-speech is not supported in your browser.");
    }
}
function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        titleEl.textContent = title;
        messageEl.textContent = message;
        
        modal.style.display = 'flex';
        // Force reflow
        modal.offsetHeight;
        modal.classList.add('active');

        const cleanup = (val) => {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
            resolve(val);
        };

        confirmBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
        
        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) cleanup(false);
        };
    });
}

// --- EVENT LISTENERS ---
if (sendButton) {
    sendButton.addEventListener('click', () => sendMessage(false));
}

if (messageInput) {
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage(false);
        }
    });
}

// --- STARTUP PAGE LOGIC ---
if (startChatBtn && startupPage && mainLayout) {
    startChatBtn.addEventListener('click', () => {
        // Instant Switch
        startupPage.style.display = 'none';
        mainLayout.style.display = 'flex';
        
        // Background work
        loadSidebarChats().then(() => {
            if (chatList.children.length === 0) {
                createNewChat();
            } else if (!currentChatId) {
                const firstChat = chatList.querySelector('.chat-item');
                if (firstChat) firstChat.click();
            }
        });
    });
}

// Background Wake-up (Pre-warm server)
fetch(`${baseURL}/session-status`, fetchOptions).catch(() => {});
