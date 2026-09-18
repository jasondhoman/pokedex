import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { formatPokemonName, pokemonApi } from "@/shared/api/pokemon";
import { ImageWithSkeleton } from "@/shared/ui/image-with-skeleton";

export const Route = createFileRoute("/pokemon/$pokemonName")({ component: DetailPage });

function DetailPage() {
  const { pokemonName } = Route.useParams();
  const { data: pokemon, isLoading, isError } = useQuery({ queryKey: ["pokemon", pokemonName], queryFn: () => pokemonApi.detail(pokemonName) });

  if (isLoading)
    return <div className="detail-loading">Loading profile...</div>;
  if (isError || !pokemon)
    return <div className="detail-loading">Pokémon not found.</div>;
  const artwork = pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default;

  return (
    <div className="page-container detail-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={17} />
        {" "}
        Back to all Pokémon
      </Link>
      <section className="detail-card">
        <div className="collection-detail-art">

          <ImageWithSkeleton src={artwork ?? ""} alt={pokemon.name} />
        </div>
        <div className="detail-copy">
          <div className="eyebrow">POKÉMON PROFILE</div>
          <span>
            #
            {String(pokemon.id).padStart(3, "0")}
          </span>
          <h1>{formatPokemonName(pokemon.name)}</h1>
          <div className="type-list">{pokemon.types.map(({ type }) => <span key={type.name} className={`type-pill type-${type.name}`}>{type.name}</span>)}</div>
          <div className="measurements">
            <div>
              <small>HEIGHT</small>
              <strong>
                {(pokemon.height / 10).toFixed(1)}
                {" "}
                m
              </strong>
            </div>
            <div>
              <small>WEIGHT</small>
              <strong>
                {(pokemon.weight / 10).toFixed(1)}
                {" "}
                kg
              </strong>
            </div>
          </div>
          <div className="stats">
            {pokemon.stats.slice(0, 4).map(({ base_stat, stat }) => (
              <div className="stat" key={stat.name}>
                <div>
                  <span>{stat.name.replace("-", " ")}</span>
                  <b>{base_stat}</b>
                </div>
                <div className="stat-bar"><i style={{ width: `${Math.min(base_stat, 150) / 1.5}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
