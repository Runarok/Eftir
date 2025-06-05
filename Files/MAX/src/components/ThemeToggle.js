window.React = require('react');
window.useTheme = require('../context/ThemeContext.jsx').useTheme;

window.ThemeToggle = function({ icon }) {
  const { toggleTheme } = window.useTheme();
  
  return React.createElement("button", {
    onClick: toggleTheme,
    className: "p-2 rounded-full transition-colors duration-300 dark:bg-gray-800 bg-white dark:text-white text-gray-800 dark:hover:bg-gray-700 hover:bg-gray-200 shadow-md",
    "aria-label": "Toggle theme"
  }, icon);
};
