# Comprehensive Audit & Hardening Plan

This plan details the final stabilization and optimization phase for BiblioPi.

## 1. Port Segregation & Wizard Control

- **9090 (Wizard)**: A dedicated minimal build that only serves the Onboarding flow.
- **9091 (Main)**: The full application.
- **Demo Detection**: If `isSetupComplete` is false but the app is accessed on 9091, display a persistent "Demo Mode" banner and tag all data with `dummy`.

## 2. Infrastructure & Security

- **Docker Stacks**: Add `docker-stack.yml` for Swarm deployments.
- **Hardening Guide**: Create `docs/security.md` covering:
  - Postgres SSL connection strings.
  - SQLite volume permissions.
  - Tailscale ACL recommendations.
- **Backups**: Implement a `backupService.ts` that triggers local JSON exports and provides instructions for NAS/Drive sync.

## 3. Rich Media & AI Depth

- **YouTube Embeds**: Modify `BookDetails.tsx` to detect YouTube IDs in `mediaAdaptations` and render a responsive player.
- **Auto-Tagging**: Add a regex-based tag generator (e.g., "History" if "war", "century", or "king" appears in summary).
- **Ollama Documentation**: Update `docs/environment.md` with recommended models for:
  - `llama3.2:1b`: Fast summaries.
  - `whisper-base`: STT.
  - `llava`: Image recognition for covers.

## 4. UI/UX Refinement

- **Tooltips**: Implement a reusable `Tooltip` component for stats and complex toggles.
- **Responsive Stress Test**: Refine `Library.tsx` grid logic to ensure 1-column layouts on very small devices.
- **Code Documentation**: Conduct a pass on all `.tsx` and `.ts` files to add JSDoc for exports.

## 5. Verification Plan

- [ ] Manual check of 9090 vs 9091 routing.
- [ ] Verify `dummy` tag presence on auto-generated books.
- [ ] Check YouTube player responsiveness on mobile view.
