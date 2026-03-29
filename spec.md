# FitTry AI

## Current State
Workspace currently has FaceVid AI. FitTry AI was the original project but was overwritten. Rebuilding from scratch.

## Requested Changes (Diff)

### Add
- Full FitTry AI virtual try-on app
- Home screen with animated model (LIVE badge), hero section, Shop by Platform (Amazon, Myntra, Flipkart, Ajio)
- Try On screen: upload photo or capture with camera, outfit selection, AI processing animation, result preview
- Favorites page: saved/liked outfits grid
- More/Profile page: app info, stats
- Bottom navigation: Home, Try On, Favorites, More
- All features completely free — no premium plan, no paywall, no generation limits

### Modify
- Replace FaceVid AI entirely with FitTry AI

### Remove
- All FaceVid AI code
- All premium/paywall/monetization code — everything is 100% free

## Implementation Plan
1. Generate Motoko backend with try-on history and favorites storage
2. Build all screens: Home, TryOn, Favorites, More
3. Add bottom navigation
4. Add camera capture component
5. Add AI processing animation
6. No paywall or premium gating anywhere
