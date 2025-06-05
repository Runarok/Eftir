// Load React from CDN
const scriptReact = document.createElement('script');
scriptReact.src = 'https://unpkg.com/react@18/umd/react.development.js';
document.head.appendChild(scriptReact);

const scriptDOM = document.createElement('script');
scriptDOM.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
document.head.appendChild(scriptDOM);

// Wait for both React and ReactDOM to load
window.addEventListener('load', () => {
  // Load App component
  const scriptApp = document.createElement('script');
  scriptApp.src = './src/App.js';
  scriptApp.onload = () => {
    // Load Game component
    const scriptGame = document.createElement('script');
    scriptGame.src = './src/components/Game.js';
    scriptGame.onload = () => {
      // Load ThemeContext
      const scriptTheme = document.createElement('script');
      scriptTheme.src = './src/context/ThemeContext.js';
      scriptTheme.onload = () => {
        const rootElement = document.getElementById('root');
        const root = ReactDOM.createRoot(rootElement);

        root.render(
          React.createElement(React.StrictMode, null,
            React.createElement(window.App, null)
          )
        );
      };
      document.head.appendChild(scriptTheme);
    };
    document.head.appendChild(scriptGame);
  };
  document.head.appendChild(scriptApp);
});
