import type { Pokemon } from "@/shared/api/pokemon";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { DiscoverForm, matchesPokemon } from "@/features/discover/discover-form";
import { useFavoritesStore } from "@/features/favorites/model/store";
import { pokemonApi } from "@/shared/api/pokemon";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; to: string }) => <a href={props.to}>{children}</a>,
}));

const pikachu: Pokemon = {
  id: 25,
  name: "pikachu",
  height: 4,
  weight: 60,
  types: [{ type: { name: "electric" } }],
  stats: [
    { base_stat: 35, stat: { name: "hp" } },
    { base_stat: 55, stat: { name: "attack" } },
    { base_stat: 40, stat: { name: "defense" } },
    { base_stat: 90, stat: { name: "speed" } },
  ],
  sprites: { front_default: "pikachu.png" },
};

function renderDiscover() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <DiscoverForm />
    </QueryClientProvider>,
  );
}

describe("matchesPokemon", () => {
  it("matches type, size, and battle style preferences", () => {
    expect(matchesPokemon(pikachu, { type: "electric", size: "small", style: "fast" })).toBe(true);
    expect(matchesPokemon(pikachu, { type: "fire", size: "any", style: "any" })).toBe(false);
    expect(matchesPokemon(pikachu, { type: "any", size: "large", style: "any" })).toBe(false);
  });

  it("supports any preferences and balanced thresholds", () => {
    expect(matchesPokemon(pikachu, { type: "any", size: "any", style: "any" })).toBe(true);
    expect(matchesPokemon(pikachu, { type: "any", size: "any", style: "balanced" })).toBe(false);
  });
});

describe("discoverForm", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [] });
    vi.spyOn(pokemonApi, "discoverPool").mockResolvedValue({
      count: 1,
      results: [{ name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon/25/" }],
    });
    vi.spyOn(pokemonApi, "detail").mockResolvedValue(pikachu);
  });

  it("discovers and displays a collection match", async () => {
    const user = userEvent.setup();
    renderDiscover();

    await user.click(screen.getByRole("button", { name: /discover pokémon/i }));

    expect(await screen.findByText("YOUR MATCH")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "pikachu" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view profile/i })).toHaveAttribute("href", "/pokemon/$pokemonName");
  });

  it("does not recommend a favorite Pokémon", async () => {
    const user = userEvent.setup();
    useFavoritesStore.setState({ favorites: ["pikachu"] });
    renderDiscover();

    await user.click(screen.getByRole("button", { name: /discover pokémon/i }));

    expect(await screen.findByText(/no collection pokémon match/i)).toBeInTheDocument();
    expect(screen.queryByText("YOUR MATCH")).not.toBeInTheDocument();
  });
});
