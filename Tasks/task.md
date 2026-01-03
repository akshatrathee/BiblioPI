# Project Audit & Enhancement Checklist

## 1. Core Config & Localization

- [x] Localize to India (INR currency, number formats)
- [x] Amazon.in links
- [x] Rename Project to "BiblioPi" everywhere (Code check)
- [x] API Keys management (Settings)
- [x] Model Selection (Settings)

## 2. User & Family Management

- [x] Test Profiles (Dad, Mom, Teen, Preschool)
- [x] User Modal: Add Email/Google Auth fields
- [x] User Modal: Gender, Age (Calendar), Education, Grade
- [x] User Modal: Auto-increment logic (Grade/Age)
- [x] User Modal: Profession dropdown/autocomplete
- [x] User Modal: Validate DOB (18+ for parents, no future dates)
- [x] "Added By" User attribution

## 3. Location Management

- [x] Nested Locations (Room > Shelf > Box)
- [x] UI Visualization (Indentation/Tree view in LocationManager)
- [x] Upload Image for Locations
- [x] Assign Location flow (BookDetails)

## 4. Book Management

- [x] Age Gating & Child Safety
- [x] "How to understand this book" field (UI verify)
- [x] Media Associations (YouTube trailers, Movie/Play refs)
- [x] Read Count tracking (User model & UI)
- [x] Condition Reporting (Damaged flow)
- [x] Cover Art Zoom/Lightbox
- [x] Edit All Fields (Verify Purchase Price, Tags, etc.)
- [x] Background "washout" effect (BookDetails)

## 5. Loans & Maintenance

- [x] Maintenance Hub (Unassigned, Overdue, Damaged)
- [x] Loans Manager: Overdue Visuals (>30 days)
- [x] Loans Manager: Quick "Mark Returned"
- [x] Dashboard: Notification Count logic

## 6. Infrastructure & Deployment

- [x] Docker / Docker Compose
- [x] Tailscale instructions
- [x] Database configuration (Settings UI)
- [x] Backup Schedule (Settings UI)
- [x] Self-hosted / Cloud options (README)

## 7. Dummy Data

- [x] 4 Test Profiles
- [x] 10 Open Source books per account (Verify "example" tag)
- [x] 5 Dummy Rooms with 3 locations each (Verify)

## 8. UI/UX Overhaul (New Design)

- [x] Analyze provided HTML/Screens
- [x] Implement new Book Details Card
- [x] Implement new Library/Discovery View
- [x] Implement new Family Profile Card
- [x] Implement new Navigation/Tab Bar
- [x] Polish gradients and typography as per screens

## 8. Final Polish

- [x] Dead Link Audit (Check all buttons)
- [x] README Final Update

## 9. Comprehensive Audit Findings

- [x] Build Success (npm run build)
- [x] TypeScript Errors Resolved
- [x] Linting/Best Practice Checks
- [x] Runtime Verification (Smoke Test)

## New Feature Requests (User Priority)

- [x] **Keyboard & Mouse Shortcuts**
  - [x] `Escape` for back navigation
  - [x] `Enter` for default forward action (standard in modals)
  - [x] `Tab` cycling for editable fields (browser native)
  - [x] Mouse shortcuts for back (history integration)
- [x] **Wizard / Onboarding Mode**
  - [x] Initialize on first run
  - [x] Create Admin/Parent/Kid accounts (Done via local profile set)
  - [x] Configure AI (Ollama/Google)
  - [x] Configure Database (SQLite/Custom)
  - [x] Configure Backup (Local/NAS/Drive)
  - [x] Configure Location Hierarchy (Room -> Furniture -> Shelf/Spot)
- [x] **Enhanced Parent Dashboard**
  - [x] Consolidate all profile data (reading stats, history) in a "Family Stats" view
- [x] **Book Status Management**
  - [x] "Undo" read/reread status
  - [x] "Reset" read status
- [x] **Location Management Enhancements**
  - [x] Location-based inventory listing (Library filter)
  - [x] Enforce 3-level hierarchy (Room > Location > Spot) at setup and book entry
- [x] **Quality of Life Settings**
  - [x] Toggle "Show Value" (estimated)
  - [x] Toggle "Vibrant UI" (glassmorphism amount)
- [x] **Advanced Utility Suite**
  - [x] **Bulk Import**: Support for CSV/JSON migration
  - [x] **Notification Hub**: Real-time alerts for maintenance & loans
  - [x] **Advanced Analytics**: Visual distribution & efficiency tracking

## Backlog / Future

- [x] Interactive "Bookshelf" visualizer (Grand Library view)
- [x] E-reader integration (Digital PDF/Simulated EPUB)
- [x] Mobile PWA Polish (Home screen installation & SW)
- [x] Laser Scanner Support (Native HID input optimization)

## 10. Final Comprehensive Audit & Execution

### 🛡️ Core Reliability & UX

- [ ] **Completeness Audit**: Verify every file has JSDoc and explanatory comments for internal logic.
- [ ] **Dead Link Scrub**: Click-test every button, tab, and link in the interface.
- [ ] **Page Context**: Add subtle hints or "intro pills" to every major view (Analytics, Locations, Loans).
- [ ] **Precision Tooltips**: Add descriptive tooltips to complex features (estimated value, vibrant UI toggle, etc).

### 🐳 Infrastructure & Security

- [ ] **Port Segregation**: Update Docker config to host Wizard on 9090 and Main App on 9091.
- [ ] **Docker Stacks Support**: Document deployment using Docker Swarm / Stacks for DB reliability.
- [ ] **DB Hardening**: Implement/Document password rotation, volume encryption, and port blocking for Postgres/SQLite.
- [ ] **Backup Vault**:
  - [ ] Local Auto-backups (daily)
  - [ ] NAS (WebDAV/SMB instructions)
  - [ ] Google Drive (Oauth2 flow documentation)

### 🤖 AI & Automation

- [ ] **Ollama Model Config**: Document best-of-breed models (Llama 3.2 for summary, Whisper for STT, etc).
- [ ] **Rich Media Depth**:
  - [ ] Auto-pull Movie/Play references via AI.
  - [ ] Embed YouTube trailers directly in `BookDetails`.
- [ ] **Auto-Tagging System**: Implement "KaraKeep" style auto-tagging based on title/summary patterns.
- [ ] **Dummy Continuity**:
  - [ ] Add `dummy` tag to all generated items.
  - [ ] Display "Demo Mode" warning banner if onboarding is skipped.

### 📱 Performance & Compatibility

- [ ] **Responsive Audit**: Stress-test Library and BookDetails on all device categories:
  - Flagship Mobile: iPhone 15 Pro (393x852), Samsung S25 (360x800), Google Pixel 9 (412x915)
  - Tablets: iPad Pro 12.9" (1024x1366)
  - Foldables: Samsung Z Fold 5 (2-fold: 374x834 closed, 748x1812 open), Huawei Mate X3 (3-fold concept)
  - Desktop: Chrome on Windows (1920x1080), Safari on macOS (1440x900)
- [ ] **Version Lock**: Finalize all tech stack versions in `package.json` and `Dockerfile`.
