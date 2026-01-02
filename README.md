# BiblioPi 📚

### Your Personal AI Librarian for the Modern Home

BiblioPi is a premium, AI-powered library management system designed to help families track, discover, and enjoy their physical book collections. Featuring a stunning glassmorphism UI, localized support for India, and advanced AI insights via Google Gemini or Ollama.

---

## ✨ Features

- **AI-Powered Insights**: Get summaries, understanding guides, and cultural context for every book.
- **Family Profiles**: Dedicated personas for Dad, Mom, and kids (Teenage/Preschool) with built-in **Age Gating** and child safety.
- **Voice Mastery**: Integrated Text-to-Speech (TTS) for reading aloud and Speech-to-Text (STT) for voice search.
- **Maintenance Hub**: Tracking overdue loans, unassigned locations, and damaged reports.
- **Nested Locations**: Deeply organize your library (Room > Shelf > Box).
- **Localized for India**: Multi-currency support (₹) and direct links to Amazon.in.
- **Buy Next**: Monthly curated recommendations based on your reading habits.

---

## 🚀 Quick Start (Docker)

The easiest way to run BiblioPi is using Docker Compose.

### 1. Prerequisites

- Docker & Docker Compose installed.
- (Optional) Tailscale for remote access.

### 2. Deployment

Clone the repository and run:

```bash
docker-compose up -d
```

The app will be available at `http://localhost:9090`.

### 3. Tailscale Serve

To access your library securely from anywhere:

```bash
tailscale serve 9090
```

---

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS.
- **Icons**: Material Symbols (Google).
- **Storage**: LocalStorage (Session-based) / SQLite (Planned).
- **AI**: Google Gemini API / Ollama (Local).
- **Deployment**: Docker, Nginx.

---

## 📖 Installation Guide

### Professional Setup

For a full professional installation (including backups):

1. Copy `.env.example` to `.env`.
2. Configure your `GOOGLE_API_KEY` and `OLLAMA_URL`.
3. Set your backup schedule (defaults to weekly).
4. Run `npm install && npm run build`.

### Docker Stack

```yaml
services:
  bibliopi:
    image: bibliopi:latest
    ports:
      - "9090:80"
    environment:
      - NODE_ENV=production
    restart: always
```

---

## 🔒 Privacy & Safety

BiblioPi is designed with privacy first. All data stays local unless you explicitly link to Google Drive or use Cloud-based AI. Age-gating ensures thatIshani (our preschool tester) only sees age-appropriate content.

---

## 🙌 Credits & Inspiration

Inspired by the best in media management:

- **Komga**: For the robust library structure.
- **Netflix & Plex**: For the premium visual experience.
- **Koillection**: For the initial collection logic.
- **OpenLibrary API**: For the global book database.

---

## 📜 License

MIT License. Created with ❤️ for book lovers everywhere.
Project: **BiblioPi** (Home-Librarian)
