# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

X Music is a free cross-platform music player built with Electron, Vue 3, and TypeScript. It fetches music metadata from NeteaseCloudMusicApi and audio data from GD音乐台.

**Tech Stack:**
- Frontend: Vue 3 + TypeScript + Vite + Ant Design Vue
- Backend: Electron (main process) + NeteaseCloudMusicApi
- State Management: Pinia
- Build Tool: electron-vite
- CSS: SCSS with global color variables

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (hot-reload)
npm run dev

# Type checking
npm run typecheck          # Check both node and web
npm run typecheck:node     # Main process only
npm run typecheck:web      # Renderer process only

# Code quality
npm run lint              # ESLint with auto-fix
npm run format            # Prettier format

# Production builds
npm run build             # Type check + build
npm run build:win         # Windows installer
npm run build:mac         # macOS installer
npm run build:linux       # Linux installer
npm run build:unpack      # Build without packaging
```

## Architecture

### Three-Process Model

**Main Process** (`src/main/`)
- Entry: `src/main/index.ts`
- Manages windows (main window, lyric window, tray)
- Runs local NeteaseCloudMusicApi server on port 12140+
- Handles IPC communication with renderer
- Core utilities in `src/main/utils/`:
  - `apiServer.ts`: Starts NeteaseCloudMusicApi server with port detection
  - `downloader.ts`: Music download manager
  - `lyricWindow.ts`: Desktop lyric overlay window
  - `fileHelper.ts`, `shellHelper.ts`, `appHelper.ts`, `httpHelper.ts`: IPC handlers

**Preload Process** (`src/preload/`)
- Bridges main and renderer via contextBridge
- Exposes safe APIs to renderer

**Renderer Process** (`src/renderer/`)
- Vue 3 SPA with hash router
- Entry: `src/renderer/src/main.ts`

### Renderer Architecture

**Services** (`src/renderer/src/service/`)
Services are singleton classes managing app-wide concerns:
- `playService.ts`: Core audio playback, playlist management, loop modes
- `lyricService.ts`: Lyric parsing and synchronization
- `downloadService.ts`: Download queue and status
- `userDataService.ts`: User playlists and favorites
- `appService.ts`: App-wide state and settings
- `storeService.ts`: Persistent storage wrapper (electron-store)
- `broadcastService.ts`: Cross-window messaging (BroadcastChannel)
- `analyserService.ts`: Audio spectrum analysis
- `logService.ts`: Centralized logging

**API Layer** (`src/renderer/src/common/api/`)
- Communicates with local NeteaseCloudMusicApi server
- Uses axios with caching via `axios-cache-interceptor`
- Main functions: `getSongUrl`, `getRecommendData`, `getSingerList`, etc.

**State Management**
- Pinia stores in `src/renderer/src/stores/`:
  - `app.ts`: Theme, settings, window state
  - `user.ts`: User authentication and profile
- Services hold reactive state (`ref()`) for real-time updates

**Routing**
- Hash router (`createWebHashHistory`) for Electron compatibility
- Main layout with nested routes for pages
- Lazy-loaded page components

**UI Components** (`src/renderer/src/components/`)
Key shared components:
- `control-bar.vue`: Bottom playback controls
- `song-table.vue`: Song list with actions (play, download, collect)
- `player/`: Immersive player UI with lyrics and visualizer
- `download-float-btn.vue`: Floating download manager
- `desk-lyric.vue`: Desktop lyric overlay

### Path Aliases

- `@renderer` → `src/renderer/src` (configured in electron.vite.config.ts)

### SCSS Global Variables

All `.vue` and `.scss` files automatically import `@renderer/styles/color` via Vite config. Use color variables without explicit imports.

## Key Patterns

### Audio Source Flow
1. User plays song → `playService.playSong(song)`
2. Service calls `getSongUrl(song.id)` API
3. API communicates with local NeteaseCloudMusicApi server
4. GD音乐台 URL returned and set to `audio.src`
5. `audio.play()` triggered

### IPC Communication
Main process utilities expose IPC handlers:
```typescript
// Main: src/main/utils/fileHelper.ts
ipcMain.handle('selectFolder', async () => { ... })

// Renderer: call via preload bridge
const result = await window.electron.ipcRenderer.invoke('selectFolder')
```

### State Persistence
- `playService` saves/restores playlist and play state to localStorage
- `storeService` uses electron-store for app settings (port, paths, etc.)
- User data synced with server when logged in

### Window Management
- Main window hides (not closes) on close event (except Linux)
- Tray icon on Windows for quick restore
- Desktop lyric window is frameless, always-on-top, click-through overlay

## Important Notes

- **Security**: Web security disabled (`webSecurity: false`) and CORS disabled (`app.commandLine.appendSwitch('disable-web-security')`) to allow audio streaming from external sources
- **Single Instance**: App enforces single instance lock
- **Port Detection**: API server auto-selects available port starting from 12140
- **Audio Metadata**: Uses `music-metadata` library for local file parsing
- **Theme**: Supports dark/light mode via app store
- **Download**: Songs downloaded with metadata embedding via `music-metadata`

## Development Tips

- Services are initialized in `main.ts` and injected globally
- Use `eventBus` for loose component communication
- Check `playService.state.value.curSong` for current playing song
- Desktop lyrics use BroadcastChannel to sync with main window
- Always handle errors from API calls (network/server issues common)
