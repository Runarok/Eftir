const script = document.createElement('script');
script.src = 'https://unpkg.com/react@18/umd/react.development.js';
document.head.appendChild(script);

const scriptDOM = document.createElement('script');
scriptDOM.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
document.head.appendChild(scriptDOM);

// Wait for React to load
window.addEventListener('load', () => {
  const rootElement = document.getElementById('root');
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(window.App, null)
    )
  );
});
