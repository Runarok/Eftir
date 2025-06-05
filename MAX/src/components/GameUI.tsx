import React from 'react';

interface GameUIProps {
  echoes: number;
  level: number;
  collected: number;
  totalCollectibles: number;
}

const GameUI: React.FC<GameUIProps> = ({ echoes, level, collected, totalCollectibles }) => {
  return (
    <div className="flex justify-between w-full max-w-md mt-4 px-4">
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase font-bold tracking-wider transition-colors duration-500 dark:text-gray-400 text-gray-600">Level</span>
        <span className="text-2xl font-bold transition-colors duration-500 dark:text-purple-400 text-blue-600">{level}</span>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase font-bold tracking-wider transition-colors duration-500 dark:text-gray-400 text-gray-600">Echoes</span>
        <span className={`text-2xl font-bold ${echoes <= 2 ? 'text-red-500' : 'transition-colors duration-500 dark:text-purple-400 text-blue-600'}`}>
          {echoes}
        </span>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase font-bold tracking-wider transition-colors duration-500 dark:text-gray-400 text-gray-600">Collectibles</span>
        <span className="text-2xl font-bold transition-colors duration-500 dark:text-purple-400 text-blue-600">
          {collected}/{totalCollectibles}
        </span>
      </div>
    </div>
  );
};

export default GameUI;