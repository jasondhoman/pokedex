import type { ReactNode } from "react";

import type { PokemonSummary } from "@/shared/api/pokemon";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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
});
