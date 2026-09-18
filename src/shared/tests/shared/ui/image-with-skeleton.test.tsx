import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImageWithSkeleton } from "@/shared/ui/image-with-skeleton";

describe("imageWithSkeleton", () => {
  it("shows a skeleton until the image loads", () => {
    render(<ImageWithSkeleton src="/pokemon.png" alt="Bulbasaur" />);

    expect(document.querySelector(".image-loading-skeleton svg")).toBeInTheDocument();

    fireEvent.load(screen.getByRole("img", { name: "Bulbasaur" }));

    expect(document.querySelector(".image-loading-skeleton")).not.toBeInTheDocument();
  });
});
