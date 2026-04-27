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

// Variables
const backendURL = 'http://localhost:5000/chat';
let currentChatId = null;

// --- 1. SIDEBAR & MEMORY LOGIC ---

// Toggle sidebar
if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
    });
}

// Load sidebar chats
async function loadSidebarChats() {
    try {
        const res = await fetch('http://localhost:5000/chats');
        const chats = await res.json();
        chatList.innerHTML = '';
        chats.forEach(chat => {
            const li = document.createElement('li');
            li.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
            li.textContent = chat.title || 'New Conversation';
            li.onclick = () => loadChatHistory(chat.id);
            chatList.appendChild(li);
        });
    } catch (e) {
        console.error("Failed to load sidebar chats", e);
    }
}

// Load a specific chat history
async function loadChatHistory(chatId) {
    try {
        currentChatId = chatId;
        const res = await fetch(`http://localhost:5000/chats/${chatId}`);
        const messages = await res.json();
        
        chatBox.innerHTML = ''; // Clear current screen
        
        if (messages.length === 0) {
            addMessageToUI("Hello! How can I help you today?", "bot");
        } else {
            messages.forEach(msg => {
                addMessageToUI(msg.content, msg.role);
            });
        }
        
        loadSidebarChats(); // Refresh active styling
    } catch (e) {
        console.error("Failed to load chat history", e);
    }
}

// Create new chat
async function createNewChat() {
    try {
        const res = await fetch('http://localhost:5000/chats/new', { method: 'POST' });
        const data = await res.json();
        currentChatId = data.chat_id;
        
        chatBox.innerHTML = ''; // Clear current chat
        addMessageToUI("Hello! How can I help you today?", "bot");
        loadSidebarChats();
    } catch (e) {
        console.error("Failed to create new chat", e);
    }
}

if (newChatBtn) {
    newChatBtn.addEventListener('click', createNewChat);
}


// --- 2. SEND MESSAGE ---
async function sendMessage(isVoice = false) {
    if (!currentChatId) {
        alert("Please create a new chat first!");
        return;
    }

    const text = messageInput.value.trim();
    if (text === '') return;

    // Display user message instantly
    addMessageToUI(text, 'user');
    messageInput.value = '';

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        // Call backend API
        const response = await fetch(backendURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text, chat_id: currentChatId })
        });

        const data = await response.json();

        // Remove typing indicator when response arrives
        removeElement(typingId);

        // --- 3. HANDLE RESPONSE ---
        // Display bot reply
        addMessageToUI(data.reply, 'bot');
        
        // Refresh sidebar to update titles if this was the first message
        loadSidebarChats();

        // Speak bot response automatically only if input was voice
        if (isVoice === true) {
            speakText(data.reply);
        }

    } catch (error) {
        console.error("Error communicating with backend:", error);
        removeElement(typingId);
        addMessageToUI("Sorry, I couldn't connect to the server.", 'bot');
    }
}

// Helper to prevent XSS when inserting HTML
function escapeHTML(str) {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

// Add message to the chat interface dynamically
function addMessageToUI(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    
    let innerHTML = '';
    if (sender === 'bot') {
        innerHTML += '<div class="avatar"><img src="baymax.png" alt="Bot Avatar"></div>';
    }
    innerHTML += `<div class="message-content">${escapeHTML(text)}</div>`;
    
    messageElement.innerHTML = innerHTML;
    
    chatBox.appendChild(messageElement);
    
    // Auto-scroll to latest message smoothly
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

// --- 4. TYPING INDICATOR ---
function showTypingIndicator() {
    const typingElement = document.createElement('div');
    const uniqueId = 'typing-' + Date.now();
    typingElement.id = uniqueId;
    typingElement.classList.add('message', 'bot-message', 'typing');
    typingElement.innerHTML = `
        <div class="avatar"><img src="baymax.png" alt="Bot Avatar"></div>
        <div class="message-content">AI is typing...</div>
    `;
    
    chatBox.appendChild(typingElement);
    
    // Smooth scroll down to show the indicator
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    
    return uniqueId;
}

// Helper to remove an element by ID
function removeElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// --- VOICE FEATURES ---

// 🎤 VOICE INPUT: Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop listening automatically when user stops speaking
    
    recognition.onresult = function(event) {
        // Convert speech to text
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        
        // Auto-send message
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
            alert("Network Error: Your browser couldn't connect to its speech recognition servers. This is often caused by a VPN, firewall, or using a browser without built-in speech services.");
            messageInput.placeholder = "Message AI Assistant...";
        } else {
            alert("Microphone error: " + event.error);
            messageInput.placeholder = "Message AI Assistant...";
        }
    };
}

// Start listening on mic click
if (micButton) {
    micButton.addEventListener('click', () => {
        // Stop any ongoing AI speech when the user starts the mic
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        if (recognition) {
            if (isListening) {
                recognition.stop(); // Stop if already listening
            } else {
                try {
                    recognition.start(); // Start if not listening
                } catch(e) {
                    console.log("Recognition already started.");
                }
            }
        } else {
            alert("Speech recognition is not supported in your browser.");
        }
    });
}

// 🔊 VOICE OUTPUT: speechSynthesis
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any currently playing speech before starting new one
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

// --- EVENT LISTENERS ---

// Send on button click
if (sendButton) {
    sendButton.addEventListener('click', () => sendMessage(false));
}

// Send on 'Enter' key press
if (messageInput) {
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage(false);
        }
    });
}

// --- STARTUP PAGE LOGIC ---

if (startChatBtn && startupPage && mainLayout) {
    startChatBtn.addEventListener('click', async () => {
        // Hide the startup page with a fade out effect
        startupPage.style.opacity = '0';
        startupPage.style.transition = 'opacity 0.5s ease';
        
        // Ensure a chat exists
        await createNewChat();
        
        setTimeout(() => {
            startupPage.style.display = 'none';
            // Show the main app layout
            mainLayout.style.display = 'flex';
        }, 500); // Wait for the fade out to finish
    });
}
