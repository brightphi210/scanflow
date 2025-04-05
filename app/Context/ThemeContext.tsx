import { createContext, useContext, useState } from "react";

export const ThemeContext = createContext({
    isDarkMode: true,
    toggleTheme: () => {},
  });
  
  // Theme Provider component
  export const ThemeProviderNew = ({ children }:any) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
  
    const toggleTheme = () => {
      setIsDarkMode(prevMode => !prevMode);
    };
  
    return (
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  
  // Custom hook to use theme
  export const useTheme = () => useContext(ThemeContext);