# xterm-mouse - Bring mouse interaction to your Node.js terminal apps.

This library provides a simple way to capture and parse mouse events from xterm-compatible terminals in Node.js applications.

## Features

*   Captures mouse events (clicks, drags, movements, wheel scrolls).
*   Supports SGR and ESC mouse protocols.
*   Provides parsed mouse event data including button, action, coordinates, and modifier keys (Shift, Alt, Ctrl).

## Getting Started

### Installation

```bash
bun add xterm-mouse
# or
npm install xterm-mouse
# or
yarn add xterm-mouse
```

### Usage

```typescript
import { TuiMouse } from 'xterm-mouse';

const mouse = new TuiMouse();

mouse.on('data', (event) => {
  console.log('Mouse event:', event);
});

mouse.enable();

// Don't forget to disable mouse tracking when your application exits
process.on('exit', () => {
  mouse.disable();
});
```

## Available Commands

*   **`bun run build`**: Compiles the TypeScript code into JavaScript and generates type declaration files.
*   **`bun run lint`**: Runs ESLint and Biome checks to identify code quality issues.
*   **`bun run format`**: Formats the code using Biome and applies ESLint fixes.
*   **`bun run lint:fix`**: Applies ESLint fixes to the codebase.
*   **`bun run biome:check`**: Runs Biome checks and applies unsafe fixes.

## Publishing to npm

This template is configured to publish to npm automatically when a version tag (e.g., `v1.0.0`) is pushed to the `main` branch.

**Important:**
*   Ensure you have set up an `NPM_TOKEN` secret in your GitHub repository settings with a valid npm automation token.
*   Remember to update the package name in `package.json` before publishing.
