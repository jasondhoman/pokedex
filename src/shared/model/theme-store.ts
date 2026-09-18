import { create } from "zustand";

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined")
    return "dark";
  const savedTheme = window.localStorage.getItem("pokedex-theme");
  if (savedTheme === "terminal")
    return "dark";
  return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const theme = get().theme === "light" ? "dark" : "light";
    window.localStorage.setItem("pokedex-theme", theme);
    set({ theme });
  },
}));
