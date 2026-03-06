# Planning & Agent Dispatch System

A Windows desktop application for task planning with AI agent dispatch and daily work limits.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Features

- **Task Planning**: Create tasks with value classification, type, and trajectory matching
- **Deterministic Sort**: Agentic tasks first, then by value class, trajectory match, word count, age
- **Daily Limit**: Maximum 20 tasks per day with visual blur when limit reached
- **Actor Comparison**: Track competitors and their progress
- **Local Storage**: All data persisted locally via JSON files

## Project Structure

```
src/
├── components/     # React UI components
├── stores/         # Zustand state management
├── services/       # Business logic
├── types/          # TypeScript definitions
├── constants/      # Configuration
└── styles/         # Tailwind CSS

src-tauri/
├── src/            # Rust backend
└── Cargo.toml      # Rust dependencies
```

## Configuration

Daily task limit: `src/constants/config.ts`
```typescript
export const DAILY_TASK_LIMIT: number = 20;
```

## Troubleshooting

If `npm run tauri dev` fails with "Couldn't recognize Tauri project":
- Ensure `src-tauri/tauri.conf.json` exists
- Ensure `src-tauri/Cargo.toml` has `build = "src/build.rs"`
- Ensure `index.html` exists at project root

## Development

- **Frontend**: React + TypeScript + Tailwind CSS
- **State**: Zustand
- **Backend**: Tauri (Rust)
- **Testing**: Vitest

## License

MIT
