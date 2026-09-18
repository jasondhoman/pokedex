import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/shared/ui/button";

describe("button", () => {
  it("defaults to a non-submit button", () => {
    render(<Button>Open</Button>);

    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("type", "button");
  });

  it("supports submit intent and variant classes", () => {
    render(<Button type="submit" variant="outline" className="custom">Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("ui-button-outline", "custom");
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });
});
