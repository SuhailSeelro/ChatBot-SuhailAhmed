// 1. CONFIGURATION
// Replace the string below with your actual API key from Google AI Studio
const API_KEY = "AIzaSyAVYgK5cVRs6meJmVdLfHwPPJqkw2N1bbA"; 

// Using v1beta as it currently has the widest support for 1.5 models
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let isTyping = false;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    if (!API_KEY || API_KEY === "PASTE_YOUR_NEW_API_KEY_HERE") {
        statusText.textContent = "API Key Missing";
        showToast("Please enter your API key", "warning");
    } else {
        statusDot.className = "status-dot online";
        statusText.textContent = "Gemini Ready";
    }
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    const sendBtn = document.getElementById('send-btn');
    
    if (!message || isTyping) return;

    input.value = '';
    input.style.height = 'auto';
    addMessage('user', message);
    showTyping(true);
    sendBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`${data.error.message} (Code: ${data.error.code})`);
        }

        if (data.candidates && data.candidates[0].content) {
            const botReply = data.candidates[0].content.parts[0].text;
            addMessage('bot', botReply);
        } else {
            addMessage('bot', "_Response blocked by safety filters or empty response._");
        }

    } catch (error) {
        console.error("API Error:", error);
        addMessage('bot', `**System Error:** ${error.message}`);
        showToast("Request Failed", "error");
    } finally {
        showTyping(false);
        sendBtn.disabled = false;
    }
}

// --- UI HELPERS ---

function addMessage(sender, content) {
    const container = document.getElementById('messages');
    const welcome = document.querySelector('.welcome');
    if (welcome) welcome.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    msgDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${formatText(content)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function formatText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

function showTyping(show) {
    isTyping = show;
    document.getElementById('typing-indicator').classList.toggle('active', show);
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function quickQuestion(txt) {
    document.getElementById('user-input').value = txt;
    sendMessage();
}

function newChat() {
    if (confirm("Reset conversation?")) location.reload();
}

function showToast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast show ${type}`;
    setTimeout(() => t.classList.remove('show'), 3000);
}