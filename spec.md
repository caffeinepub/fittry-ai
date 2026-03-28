# FitTry AI

## Current State
FitTry AI is a virtual try-on web app with pages: home, upload, outfit-selector, processing, result. It has a freemium model, e-commerce integration, and premium modal.

## Requested Changes (Diff)

### Add
- A new `SalesPage` accessible via a "Sell / Buy This App" link in the header
- Sales page includes: hero with app name + tagline, key features list, screenshots/mockup section, pricing suggestion, contact/inquiry button (mailto link), and a clear CTA to view the live demo

### Modify
- `App.tsx`: add `sales` to AppState and render `SalesPage`
- `Header.tsx`: add a "Buy This App" button/link that navigates to the sales page
- `types.ts`: add `sales` to `AppState` union type

### Remove
- Nothing

## Implementation Plan
1. Add `sales` to `AppState` in `types.ts`
2. Create `src/frontend/src/pages/SalesPage.tsx` with full sales landing page
3. Update `App.tsx` to import and render `SalesPage`
4. Update `Header.tsx` to add "Buy This App" nav link
