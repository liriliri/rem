# Building REM

This document covers local setup and build commands for REM.

## Windows Setup

### Prerequisites

- Git
- Node.js and npm
- PowerShell (default on modern Windows)

### Clone and initialize submodules

```powershell
git clone https://github.com/liriliri/rem.git
cd rem
git submodule update --init --recursive
```

### Install dependencies

```powershell
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is used because some dependency peer ranges can conflict on newer npm versions.

## Build (Validation Pipeline)

Run the standard validation checks:

```powershell
npm run lint
npm run test:unit
npm run build:all
```

## Build Windows Executable (Portable)

Build and package a portable `.exe` with one command:

```powershell
npm run build:win:portable
```

Expected output file:

- `release/portable-<timestamp>/REM-<version>-win-x64.exe`

## Troubleshooting

- If you see signing helper or symlink privilege issues, keep `--config.win.signAndEditExecutable=false` for local unsigned test builds.