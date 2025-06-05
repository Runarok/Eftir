import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';  // change extension to .js in import
import './index.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
