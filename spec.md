# FitTry AI

## Current State
FitTry AI Version 24 exists in the workspace with login, outfit gallery, try-on screen, favorites, video generation (Replicate + Cloudinary), VisionVideo AI demo, Server Dashboard, and More tab. The app is fully free with no premium plan.

## Requested Changes (Diff)

### Add
- Nothing new — full clean rebuild preserving all existing features

### Modify
- Rebuild entire frontend from scratch for a cleaner, more polished codebase
- Ensure all features are working and well-integrated

### Remove
- Any broken or incomplete code

## Implementation Plan

Rebuild FitTry AI with these features:

1. **Login Screen** — Email/Mobile toggle, OTP verification (DLT-style, OTP shown on screen), name field on signup
2. **Home Screen** — Hero section with animated model + LIVE badge, quick action buttons to Try On and Gallery, platform badges (Amazon, Myntra, Flipkart, Ajio)
3. **Try On Screen** — Upload user photo, browse outfit grid, tap outfit to "try on" (simulated overlay), AI Settings panel (Replicate key, Cloudinary cloud name + upload preset, backend URL) for real /tryon API calls
4. **Outfit Gallery** — 120 outfits (60 men, 60 women), gender/category filters, search, tap to preview dress image before trying on
5. **Favorites Screen** — Saved/liked outfits grid
6. **More Screen** — User profile, logout, link to Server Dashboard, link to Generate Video screen, footer "built with 🖤 ai agent"
7. **Server Dashboard Screen** — Live animated stats (CPU, RAM, Disk, Network, updates every 2s), 3 demo servers with Start/Stop/Restart buttons, terminal log with scrolling messages
8. **Video Gen Screen (VisionVideo AI)** — Upload photo, select outfit card (Shirt, Jacket, Dress, Saree, etc.), collapsible API settings (Replicate key, Cloudinary cloud name + upload preset, custom backend URL), Generate Video button, status messages (Uploading, Processing, Video Ready), video player
9. **Bottom Navigation** — Home, Try On, Gallery, Favorites, More
10. **Fully Free** — No premium plan, no paywall triggers
11. **Dark theme** — Mobile-optimized, modern look
