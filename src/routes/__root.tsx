import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

import { useFavoritesStore } from "@/features/favorites/model/store";
import { PokeballIcon } from "@/shared/ui/pokeball-icon";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } } });

function Shell() {
  const favoritesCount = useFavoritesStore(state => state.favorites.length);
  const pathname = useRouterState({ select: state => state.location.pathname });

  return (
    <QueryClientProvider client={queryClient}>
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
            saved
          </Link>
        </nav>
      </header>
      <main><Outlet /></main>
      <footer>
        <span>Built with React + TypeScript</span>
        <span>
          Data from
          <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>
        </span>
      </footer>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({ component: Shell });
