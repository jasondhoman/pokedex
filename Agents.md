# Agents.md

## Project overview

This repository is a React + TypeScript Pokédex built with Vite. It uses PokéAPI for a searchable catalog, dynamic Pokémon profiles, and favorites persisted in IndexedDB through Dexie.js.

## Technology stack

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Router Vite plugin with file-based routing
- TanStack Query
- Zustand
- Dexie.js
- Tailwind CSS
- Sass/SCSS for global stylesheets
- Lucide React
- PokéAPI
- Vitest and React Testing Library
- Playwright for browser end-to-end tests
- Husky and lint-staged for pre-commit ESLint checks
- TanStack Form with Zod validation
- TanStack Table for collection Pokémon data grids
- shadcn-style UI components built on Radix primitives
- ESLint with `@antfu/eslint-config`
- TypeScript 6

## Package manager and commands

PNPM is required. Do not use npm or yarn to install dependencies or run scripts. Do not manually edit `pnpm-lock.yaml`; update it through `pnpm install` after changing `package.json`.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:ui
pnpm lint:staged
pnpm build
pnpm preview
```

Linting uses the Antfu ESLint flat configuration in `eslint.config.js`, including TypeScript-aware rules. Do not add Oxlint configuration or dependencies. VS Code is configured to validate and fix ESLint issues on save.

Import sorting is enforced by `perfectionist/sort-imports`: external package imports come before relative local imports, with a blank line between groups. Keep the configured ordering rather than disabling the rule.

Run `pnpm test` after UI changes, `pnpm test:e2e` for browser-flow changes, and `pnpm build` after application changes.
Commits run ESLint through the Husky `pre-commit` hook on staged JavaScript and TypeScript files.

## Architecture

Use Feature-Sliced Design boundaries:

```text
src/
├── app/       # Application composition and providers
├── entities/  # Pokémon domain UI and models
├── features/  # User interactions such as search and favorites
└── shared/    # API clients, types, and reusable infrastructure
└── routes/    # TanStack Router file-based route definitions
```

Keep dependencies flowing inward:

- `app` may use any layer.
- `features` may use `entities` and `shared`.
- `entities` may use `shared`.
- `shared` must remain independent of product-specific features.

Prefer one clear responsibility per module. Keep route setup in `app`, API contracts and request helpers in `shared/api`, domain presentation in `entities`, and user interactions in `features`.

TanStack Router uses file-based routing under `src/routes`. Each route module must export a `Route` created with `createFileRoute`. The Vite plugin generates `src/routeTree.gen.ts`; do not hand-edit that generated file. Add new pages by adding route files rather than registering routes manually.

Use the `@/` alias for imports from `src` (for example, `@/shared/api/pokemon`). Avoid `../` and `./` paths for local module imports; relative paths are reserved for same-file side-effect imports only when needed.

The `@/` alias is configured consistently in `tsconfig.app.json`, `vite.config.ts`, and `vitest.config.ts`.

All source and test filenames must use kebab-case, for example `pokemon-card.tsx` and `pokemon-card.test.tsx`. Keep exported component names in PascalCase even when their filenames are kebab-case.
Keep all unit, component, and end-to-end tests under `src/shared/tests/`. Keep browser tests under `src/shared/tests/e2e/` and shared Vitest setup in `src/shared/tests/setup.ts`.

## Data fetching and state

- Use TanStack Query for remote PokéAPI data.
- Keep API request functions and types in `src/shared/api`.
- Use stable query keys containing the resource and identifier.
- Include pagination parameters in query keys and API requests; keep the current catalog page in the route search params.
- Surface loading and error states in the UI.
- Keep server state in TanStack Query rather than duplicating it in Zustand.
- Use Zustand for client-side favorites state and Dexie.js for IndexedDB persistence; do not use Zustand's storage middleware for favorites.
- Discover recommendations must filter out the current favorites list immediately before selecting a random result.
- Use TanStack Table for tabular collection Pokémon data; keep row actions explicit and preserve row selection for the detail view.
- Use TanStack Table v9's current `useTable`, `tableFeatures`, and `createColumnHelper` APIs; do not import deprecated legacy compatibility APIs.
- Use Tailwind CSS utilities for new styling; preserve existing semantic CSS classes when changing established UI.
- Keep global styles in `src/index.scss`; new styles must use SCSS syntax and should not introduce additional global CSS files.
- Use Roboto for the primary UI font and DM Mono for metadata, labels, and compact numeric information.

## Routing

- Define routes through TanStack Router.
- Add routes under `src/routes` using the file-based naming convention.
- Use route parameters for Pokémon detail pages.
- Use TanStack Router `Link` components for internal navigation.
- GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml`; preserve the repository-derived Vite base path and `404.html` SPA fallback.
- Preserve `/` and `/pokemon/$pokemonName` unless a requirement explicitly changes them.

## UI conventions

- Preserve the existing visual language, typography, and responsive behavior.
- Use semantic HTML, visible focus states, and accessible labels.
- Every React `<button>` must declare an explicit `type`. Use `type="button"` outside forms; use `type="submit"` or `type="reset"` only when that is the button's intended form behavior.
- Prefer shared shadcn-style components from `src/shared/ui` over one-off buttons and select controls.
- Reuse existing components and styles before introducing new patterns.
- Use official artwork from PokéAPI where available.
- Keep user-facing copy concise and consistent with the product tone.

## Testing conventions

- Use Vitest with `jsdom` for unit and UI tests.
- Use Playwright for end-to-end tests; keep browser tests independent from external APIs by routing deterministic test responses.
- Use React Testing Library and `user-event` for component behavior.
- Test user-visible behavior rather than implementation details.
- Reset Zustand state explicitly in tests that mutate global state.
- Add or update tests for interactive behavior and meaningful loading/error states.
- Use TanStack Form for interactive forms and Zod schemas for validation; avoid duplicating form state with ad hoc controlled state.

## Documentation and change guidelines

- Keep `README.md` focused on the product, architecture, setup, and validation workflow.
- Update `Agents.md` when tooling, architecture, package-manager, linting, testing, or contribution conventions change.
- Use PNPM commands in all project documentation.
- Treat `src/routeTree.gen.ts` as generated output managed by the TanStack Router Vite plugin.
- Make focused changes, avoid unrelated refactors, and prefer typed helpers over broad casts.
- Run targeted validation, then `pnpm build` for application code changes.
