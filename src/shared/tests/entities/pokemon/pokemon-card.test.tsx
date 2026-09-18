import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PokemonCard } from "@/entities/pokemon/pokemon-card";
import { useFavoritesStore } from "@/features/favorites/model/store";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; to: string; params: object; className?: string }) => (
    <a href={props.to} className={props.className}>{children}</a>
  ),
}));

const charmander = {
  name: "charmander",
  url: "https://pokeapi.co/api/v2/pokemon/4/",
};

describe("pokemonCard", () => {
  it("renders the formatted name, number, and artwork", () => {
    render(<PokemonCard pokemon={charmander} />);

    expect(screen.getByRole("heading", { name: "charmander" })).toBeInTheDocument();
    expect(screen.getByText("#004")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "charmander" })).toHaveAttribute(
      "src",
      expect.stringContaining("/official-artwork/4.png"),
    );
  });

  it("toggles the favorite state from the card action", async () => {
    const user = userEvent.setup();
    useFavoritesStore.setState({ favorites: [] });
    render(<PokemonCard pokemon={charmander} />);

    const button = screen.getByRole("button", { name: /add charmander to favorites/i });
    await user.click(button);

    expect(useFavoritesStore.getState().favorites).toEqual(["charmander"]);
    expect(screen.getByRole("button", { name: /remove charmander from favorites/i })).toBeInTheDocument();
  });
});
