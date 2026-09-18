import type { Pokemon } from "@/shared/api/pokemon";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import { X } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useFavoritesStore } from "@/features/favorites/model/store";
import { PokemonSearch } from "@/features/search/pokemon-search";
import { formatPokemonName, pokemonApi } from "@/shared/api/pokemon";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Button } from "@/shared/ui/button";
import { PokeballIcon } from "@/shared/ui/pokeball-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

export const Route = createFileRoute("/saved")({ component: SavedPage });

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, Pokemon>();
type PageSize = 10 | 20 | 30 | "all";
type SortKey = "id" | "name" | "types" | "height" | "weight";
type SortDirection = "asc" | "desc";

export function SavedPage() {
  const favorites = useFavoritesStore(state => state.favorites);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [selectedName, setSelectedName] = useState<string | null>(favorites[0] ?? null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "id", direction: "asc" });
  const { data: savedPokemon = [], isLoading, isError } = useQuery({
    queryKey: ["pokemon", "saved", favorites],
    queryFn: () => Promise.all(favorites.map(name => pokemonApi.detail(name))),
    enabled: favorites.length > 0,
  });

  useEffect(() => {
    if (selectedName && !favorites.includes(selectedName))
      setSelectedName(favorites[0] ?? null);
    if (!selectedName && favorites.length > 0)
      setSelectedName(favorites[0]);
  }, [favorites, selectedName]);

  const selectedPokemon = savedPokemon.find(pokemon => pokemon.name === selectedName) ?? null;
  const filteredPokemon = savedPokemon.filter(pokemon => pokemon.name.includes(debouncedSearch.trim().toLowerCase()));
  const sortedPokemon = useMemo(() => [...filteredPokemon].sort((a, b) => {
    const first = sort.key === "types" ? a.types.map(({ type }) => type.name).join(" / ") : a[sort.key];
    const second = sort.key === "types" ? b.types.map(({ type }) => type.name).join(" / ") : b[sort.key];
    const comparison = typeof first === "number" && typeof second === "number"
      ? first - second
      : String(first).localeCompare(String(second));
    return sort.direction === "asc" ? comparison : -comparison;
  }), [filteredPokemon, sort]);
  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(sortedPokemon.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visiblePokemon = pageSize === "all"
    ? sortedPokemon
    : sortedPokemon.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const columns = useMemo(() => columnHelper.columns([
    columnHelper.accessor("id", {
      header: "No.",
      cell: info => `#${String(info.getValue()).padStart(3, "0")}`,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: info => formatPokemonName(info.getValue()),
    }),
    columnHelper.display({
      id: "types",
      header: "Type",
      cell: info => info.row.original.types.map(({ type }) => type.name).join(" / "),
    }),
    columnHelper.accessor("height", {
      header: "Height",
      cell: info => `${(info.getValue() / 10).toFixed(1)} m`,
    }),
    columnHelper.accessor("weight", {
      header: "Weight",
      cell: info => `${(info.getValue() / 10).toFixed(1)} kg`,
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: info => (
        <Button
          variant="ghost"
          className="table-action"
          aria-label={`Unsave ${info.row.original.name}`}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(info.row.original.name);
          }}
        >
          <X size={15} />
          Unsave
        </Button>
      ),
    }),
  ]), [toggleFavorite]);

  const table = useTable({
    data: visiblePokemon,
    columns,
    features,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize, sort]);

  function toggleSort(key: SortKey) {
    setSort(current => current.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: "asc" });
  }

  return (
    <div className="page-container saved-page">
      <section className="saved-heading">
        <div>
          <div className="eyebrow">
            <PokeballIcon size={14} />
            {" "}
            YOUR SAVED POKÉMON
          </div>
          <h1>Your collection.</h1>
          <p>Click a row to inspect a Pokémon. You can remove favorites whenever you like.</p>
        </div>
        <span className="saved-count">
          {favorites.length}
          {" "}
          saved
        </span>
      </section>
      {isLoading && <div className="saved-status">Loading your collection...</div>}
      {isError && <div className="saved-status">We could not load your saved Pokémon. Please try again.</div>}
      {!isLoading && !isError && favorites.length === 0 && (
        <div className="saved-empty">
          <PokeballIcon size={24} />
          <h2>No saved Pokémon yet.</h2>
          <p>Favorite a Pokémon from the catalog to see it here.</p>
        </div>
      )}
      {!isLoading && !isError && favorites.length > 0 && (
        <>
          <div className="saved-table-toolbar">
            <PokemonSearch isLoading={search !== debouncedSearch} value={search} onChange={setSearch} />
            <span className="result-count">
              {filteredPokemon.length}
              {" "}
              of
              {" "}
              {savedPokemon.length}
              {" "}
              saved
            </span>
          </div>
          <div className="saved-table-wrap">
            <table className="saved-table">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder || header.id === "actions"
                          ? null
                          : (
                              <button type="button" className="table-sort" onClick={() => toggleSort(header.id as SortKey)}>
                                <table.FlexRender header={header} />
                                <span aria-hidden="true">{sort.key === header.id ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
                              </button>
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={row.original.name === selectedName ? "is-selected" : ""} onClick={() => setSelectedName(row.original.name)}>
                    {row.getAllCells().map(cell => <td key={cell.id}><table.FlexRender cell={cell} /></td>)}
                  </tr>
                ))}
                {sortedPokemon.length === 0 && (
                  <tr>
                    <td colSpan={columns.length}>
                      No saved Pokémon match “
                      {search}
                      ”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="saved-table-pagination">
            <span>
              {sortedPokemon.length === 0 ? 0 : ((currentPage - 1) * (pageSize === "all" ? sortedPokemon.length : pageSize)) + 1}
              –
              {pageSize === "all" ? sortedPokemon.length : Math.min(currentPage * pageSize, sortedPokemon.length)}
              {" of "}
              {sortedPokemon.length}
            </span>
            <div className="saved-page-controls">
              <Button type="button" variant="outline" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
              <span>{`Page ${currentPage} of ${totalPages}`}</span>
              <Button type="button" variant="outline" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
              <Select value={String(pageSize)} onValueChange={value => setPageSize(value === "all" ? "all" : Number(value) as PageSize)}>
                <SelectTrigger className="saved-page-size"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="30">30 per page</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedPokemon && <SavedDetail pokemon={selectedPokemon} />}
        </>
      )}
    </div>
  );
}

function SavedDetail({ pokemon }: { pokemon: Pokemon }) {
  const artwork = pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default;
  return (
    <article className="saved-detail">
      <div className="saved-detail-art"><img src={artwork ?? ""} alt={pokemon.name} /></div>
      <div className="saved-detail-copy">
        <span className="result-label">SELECTED POKÉMON</span>
        <h2>{formatPokemonName(pokemon.name)}</h2>
        <div className="type-list">{pokemon.types.map(({ type }) => <span className={`type-pill type-${type.name}`} key={type.name}>{type.name}</span>)}</div>
        <div className="saved-detail-stats">
          <span>
            Height
            <strong>
              {(pokemon.height / 10).toFixed(1)}
              {" "}
              m
            </strong>
          </span>
          <span>
            Weight
            <strong>
              {(pokemon.weight / 10).toFixed(1)}
              {" "}
              kg
            </strong>
          </span>
          <span>
            Base exp.
            <strong>{pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}</strong>
          </span>
        </div>
      </div>
    </article>
  );
}
