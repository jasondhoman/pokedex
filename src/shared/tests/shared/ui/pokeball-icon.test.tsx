import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PokeballIcon } from "@/shared/ui/pokeball-icon";

describe("pokeballIcon", () => {
  it("renders a decorative Poké Ball SVG at the requested size", () => {
    const { container } = render(<PokeballIcon active size={24} />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("width", "24");
    expect(icon).toHaveAttribute("height", "24");
    expect(container.querySelector("rect[fill=\"#e53935\"]")).toBeInTheDocument();
    expect(container.querySelector("circle[stroke=\"black\"]")).toBeInTheDocument();
  });

  it("keeps the top white when inactive", () => {
    const { container } = render(<PokeballIcon />);

    expect(container.querySelector("rect[fill=\"white\"]")).toBeInTheDocument();
    expect(container.querySelector("rect[fill=\"#e53935\"]")).not.toBeInTheDocument();
  });

  it("supports active page navigation styling", () => {
    const { container, rerender } = render(<PokeballIcon active={false} />);

    expect(container.querySelector("rect[fill=\"#e53935\"]")).not.toBeInTheDocument();

    rerender(<PokeballIcon active />);

    expect(container.querySelector("rect[fill=\"#e53935\"]")).toBeInTheDocument();
  });
});
