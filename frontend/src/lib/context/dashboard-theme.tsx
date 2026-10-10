"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type DashboardTheme = "dark" | "light";

interface DashboardThemeContextType {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
  isLight: boolean;
}

const DashboardThemeContext = createContext<DashboardThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  isLight: false,
});

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DashboardTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dashboard_theme") as DashboardTheme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: DashboardTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("dashboard_theme", newTheme);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <DashboardThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isLight: mounted && theme === "light",
      }}
    >
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  return useContext(DashboardThemeContext);
}
