import type { CatalogFilters as CatalogFiltersState } from "@/features/catalog-filters/catalog-filters";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { z } from "zod";

import { PokemonCard } from "@/entities/pokemon/pokemon-card";
import { CatalogFilters } from "@/features/catalog-filters/catalog-filters";
import { pokemonApi } from "@/shared/api/pokemon";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Button } from "@/shared/ui/button";

const PAGE_SIZE = 24;
const defaultFilters = { type: "any", height: "any", weight: "any" } as const;

export const Route = createFileRoute("/")({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).catch(1),
  }),
  component: CatalogPage,
});

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFiltersState>(defaultFilters);
  const debouncedSearch = useDebouncedValue(search);
  const previousSearch = useRef(debouncedSearch);
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "list"],
    queryFn: () => pokemonApi.list(1302),
  });
  const { data: pokemonDetails = [], isLoading: isLoadingAttributes } = useQuery({
    queryKey: ["pokemon", "attributes"],
    queryFn: () => Promise.all((data?.results ?? []).map(pokemon => pokemonApi.detail(pokemon.name))),
    enabled: Boolean(data) && hasActiveFilters(filters),
  });
  const detailsByName = new Map(pokemonDetails.map(pokemon => [pokemon.name, pokemon]));
  const filtered = data?.results.filter((pokemon) => {
    if (!pokemon.name.includes(debouncedSearch.trim().toLowerCase()))
      return false;
    const detail = detailsByName.get(pokemon.name);
    return !hasActiveFilters(filters) || (detail !== undefined && matchesFilters(detail, filters));
  }) ?? [];
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
      void navigate({ resetScroll: false, search: { page: 1 } });
    }
  }, [debouncedSearch, navigate]);

  useEffect(() => {
    if (hasActiveFilters(filters))
      void navigate({ resetScroll: false, search: { page: 1 } });
  }, [filters, navigate]);

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
      <CatalogFilters
        filters={filters}
        search={search}
        isSearchLoading={search !== debouncedSearch}
        isLoadingAttributes={isLoadingAttributes}
        onChange={setFilters}
        onSearchChange={updateSearch}
        onClear={() => setFilters(defaultFilters)}
      />
      <section className="toolbar" aria-label="Catalog results">
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
      </section>
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
              <Button type="button" variant="outline" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                Previous
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
              <Button type="button" variant="outline" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                Next
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}

function hasActiveFilters(filters: CatalogFiltersState) {
  return filters.type !== "any" || filters.height !== "any" || filters.weight !== "any";
}

function matchesFilters(pokemon: { types: Array<{ type: { name: string } }>; height: number; weight: number }, filters: CatalogFiltersState) {
  const matchesType = filters.type === "any" || pokemon.types.some(({ type }) => type.name === filters.type);
  const matchesHeight = filters.height === "any"
    || (filters.height === "small" && pokemon.height <= 10)
    || (filters.height === "medium" && pokemon.height > 10 && pokemon.height <= 20)
    || (filters.height === "large" && pokemon.height > 20);
  const matchesWeight = filters.weight === "any"
    || (filters.weight === "light" && pokemon.weight <= 100)
    || (filters.weight === "medium" && pokemon.weight > 100 && pokemon.weight <= 500)
    || (filters.weight === "heavy" && pokemon.weight > 500);
  return matchesType && matchesHeight && matchesWeight;
}
