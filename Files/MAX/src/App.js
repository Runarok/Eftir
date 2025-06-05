// App component definition
// App component definition
window.App = function() {
  return React.createElement(window.ThemeProvider, null,
    React.createElement("div", {
      className: "min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500"
    },
      React.createElement(window.Game, null)
    )
  );
};

// Load components
const scriptGame = document.createElement('script');
scriptGame.src = './components/Game.js';
document.head.appendChild(scriptGame);

const scriptTheme = document.createElement('script');
scriptTheme.src = './context/ThemeContext.js';
document.head.appendChild(scriptTheme);
