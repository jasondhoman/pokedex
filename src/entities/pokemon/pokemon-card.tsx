import type { PokemonSummary } from "@/shared/api/pokemon";

import { Link } from "@tanstack/react-router";

import { useFavoritesStore } from "@/features/favorites/model/store";
import { formatPokemonName, getPokemonId } from "@/shared/api/pokemon";
import { Button } from "@/shared/ui/button";
import { ImageWithSkeleton } from "@/shared/ui/image-with-skeleton";
import { PokeballIcon } from "@/shared/ui/pokeball-icon";

type Props = { pokemon: PokemonSummary };

export function PokemonCard({ pokemon }: Props) {
  const id = getPokemonId(pokemon.url);
  const isFavorite = useFavoritesStore(state => state.isFavorite(pokemon.name));
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);

  return (
    <article className="pokemon-card">
      <Link to="/pokemon/$pokemonName" params={{ pokemonName: pokemon.name }} className="card-link">
        <div className="card-image">
          <span className="card-number">
            #
            {String(id).padStart(3, "0")}
          </span>
          <ImageWithSkeleton
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
            alt={pokemon.name}
            loading="lazy"
          />
        </div>
        <div className="card-copy">
          <h3>{formatPokemonName(pokemon.name)}</h3>
          <span>
            Explore profile
            <span className="pl-1" aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>
      <Button
        type="button"
        className={`favorite-button ${isFavorite ? "is-favorite" : ""}`}
        onClick={() => toggleFavorite(pokemon.name)}
        aria-label={`${isFavorite ? "Remove" : "Add"} ${pokemon.name} ${isFavorite ? "from" : "to"} favorites`}
      >
        <PokeballIcon active={isFavorite} size={18} />
      </Button>
    </article>
  );
}
