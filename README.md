# xterm-mouse - Bring mouse interaction to your Node.js terminal apps.

This library provides a simple way to capture and parse mouse events from xterm-compatible terminals in Node.js applications.

## Features

*   Captures mouse events (clicks, drags, movements, wheel scrolls).
*   Supports SGR and ESC mouse protocols.
*   Provides parsed mouse event data including button, action, coordinates, and modifier keys (Shift, Alt, Ctrl).
*   Offers a streaming API with `eventsOf` and `stream` methods for asynchronous iteration over mouse events.

## Getting Started

### Installation

```bash
bun add @neiropacks/xterm-mouse
# or
npm install @neiropacks/xterm-mouse
# or
yarn add @neiropacks/xterm-mouse
```

### Usage

#### Basic Usage (Event-based)

```typescript
import { Mouse } from '@neiropacks/xterm-mouse';

const mouse = new Mouse();

console.log("Enabling mouse tracking... Press 'q' to exit.");

mouse.on('press', (event) => {
  console.log('Press event:', JSON.stringify(event));
});

mouse.enable();

process.stdin.on('data', (data) => {
  if (data.toString() === 'q') {
    mouse.disable();
    process.exit();
  }
});
```

#### Streaming API Usage

```typescript
import { Mouse } from '@neiropacks/xterm-mouse';

const mouse = new Mouse();

const main = async (): Promise<void> => {
  console.log('Enable mouse events...');
  mouse.enable();

  console.log('Starting to stream all mouse events. Press \'q\' to stop.');

  // Example of using the stream() method
  const streamPromise = (async (): Promise<void> => {
    for await (const { type, event } of mouse.stream()) {
      console.log(`Stream Event: type=${type}, event=${JSON.stringify(event)}`);
    }
  })();

  // Example of using the eventsOf() method for a specific event type
  const eventsOfPromise = (async (): Promise<void> => {
    for await (const event of mouse.eventsOf('press')) {
      console.log(`eventsOf('press') Event: ${JSON.stringify(event)}`);
    }
  })();

  // Keep the script running until a key is pressed.
  process.stdin.on('data', (data) => {
    if (data.toString() === 'q') {
      console.log('Disabling mouse events...');
      mouse.disable();
      process.exit(0);
    }
  });
};

main().catch(console.error);
```

## Available Commands

*   **`bun run build`**: Compiles the TypeScript code into JavaScript and generates type declaration files.
*   **`bun run lint`**: Runs ESLint and Biome checks to identify code quality issues.
*   **`bun run format`**: Formats the code using Biome and applies ESLint fixes.
*   **`bun run lint:fix`**: Applies ESLint fixes to the codebase.
*   **`bun run biome:check`**: Runs Biome checks and applies unsafe fixes.
*   **`bun run dev:basic`**: Runs the basic example with hot-reloading.
*   **`bun run dev:streaming`**: Runs the streaming example with hot-reloading.

## Publishing to npm

This template is configured to publish to npm automatically when a version tag (e.g., `v1.0.0`) is pushed to the `main` branch.

**Important:**
*   Ensure you have set up an `NPM_TOKEN` secret in your GitHub repository settings with a valid npm automation token.
*   Remember to update the package name in `package.json` before publishing.
