import { expect, test } from "@playwright/test";

const pokemonList = {
  count: 2,
  results: [
    { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
    { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    indexedDB.deleteDatabase("pokedex");
  });
  await page.route("**/api/v2/pokemon?limit=1302&offset=0", route => route.fulfill({ json: pokemonList }));
});

test("browses the catalog and switches to light mode", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /know them all/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bulbasaur" })).toBeVisible();

  await page.getByRole("button", { name: /switch to light mode/i }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-theme", "light");
});

test("shows the not found page and returns to the catalog", async ({ page }) => {
  await page.goto("/missing-page");

  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
  await page.getByRole("link", { name: /return to the pokédex/i }).click();
  await expect(page).toHaveURL(/\/\?page=1$/);
  await expect(page.getByRole("heading", { name: /know them all/i })).toBeVisible();
});

test("navigates to the collection page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /collection/i }).click();

  await expect(page).toHaveURL(/\/collection$/);
  await expect(page.getByRole("heading", { name: /no collection pokémon yet/i })).toBeVisible();
});
