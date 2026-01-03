# BiblioPi Audit & Enhancement Plan

## Goal

Finalize BiblioPi features, focusing on User Management, Loans, Location Visualization, and UI Polish.

## Proposed Changes

### 1. User Management (`UserModal.tsx`, `types.ts`, `storageService.ts`)

- **Modify `User` type**: Add `email`, `gender`, `education`, `job`, `grade`.
- **Update `UserModal`**:
  - Add fields for Email/Google Auth (Mock).
  - Add Gender dropdown (M/F/Other).
  - Add Date Picker for DOB.
  - Add Profession (Autocomplete/Dropdown) & Education.
  - Implement validation: DOB < Today, Parents >= 18.
  - Implement `calculateGrade` logic.

### 2. Location Visualization (`LocationManager.tsx`)

- **Tree View**: Update `LocationManager` to use indentation/disclosure triangles for Room > Shelf > Spot.
- **Image Upload**: Add file input for location images to `LocationManager` (store as dataURL for now).

### 3. Book Details Polish (`BookDetails.tsx`)

- **Lightbox**: Add click-to-zoom for cover image.
- **Media**: Ensure `mediaAdaptations` renders YouTube embeds/links if present.
- **"How to Understand"**: Verify rendering of `understandingGuide`.
- **Background Washout**: Add CSS backdrop filter with cover image as background.

### 4. Loans Manager (`LoansManager.tsx`)

- **Overdue Visuals**: Highlight loans > 30 days in red.
- **Action**: Add "Return" button on the card.

### 5. Read Count (`types.ts`, `App.tsx`, `Profile.tsx`)

- **Track**: Ensure `readCount` increments on "Mark Read".
- **Display**: Show "Read X times" in Profile/Book Details.

### 6. Dead Link Audit

- **Scan**: Check `Icons.tsc`, `Dashboard.tsx`, `Library.tsx` for `onClick={undefined}` buttons.
- **Fix**: Wire up to `alert("Feature coming soon")` or hide.

## Verification

- Manual verification of each flow.
- "Checklist" completion in `task.md`.
