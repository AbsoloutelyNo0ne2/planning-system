# Run Instructions - Planning System Desktop App

This document provides instructions for building and running the Tauri desktop application.

## Prerequisites

Before building the application, ensure you have the following installed:

- **Node.js** (v18+) - [Download here](https://nodejs.org/)
- **Rust** (via rustup) - Install from [rustup.rs](https://rustup.rs/)
- **Visual Studio Build Tools** - Already installed on this system

## Build Commands

### Install Dependencies

```bash
cd planning-system
npm install
```

### Run in Development Mode

```bash
npm run dev
```

This will start the Vite development server and launch the Tauri desktop window.

### Build for Production

```bash
npm run build
```

### Build Tauri App

```bash
cd src-tauri
cargo build --release
```

## Desktop Shortcut Creation

### Windows

After building the Tauri app, the executable will be located at:

```
src-tauri/target/release/planning-system.exe
```

**To create a desktop shortcut:**

1. Navigate to `src-tauri/target/release/`
2. Right-click on `planning-system.exe`
3. Select **Send to** → **Desktop (create shortcut)**

**Alternative: Pin to Taskbar**

1. Right-click on `planning-system.exe`
2. Select **Pin to taskbar**

## Troubleshooting

| Issue | Solution |
|-------|----------|
| White screen on launch | Open DevTools (Ctrl+Shift+I) and check the console for JavaScript errors |
| Build fails with linker errors | Ensure Visual Studio Build Tools are properly installed |
| Actors not appearing | Check that the app has permissions to read/write to local storage |
| npm install fails | Delete `node_modules` and `package-lock.json`, then run `npm install` again |
| Tauri build fails | Ensure Rust is properly installed: `rustc --version` should show the version |

## Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [Vite Documentation](https://vitejs.dev/)
- [Rust Documentation](https://doc.rust-lang.org/)