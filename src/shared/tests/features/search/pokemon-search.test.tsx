import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PokemonSearch } from "@/features/search/pokemon-search";

describe("pokemonSearch", () => {
  it("shows the shortcut when empty and reports typed search text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<PokemonSearch value="" onChange={onChange} />);

    expect(screen.getByText("⌘ K")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: /search pokémon/i }), "char");

    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenLastCalledWith("r");
  });

  it("clears the current search", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<PokemonSearch value="pikachu" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /clear search/i }));

    expect(onChange).toHaveBeenCalledWith("");
    expect(screen.queryByText("⌘ K")).not.toBeInTheDocument();
  });

  it("shows a loading indicator while the search is debouncing", () => {
    render(<PokemonSearch isLoading value="pikachu" onChange={vi.fn()} />);

    expect(screen.getByLabelText("Searching")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /search pokémon/i })).toHaveAttribute("aria-busy", "true");
  });
});
