import { beforeEach, describe, expect, it } from "vitest";

import { useThemeStore } from "@/shared/model/theme-store";

describe("theme store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useThemeStore.setState({ theme: "classic" });
  });

  it("toggles and persists the terminal theme", () => {
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe("terminal");
    expect(window.localStorage.getItem("pokedex-theme")).toBe("terminal");
  });
});
