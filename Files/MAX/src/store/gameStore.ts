import { create } from 'zustand';
import { GameMode, GameModeConfig } from '../types/game';

const GAME_MODES: Record<GameMode, GameModeConfig> = {
  [GameMode.CLASSIC]: {
    initialEchoes: 5,
    collectiblesCount: 3,
    hasTimer: false,
    hasEnemies: false,
    infiniteEchoes: false
  },
  [GameMode.TIME_ATTACK]: {
    initialEchoes: 5,
    collectiblesCount: 3,
    hasTimer: true,
    timeLimit: 180, // 3 minutes
    hasEnemies: false,
    infiniteEchoes: false
  },
  [GameMode.SURVIVAL]: {
    initialEchoes: 3,
    collectiblesCount: 5,
    hasTimer: false,
    hasEnemies: true,
    infiniteEchoes: false
  },
  [GameMode.PUZZLE]: {
    initialEchoes: 3,
    collectiblesCount: 3,
    hasTimer: false,
    hasEnemies: false,
    infiniteEchoes: false
  },
  [GameMode.EASY]: {
    initialEchoes: 999,
    collectiblesCount: 3,
    hasTimer: false,
    hasEnemies: false,
    infiniteEchoes: true
  }
};

interface GameState {
  isMenuOpen: boolean;
  isPaused: boolean;
  bestScore: number;
  currentScore: number;
  gameMode: GameMode;
  timeRemaining: number | null;
  setMenuOpen: (open: boolean) => void;
  setPaused: (paused: boolean) => void;
  setBestScore: (score: number) => void;
  setCurrentScore: (score: number) => void;
  setGameMode: (mode: GameMode) => void;
  setTimeRemaining: (time: number | null) => void;
  getGameModeConfig: () => GameModeConfig;
}

export const useGameStore = create<GameState>((set, get) => ({
  isMenuOpen: true,
  isPaused: false,
  bestScore: 0,
  currentScore: 0,
  gameMode: GameMode.CLASSIC,
  timeRemaining: null,
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setPaused: (paused) => set({ isPaused: paused }),
  setBestScore: (score) => set((state) => ({
    bestScore: Math.max(state.bestScore, score)
  })),
  setCurrentScore: (score) => set({ currentScore: score }),
  setGameMode: (mode) => set({ 
    gameMode: mode,
    timeRemaining: GAME_MODES[mode].hasTimer ? GAME_MODES[mode].timeLimit! : null
  }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  getGameModeConfig: () => GAME_MODES[get().gameMode]
}));