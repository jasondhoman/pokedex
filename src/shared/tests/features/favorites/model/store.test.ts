import { beforeEach, describe, expect, it, vi } from "vitest";

import { favoritesDatabase } from "@/features/favorites/model/database";
import { hydrateFavorites, useFavoritesStore } from "@/features/favorites/model/store";

describe("favorites store", () => {
  beforeEach(async () => {
    await favoritesDatabase.favorites.clear();
    useFavoritesStore.setState({ favorites: [] });
  });

  it("adds and removes favorites", () => {
    useFavoritesStore.getState().toggleFavorite("bulbasaur");
    expect(useFavoritesStore.getState().favorites).toEqual(["bulbasaur"]);
    expect(useFavoritesStore.getState().isFavorite("bulbasaur")).toBe(true);

    useFavoritesStore.getState().toggleFavorite("bulbasaur");
    expect(useFavoritesStore.getState().favorites).toEqual([]);
    expect(useFavoritesStore.getState().isFavorite("bulbasaur")).toBe(false);
  });

  it("keeps multiple favorites in insertion order", () => {
    useFavoritesStore.getState().toggleFavorite("bulbasaur");
    useFavoritesStore.getState().toggleFavorite("pikachu");

    expect(useFavoritesStore.getState().favorites).toEqual(["bulbasaur", "pikachu"]);
  });

  it("hydrates favorites from IndexedDB in saved order", async () => {
    await favoritesDatabase.favorites.bulkAdd([
      { name: "pikachu", position: 1 },
      { name: "bulbasaur", position: 0 },
    ]);

    await hydrateFavorites();

    expect(useFavoritesStore.getState().favorites).toEqual(["bulbasaur", "pikachu"]);
  });

  it("reports IndexedDB write failures", async () => {
    const error = new Error("write failed");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(favoritesDatabase.favorites, "clear").mockRejectedValueOnce(error);

    useFavoritesStore.getState().toggleFavorite("bulbasaur");
    await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith("Unable to save favorites.", error));

    consoleError.mockRestore();
  });
});
