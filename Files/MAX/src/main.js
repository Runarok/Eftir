const scriptReact = document.createElement('script');
scriptReact.src = 'https://unpkg.com/react@18/umd/react.development.js';
scriptReact.onload = () => {
  const scriptDOM = document.createElement('script');
  scriptDOM.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
  scriptDOM.onload = () => {
    // Load App component
    const scriptApp = document.createElement('script');
    scriptApp.src = './App.js';
    scriptApp.onload = () => {
      const rootElement = document.getElementById('root');
      const root = ReactDOM.createRoot(rootElement);

      root.render(
        React.createElement(React.StrictMode, null,
          React.createElement(window.App, null)
        )
      );
    };
    document.head.appendChild(scriptApp);
  };
  document.head.appendChild(scriptDOM);
};
document.head.appendChild(scriptReact);
