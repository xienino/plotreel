# Copilot Instructions for zhihui

This repository is a React frontend project built with Create React App. It is focused on the UI layer and appears to be packaged into a `./gui` destination for integration with a larger application.

## What to know first

- The frontend is implemented in `src/` using a mix of JavaScript, JSX, and some TypeScript support.
- `src/pages/` contains the main page screens, especially the project workflow under `src/pages/project/`.
- `src/services/` holds HTTP / backend adapter logic and WebSocket helpers.
- `public/` contains static frontend assets and the app shell.
- The app expects a backend or local service; the repo itself does not contain a server implementation.

## Key commands

Use the workspace `package.json` scripts for development and build.

- `npm run dev` — start the React development server
- `npm run build` — build production assets into `BUILD_PATH='../../gui'`
- `npm run frontend:test` — run Create React App tests
- `npm run frontend:eject` — eject CRA config if needed

There are also helper scripts for environment-specific builds:

- `npm run build:dev`
- `npm run build:test`

## Important project conventions

- Code style is governed by ESLint + Prettier. `package.json` includes `precommit`, `husky`, and `lint-staged` settings.
- Styles use Sass and are colocated with components/pages in `.sass` files.
- `src/setupProxy.js` and `proxy` in `package.json` are used for local backend forwarding.
- The build output is explicitly directed to `../../gui`.

## Useful files and directories

- `src/pages/project/` — core project management screens
- `src/pages/login.jsx` — login flow
- `src/layout/index.jsx` — main layout and navigation wrapper
- `src/services/` — API and socket service modules
- `src/components/` — shared UI controls and widgets
- `src/styles/` — global style utilities

## Typical tasks for Copilot to help with

- Add or refactor frontend pages and components
- Improve `src/services/` data fetching and error handling
- Fix layout or style issues in `.sass` files
- Update build or proxy configuration for local development

## When not to guess

If a change depends on backend behavior, API contract, or Python service assumptions, ask for the service contract or examples before modifying frontend integration.

## Example prompts

- "Create a new settings page under `src/pages/settings.jsx` and wire it into the main layout."
- "Refactor `src/services/project.jsx` to use a centralized request helper and handle HTTP errors consistently."
- "Explain where new project-related routes should be added and how to keep page styling consistent with existing `.sass` patterns."
- "Why does the build output go to `../../gui`, and what needs to change if I want a normal CRA build folder?"
