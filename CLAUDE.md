# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview the dist/ build locally
```

No linter or test suite is configured.

## Architecture

This is a **single-page marketing site** for ChuDo Production (a video production studio in Bishkek). It is a React 19 + Vite app with no router — the entire site lives in `src/App.jsx` as one large file (~2900 lines). Sections are rendered in order and navigated via anchor links.

### Page sections (in render order)

| Section component | Anchor ID | What it does |
|---|---|---|
| `StickyNav` | — | Appears after hero scrolls out of view via IntersectionObserver |
| Hero | `#hero` | 3D camera model (Three.js/GLTFLoader), animated tags, BlurText headline |
| `MarketPainsSection` | `#market-pains` | Scroll-jacked sticky section — each 100svh of scroll advances to the next "pain" card (6 total), driven by `getBoundingClientRect` on rAF |
| `OfferSection` | `#offer` | Interactive 3D sphere of portfolio cards (CSS 3D, not WebGL) + services list. Hover on a service dims non-matching cards. Click a card opens `VideoModal`. |
| `UniqueValueSection` | `#usp` | Comparison rows (ordinary shoot vs ChuDo approach), activated by scroll/hover |
| `CasesSection` | `#cases` | Filterable grid of case cards, opens `CaseModal` |
| `WorkflowSection` | `#workflow` | 7-step accordion with `WorkflowVisual` and `WorkflowDossier` panels |
| `PartnersSection` | `#partners` | Logo grid (in `src/components/`) |
| `ContactSection` | `#contact` | LED process line animation + WhatsApp/Telegram CTAs |

### Key data structures in `App.jsx`

- **`projectVideos`** — all video assets as Google Drive file IDs, built with `makeDriveVideo()` / `makeDriveVideos()` helpers
- **`portfolioItems`** — 8 showcase items for the sphere in OfferSection; each links to a `serviceType` for filtering
- **`cases`** — 24 full case entries for CasesSection, built with `makeCase()`; each references `projectVideos` entries
- **`services`** — 8 service types with visual accent themes
- **`workflowSteps`** — 7 workflow steps with metadata for the dossier panel

### Video system

All videos are hosted on Google Drive. Three URL helpers:
- `driveVideo(fileId)` → embed iframe URL (`/preview`)
- `driveView(fileId)` → external link URL (`/view`)
- `driveThumbnail(fileId)` → thumbnail image URL

`normalizeVideoSource` / `getPrimaryVideoSource` / `getVideoList` / `getPlayableVideo` / `getPreviewMedia` form a pipeline that handles strings, single objects, and playlist arrays uniformly.

`DriveVideoPlayer` renders a Drive iframe + always-visible "Open in Drive" link (Drive returns HTTP 200 even for access-denied pages so `onError` never fires — the link is the reliable fallback).

### Anchor scroll guard

`_anchorScrollActive` / `_startAnchorScroll()` are module-level globals that block `IntersectionObserver` from changing accordion/pain state during smooth-scroll navigation. The flag is set for 1300ms on any `<a href="#...">` click.

### Extracted components (`src/components/`)

- `BlurText` — animated word-by-word blur-in text
- `CustomCursor` — custom SVG cursor that follows pointer
- `PartnersSection` / `PartnerLogoGrid` / `PartnerLogoItem` / `FallbackLogo` — logo wall
- `ContactSection` — contact section with animated LED process line

### Partner logos (`src/data/partnersLogos.js`)

All logos currently use `logoUrl: null` which renders a generated wordmark via `FallbackLogo`. To add real logos, set `logoUrl` to a Google Drive CDN URL (`https://lh3.googleusercontent.com/d/FILE_ID`), a Drive export URL, or a local path under `public/partners/`. An optional Google Drive API integration is fully stubbed in `src/lib/googleDriveLogos.js` (requires `VITE_GDRIVE_FOLDER_ID` and `VITE_GDRIVE_API_KEY` env vars).

### Static assets

- `public/portfolio/*.svg` — poster/thumbnail images for portfolio cards
- `public/videos/ai-creative.mp4` — one local video preview
- `assets/red_camera_web.glb` — 3D camera model for the hero
- `assets/chudo-logo-new.png` — logo image
