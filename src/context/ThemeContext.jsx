import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check saved theme, default to 'auto' if none exists
    return localStorage.getItem('app_theme') || 'auto';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Function to apply the dark class based on system preference
    const applySystemTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Remove dark class first to avoid conflicts
    root.classList.remove('dark');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'auto') {
      applySystemTheme();
      
      // Listen for system theme changes while in Auto mode
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applySystemTheme();
      mediaQuery.addEventListener('change', handleChange);
      
      // Cleanup listener
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Save theme preference
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}