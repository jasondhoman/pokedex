import { create } from "zustand";

import { favoritesDatabase } from "@/features/favorites/model/database";

export type FavoritesState = {
  favorites: string[];
  toggleFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
};

async function persistFavorites(favorites: string[]) {
  await favoritesDatabase.transaction("rw", favoritesDatabase.favorites, async () => {
    await favoritesDatabase.favorites.clear();
    await favoritesDatabase.favorites.bulkAdd(favorites.map((name, position) => ({ name, position })));
  });
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favorites: [],
  toggleFavorite: (name) => {
    const favorites = get().favorites.includes(name)
      ? get().favorites.filter(favorite => favorite !== name)
      : [...get().favorites, name];
    set({ favorites });
    void persistFavorites(favorites).catch((error: unknown) => {
      console.error("Unable to save favorites.", error);
    });
  },
  isFavorite: name => get().favorites.includes(name),
}));

export async function hydrateFavorites() {
  const records = await favoritesDatabase.favorites.orderBy("position").toArray();
  useFavoritesStore.setState({ favorites: records.map(record => record.name) });
}

if (typeof indexedDB !== "undefined") {
  void hydrateFavorites().catch((error: unknown) => {
    console.error("Unable to load favorites.", error);
  });
}
