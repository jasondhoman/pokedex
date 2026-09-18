import { describe, expect, it, vi } from "vitest";

import { formatPokemonName, getPokemonId, pokemonApi } from "@/shared/api/pokemon";

describe("pokemon api helpers", () => {
  it("extracts the numeric id from a PokéAPI URL", () => {
    expect(getPokemonId("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
  });

  it("formats hyphenated Pokémon names", () => {
    expect(formatPokemonName("mr-mime")).toBe("mr mime");
  });

  it("requests paginated Pokémon summaries", async () => {
    const response = { count: 1, results: [{ name: "pikachu", url: "/25/" }] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));

    await expect(pokemonApi.list(12, 24)).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon?limit=12&offset=24");
  });

  it("normalizes detail names and reports API failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("error", { status: 500 })));

    await expect(pokemonApi.detail("Mr-Mime")).rejects.toThrow("Unable to reach the Pokédex right now.");
    expect(fetch).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon/mr-mime");
  });
});
