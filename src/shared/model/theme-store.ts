import { create } from "zustand";

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined")
    return "dark";
  const collectionTheme = window.localStorage.getItem("pokedex-theme");
  if (collectionTheme === "terminal")
    return "dark";
  return collectionTheme === "light" || collectionTheme === "dark" ? collectionTheme : "dark";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const theme = get().theme === "light" ? "dark" : "light";
    window.localStorage.setItem("pokedex-theme", theme);
    set({ theme });
  },
}));
