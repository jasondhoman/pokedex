import type { ReactNode } from "react";

import type { PokemonSummary } from "@/shared/api/pokemon";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogPage } from "@/routes/index";
import { pokemonApi } from "@/shared/api/pokemon";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
  createFileRoute: () => (config: object) => ({
    ...config,
    useNavigate: () => navigate,
    useSearch: () => ({ page: 2 }),
  }),
}));

const pokemon: PokemonSummary[] = Array.from({ length: 25 }, (_, index) => ({
  name: `pokemon-${index + 1}`,
  url: `https://pokeapi.co/api/v2/pokemon/${index + 1}/`,
}));

describe("catalog pagination", () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.spyOn(pokemonApi, "list").mockResolvedValue({
      count: pokemon.length,
      results: pokemon,
    });
  });

  it("does not reset a page from the URL on initial render", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <CatalogPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("filters Pokémon by type and clears attribute filters", async () => {
    const user = userEvent.setup();
    vi.spyOn(pokemonApi, "detail").mockImplementation(async name => ({
      id: Number(name.replace("pokemon-", "")),
      name,
      height: 7,
      weight: 69,
      types: [{ type: { name: name === "pokemon-1" ? "fire" : "water" } }],
      stats: [],
      sprites: { front_default: null },
    }));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <CatalogPage />
      </QueryClientProvider>,
    );

    expect(screen.queryByRole("textbox", { name: /search pokémon/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /show filters/i }));
    await screen.findByRole("heading", { name: /search and filter pokémon/i });
    expect(screen.getByRole("textbox", { name: /search pokémon/i })).toBeVisible();
    await user.click(screen.getByRole("combobox", { name: "Type" }));
    await user.click(screen.getByRole("option", { name: "Fire" }));

    expect(await screen.findByRole("heading", { name: /pokemon 1/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /pokemon 2/i })).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith({ resetScroll: false, search: { page: 1 } });

    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(await screen.findByRole("heading", { name: /pokemon 2/i })).toBeInTheDocument();
  });
});
