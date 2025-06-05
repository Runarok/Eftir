import React from 'react';
import Game from './components/Game.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500">
        <Game />
      </div>
    </ThemeProvider>
  );
}

export default App;
