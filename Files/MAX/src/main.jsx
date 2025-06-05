window.React = require('react');
window.createRoot = require('react-dom/client').createRoot;

window.App = require('./App.jsx');

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(window.App, null)
  )
);
