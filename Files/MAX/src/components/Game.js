window.React = require('react');
window.useTheme = require('../context/ThemeContext.jsx').useTheme;
window.useGameStore = require('../store/gameStore');
window.GameEngine = require('../game/GameEngine');
window.GameUI = require('./GameUI.jsx');
window.GameMenu = require('./GameMenu.jsx');
window.ThemeToggle = require('./ThemeToggle.jsx');
window.Moon = require('lucide-react').Moon;
window.Sun = require('lucide-react').Sun;

window.Game = function() {
  const canvasRef = React.useRef(null);
  const [gameEngine, setGameEngine] = React.useState(null);
  const [echoes, setEchoes] = React.useState(5);
  const [level, setLevel] = React.useState(1);
  const [collected, setCollected] = React.useState(0);
  const [totalCollectibles, setTotalCollectibles] = React.useState(0);
  const [isGameOver, setIsGameOver] = React.useState(false);
  const [isLevelComplete, setIsLevelComplete] = React.useState(false);
  const { theme } = window.useTheme();
  const { isMenuOpen, setMenuOpen, setPaused, setCurrentScore } = window.useGameStore();

  const handleStartGame = React.useCallback(() => {
    if (gameEngine) {
      setMenuOpen(false);
      setPaused(false);
      gameEngine.resume();
    }
  }, [gameEngine, setMenuOpen, setPaused]);

  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(!isMenuOpen);
        setPaused(!isMenuOpen);
        if (gameEngine) {
          if (isMenuOpen) {
            gameEngine.resume();
          } else {
            gameEngine.pause();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMenuOpen, setMenuOpen, setPaused, gameEngine]);

  React.useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new window.GameEngine(canvas, theme);
    
    engine.onEchoUsed = (remaining) => {
      setEchoes(remaining);
    };
    
    engine.onCollectibleFound = (found, total) => {
      setCollected(found);
      setTotalCollectibles(total);
      setCurrentScore(found * 100 + level * 500);
    };
    
    engine.onGameOver = () => {
      setIsGameOver(true);
      setMenuOpen(true);
    };
    
    engine.onLevelComplete = () => {
      setIsLevelComplete(true);
    };
    
    setGameEngine(engine);
    
    setEchoes(engine.maxEchoes);
    setTotalCollectibles(engine.totalCollectibles);
    
    const handleResize = () => {
      if (canvas && engine) {
        canvas.width = Math.min(800, window.innerWidth - 40);
        canvas.height = Math.min(600, window.innerHeight - 200);
        engine.resize(canvas.width, canvas.height);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      engine.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, setCurrentScore]);

  React.useEffect(() => {
    if (gameEngine) {
      gameEngine.updateTheme(theme);
    }
  }, [theme, gameEngine]);

  const startNewGame = () => {
    if (gameEngine) {
      gameEngine.startNewGame();
      setIsGameOver(false);
      setLevel(1);
      setEchoes(gameEngine.maxEchoes);
      setCollected(0);
      setTotalCollectibles(gameEngine.totalCollectibles);
      setCurrentScore(0);
      setMenuOpen(false);
      setPaused(false);
    }
  };

  const nextLevel = () => {
    if (gameEngine) {
      gameEngine.nextLevel();
      setIsLevelComplete(false);
      setLevel(prev => prev + 1);
      setEchoes(gameEngine.maxEchoes);
      setCollected(0);
      setTotalCollectibles(gameEngine.totalCollectibles);
    }
  };

  return React.createElement("div", {
    className: "flex flex-col items-center justify-center w-full transition-colors duration-500"
  },
    React.createElement("h1", {
      className: "text-4xl font-bold mb-4 transition-colors duration-500 dark:text-purple-400 text-blue-600"
    }, "Echo Maze"),
    
    React.createElement("div", {
      className: "relative"
    },
      React.createElement("canvas", {
        ref: canvasRef,
        className: "border-4 rounded-lg shadow-lg transition-colors duration-500 dark:border-purple-700 border-blue-400",
        width: 800,
        height: 600
      }),
      
      React.createElement("div", {
        className: "absolute top-2 right-2"
      },
        React.createElement(window.ThemeToggle, {
          icon: theme === 'dark' ? React.createElement(window.Sun, { size: 20 }) : React.createElement(window.Moon, { size: 20 })
        })
      ),
      
      React.createElement(window.GameMenu, {
        onStartGame: handleStartGame,
        onRestart: startNewGame,
        echoes: echoes,
        level: level
      }),
      
      isGameOver && !isMenuOpen && React.createElement("div", {
        className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg"
      },
        React.createElement("div", {
          className: "bg-gray-800 p-6 rounded-lg text-center"
        },
          React.createElement("h2", {
            className: "text-2xl font-bold text-red-400 mb-4"
          }, "Game Over"),
          React.createElement("p", {
            className: "text-gray-200 mb-4"
          }, "You ran out of echoes!"),
          React.createElement("button", {
            onClick: startNewGame,
            className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          }, "Try Again")
        )
      ),
      
      isLevelComplete && !isMenuOpen && React.createElement("div", {
        className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg"
      },
        React.createElement("div", {
          className: "bg-gray-800 p-6 rounded-lg text-center"
        },
          React.createElement("h2", {
            className: "text-2xl font-bold text-green-400 mb-4"
          }, "Level Complete!"),
          React.createElement("p", {
            className: "text-gray-200 mb-4"
          }, "You found all collectibles and reached the exit!"),
          React.createElement("button", {
            onClick: nextLevel,
            className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          }, "Next Level")
        )
      )
    ),
    
    React.createElement(window.GameUI, {
      echoes: echoes,
      level: level,
      collected: collected,
      totalCollectibles: totalCollectibles
    })
  );
};
