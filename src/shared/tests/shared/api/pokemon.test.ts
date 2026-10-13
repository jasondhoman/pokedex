import axios, { AxiosHeaders } from "axios";
import { describe, expect, it, vi } from "vitest";

import { http } from "@/shared/api/client";
import { formatPokemonName, getPokemonId, pokemonApi } from "@/shared/api/pokemon";

describe("pokemon api helpers", () => {
  const makeResponse = <T>(data: T) => ({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

  it("extracts the numeric id from a PokéAPI URL", () => {
    expect(getPokemonId("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
  });

  it("formats hyphenated Pokémon names", () => {
    expect(formatPokemonName("mr-mime")).toBe("mr mime");
  });

  it("requests paginated Pokémon summaries", async () => {
    const payload = { count: 1, results: [{ name: "pikachu", url: "/25/" }] };
    vi.spyOn(axios, "get").mockResolvedValue(makeResponse(payload));

    await expect(pokemonApi.list(12, 24)).resolves.toEqual(payload);
    expect(axios.get).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon?limit=12&offset=24");
  });

  it("normalizes detail names and reports API failures", async () => {
    vi.spyOn(axios, "get").mockRejectedValue(Object.assign(new Error("Request failed"), {
      isAxiosError: true,
      response: { status: 500 },
    }));

    await expect(pokemonApi.detail("Mr-Mime")).rejects.toThrow("Unable to reach the Pokédex right now.");
    expect(axios.get).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon/mr-mime");
  });

  it("sends post, put, and delete requests and returns response data", async () => {
    const payload = { ok: true };
    vi.spyOn(axios, "post").mockResolvedValue(makeResponse(payload));
    vi.spyOn(axios, "put").mockResolvedValue(makeResponse(payload));
    vi.spyOn(axios, "delete").mockResolvedValue(makeResponse(payload));

    await expect(Promise.all([
      http.post("/pokemon", payload),
      http.put("/pokemon/25", payload),
      http.delete("/pokemon/25"),
    ])).resolves.toEqual([payload, payload, payload]);
    expect(axios.post).toHaveBeenCalledWith("/pokemon", payload);
    expect(axios.put).toHaveBeenCalledWith("/pokemon/25", payload);
    expect(axios.delete).toHaveBeenCalledWith("/pokemon/25");
  });
});
