import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { PokemonCard } from "@/entities/pokemon/pokemon-card";
import { PokemonSearch } from "@/features/search/pokemon-search";
import { pokemonApi } from "@/shared/api/pokemon";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Button } from "@/shared/ui/button";

const PAGE_SIZE = 24;

export const Route = createFileRoute("/")({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).catch(1),
  }),
  component: CatalogPage,
});

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const previousSearch = useRef(debouncedSearch);
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "list"],
    queryFn: () => pokemonApi.list(1302),
  });
  const filtered = data?.results.filter(pokemon => pokemon.name.includes(debouncedSearch.trim().toLowerCase())) ?? [];
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const visiblePokemon = filtered.slice(offset, offset + PAGE_SIZE);

  function goToPage(nextPage: number) {
    void navigate({ search: { page: nextPage } });
  }

  function updateSearch(value: string) {
    setSearch(value);
  }

  useEffect(() => {
    if (previousSearch.current !== debouncedSearch) {
      previousSearch.current = debouncedSearch;
      void navigate({ search: { page: 1 } });
    }
  }, [debouncedSearch, navigate]);

  return (
    <div className="page-container">
      <section className="hero-copy">
        <div className="eyebrow">
          <Sparkles size={14} />
          {" "}
          THE ULTIMATE POKÉDEX
        </div>
        <h1>
          Know them
          <br />
          <em>all.</em>
        </h1>
        <p>Explore the world of Pokémon. Discover their strengths, stories, and what makes each one unique.</p>
      </section>
      <div className="toolbar">
        <PokemonSearch isLoading={search !== debouncedSearch} value={search} onChange={updateSearch} />
        <span className="result-count">
          {filtered.length ? offset + 1 : 0}
          –
          {Math.min(offset + PAGE_SIZE, filtered.length)}
          {" "}
          of
          {" "}
          {filtered.length || data?.count || "—"}
          {" "}
          Pokémon
        </span>
      </div>
      {isLoading && <div className="loading-grid">{Array.from({ length: 8 }, (_, index) => <div className="skeleton" key={index} />)}</div>}
      {isError && <div className="error-state">We couldn't load the Pokédex. Please refresh and try again.</div>}
      {!isLoading && !isError && (
        <div className="pokemon-grid">
          {visiblePokemon.map(pokemon => <PokemonCard key={pokemon.name} pokemon={pokemon} />)}
          {filtered.length === 0 && (
            <div className="empty-state">
              No Pokémon match “
              {search}
              ”.
            </div>
          )}
          {!isLoading && !isError && (
            <nav className="pagination" aria-label="Pokémon pages">
              <Button variant="outline" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                ←
              </Button>
              <span className="text-nowrap">
                Page
                {" "}
                {currentPage}
                {" "}
                of
                {" "}
                {totalPages}
              </span>
              <Button variant="outline" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                →
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
