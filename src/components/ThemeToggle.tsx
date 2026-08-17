import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-all duration-300 text-foreground"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      role="switch"
      aria-checked={theme === "dark"}
    >
      <Sun
        className="h-[18px] w-[18px] transition-all duration-300 absolute"
        style={{
          opacity: theme === "dark" ? 1 : 0,
          transform: theme === "dark" ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0)",
        }}
      />
      <Moon
        className="h-[18px] w-[18px] transition-all duration-300 absolute"
        style={{
          opacity: theme === "light" ? 1 : 0,
          transform: theme === "light" ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0)",
        }}
      />
    </button>
  );
}
