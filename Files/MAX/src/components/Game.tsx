import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useGameStore } from '../store/gameStore';
import GameEngine from '../game/GameEngine';
import GameUI from './GameUI';
import GameMenu from './GameMenu';
import ThemeToggle from './ThemeToggle';
import { Moon, Sun } from 'lucide-react';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [echoes, setEchoes] = useState(5);
  const [level, setLevel] = useState(1);
  const [collected, setCollected] = useState(0);
  const [totalCollectibles, setTotalCollectibles] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const { theme } = useTheme();
  const { isMenuOpen, setMenuOpen, setPaused, setCurrentScore } = useGameStore();

  const handleStartGame = useCallback(() => {
    if (gameEngine) {
      setMenuOpen(false);
      setPaused(false);
      gameEngine.resume();
    }
  }, [gameEngine, setMenuOpen, setPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new GameEngine(canvas, theme);
    
    engine.onEchoUsed = (remaining: number) => {
      setEchoes(remaining);
    };
    
    engine.onCollectibleFound = (found: number, total: number) => {
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
    
    // Set initial values
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

  useEffect(() => {
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

  return (
    <div className="flex flex-col items-center justify-center w-full transition-colors duration-500">
      <h1 className="text-4xl font-bold mb-4 transition-colors duration-500 dark:text-purple-400 text-blue-600">
        Echo Maze
      </h1>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="border-4 rounded-lg shadow-lg transition-colors duration-500 dark:border-purple-700 border-blue-400"
          width={800}
          height={600}
        />
        
        <div className="absolute top-2 right-2">
          <ThemeToggle 
            icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} 
          />
        </div>
        
        <GameMenu
          onStartGame={handleStartGame}
          onRestart={startNewGame}
          echoes={echoes}
          level={level}
        />
        
        {isGameOver && !isMenuOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Game Over</h2>
              <p className="text-gray-200 mb-4">You ran out of echoes!</p>
              <button 
                onClick={startNewGame}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {isLevelComplete && !isMenuOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Level Complete!</h2>
              <p className="text-gray-200 mb-4">You found all collectibles and reached the exit!</p>
              <button 
                onClick={nextLevel}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Next Level
              </button>
            </div>
          </div>
        )}
      </div>
      
      <GameUI 
        echoes={echoes} 
        level={level} 
        collected={collected}
        totalCollectibles={totalCollectibles}
      />
    </div>
  );
};

export default Game;