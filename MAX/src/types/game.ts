export enum CellType {
  WALL,
  PATH
}

export interface Cell {
  type: CellType;
  visible: number; // 0 to 1, representing visibility
}

export interface Position {
  x: number;
  y: number;
}

export enum GameMode {
  CLASSIC = 'classic',
  TIME_ATTACK = 'time_attack',
  SURVIVAL = 'survival',
  PUZZLE = 'puzzle',
  EASY = 'easy'
}

export interface GameModeConfig {
  initialEchoes: number;
  collectiblesCount: number;
  hasTimer: boolean;
  timeLimit?: number; // in seconds
  hasEnemies: boolean;
  infiniteEchoes: boolean;
}