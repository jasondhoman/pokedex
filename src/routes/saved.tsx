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

export const Route = createFileRoute("/saved")({ component: SavedPage });

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, Pokemon>();

export function SavedPage() {
  const favorites = useFavoritesStore(state => state.favorites);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [selectedName, setSelectedName] = useState<string | null>(favorites[0] ?? null);
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
    data: filteredPokemon,
    columns,
    features,
  });

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
                  <tr key={headerGroup.id}>{headerGroup.headers.map(header => <th key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</th>)}</tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={row.original.name === selectedName ? "is-selected" : ""} onClick={() => setSelectedName(row.original.name)}>
                    {row.getAllCells().map(cell => <td key={cell.id}><table.FlexRender cell={cell} /></td>)}
                  </tr>
                ))}
                {filteredPokemon.length === 0 && (
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
