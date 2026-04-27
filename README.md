# JARVIS AI Assistant 🤖

A sleek, modern, and secure AI chatbot interface inspired by ChatGPT and Gemini. Built with a Flask backend and a premium Vanilla JS/CSS frontend.

## ✨ Features
- **Modern UI**: Clean dark-mode design with a responsive 8px grid system.
- **Session Support**: Multi-user support with guest login and email registration.
- **Chat Management**: Create multiple conversations, rename them, and delete history.
- **Secure Architecture**: 
  - API Key protection for internal endpoints.
  - SQLite database with WAL mode for speed.
  - Input sanitization and security logging.
  - CSRF/XSS protection via Flask-Talisman.
- **Voice Support**: Integrated speech-to-text and text-to-speech.

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- A Google Gemini API Key ([Get one here](https://aistudio.google.dev/))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/JARVIS.git
   cd JARVIS
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   CLIENT_API_KEY=jarvis-local-secret-2024
   FLASK_SECRET_KEY=your_random_secret_string
   FLASK_ENV=development
   ```

### Running the App
```bash
python app.py
```
Open your browser to `http://localhost:5000`.

## 🛠️ Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python, Flask
- **Database**: SQLite3
- **AI**: Google Gemini API (2.0-flash / 1.5-flash)

## 📄 License
MIT License. Feel free to use and modify!
