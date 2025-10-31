# @neiropacks/packs-template - Ink Package Template

This repository serves as a template for creating packages for [Ink](https://github.com/vadimdemedes/ink), a React renderer for command-line apps.

## Getting Started

To use this template:

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:neiropacks/packs-template.git your-package-name
    cd your-package-name
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
3.  **Rename the package:**
    *   Update the `name` field in `package.json` to your desired package name (e.g., `your-package-name`).
    *   If you intend to publish under a different npm scope, update `@neiros` in `package.json` and in the GitHub Actions workflow (`.github/workflows/publish.yml`).
4.  **Start developing:**
    *   Your main library code should reside in `src/`.
    *   Hooks go into `src/hooks/`.
    *   Providers go into `src/components/providers/`.
    *   Utility functions go into `src/utils/`.

## Available Commands

After setting up the repository and installing dependencies, you can use the following commands:

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