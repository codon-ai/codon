# React Theme Context and Toggle
Create a React Theme Context Provider and Toggle component in a single file. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Type `Theme = "light" | "dark"`.
- Export interface `ThemeContextType { theme: Theme; toggleTheme: () => void; }`.
- Export `ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)`.
- Export component `ThemeProvider({ children }: { children: React.ReactNode })`: maintains state `theme: Theme` initialized to `"light"`, in `useEffect` updates `document.documentElement.setAttribute("data-theme", theme)`, and provides `{ theme, toggleTheme }` where `toggleTheme` flips between `"light"` and `"dark"`.
- Export custom hook `useTheme(): ThemeContextType` that returns context or throws `new Error("useTheme must be used within a ThemeProvider")`.
- Export component `ThemeToggle()`: consumes `useTheme()` and returns `<button onClick={toggleTheme}>Current theme: {theme}</button>`.
