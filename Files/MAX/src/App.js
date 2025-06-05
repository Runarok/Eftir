window.React = require('react');
window.Game = require('./components/Game.jsx');
window.ThemeProvider = require('./context/ThemeContext.jsx').ThemeProvider;

window.App = function() {
  return React.createElement(window.ThemeProvider, null,
    React.createElement("div", {
      className: "min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500"
    },
      React.createElement(window.Game, null)
    )
  );
};
