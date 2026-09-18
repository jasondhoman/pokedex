import { create } from "zustand";

export type Theme = "classic" | "terminal";

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined")
    return "classic";
  return window.localStorage.getItem("pokedex-theme") === "terminal" ? "terminal" : "classic";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const theme = get().theme === "classic" ? "terminal" : "classic";
    window.localStorage.setItem("pokedex-theme", theme);
    set({ theme });
  },
}));
