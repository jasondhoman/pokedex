import { LoaderCircle, Search, X } from "lucide-react";
import { useState } from "react";

type Props = { isLoading?: boolean; value: string; onChange: (value: string) => void };

export function PokemonSearch({ isLoading = false, value, onChange }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <label className={`search-box ${focused ? "is-focused" : ""}`}>
      <Search size={20} aria-hidden="true" />
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search Pokémon by name..."
        aria-label="Search Pokémon by name"
        aria-busy={isLoading}
      />
      {isLoading && (
        <span className="search-loading" role="status" aria-label="Searching">
          <LoaderCircle size={18} aria-hidden="true" />
        </span>
      )}
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search">
          <X size={18} />
        </button>
      )}
      {!value && <kbd>⌘ K</kbd>}
    </label>
  );
}
