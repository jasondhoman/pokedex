import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

import { useFavoritesStore } from "@/features/favorites/model/store";
import { useThemeStore } from "@/shared/model/theme-store";
import { PokeballIcon } from "@/shared/ui/pokeball-icon";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } } });

function Shell() {
  const favoritesCount = useFavoritesStore(state => state.favorites.length);
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const pathname = useRouterState({ select: state => state.location.pathname });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-shell" data-theme={theme}>
        <header className="site-header">
          <Link to="/" className="brand">
            <span className="brand-mark">◒</span>
            <span>
              Poké
              <span>dex</span>
            </span>
          </Link>
          <nav>
            <Link to="/discover" activeProps={{ className: "active" }}>Discover</Link>
            <Link to="/saved" activeProps={{ className: "active" }} className="favorites-nav">
              <PokeballIcon active={pathname === "/saved"} size={16} />
              {" "}
              {favoritesCount}
              {" "}
              Collection
            </Link>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <span className={theme === "light" ? "active" : ""}>Light</span>
              <span className={theme === "dark" ? "active" : ""}>Dark</span>
            </button>
          </nav>
        </header>
        <main><Outlet /></main>
        <footer>
          <span>
            Data from
            {" "}
            <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>
          </span>
          <a
            className="github-link"
            href="https://github.com/jasondhoman/pokedex"
            target="_blank"
            rel="noreferrer"
            aria-label="View Pokédex source code on GitHub"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1 1.9.8 2.1 1.5 1 .1 2-.7 2.5-1.1.1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.3.7 1 .7 2v3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
            </svg>
            <span>GitHub</span>
          </a>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({ component: Shell });
