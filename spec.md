# FitTry AI

## Current State
New project. Empty backend and frontend scaffolding.

## Requested Changes (Diff)

### Add
- User authentication (login/signup) via authorization component
- Blob storage for user photo uploads
- Camera capture support
- Backend: user try-on quota tracking (3 free/day), premium status, try-on history
- Frontend: mobile-first SPA with dark/light mode toggle
- Upload page: upload photo or capture via camera
- Outfit gallery: browse outfit categories (Casual, Formal, Streetwear, Sport, Evening)
- Try-on view: show user photo + selected outfit with simulated AI processing animation
- Results page: show try-on result with Save/Share actions
- Premium upgrade modal/page
- Freemium gate: 3 free tries per day, prompt upgrade after limit
- Try-on history page
- HD download as premium in-app purchase (Stripe)

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Select components: authorization, blob-storage, camera, stripe, http-outcalls
2. Generate Motoko backend: user profiles, try-on quota (3/day free), premium status, try-on history records
3. Frontend: mobile-first layout, dark/light mode, 5 screens (Home, Upload, Outfits, Try-On Result, Premium), outfit data seeded in frontend
