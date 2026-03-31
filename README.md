# Focus Plus ✨ — React Dashboard

AI-powered focus & productivity dashboard built with React + Vite.

## Features
- 🎯 **MediaPipe Attention Detection** — Real-time face tracking & focus scoring
- 📝 **Session Notes** — Auto-saving notepad with export
- 🤖 **Bot Professor** — Upload .txt files and ask questions (Gemini AI supported)
- 📊 **Analytics** — Saved session reports with focus metrics
- ⏱️ **Focus Timer** — Configurable countdown with camera integration
- 📋 **Task Scheduler** — Per-user task management
- 🎨 **4 Themes** — Ocean, Sunset, Nature, Dark
- 🔐 **Auth** — Secure login/signup with SHA-256 password hashing (localStorage)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Optional: Gemini AI for Bot Professor

```bash
cp .env.example .env
# Edit .env and set VITE_GEMINI_KEY=your_key_here
# Get a free key at https://aistudio.google.com/app/apikey
```

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    AuthPage.jsx          # Login & signup
    Dashboard.jsx         # Main layout grid
    panels/
      NotesPanel.jsx      # Session notes
      StudyPanel.jsx      # Camera + timer + stats
      BotProfessor.jsx    # AI document Q&A
      Analytics.jsx       # Saved session reports
      ProfilePanel.jsx    # User info + logout
      ThemePanel.jsx      # Theme switcher
      TaskPanel.jsx       # Task scheduler
  hooks/
    useAuth.js            # Authentication logic
    useTimer.js           # Countdown timer
    useMediaPipe.js       # Face detection wrapper
  utils/
    storage.js            # localStorage helpers + crypto
  App.jsx                 # Root with loading screen
  index.css               # All styles + CSS variables
```

## Notes
- All data is stored in **localStorage** (no backend required)
- MediaPipe loads from CDN — requires internet for first session
- Camera permission is requested when starting a focus timer
