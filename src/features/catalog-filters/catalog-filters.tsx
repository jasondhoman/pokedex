import { useState } from "react";

import { PokemonSearch } from "@/features/search/pokemon-search";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

export type CatalogFilters = {
  type: string;
  height: string;
  weight: string;
};

type CatalogFiltersProps = {
  filters: CatalogFilters;
  search: string;
  isSearchLoading: boolean;
  isLoadingAttributes: boolean;
  onChange: (filters: CatalogFilters) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
};

const typeOptions = ["fire", "water", "grass", "electric", "psychic", "dark", "fairy", "dragon"];

export function CatalogFilters({
  filters,
  search,
  isSearchLoading,
  isLoadingAttributes,
  onChange,
  onSearchChange,
  onClear,
}: CatalogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = filters.type !== "any" || filters.height !== "any" || filters.weight !== "any";

  return (
    <section className="catalog-filters" aria-labelledby="catalog-filters-title">
      <div className="catalog-filters-heading">
        <div>
          <div className="eyebrow">REFINE THE CATALOG</div>
          <h2 id="catalog-filters-title">Search and filter Pokémon.</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          aria-expanded={isOpen}
          aria-controls="catalog-filter-controls"
          onClick={() => setIsOpen(current => !current)}
        >
          {isOpen ? "Hide filters" : "Show filters"}
        </Button>
      </div>
      {isOpen && (
        <div id="catalog-filter-controls">
          <div className="catalog-filter-search">
            <PokemonSearch isLoading={isSearchLoading} value={search} onChange={onSearchChange} />
          </div>
          <div className="catalog-filter-fields">
            <label>
              Type
              <Select value={filters.type} onValueChange={type => onChange({ ...filters, type })}>
                <SelectTrigger aria-label="Type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any type</SelectItem>
                  {typeOptions.map(type => <SelectItem value={type} key={type}>{type[0].toUpperCase() + type.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </label>
            <label>
              Height
              <Select value={filters.height} onValueChange={height => onChange({ ...filters, height })}>
                <SelectTrigger aria-label="Height"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any height</SelectItem>
                  <SelectItem value="small">Small (up to 1 m)</SelectItem>
                  <SelectItem value="medium">Medium (1–2 m)</SelectItem>
                  <SelectItem value="large">Large (over 2 m)</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label>
              Weight
              <Select value={filters.weight} onValueChange={weight => onChange({ ...filters, weight })}>
                <SelectTrigger aria-label="Weight"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any weight</SelectItem>
                  <SelectItem value="light">Light (up to 10 kg)</SelectItem>
                  <SelectItem value="medium">Medium (10–50 kg)</SelectItem>
                  <SelectItem value="heavy">Heavy (over 50 kg)</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
          <div className="catalog-filters-actions">
            <Button type="button" variant="outline" onClick={onClear} disabled={!hasActiveFilters}>
              Clear filters
            </Button>
            {isLoadingAttributes && <span className="catalog-filter-status" role="status">Loading attributes...</span>}
          </div>
        </div>
      )}
    </section>
  );
}
