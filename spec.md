# FitTry AI

## Current State
TryOnScreen has a simulated try-on flow: user uploads photo, selects outfit from gallery, a fake processing animation runs, then the outfit image is shown as the "result" — no real AI call is made.

VideoGenScreen already has a real Replicate + Cloudinary backend integration with a collapsible settings panel (API key, cloud name, upload preset, custom backend URL).

## Requested Changes (Diff)

### Add
- Real `/tryon` API call in TryOnScreen using the provided backend code
- Settings panel (collapsible) in TryOnScreen: backend URL, Replicate API key, Cloudinary cloud name, upload preset (persisted to localStorage, shared keys with VideoGenScreen storage)
- Option to upload a custom cloth/garment image in addition to selecting from gallery
- Real result image display (from API response `output` field)
- Fallback to simulated mode if no backend URL is configured

### Modify
- `handleTryOn` — if backend URL is set, call `POST /tryon` with `person` + `cloth` multipart form, poll for result, show real output image
- Result screen — show actual returned image URL when real API is used
- Processing screen — show real status polling messages when in real API mode

### Remove
- Nothing removed

## Implementation Plan
1. Add localStorage keys for Replicate/Cloudinary/backend URL (reuse VideoGenScreen keys)
2. Add collapsible settings panel in TryOnScreen (above the Try On button in select step)
3. Add cloth image upload option (alongside outfit selection)
4. Update `handleTryOn` to detect backend mode and call real `/tryon` API
5. Convert selected outfit image URL to a Blob for the `cloth` field if no custom cloth uploaded
6. Poll backend or use Replicate direct polling for result
7. Update result screen to show real output image if available
