import type { Pokemon } from "@/shared/api/pokemon";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Dices, Sparkles } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { useFavoritesStore } from "@/features/favorites/model/store";
import { formatPokemonName, pokemonApi } from "@/shared/api/pokemon";
import { Button } from "@/shared/ui/button";
import { ImageWithSkeleton } from "@/shared/ui/image-with-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const discoverSchema = z.object({
  type: z.enum(["any", "fire", "water", "grass", "electric", "psychic", "dark", "fairy", "dragon"]),
  size: z.enum(["any", "small", "medium", "large"]),
  style: z.enum(["any", "strong", "fast", "balanced"]),
});

type DiscoverResult = z.infer<typeof discoverSchema>;

export function matchesPokemon(pokemon: Pokemon, preferences: DiscoverResult) {
  const matchesType = preferences.type === "any" || pokemon.types.some(({ type }) => type.name === preferences.type);
  const matchesSize = preferences.size === "any"
    || (preferences.size === "small" && pokemon.height <= 10)
    || (preferences.size === "medium" && pokemon.height > 10 && pokemon.height <= 20)
    || (preferences.size === "large" && pokemon.height > 20);
  const totalStats = pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
  const speed = pokemon.stats.find(stat => stat.stat.name === "speed")?.base_stat ?? 0;
  const matchesStyle = preferences.style === "any"
    || (preferences.style === "strong" && totalStats >= 450)
    || (preferences.style === "fast" && speed >= 80)
    || (preferences.style === "balanced" && totalStats >= 300 && speed >= 50);

  return matchesType && matchesSize && matchesStyle;
}

export function DiscoverForm() {
  const [result, setResult] = useState<Pokemon | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const favorites = useFavoritesStore(state => state.favorites);
  const discoverQuery = useQuery({
    queryKey: ["pokemon", "discover-pool"],
    queryFn: async () => {
      const pool = await pokemonApi.discoverPool();
      return Promise.all(pool.results.map(pokemon => pokemonApi.detail(pokemon.name)));
    },
    enabled: false,
  });

  const defaultValues: DiscoverResult = {
    type: "any",
    size: "any",
    style: "any",
  };
  const form = useForm({
    defaultValues: {
      ...defaultValues,
    },
    validators: {
      onSubmit: discoverSchema,
    },
    onSubmit: async ({ value }) => {
      setHasSearched(true);
      setResult(null);
      const response = await discoverQuery.refetch();
      const matches = (response.data ?? []).filter(pokemon => !favorites.includes(pokemon.name) && matchesPokemon(pokemon, value));
      setResult(matches[Math.floor(Math.random() * matches.length)] ?? null);
    },
  });

  async function discoverPokemon() {
    await form.handleSubmit();
  }

  return (
    <div className="discover-layout">
      <section className="discover-intro">
        <div className="eyebrow">
          <Sparkles size={14} />
          {" "}
          FIND YOUR NEXT PARTNER
        </div>
        <h1 id="discover-page-title">
          Who will you meet?
        </h1>
        <p>Tell us what you are looking for and we will pick a Pokémon you have not added to your collection yet.</p>
        <div className="discover-note">
          <Dices size={17} />
          {" "}
          Every result is randomly selected.
        </div>
      </section>
      <section className="discover-panel">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void discoverPokemon();
          }}
        >
          <fieldset>
            <legend>What type are you drawn to?</legend>
            <form.Field name="type">
              {field => (
                <Select value={field.state.value} onValueChange={value => field.handleChange(value as DiscoverResult["type"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Surprise Me</SelectItem>
                    {["fire", "water", "grass", "electric", "psychic", "dark", "fairy", "dragon"].map(type => <SelectItem value={type} key={type}>{formatPokemonName(type).replace(/^./, character => character.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </fieldset>
          <fieldset>
            <legend>How big should they be?</legend>
            <form.Field name="size">
              {field => (
                <Select value={field.state.value} onValueChange={value => field.handleChange(value as DiscoverResult["size"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Size</SelectItem>
                    <SelectItem value="small">Small And Speedy</SelectItem>
                    <SelectItem value="medium">A Balanced Size</SelectItem>
                    <SelectItem value="large">Big Presence</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </fieldset>
          <fieldset>
            <legend>What is their battle style?</legend>
            <form.Field name="style">
              {field => (
                <Select value={field.state.value} onValueChange={value => field.handleChange(value as DiscoverResult["style"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Keep It Mysterious</SelectItem>
                    <SelectItem value="strong">Strong And Mighty</SelectItem>
                    <SelectItem value="fast">Quick On Their Feet</SelectItem>
                    <SelectItem value="balanced">Well-Rounded</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </fieldset>
          <form.Subscribe selector={state => [state.isSubmitting, discoverQuery.isFetching]}>
            {([isSubmitting, isFetching]) => (
              <Button type="submit" className="discover-submit" disabled={isSubmitting || isFetching}>
                {isSubmitting || isFetching ? "Searching..." : "Discover Pokémon"}
                <span aria-hidden="true">↗</span>
              </Button>
            )}
          </form.Subscribe>
        </form>
        {discoverQuery.isError && <div className="discover-empty">We could not search the Pokédex right now. Please try again.</div>}
        {hasSearched && !discoverQuery.isFetching && !discoverQuery.isError && (
          result
            ? (
                <div className="discover-result">
                  <span className="result-label">YOUR MATCH</span>
                  <div className="discover-result-art">
                    <span>
                      #
                      {String(result.id).padStart(3, "0")}
                    </span>
                    <ImageWithSkeleton
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${result.id}.png`}
                      alt={result.name}
                    />
                  </div>
                  <div className="discover-result-copy">
                    <h2>{formatPokemonName(result.name)}</h2>
                    <p>This one is waiting to be discovered.</p>
                    <Link to="/pokemon/$pokemonName" params={{ pokemonName: result.name }}>View profile ↗</Link>
                  </div>
                </div>
              )
            : <div className="discover-empty">No collection Pokémon match those preferences. Try broadening your search or adding fewer Pokémon.</div>
        )}
      </section>
    </div>
  );
}
