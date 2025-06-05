window.React = require('react');

window.ThemeContext = React.createContext(undefined);

window.ThemeProvider = function({ children }) {
  const [theme, setTheme] = React.useState('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  React.useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    
    document.body.style.backgroundColor = theme === 'dark' ? '#121212' : '#f8f9fa';
  }, [theme]);

  return React.createElement(window.ThemeContext.Provider, {
    value: { theme, toggleTheme }
  }, children);
};

window.useTheme = function() {
  const context = React.useContext(window.ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
