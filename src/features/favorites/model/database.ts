import type { EntityTable } from "dexie";

import Dexie from "dexie";

type FavoriteRecord = {
  name: string;
  position: number;
};

export class FavoritesDatabase extends Dexie {
  favorites!: EntityTable<FavoriteRecord, "name">;

  constructor() {
    super("pokedex");
    this.version(1).stores({ favorites: "name, position" });
  }
}

export const favoritesDatabase = new FavoritesDatabase();
