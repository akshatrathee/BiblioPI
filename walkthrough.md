# BiblioPi Technical Walkthrough

This document provides a deep dive into the technical architecture and implementation of BiblioPi (v1.3.0).

## Phase 1: Core Architecture

BiblioPi is built as a highly performant **React 18** application using **Vite 5** as its build engine. The primary design philosophy is "Offline-First" and "Privacy-First."

- **State Management**: A centralized `AppState` in `App.tsx` handles all domain data.
- **Persistence**: Managed by `storageService.ts` via browser `localStorage` (with planned support for SQLite/Postgres backends).

## Phase 2: Location Hierarchy

The 3-tier location system (Room > Shelf > Spot) is implemented using a recursive structure in `LocationManager.tsx`.

- **Indented Tree View**: Ensures users can visualize nested locations.
- **Image Support**: Users can upload high-contrast photos for each location to identify boxes or shelves visually.

## Phase 3: AI Documentation & Summaries (Gemini / Ollama)

BiblioPi integrates with both cloud-based (Gemini) and local (Ollama) AI providers.

- **Model Selection**: Users can choose specific models for different tasks (e.g., `llama3.2` for summaries).
- **Auto-Tagging**: A regex-based engine in `storageService.ts` automatically categorizes new scans.

## Phase 4: Advanced Library Management

The latest phase focuses on production-grade analysis and tools.

### 📊 Analytics Engine (`Analytics.tsx`)

Calculates real-time metrics:

- **Genre Distribution**: Visual bar charts using percentage weights.
- **Asset Valuation**: Aggregates `estimatedValue` vs `purchasePrice` to track library net worth.
- **Family Share**: Tracks which family members are contributing most to the collection.

### 📥 Bulk Processing (`importService.ts`)

Handles legacy migration via CSV and JSON.

- **CSV Support**: Specifically optimized for pipe-delimited data commonly used by power users.
- **Error Sanitization**: Deduplicates records and validates ISBN formats during ingestion.

### 🔔 Real-time Notifications (`NotificationHub.tsx`)

A centralized state monitor that scans for:

- Overdue loans (> 30 days).
- Homeless books (unassigned locations).
- Maintenance requirements (damaged status).

## Phase 5: Onboarding & Security Hardening (v1.2.0)

The setup wizard (`Onboarding.tsx`) has been fortified with strict validation logic and better infrastructure alignment.

### 🛡️ Validation Rules

- **Strict Age Enforcement**: The Librarian must be 18+. Any DOB entry under 18 auto-resets to `1990-01-01`.
- **Custom Locations**: Users can now add specific rooms (e.g., "Dungeon", "Secret Lair") which persist immediately.
- **Port Segregation**: The wizard runs on `9090`. Upon completion, it automatically redirects to the secured App on `9091`.

### 🤖 AI Configuration

- **Ollama Integration**: Now displays exact `pull` commands (e.g., `ollama pull llama3`) based on your hardware profile (Pi vs RTX).
- **Gemini**: retained for cloud-based inference.

### 💾 Database & Backup

- **SQLite Persistence**: We enforce SQLite usage for simplicity. Data is persisted via Docker volumes at `/app/data`.
- **NAS Integration**:
  - Browser-based mounting is impossible. We provide the exact `docker service update` command to mount your NAS.
  - **Manual Verification**:
    1. Run the provided command on your host.
    2. Check if the file path exists using `ls -l /path/to/nas`.
    3. Use the "Test Backup" button in the wizard to simulate a write action.

## Phase 6: Infrastructure & Deployment

- **Docker Stack**: Replaced legacy `docker-compose` with production-ready Swarm definitions.
- **Nginx Hardening**: Includes custom headers (`X-Frame-Options`, `X-Content-Type-Options`).
