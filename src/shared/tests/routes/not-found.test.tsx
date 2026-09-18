import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotFoundPage } from "@/routes/__root";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
  createRootRoute: (config: unknown) => config,
}));

describe("notFoundPage", () => {
  it("shows a recovery link to the catalog", () => {
    render(<NotFoundPage />);

    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to the pokédex/i })).toHaveAttribute("href", "/");
  });
});
