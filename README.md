# BiblioPi 📚

## Your Personal AI Librarian for the Modern Home (v1.3.0)

BiblioPi is a premium, AI-powered library management system designed to help families track, discover, and enjoy their physical book collections. Featuring a stunning glassmorphism UI, localized support for India, and advanced AI insights.

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Stack: React 18](https://img.shields.io/badge/Stack-React%2018-blue)](https://react.dev/)
[![AI: Gemini 3 Flash](https://img.shields.io/badge/AI-Gemini%203%20Flash-orange)](https://deepmind.google/technologies/gemini/)
[![Built with: Antigravity](https://img.shields.io/badge/Built%20with-Antigravity-purple)](https://deepmind.google/antigravity)

---

## 🌟 Features

### 🏢 Physical Inventory & Location Management

- **3-Tier Hierarchy**: Organize books by Room > Shelf > Spot (or Box).
- **Visual Inventory**: High-contrast labels and location images to identify where books are stored.
- **Maintenance Hub**: Identifies "homeless" books (unassigned) and tracks damaged or missing copies.

### 🤖 AI-Powered Intelligence

- **Reading Recommendations**: Personalized "Read Next" picks based on family reading history and interests.
- **Auto-Summaries**: High-quality metadata, cultural context, and "How to understand this book" guides generated via **Gemini 3 Flash** or **Llama 3**.
- **Child Safety**: Automated **Age Gating** hides mature content from preschooler/kid profiles (e.g., Ishani's mode).

### 📊 Advanced Analytics

- **Reading Trends**: Visual charts (via Recharts) for genre distribution and monthly activity.
- **Asset Valuation**: Track your collection's financial value in INR (₹) with purchase vs. estimated price tracking.
- **Family Dashboard**: Consolidated view of family-wide reading stats and member activity.

### 📖 Immersive User Experience

- **Interactive Bookshelf**: A visually styled virtual shelf to browse your book spines with gradient effects and spine styling.
- **Voice Search** *(Planned)*: Voice search integration is planned for a future release.
- **Multi-Read Tracking**: Log every reread, track pages read, and maintain a full history with Undo/Reset support.

### 🛠️ Tools & Portability

- **Bulk Import**: Seamlessly migrate legacy collections via CSV (pipe-delimited) or JSON.
- **Cloud Sync** *(Planned)*: Google Drive backup integration is planned for a future release. Currently supports manual JSON export/import.
- **Barcode Scanner**: Scan ISBN barcodes using HID barcode scanners for quick book lookups.

### 🛡️ Family Safety & Governance

- **Adult/Admin Controls**: Manage loans and sensitive database settings from a central hub.
- **Offline First**: Works perfectly on your local network without an internet connection (using Ollama).
- **Loans Manager**: Keep track of books borrowed by friends or family with automated return tracking.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18.3](https://react.dev/)
- **Tooling**: [Vite 5.4](https://vitejs.dev/) (Native ESM build engine)
- **Language**: [TypeScript 5.5](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) (JIT engine)
- **Icons**: Material Symbols (Variable fonts) + Lucide React
- **Charts**: [Recharts 2.13](https://recharts.org/)
- **AI**: Google @google/genai (v1.0.0) / Ollama Local
- **Containerization**: [Docker](https://www.docker.com/)

---

## 🔒 Tailscale SSL & Remote Access

BiblioPi facilitates safe remote access using **Tailscale**. To enable secure HTTPS (SSL) for your family library:

1. **Install Tailscale**: Ensure the host machine is part of your Tailnet.
2. **Enable MagicDNS**: In your Tailscale admin console, ensure MagicDNS is active.
3. **Provision Certs**: Run the following on your host:

   ```bash
   tailscale cert bibliopi.your-tailnet-name.ts.net
   ```

4. **Automated SSL**: Our Docker configuration (v2026) automatically picks up these certs to serve BiblioPi over **HTTPS**.

---

## 🚀 Quick Start (Production)

```bash
# Clone and Deploy
git clone https://github.com/your-username/BiblioPi.git
cd BiblioPi
docker compose up -d
```

Visit:

- **Wizard**: `http://localhost:9090` (first-time setup)
- **Main App**: `http://localhost:9091` (after onboarding)
- **With Tailscale SSL**: `https://bibliopi.tailnet-name.ts.net`

---

## 📚 Documentation

- [Installation Detail](./docs/installation.md)
- [Environment Config](./docs/environment.md)
- [Functional Walkthrough](./walkthrough.md)
- [Security Hardening Guide](./docs/security.md)

---

## 👥 Contributors

- **[Claude Code](https://claude.ai/code)** (Anthropic) - AI pair programming and documentation
- **[Google Antigravity](https://deepmind.google/antigravity)** (Google DeepMind) - Core AI assistance and architecture

---

## 🙏 Credits & Inspiration

- **[Komga](https://github.com/gotson/komga)**: For excellence in digital library hierarchy.
- **[Koillection](https://github.com/koillection/koillection)**: For the initial collection management logic.
- **OpenLibrary API**: The backbone of our global book database.
- **Plex & Netflix**: Inspiration for the premium "Lean Back" UI experience.

---

## 📄 License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to share and adapt this work for non-commercial purposes, with appropriate attribution and under the same license.

---

**Built with ❤️ by Claude Code and Google Antigravity.**
