# Pokédex

A focused, responsive Pokédex for discovering Pokémon by name and exploring their core profile data.

The app uses the public [PokéAPI](https://pokeapi.co/) to display the first 24 Pokémon in a searchable catalog. Each Pokémon has a dynamic detail page with official artwork, types, height, weight, and base stats. Users can save favorites locally from the catalog.

## Product behavior

- Browse a responsive Pokémon catalog.
- Search the loaded catalog by Pokémon name.
- Navigate through the catalog with URL-backed pagination.
- Use Discover to answer preference questions and receive a random Pokémon that is not in your collection.
- Open a dynamic detail page at `/pokemon/:pokemonName`.
- Save and remove favorites with Zustand state persisted to IndexedDB through Dexie.js.
- View collection Pokémon in a TanStack Table with row selection, common attributes, and unsave actions.
- See loading skeletons, empty search results, and API error states.

## Technology

- React 19 and TypeScript 6
- Vite
- TanStack Router file-based routing for client-side navigation
- TanStack Query for API requests and caching
- TanStack Form with Zod for typed form state and validation
- shadcn-style UI components built with Radix primitives
- Zustand for client-side favorites with Dexie.js IndexedDB persistence
- Tailwind CSS for utility-first styling
- Sass/SCSS for the global stylesheet
- Vitest and React Testing Library for UI tests
- Playwright for browser end-to-end tests
- ESLint with `@antfu/eslint-config`

## Architecture

The source follows Feature-Sliced Design boundaries:

```text
src/
├── app/       # Application composition
├── entities/  # Pokémon domain UI, such as PokemonCard
├── features/  # Search and favorites interactions
├── routes/    # File-based TanStack Router route modules
└── shared/    # PokéAPI client, types, and shared utilities
```

Remote server state belongs to TanStack Query. Local client state belongs to Zustand, with Dexie.js persisting favorites in IndexedDB. The API client and Pokémon types stay in `shared`, while feature behavior and domain UI remain separated.

Routes are declared in `src/routes` with `createFileRoute`. The TanStack Router Vite plugin generates `src/routeTree.gen.ts` from those files; this generated file should not be edited manually.

The `@/` import alias points to `src`, so application code can use imports such as `@/shared/api/pokemon` instead of traversing relative paths.

Reusable UI primitives live in `src/shared/ui` and follow the shadcn convention: composable, accessible components with local styling rather than a separate component package.

## Development

```bash
pnpm install
pnpm dev
```

Open the local Vite URL shown in the terminal to use the app.

## Validation

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm lint` runs Antfu's ESLint flat configuration with TypeScript-aware rules. `pnpm test` runs the Vitest suite in a JSDOM environment. `pnpm test:e2e` starts the production preview server and runs Playwright browser tests against Chromium. `pnpm build` type-checks the project and creates the production bundle.

## GitHub Pages deployment

Pushes to `main` deploy automatically through `.github/workflows/deploy-pages.yml`. In the repository settings, set **Pages → Source** to **GitHub Actions**. The Vite base path is derived from `GITHUB_REPOSITORY`, and the workflow publishes a `404.html` SPA fallback for direct route visits.

## Project conventions

- PNPM is the required package manager.
- Use `pnpm-lock.yaml` as the dependency lockfile.
- Use TanStack Router links for internal navigation.
- Add new pages as file-based route modules under `src/routes`.
- Add UI tests for new interactive behavior.
- Keep unit and component tests under `src/shared/tests/`.
- Keep documentation and agent instructions in sync with tooling changes.

VS Code settings and the recommended ESLint extension are included in `.vscode`.
