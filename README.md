# factory-test-repo

A small todo app built with Vite, React, and TypeScript. It lets you add tasks by typing and pressing Enter (or clicking **Add**), check them off by clicking the text, remove them with the **×** button, and see a live count of remaining items.

## Setup

**Prerequisites:** Node.js 18 or later.

```bash
npm install
```

## Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Start the Vite dev server with hot module replacement |
| `npm run build` | Type-check with `tsc` then produce a production bundle in `dist/` |
| `npm run preview` | Serve the production build locally for a final check before deploy |
| `npm run lint` | Run ESLint across all source files |
| `npm run test` | Run the Vitest test suite once (non-watch mode) |

## Project Structure

```
index.html           Entry HTML — mounts the React app at <div id="root">
src/
  main.tsx           App entry point; renders <App> into the DOM
  App.tsx            Root component; owns todo state (add, toggle, remove)
  App.test.tsx       Vitest tests for the App component
  index.css          Global styles
```
