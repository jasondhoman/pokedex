import type { Pokemon } from "@/shared/api/pokemon";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFavoritesStore } from "@/features/favorites/model/store";
import { CollectionPage } from "@/routes/collection";
import { pokemonApi } from "@/shared/api/pokemon";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({ component: null }),
}));

const bulbasaur: Pokemon = {
  id: 1,
  name: "bulbasaur",
  height: 7,
  weight: 69,
  types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
  stats: [
    { base_stat: 45, stat: { name: "hp" } },
    { base_stat: 49, stat: { name: "attack" } },
  ],
  sprites: {
    front_default: "bulbasaur.png",
    other: { "official-artwork": { front_default: "bulbasaur-art.png" } },
  },
};

const charmander: Pokemon = {
  ...bulbasaur,
  id: 4,
  name: "charmander",
  types: [{ type: { name: "fire" } }],
};

function renderCollection() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CollectionPage />
    </QueryClientProvider>,
  );
}

describe("collectionPage", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [] });
    vi.spyOn(pokemonApi, "detail").mockImplementation(async name => name === "charmander" ? charmander : bulbasaur);
  });

  it("renders the empty collection state", () => {
    renderCollection();

    expect(screen.getByRole("heading", { name: /no collection pokémon yet/i })).toBeInTheDocument();
  });

  it("renders collection rows and shows details after selecting a row", async () => {
    const user = userEvent.setup();
    useFavoritesStore.setState({ favorites: ["bulbasaur"] });
    renderCollection();

    const row = await screen.findByRole("row", { name: /bulbasaur/i });
    expect(screen.getByText("#001")).toBeInTheDocument();

    await user.click(row);

    expect(screen.getByRole("heading", { name: "bulbasaur" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "bulbasaur" })).toHaveAttribute("src", "bulbasaur-art.png");
  });

  it("unsaves a Pokémon without selecting its row", async () => {
    const user = userEvent.setup();
    useFavoritesStore.setState({ favorites: ["bulbasaur"] });
    renderCollection();

    await screen.findByRole("row", { name: /bulbasaur/i });
    await user.click(screen.getByRole("button", { name: /unsave bulbasaur/i }));

    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  it("filters collection rows by Pokémon name", async () => {
    const user = userEvent.setup();
    useFavoritesStore.setState({ favorites: ["bulbasaur", "charmander"] });
    renderCollection();

    await screen.findByRole("row", { name: /bulbasaur/i });
    const search = screen.getByRole("textbox", { name: /search pokémon/i });
    await user.type(search, "char");

    await waitFor(() => expect(screen.getByRole("row", { name: /charmander/i })).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByRole("row", { name: /bulbasaur/i })).not.toBeInTheDocument());
    expect(screen.getByText("1 of 2 collection")).toBeInTheDocument();
  });

  it("shows an empty result when no collection row matches", async () => {
    const user = userEvent.setup();
    useFavoritesStore.setState({ favorites: ["bulbasaur"] });
    renderCollection();

    await screen.findByRole("row", { name: /bulbasaur/i });
    await user.type(screen.getByRole("textbox", { name: /search pokémon/i }), "mewtwo");

    await waitFor(() => expect(screen.getByText(/no collection pokémon match/i)).toBeInTheDocument());
  });

  it("sorts rows and pages through the collection", async () => {
    const user = userEvent.setup();
    const names = ["zubat", "abra", "bellsprout", "caterpie", "diglett", "eevee", "gastly", "horsea", "ivysaur", "jigglypuff", "kakuna"];
    useFavoritesStore.setState({ favorites: names });
    vi.spyOn(pokemonApi, "detail").mockImplementation(async name => ({
      ...bulbasaur,
      id: names.indexOf(name) + 1,
      name,
    }));
    renderCollection();

    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /zubat/i })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /kakuna/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /name/i }));
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("abra");

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /zubat/i })).toBeInTheDocument();
  });
});
