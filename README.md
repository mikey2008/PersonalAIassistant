# 🤖 JARVIS — Humanized AI Assistant

A minimal, human-like AI chatbot powered by **Google Gemini**, built with a Python Flask backend and a clean, dark-mode frontend. Features voice input/output, long-term memory via SQLite, and a chat history sidebar.

---

## ✨ Features

- 💬 **Human-like responses** — Short, friendly, emotionally aware replies via Gemini 2.5 Flash
- 🧠 **Long-term memory** — Conversations saved to a local SQLite database
- 📂 **Chat history sidebar** — Browse, switch, and resume past conversations
- 🎤 **Voice input** — Speak your message using the Web Speech API
- 🔊 **Voice output** — AI speaks its responses back (on voice-triggered messages)
- 🎙️ **Mic toggle** — Click again to stop listening
- 🛡️ **Secure** — API keys only on the server, never in the frontend
- 🌙 **Dark mode UI** — Minimalist, centered design inspired by ChatGPT & Gemini

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- Google Chrome or Microsoft Edge (for voice features)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/JARVIS.git
cd JARVIS
```

### 2. Create a Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Open .env and add your key
GEMINI_API_KEY=your_actual_key_here
```

### 5. Run the Backend
```bash
python app.py
```
> Flask server starts at `http://localhost:5000`

### 6. Open the Frontend
Open a new terminal and run:
```bash
python -m http.server 8080
```
Then open **`http://localhost:8080`** in your browser.

---

## 🏗️ Project Structure

```
JARVIS/
├── app.py              # Flask backend — API, Gemini integration, SQLite DB
├── index.html          # Frontend UI
├── style.css           # Styling (dark mode, animations)
├── script.js           # Frontend logic, voice features, sidebar
├── baymax.png          # Avatar image
├── requirements.txt    # Python dependencies
├── .env.example        # Template for environment variables
├── .gitignore          # Excludes secrets & generated files
└── README.md
```

---

## 🔒 Security

- The `GEMINI_API_KEY` is stored **only** in `.env` (never in frontend code)
- `.env` and `database.db` are listed in `.gitignore` and will never be committed
- All user inputs are validated and sanitized on the server
- The system prompt is fully hidden from users and is injection-resistant

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-CORS |
| AI Model | Google Gemini 2.5 Flash |
| Database | SQLite (built-in Python) |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Voice | Web Speech API (browser-native) |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
