# REM

An Electron-based desktop app for [Rclone](https://rclone.org/). Browse, organize, and transfer files across cloud storages; manage rclone configs and mounts.

## Tech Stack

- **Runtime**: Electron 37, Node.js
- **Frontend**: React 19, MobX 6, Sass
- **Build**: Vite 7, TypeScript
- **UI Components**: luna-\* component library (file-list, toolbar, modal, split-pane, etc.)
- **Utilities**: licia (utility library)
- **Rclone**: `rclone-static` binary; main spawns `rclone rcd`, renderer uses RC HTTP API (`common/rclone.ts`)
- **Packaging**: electron-builder
- **i18n**: Custom I18n (licia/I18n), locale files in JSON

## Architecture

```
src/
├── common/        # Shared types, theme, i18n, rclone RC client
├── main/          # Electron main process
│   ├── lib/       # rclone process, store, tray, menu, password, ipc
│   └── window/    # Window creation (main, settings, mount, job)
├── renderer/      # React UI (each page is a sub-directory)
│   ├── main/      # Main window: Config | File | Job + Toolbar/Statusbar
│   ├── settings/ mount/ job/ password/
│   └── store/     # Cross-page MobX stores (settings, job)
├── preload/       # Bridges renderer ↔ main via IPC
└── share/         # Shared across Electron apps (liriliri)
    ├── common/    # Logging, i18n, types
    ├── main/      # Window, ipc, theme, language, updater
    ├── preload/   # Shared IPC wrappers
    └── renderer/  # Shared pages: about, terminal, process, video
```

Path aliases: `common` → `src/common`, `share` → `src/share`.

## Layer Responsibilities

- **common/**: Types, theme, i18n JSONs, rclone RC helpers. No Electron APIs.
- **main/**: Starts/stops rclone, windows, tray, menu, password gate, FileStore.
- **renderer/**: React + MobX. Rclone RC calls go through `common/rclone.ts` (port/auth from main). Main-process APIs only via preload.
- **preload/**: Exposes `main` / `preload` via contextBridge; typed `invoke` helpers.
- **share/**: Reusable Electron app infrastructure and shared windows.

## IPC Pattern

Renderer calls `main.someMethod()` → preload `invoke('someMethod')` → main `handleEvent('someMethod', handler)`.

Events from main to renderer: `window.sendTo(name, channel, ...args)` → preload `main.on(event, callback)`.

## Windows & Pages

`renderer/main.tsx` selects a page from `?page=` (lazy-loaded). Default page is the main window; others open as separate BrowserWindows. Multiple main windows via `newWindow`.

| Page | Source | Role |
|------|--------|------|
| (default) | `renderer/main/` | Config + file browser + jobs |
| `settings` / `mount` / `job` / `password` | `renderer/<page>/` | Settings, mounts, jobs, config decrypt |
| `terminal` / `process` / `about` / `video` | `share/renderer/<page>/` | Shared utility windows |

## Rclone Integration

1. After optional password check, `main/lib/rclone.ts` spawns `rclone rcd` (local RC addr, auth, optional `--config`).
2. Renderer gets port/auth via IPC, then `common/rclone.ts` (`axios`) for remotes, files, transfers, mounts.
3. Process killed on `will-quit`; health via `isRcloneRunning`.
