# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BiblioPi is a premium, AI-powered family library management system. It's a self-hosted, offline-first web application for tracking physical and digital book collections with AI-powered recommendations and analytics.

## Development Commands

```bash
npm run dev          # Start development server (port 9090 via Vite)
npm run build        # TypeScript compilation + Vite production build to /dist
npm run preview      # Preview production build locally
```

**Docker deployment:**
```bash
docker compose up -d                      # Full stack deployment
docker compose --profile postgres up -d   # Enable optional Postgres backend
```

## Tech Stack

- **Frontend:** React 18.3 + TypeScript 5.5 (strict mode) + Vite 5.4
- **Styling:** Tailwind CSS 3.4 + PostCSS
- **AI:** Google Gemini 3 Flash (@google/genai 1.0.0) + Ollama (local inference)
- **Data:** Browser localStorage (default) or PostgreSQL (optional)
- **Deployment:** Docker multi-stage builds with Nginx

## Architecture

### Directory Structure

```
./
├── components/           # React components (~20 .tsx files)
├── hooks/                # Custom React hooks (useLaserScanner.ts)
├── services/             # Business logic & API integrations
│   ├── storageService.ts     # State persistence, utilities (generateId, calculateAge)
│   ├── geminiService.ts      # Gemini AI with structured output schemas
│   ├── openLibraryService.ts # Book metadata via ISBN lookup
│   ├── backupService.ts      # Cloud & local backup
│   └── importService.ts      # CSV/JSON bulk import
├── types.ts              # All TypeScript interfaces and enums
├── App.tsx               # Root component with routing
└── index.tsx             # React entry point
```

### State Management

- **Pattern:** Centralized `AppState` in `App.tsx` using React hooks (no Redux)
- **Persistence:** `storageService.ts` saves to localStorage key `home_librarian_v5`
- **Data flow:** Top-down props passing through component tree

### Core Data Models (types.ts)

- **Book** - Full record with ISBN, metadata, location, reading status, AI-generated fields
- **User** - Profiles with DOB, role (Admin/User), reading history, AI personas
- **Location** - Recursive 3-tier hierarchy: Room > Shelf > Box/Spot
- **Loan** - Borrowed books tracking with borrower and return dates
- **ReadEntry** - Per-book reading history (status, dates, rating, reread count)
- **AppState** - Complete application state container

### Routing

History-based routing via `window.history.pushState()` with hash fragments:
- Views: `dashboard | library | loans | profile | scanner | buy-next | maintenance | locations | bookshelf | analytics | reader`
- Deep links: `#book/{bookId}` for book details

## Key Patterns

### AI Integration

Two providers configured via `AiSettings`:
- **Gemini:** Uses structured output schemas for Book, Persona, Recommendations
- **Ollama:** Local/offline fallback with configurable URL and model

### Location Hierarchy

Recursive tree structure with `parentId` relationships:
- Room (top level) > Shelf/Box (middle) > Spot/Container (leaf)
- Each location can have an image for visual identification

### Reading Status Enum

```typescript
UNREAD | READING | COMPLETED | DNF | WISHLIST
```
Multi-read support via `readDates[]` array for tracking all completions.

### Barcode Scanner

`useLaserScanner()` hook detects HID barcode scanners that emulate keyboard input. Uses keystroke timing threshold (>100ms = manual typing, ignored).

### Age-Gating

Books with `minAge` field are hidden from child profiles. Admin role controls full access.

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | ES2020 target, JSX react-jsx, strict mode enabled |
| `vite.config.ts` | Dev port 9090, production sourcemaps disabled |
| `docker-compose.yml` | App service + optional Postgres profile |
| `.env.example` | Template for DB type, API keys, ports, Tailscale |
| `nginx.conf` | Security headers, SPA routing |

## Naming Conventions

- **Components:** PascalCase (`Dashboard.tsx`)
- **Services:** camelCase with `Service` suffix (`geminiService.ts`)
- **Helper functions:** camelCase (`generateId`, `calculateAge`)
- **Types/Interfaces:** PascalCase
- **Constants:** UPPER_SNAKE_CASE (`STORAGE_KEY`, `STARTER_BOOKS`)

## Localization

Default locale is India (INR currency, class-based grade system). Age and grade calculations are in `storageService.ts`.
