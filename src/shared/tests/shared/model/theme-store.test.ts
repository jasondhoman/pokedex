import { beforeEach, describe, expect, it } from "vitest";

import { useThemeStore } from "@/shared/model/theme-store";

describe("theme store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useThemeStore.setState({ theme: "dark" });
  });

  it("toggles and persists light mode", () => {
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe("light");
    expect(window.localStorage.getItem("pokedex-theme")).toBe("light");
  });
});
