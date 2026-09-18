export type PokemonSummary = {
  name: string;
  url: string;
};

export type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  sprites: {
    front_default: string | null;
    other?: { "official-artwork"?: { front_default: string | null } };
  };
};

type PokemonListResponse = {
  count: number;
  results: PokemonSummary[];
};

const API_URL = "https://pokeapi.co/api/v2";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok)
    throw new Error("Unable to reach the Pokédex right now.");
  return response.json() as Promise<T>;
}

export const pokemonApi = {
  list: (limit = 24, offset = 0) => fetchJson<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`),
  discoverPool: () => fetchJson<PokemonListResponse>("/pokemon?limit=151&offset=0"),
  detail: (name: string) => fetchJson<Pokemon>(`/pokemon/${name.toLowerCase()}`),
};

export function getPokemonId(url: string) {
  return Number(url.split("/").filter(Boolean).at(-1));
}

export function formatPokemonName(name: string) {
  return name.replaceAll("-", " ");
}
